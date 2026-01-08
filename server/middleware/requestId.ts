import { RequestHandler } from 'express';
import crypto from 'crypto';

interface RequestMetrics {
  totalRequests: number;
  totalErrors: number;
  totalLatencyMs: number;
  requestsByPath: Map<string, number>;
  errorsByPath: Map<string, number>;
  latencyByPath: Map<string, number[]>;
}

const metrics: RequestMetrics = {
  totalRequests: 0,
  totalErrors: 0,
  totalLatencyMs: 0,
  requestsByPath: new Map(),
  errorsByPath: new Map(),
  latencyByPath: new Map(),
};

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const requestId = req.headers['x-request-id'] as string || 
                   crypto.randomBytes(8).toString('hex');
  (req as any).requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

export const requestLoggingMiddleware: RequestHandler = (req, res, next) => {
  const start = Date.now();
  const requestId = (req as any).requestId || 'unknown';
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.path;
    const status = res.statusCode;
    
    if (path.startsWith('/api')) {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        method: req.method,
        path,
        status,
        duration,
        userAgent: req.headers['user-agent']?.substring(0, 100),
      }));
    }
  });
  
  next();
};

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const start = Date.now();
  const path = normalizePath(req.path);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    metrics.totalRequests++;
    metrics.totalLatencyMs += duration;
    
    metrics.requestsByPath.set(path, (metrics.requestsByPath.get(path) || 0) + 1);
    
    if (res.statusCode >= 400) {
      metrics.totalErrors++;
      metrics.errorsByPath.set(path, (metrics.errorsByPath.get(path) || 0) + 1);
    }
    
    const latencies = metrics.latencyByPath.get(path) || [];
    latencies.push(duration);
    if (latencies.length > 100) latencies.shift();
    metrics.latencyByPath.set(path, latencies);
  });
  
  next();
};

function normalizePath(path: string): string {
  return path
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[a-f0-9-]{36}/gi, '/:uuid');
}

function calculatePercentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export const metricsEndpoint: RequestHandler = (req, res) => {
  const pathMetrics: Record<string, any> = {};
  
  for (const [path, count] of metrics.requestsByPath) {
    const latencies = metrics.latencyByPath.get(path) || [];
    pathMetrics[path] = {
      requests: count,
      errors: metrics.errorsByPath.get(path) || 0,
      latency: {
        p50: calculatePercentile(latencies, 50),
        p95: calculatePercentile(latencies, 95),
        p99: calculatePercentile(latencies, 99),
      },
    };
  }
  
  res.json({
    uptime: process.uptime(),
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    errorRate: metrics.totalRequests > 0 
      ? (metrics.totalErrors / metrics.totalRequests * 100).toFixed(2) + '%' 
      : '0%',
    avgLatencyMs: metrics.totalRequests > 0 
      ? Math.round(metrics.totalLatencyMs / metrics.totalRequests) 
      : 0,
    paths: pathMetrics,
  });
};
