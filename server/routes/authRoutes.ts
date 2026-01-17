import { Router } from 'express';
import { z } from 'zod';
import {
  registerWithEmail,
  loginWithEmail,
  validateSession,
  invalidateSession,
  createPasswordResetToken,
  resetPassword,
  verifyEmail,
  addPasswordToAccount,
  createEmailVerificationToken,
} from '../services/authService';
import {
  sendAuthWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from '../email';
import { createRateLimiter } from '../middleware/rateLimiter';
import { csrfProtection, setCsrfToken } from '../middleware/csrf';
import { storage } from '../storage';

const router = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  message: 'Too many password reset requests. Please try again later.',
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const addPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

function getClientInfo(req: any) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
  const userAgent = req.headers['user-agent'];
  return { ip, userAgent };
}

const isProduction = process.env.NODE_ENV === 'production';

function setSessionCookie(res: any, token: string) {
  res.cookie('auth_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearSessionCookie(res: any) {
  res.clearCookie('auth_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
}

router.get('/csrf', (req, res) => {
  setCsrfToken(req, res, () => {
    res.json({ token: res.locals.csrfToken });
  });
});

router.post('/register', csrfProtection, authRateLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const { ip, userAgent } = getClientInfo(req);

    const result = await registerWithEmail(
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      ip,
      userAgent
    );

    if (!result.success || !result.user) {
      return res.status(400).json({ error: result.error });
    }

    const loginResult = await loginWithEmail(data.email, data.password, ip, userAgent);

    if (loginResult.success && loginResult.sessionToken) {
      setSessionCookie(res, loginResult.sessionToken);
    }

    const verifyToken = await createEmailVerificationToken(result.user.id, data.email);
    await sendAuthWelcomeEmail(data.email, data.firstName || null);
    await sendEmailVerificationEmail(data.email, data.firstName || null, verifyToken);

    const { passwordHash, ...safeUser } = result.user;
    res.status(201).json({
      success: true,
      user: safeUser,
      message: 'Account created. Please check your email to verify.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', csrfProtection, authRateLimiter, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const { ip, userAgent } = getClientInfo(req);

    const result = await loginWithEmail(data.email, data.password, ip, userAgent);

    if (!result.success || !result.sessionToken) {
      return res.status(401).json({ error: result.error });
    }

    setSessionCookie(res, result.sessionToken);

    const { passwordHash, ...safeUser } = result.user!;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', csrfProtection, async (req, res) => {
  try {
    // Invalidate email/password session
    const token = req.cookies?.auth_session;
    if (token) {
      await invalidateSession(token);
    }
    clearSessionCookie(res);
    
    // Clear passport user if present
    if (req.logout) {
      req.logout(() => {});
    }
    
    // Destroy session and clear cookies, then respond
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('[Auth] Session destroy error:', err);
        }
        res.clearCookie('connect.sid', { path: '/' });
        res.json({ success: true });
      });
    } else {
      res.clearCookie('connect.sid', { path: '/' });
      res.json({ success: true });
    }
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    clearSessionCookie(res);
    res.clearCookie('connect.sid', { path: '/' });
    res.json({ success: true });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.auth_session;
    
    if (!token) {
      const replitUser = (req as any).user;
      if (replitUser?.claims?.sub) {
        const user = await storage.getUser(replitUser.claims.sub);
        if (user) {
          const { passwordHash, ...safeUser } = user;
          return res.json({ user: safeUser, provider: 'replit' });
        }
      }
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await validateSession(token);
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session expired' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, provider: 'email' });
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/forgot-password', csrfProtection, passwordResetRateLimiter, async (req, res) => {
  try {
    const data = passwordResetRequestSchema.parse(req.body);
    const { ip, userAgent } = getClientInfo(req);

    const result = await createPasswordResetToken(data.email, ip, userAgent);

    if (result.token) {
      const user = await storage.getUserByEmail(data.email.toLowerCase());
      if (user) {
        await sendPasswordResetEmail(data.email, user.firstName || null, result.token);
      }
    }

    res.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    console.error('[Auth] Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', csrfProtection, async (req, res) => {
  try {
    const data = passwordResetSchema.parse(req.body);
    const { ip, userAgent } = getClientInfo(req);

    const result = await resetPassword(data.token, data.password, ip, userAgent);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    console.error('[Auth] Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const { ip, userAgent } = getClientInfo(req);
    const result = await verifyEmail(token, ip, userAgent);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('[Auth] Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

router.post('/add-password', csrfProtection, async (req, res) => {
  try {
    const replitUser = (req as any).user;
    const sessionToken = req.cookies?.auth_session;
    
    let userId: string | null = null;

    if (replitUser?.claims?.sub) {
      userId = replitUser.claims.sub;
    } else if (sessionToken) {
      const user = await validateSession(sessionToken);
      userId = user?.id || null;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const data = addPasswordSchema.parse(req.body);
    const { ip, userAgent } = getClientInfo(req);

    const result = await addPasswordToAccount(userId, data.password, ip, userAgent);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Password added successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    console.error('[Auth] Add password error:', error);
    res.status(500).json({ error: 'Failed to add password' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const replitUser = (req as any).user;
    const sessionToken = req.cookies?.auth_session;
    
    let user = null;

    if (sessionToken) {
      user = await validateSession(sessionToken);
    } else if (replitUser?.claims?.sub) {
      user = await storage.getUser(replitUser.claims.sub);
    }

    if (!user || !user.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (user.emailVerifiedAt) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const verifyToken = await createEmailVerificationToken(user.id, user.email);
    await sendEmailVerificationEmail(user.email, user.firstName || null, verifyToken);

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('[Auth] Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification' });
  }
});

export default router;
