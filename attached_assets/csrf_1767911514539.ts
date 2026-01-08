/**
 * CSRF Protection Middleware
 * 
 * Implements Double Submit Cookie pattern for CSRF protection.
 * This is compatible with SPA architecture where traditional session-based
 * CSRF tokens are difficult to implement.
 * 
 * FIX: Addresses missing CSRF protection on state-changing endpoints.
 */

import { RequestHandler, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../lib/logger';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token.
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to set CSRF token cookie on responses.
 * Should be applied to all routes that return HTML or need CSRF protection.
 */
export const setCsrfToken: RequestHandler = (req, res, next) => {
  // Generate token if not present
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  
  // Make token available to templates/responses
  res.locals.csrfToken = token;
  next();
};

/**
 * Middleware to validate CSRF token on state-changing requests.
 * Checks that the token in the header matches the token in the cookie.
 */
export const validateCsrfToken: RequestHandler = (req, res, next) => {
  // Skip CSRF for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  
  if (!cookieToken || !headerToken) {
    logger.warn({
      path: req.path,
      method: req.method,
      hasCookieToken: !!cookieToken,
      hasHeaderToken: !!headerToken,
    }, 'CSRF token missing');
    
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'Request must include CSRF token',
    });
  }
  
  // Timing-safe comparison to prevent timing attacks
  if (!timingSafeEqual(cookieToken, headerToken)) {
    logger.warn({
      path: req.path,
      method: req.method,
    }, 'CSRF token mismatch');
    
    return res.status(403).json({
      error: 'CSRF token invalid',
      message: 'CSRF token validation failed',
    });
  }
  
  next();
};

/**
 * Timing-safe string comparison.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Combined middleware that sets and validates CSRF tokens.
 * Use this as a single middleware for protected routes.
 */
export const csrfProtection: RequestHandler = (req, res, next) => {
  setCsrfToken(req, res, () => {
    validateCsrfToken(req, res, next);
  });
};

/**
 * Express error handler for CSRF errors.
 */
export function csrfErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.message === 'CSRF token missing' || err.message === 'CSRF token invalid') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing CSRF token',
    });
    return;
  }
  next(err);
}
