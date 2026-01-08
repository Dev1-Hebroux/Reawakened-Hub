/**
 * Replit Authentication Module - Fixed Version
 * 
 * Fixes applied:
 * 1. [HIGH] Race condition in super-admin role assignment - now handles demotion
 * 2. [HIGH] Session save after token refresh is fire-and-forget - now properly awaited
 * 3. [MEDIUM] Missing structured logging - added comprehensive logging
 * 4. [MEDIUM] Session store missing connection pooling - added pool configuration
 */

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { logger } from "./lib/logger";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

/**
 * Get session middleware with proper connection pooling.
 * FIX: Added pool configuration to prevent connection exhaustion under load.
 */
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
    // FIX: Add connection pool configuration
    pool: {
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    } as any,
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
      sameSite: 'strict', // FIX: Added SameSite for CSRF protection
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
 * Get and validate super admin emails from environment.
 * FIX: Added email format validation.
 */
function getSuperAdminEmails(): string[] {
  const emails = process.env.SUPER_ADMIN_EMAILS || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0 && emailRegex.test(e));
}

/**
 * Role hierarchy for determining role precedence.
 * Higher index = higher privilege.
 */
const ROLE_HIERARCHY = ['member', 'leader', 'admin', 'super_admin'] as const;
type UserRole = typeof ROLE_HIERARCHY[number];

/**
 * Determine the appropriate role for a user based on current state and admin list.
 * 
 * FIX: This function now properly handles:
 * 1. Promotion to super_admin when email is in the list
 * 2. Demotion from super_admin when email is removed from list
 * 3. Preservation of elevated roles (admin, leader) when not super_admin
 */
function determineUserRole(
  isSuperAdmin: boolean, 
  existingRole: string | null
): UserRole {
  // If in super admin list, always grant super_admin
  if (isSuperAdmin) {
    return 'super_admin';
  }
  
  // If currently super_admin but no longer in list, demote to admin
  if (existingRole === 'super_admin') {
    logger.info({ existingRole }, 'Demoting user from super_admin (removed from SUPER_ADMIN_EMAILS)');
    return 'admin';
  }
  
  // Preserve existing elevated roles (admin, leader)
  if (existingRole && ROLE_HIERARCHY.includes(existingRole as UserRole)) {
    return existingRole as UserRole;
  }
  
  // Default to member for new users
  return 'member';
}

/**
 * Upsert user with proper role handling.
 * FIX: Now uses determineUserRole for proper promotion/demotion logic.
 */
async function upsertUser(claims: any): Promise<void> {
  const userId = claims["sub"];
  const email = claims["email"]?.toLowerCase();
  const superAdminEmails = getSuperAdminEmails();
  const isSuperAdmin = email && superAdminEmails.includes(email);
  
  const existingUser = await storage.getUser(userId);
  const newRole = determineUserRole(isSuperAdmin, existingUser?.role || null);
  
  logger.info({
    userId,
    email,
    existingRole: existingUser?.role,
    newRole,
    isSuperAdmin,
  }, 'Upserting user');
  
  await storage.upsertUser({
    id: userId,
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role: newRole,
  });
}

/**
 * Promisified session save for proper async handling.
 * FIX: Allows awaiting session save to prevent race conditions.
 */
function saveSessionAsync(req: Express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }
    
    req.session.save((err) => {
      if (err) {
        logger.error({ err }, 'Failed to save session');
        reject(err);
      } else {
        resolve();
      }
    });
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

  const registeredStrategies = new Set<string>();

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
    logger.info({ hostname: req.hostname }, 'Login initiated');
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
    const userId = (req.user as any)?.claims?.sub;
    logger.info({ userId }, 'User logging out');
    
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
 * Authentication middleware with proper token refresh handling.
 * FIX: Session save is now awaited to prevent race conditions.
 */
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  if (!req.isAuthenticated() || !user.expires_at) {
    logger.debug({ requestId }, 'Request not authenticated');
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    logger.warn({ userId: user.claims?.sub, requestId }, 'No refresh token available');
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    logger.debug({ userId: user.claims?.sub, requestId }, 'Refreshing expired token');
    
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    
    // FIX: Properly await session save before continuing
    await saveSessionAsync(req);
    
    logger.info({ userId: user.claims?.sub, requestId }, 'Token refreshed successfully');
    return next();
  } catch (error) {
    logger.error({ 
      err: error, 
      userId: user.claims?.sub, 
      requestId 
    }, 'Token refresh failed');
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const isSuperAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || dbUser.role !== 'super_admin') {
      logger.warn({ 
        userId: user.claims.sub, 
        role: dbUser?.role,
        requestId 
      }, 'Super admin access denied');
      return res.status(403).json({ message: "Super admin access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    logger.error({ err: error, requestId }, 'Error checking super admin status');
    return res.status(500).json({ message: "Server error" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role || '')) {
      logger.warn({ 
        userId: user.claims.sub, 
        role: dbUser?.role,
        requestId 
      }, 'Admin access denied');
      return res.status(403).json({ message: "Admin access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    logger.error({ err: error, requestId }, 'Error checking admin status');
    return res.status(500).json({ message: "Server error" });
  }
};

export const isLeaderOrAbove: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || !['leader', 'admin', 'super_admin'].includes(dbUser.role || '')) {
      logger.warn({ 
        userId: user.claims.sub, 
        role: dbUser?.role,
        requestId 
      }, 'Leader access denied');
      return res.status(403).json({ message: "Leader access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    logger.error({ err: error, requestId }, 'Error checking leader status');
    return res.status(500).json({ message: "Server error" });
  }
};
