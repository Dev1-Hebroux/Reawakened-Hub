/**
 * Performance Middleware
 * 
 * Collection of middleware for improving response times:
 * - Compression (gzip/brotli)
 * - Response timing headers
 * - Slow request logging
 * - Cache headers
 */

import { Request, Response, NextFunction, Express } from 'express';
import compression from 'compression';

// ============================================================================
// Response Compression
// ============================================================================

export const compressionMiddleware = compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// ============================================================================
// Response Timing
// ============================================================================

export function serverTiming(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime.bigint();
  
  const timings: Array<{ name: string; duration: number; description?: string }> = [];
  
  (req as any).addTiming = (name: string, duration: number, description?: string) => {
    timings.push({ name, duration, description });
  };
  
  const originalSend = res.send;
  res.send = function(body) {
    const endTime = process.hrtime.bigint();
    const totalDuration = Number(endTime - startTime) / 1_000_000;
    
    const timingValues = [
      `total;dur=${totalDuration.toFixed(2)}`,
      ...timings.map(t => 
        t.description 
          ? `${t.name};dur=${t.duration.toFixed(2)};desc="${t.description}"`
          : `${t.name};dur=${t.duration.toFixed(2)}`
      ),
    ];
    
    res.setHeader('Server-Timing', timingValues.join(', '));
    
    return originalSend.call(this, body);
  };
  
  next();
}

// ============================================================================
// Slow Request Logging
// ============================================================================

interface SlowRequestLoggerOptions {
  threshold?: number;
  logger?: (message: string, data: any) => void;
}

export function slowRequestLogger(options: SlowRequestLoggerOptions = {}) {
  const { 
    threshold = 200, 
    logger = console.warn 
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > threshold) {
        logger(`Slow request: ${req.method} ${req.path}`, {
          method: req.method,
          path: req.path,
          query: req.query,
          duration: `${duration}ms`,
          status: res.statusCode,
          userId: (req as any).user?.id,
        });
      }
    });
    
    next();
  };
}

// ============================================================================
// Cache Headers
// ============================================================================

interface CacheOptions {
  maxAge?: number;
  isPublic?: boolean;
  staleWhileRevalidate?: number;
}

export function cacheControl(options: CacheOptions = {}) {
  const {
    maxAge = 60,
    isPublic = true,
    staleWhileRevalidate = 60,
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    if ((req as any).user && !isPublic) {
      res.setHeader('Cache-Control', 'private, no-cache');
    } else {
      const directives = [
        isPublic ? 'public' : 'private',
        `max-age=${maxAge}`,
      ];
      
      if (staleWhileRevalidate > 0) {
        directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
      }
      
      res.setHeader('Cache-Control', directives.join(', '));
    }
    
    next();
  };
}

export function noCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

// ============================================================================
// Request ID
// ============================================================================

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id'] as string || 
    `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  
  (req as any).requestId = id;
  res.setHeader('X-Request-ID', id);
  
  next();
}

// ============================================================================
// Combined Performance Middleware
// ============================================================================

export function applyPerformanceMiddleware(app: Express): void {
  app.use(compressionMiddleware);
  app.use(serverTiming);
  app.use(slowRequestLogger({ threshold: 200 }));
  
  console.log('✓ Performance middleware applied (compression, timing, slow-request logging)');
}
