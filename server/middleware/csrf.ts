import { RequestHandler } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const isProduction = process.env.NODE_ENV === 'production';

function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

export const setCsrfToken: RequestHandler = (req, res, next) => {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
  
  res.locals.csrfToken = token;
  next();
};

export const validateCsrfToken: RequestHandler = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // TEMPORARY: Allow bootstrap endpoint without CSRF (remove after first use)
  // Note: path is relative to /api mount point, so it's /spark-audio/bootstrap not /api/spark-audio/bootstrap
  if (req.path === '/spark-audio/bootstrap') {
    return next();
  }
  
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  
  if (!cookieToken || !headerToken) {
    console.warn(`[CSRF] Token missing: path=${req.path}, method=${req.method}, hasCookie=${!!cookieToken}, hasHeader=${!!headerToken}`);
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'Request must include CSRF token',
    });
  }
  
  if (!timingSafeEqual(cookieToken, headerToken)) {
    console.warn(`[CSRF] Token mismatch: path=${req.path}, method=${req.method}`);
    return res.status(403).json({
      error: 'CSRF token invalid',
      message: 'CSRF token validation failed',
    });
  }
  
  next();
};

export const csrfProtection: RequestHandler = (req, res, next) => {
  setCsrfToken(req, res, () => {
    validateCsrfToken(req, res, next);
  });
};
