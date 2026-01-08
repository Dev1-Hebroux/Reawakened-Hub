import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Structured logger for consistent logging
const logger = {
  info: (message: string, context: Record<string, unknown> = {}) => {
    console.log(JSON.stringify({ level: 'info', message, ...context, timestamp: new Date().toISOString() }));
  },
  error: (message: string, context: Record<string, unknown> = {}) => {
    console.error(JSON.stringify({ level: 'error', message, ...context, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, context: Record<string, unknown> = {}) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...context, timestamp: new Date().toISOString() }));
  },
};

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset session expiry on each request to prevent logout
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

/**
 * Parse and validate super admin emails from environment variable.
 * Handles edge cases like empty strings, whitespace, and malformed entries.
 */
function getSuperAdminEmails(): string[] {
  const emails = process.env.SUPER_ADMIN_EMAILS || '';
  return emails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0 && e.includes('@')); // Basic email validation
}

/**
 * Determine the appropriate role for a user.
 * Preserves existing elevated roles while allowing super_admin override.
 * Role hierarchy: super_admin > admin > leader > member
 */
function determineUserRole(
  isSuperAdmin: boolean,
  existingRole: string | null | undefined
): string {
  // Super admin from env takes precedence
  if (isSuperAdmin) {
    return 'super_admin';
  }
  
  // Preserve existing elevated roles
  const elevatedRoles = ['super_admin', 'admin', 'leader'];
  if (existingRole && elevatedRoles.includes(existingRole)) {
    return existingRole;
  }
  
  // Default to member
  return existingRole || 'member';
}

async function upsertUser(claims: any) {
  const email = claims["email"]?.toLowerCase();
  const userId = claims["sub"];
  
  if (!userId) {
    logger.error('Missing user ID in claims', { email });
    return;
  }
  
  const superAdminEmails = getSuperAdminEmails();
  const isSuperAdmin = email && superAdminEmails.includes(email);
  
  const existingUser = await storage.getUser(userId);
  const role = determineUserRole(isSuperAdmin, existingUser?.role);
  
  logger.info('Upserting user', { 
    userId, 
    email, 
    previousRole: existingUser?.role, 
    newRole: role,
    isSuperAdmin 
  });
  
  await storage.upsertUser({
    id: userId,
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

/**
 * Save session and wait for completion.
 * Returns true if save succeeded, false otherwise.
 */
async function saveSessionAsync(req: Express.Request): Promise<boolean> {
  if (!req.session) return false;
  
  return new Promise((resolve) => {
    req.session.save((err) => {
      if (err) {
        logger.error('Failed to save session', { error: err.message });
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    logger.warn('No refresh token available for token refresh', { 
      userId: user.claims?.sub 
    });
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    
    // Wait for session save to complete before continuing
    const saved = await saveSessionAsync(req);
    if (!saved) {
      logger.warn('Session save failed after token refresh, continuing anyway', {
        userId: user.claims?.sub
      });
    }
    
    return next();
  } catch (error) {
    const err = error as Error;
    logger.error('Token refresh failed', { 
      error: err.message, 
      userId: user.claims?.sub 
    });
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const isSuperAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || dbUser.role !== 'super_admin') {
      logger.warn('Super admin access denied', { 
        userId: user.claims.sub, 
        role: dbUser?.role 
      });
      return res.status(403).json({ message: "Super admin access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    const err = error as Error;
    logger.error('Error checking super admin status', { 
      error: err.message, 
      userId: user.claims.sub 
    });
    return res.status(500).json({ message: "Server error" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role || '')) {
      logger.warn('Admin access denied', { 
        userId: user.claims.sub, 
        role: dbUser?.role 
      });
      return res.status(403).json({ message: "Admin access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    const err = error as Error;
    logger.error('Error checking admin status', { 
      error: err.message, 
      userId: user.claims.sub 
    });
    return res.status(500).json({ message: "Server error" });
  }
};

export const isLeaderOrAbove: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || !['leader', 'admin', 'super_admin'].includes(dbUser.role || '')) {
      logger.warn('Leader access denied', { 
        userId: user.claims.sub, 
        role: dbUser?.role 
      });
      return res.status(403).json({ message: "Leader access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    const err = error as Error;
    logger.error('Error checking leader status', { 
      error: err.message, 
      userId: user.claims.sub 
    });
    return res.status(500).json({ message: "Server error" });
  }
};
