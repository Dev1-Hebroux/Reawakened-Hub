/**
 * Authentication middleware
 *
 * Email/password authentication backed by Supabase (PostgreSQL).
 * Sessions stored in `userSessions` table via authService.
 */

import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { invalidateSession, validateSession } from "./services/authService";

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

export function getSuperAdminEmails(): string[] {
  const emails = process.env.SUPER_ADMIN_EMAILS || '';
  return emails.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
}

const ROLE_HIERARCHY = ['member', 'leader', 'admin', 'super_admin'] as const;
type Role = typeof ROLE_HIERARCHY[number];

function isValidRole(role: string | null | undefined): role is Role {
  if (!role) return false;
  return ROLE_HIERARCHY.includes(role as Role);
}

export function determineUserRole(
  existingRole: string | null | undefined,
  isSuperAdmin: boolean
): string {
  if (isSuperAdmin) return 'super_admin';
  if (existingRole === 'super_admin') return 'admin';
  if (isValidRole(existingRole) && existingRole !== 'member') return existingRole;
  return 'member';
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Logout: clear email session + express session
  app.get("/api/logout", async (req, res) => {
    try {
      const token = req.cookies?.auth_session;
      if (token) {
        await invalidateSession(token);
      }

      res.clearCookie('auth_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      if (req.session) {
        req.session.destroy((err) => {
          if (err) console.error('[Auth] Session destroy error:', err);
        });
      }

      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      res.clearCookie('auth_session', { path: '/' });
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/');
    }
  });
}

/**
 * Helper: extract authenticated user from auth_session cookie.
 * Returns the user object or null.
 */
async function getAuthenticatedUser(req: any): Promise<any | null> {
  const authSessionToken = req.cookies?.auth_session;
  if (!authSessionToken) return null;

  try {
    const emailUser = await validateSession(authSessionToken);
    if (!emailUser) return null;

    const user = {
      id: emailUser.id,
      claims: {
        sub: emailUser.id,
        email: emailUser.email,
        first_name: emailUser.firstName,
        last_name: emailUser.lastName,
      },
      email: emailUser.email,
      firstName: emailUser.firstName,
      lastName: emailUser.lastName,
      role: emailUser.role,
      profileImageUrl: emailUser.profileImageUrl,
      authProvider: emailUser.authProvider,
    };

    req.user = user;
    return user;
  } catch (error) {
    console.error("[Auth] Session validation failed:", error);
    return null;
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

export const isSuperAdmin: RequestHandler = async (req, res, next) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(user.id);
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
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(user.id);
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
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(user.id);
    if (!dbUser || !['leader', 'admin', 'super_admin'].includes(dbUser.role || '')) {
      return res.status(403).json({ message: "Leader access required" });
    }
    (req as any).dbUser = dbUser;
    return next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
