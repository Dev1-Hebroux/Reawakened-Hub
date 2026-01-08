/**
 * Rate Limiting Middleware
 * 
 * Provides protection against abuse and DoS attacks.
 * Uses a sliding window algorithm with in-memory storage.
 * 
 * For production, consider using Redis for distributed rate limiting.
 */

import { RequestHandler } from 'express';
import { logger } from '../lib/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  message?: string;
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress || 'unknown',
  skipSuccessfulRequests: false,
  message: 'Too many requests, please try again later',
};

/**
 * Create a rate limiter middleware with the given options.
 */
export function createRateLimiter(options: Partial<RateLimitOptions> = {}): RequestHandler {
  const config = { ...defaultOptions, ...options };
  const store = new Map<string, RateLimitEntry>();
  
  // Cleanup expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime <= now) {
        store.delete(key);
      }
    }
  }, config.windowMs);
  
  return (req, res, next) => {
    const key = config.keyGenerator(req);
    const now = Date.now();
    
    let entry = store.get(key);
    
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      store.set(key, entry);
    }
    
    entry.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
    
    if (entry.count > config.maxRequests) {
      logger.warn({
        key,
        count: entry.count,
        limit: config.maxRequests,
        path: req.path,
      }, 'Rate limit exceeded');
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }
    
    next();
  };
}

/**
 * Strict rate limiter for authentication endpoints.
 * Limits to 5 requests per minute to prevent brute force attacks.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
});

/**
 * Standard API rate limiter.
 * Limits to 100 requests per minute.
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
});

/**
 * Strict rate limiter for write operations.
 * Limits to 30 requests per minute.
 */
export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Too many write operations, please try again later',
});
