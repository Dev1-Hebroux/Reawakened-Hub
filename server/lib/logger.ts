/**
 * Structured Logging Library
 * 
 * Provides structured JSON logging with request correlation,
 * performance metrics, and environment-aware configuration.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  err?: Error | unknown;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDevelopment = process.env.NODE_ENV === 'development';
const configuredLevel = (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? 'debug' : 'info');
const minLevel = LOG_LEVELS[configuredLevel] || LOG_LEVELS.info;

// Sensitive fields to redact
const REDACT_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'authorization',
  'cookie',
  'secret',
];

function redactSensitive(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitive(item, depth + 1));
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (REDACT_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactSensitive(value, depth + 1);
      }
    }
    return result;
  }
  
  return obj;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= minLevel;
}

function formatError(err: unknown): Record<string, unknown> | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return { message: String(err) };
}

function createLogEntry(level: LogLevel, context: LogContext, message: string): string {
  const redactedContext = redactSensitive(context) as LogContext;
  
  const entry: Record<string, unknown> = {
    level,
    timestamp: new Date().toISOString(),
    message,
    service: 'reawakened-api',
    env: process.env.NODE_ENV,
    ...redactedContext,
  };
  
  if (redactedContext.err) {
    entry.error = formatError(redactedContext.err);
    delete entry.err;
  }
  
  if (isDevelopment) {
    const contextStr = Object.keys(redactedContext).length > 0 ? ` ${JSON.stringify(redactedContext)}` : '';
    return `[${entry.timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }
  
  return JSON.stringify(entry);
}

function log(level: LogLevel, contextOrMessage: LogContext | string, message?: string): void {
  if (!shouldLog(level)) return;
  
  let ctx: LogContext;
  let msg: string;
  
  if (typeof contextOrMessage === 'string') {
    ctx = {};
    msg = contextOrMessage;
  } else {
    ctx = contextOrMessage;
    msg = message || '';
  }
  
  const logLine = createLogEntry(level, ctx, msg);
  
  switch (level) {
    case 'error':
      console.error(logLine);
      break;
    case 'warn':
      console.warn(logLine);
      break;
    default:
      console.log(logLine);
  }
}

class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  debug(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      log('debug', this.context, contextOrMessage);
    } else {
      log('debug', { ...this.context, ...contextOrMessage }, message);
    }
  }

  info(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      log('info', this.context, contextOrMessage);
    } else {
      log('info', { ...this.context, ...contextOrMessage }, message);
    }
  }

  warn(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      log('warn', this.context, contextOrMessage);
    } else {
      log('warn', { ...this.context, ...contextOrMessage }, message);
    }
  }

  error(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      log('error', this.context, contextOrMessage);
    } else {
      log('error', { ...this.context, ...contextOrMessage }, message);
    }
  }
}

export const logger = new Logger();

export function createLogger(context: LogContext): Logger {
  return logger.child(context);
}

export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({ requestId, userId });
}

// ============================================================================
// Logging Utilities
// ============================================================================

export function logRequest(
  requestLogger: Logger,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  metadata?: LogContext
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  requestLogger[level]({
    type: 'http_request',
    method,
    path,
    statusCode,
    durationMs,
    ...metadata,
  }, `${method} ${path} ${statusCode} ${durationMs}ms`);
}

export function logQuery(
  requestLogger: Logger,
  query: string,
  durationMs: number,
  rowCount?: number
): void {
  requestLogger.debug({
    type: 'db_query',
    query: query.substring(0, 200),
    durationMs,
    rowCount,
  }, `DB query completed in ${durationMs}ms`);
}

export function logEvent(
  requestLogger: Logger,
  eventType: string,
  eventData: LogContext
): void {
  requestLogger.info({
    type: 'business_event',
    eventType,
    ...eventData,
  }, `Event: ${eventType}`);
}

export function logError(
  requestLogger: Logger,
  error: Error,
  context?: LogContext
): void {
  requestLogger.error({
    type: 'error',
    err: error,
    ...context,
  }, error.message);
}

// ============================================================================
// Performance Tracking
// ============================================================================

export function createTimer(): { elapsed: () => number } {
  const start = Date.now();
  
  return {
    elapsed(): number {
      return Date.now() - start;
    },
  };
}

export async function withTiming<T>(
  requestLogger: Logger,
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = createTimer();
  
  try {
    const result = await fn();
    
    requestLogger.debug({
      type: 'timing',
      operation: operationName,
      durationMs: timer.elapsed(),
      success: true,
    }, `${operationName} completed`);
    
    return result;
  } catch (error) {
    requestLogger.error({
      type: 'timing',
      operation: operationName,
      durationMs: timer.elapsed(),
      success: false,
      err: error as Error,
    }, `${operationName} failed`);
    
    throw error;
  }
}

export default logger;
