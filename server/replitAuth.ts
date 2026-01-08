import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

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
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
      sameSite: 'strict' as const,
    },
  });
}

function saveSessionAsync(req: Express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }
    req.session.save((err) => {
      if (err) {
        console.error('[Session] Failed to save session:', err);
        reject(err);
      } else {
        resolve();
      }
    });
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

function getSuperAdminEmails(): string[] {
  const emails = process.env.SUPER_ADMIN_EMAILS || '';
  return emails.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
}

const ROLE_HIERARCHY = ['member', 'leader', 'admin', 'super_admin'] as const;
type Role = typeof ROLE_HIERARCHY[number];

function isValidRole(role: string | null | undefined): role is Role {
  if (!role) return false;
  return ROLE_HIERARCHY.includes(role as Role);
}

function determineUserRole(
  existingRole: string | null | undefined,
  isSuperAdmin: boolean
): string {
  if (isSuperAdmin) {
    return 'super_admin';
  }
  
  if (existingRole === 'super_admin') {
    return 'admin';
  }
  
  if (isValidRole(existingRole) && existingRole !== 'member') {
    return existingRole;
  }
  
  return 'member';
}

async function upsertUser(
  claims: any,
) {
  const email = claims["email"]?.toLowerCase();
  const superAdminEmails = getSuperAdminEmails();
  const isSuperAdmin = email && superAdminEmails.includes(email);
  
  const existingUser = await storage.getUser(claims["sub"]);
  const newRole = determineUserRole(existingUser?.role, isSuperAdmin);
  
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role: newRole,
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
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    await saveSessionAsync(req);
    return next();
  } catch (error) {
    console.error("[Auth] Token refresh failed:", error);
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
      return res.status(403).json({ message: "Super admin access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
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
      return res.status(403).json({ message: "Admin access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
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
      return res.status(403).json({ message: "Leader access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
