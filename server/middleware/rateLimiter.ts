import { RequestHandler } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  message?: string;
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  message: 'Too many requests, please try again later',
};

export function createRateLimiter(options: Partial<RateLimitOptions> = {}): RequestHandler {
  const config = { ...defaultOptions, ...options };
  const store = new Map<string, RateLimitEntry>();
  
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(store.entries());
    for (const [key, entry] of entries) {
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
    
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
    
    if (entry.count > config.maxRequests) {
      console.warn(`[RateLimit] Exceeded: key=${key}, count=${entry.count}, path=${req.path}`);
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

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
});

export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Too many write operations, please try again later',
});
