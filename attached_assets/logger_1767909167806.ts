/**
 * Structured Logger Utility
 * 
 * Provides consistent JSON-formatted logging for observability.
 * All logs include timestamp, level, and can include arbitrary context.
 * 
 * Usage:
 * ```typescript
 * import { logger } from './logger';
 * 
 * logger.info('User logged in', { userId: '123', ip: '1.2.3.4' });
 * logger.error('Database connection failed', { error: err.message, retryCount: 3 });
 * logger.warn('Rate limit approaching', { current: 95, limit: 100 });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

interface LoggerOptions {
  minLevel?: LogLevel;
  pretty?: boolean;
  includeStack?: boolean;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel;
  private pretty: boolean;
  private includeStack: boolean;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.pretty = options.pretty ?? (process.env.NODE_ENV !== 'production');
    this.includeStack = options.includeStack ?? false;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    if (this.pretty) {
      const { level, message, timestamp, ...rest } = entry;
      const contextStr = Object.keys(rest).length > 0 
        ? '\n  ' + JSON.stringify(rest, null, 2).split('\n').join('\n  ')
        : '';
      return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${contextStr}`;
    }
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Add stack trace for errors if enabled
    if (level === 'error' && this.includeStack && context.error instanceof Error) {
      entry.stack = context.error.stack;
    }

    const formatted = this.formatEntry(entry);

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Create a child logger with additional default context.
   * Useful for adding request IDs or user IDs to all logs in a scope.
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.defaultContext, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.defaultContext, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.defaultContext, ...context });
  }

  error(message: string, context?: LogContext): void {
    this.parent.error(message, { ...this.defaultContext, ...context });
  }
}

// Export singleton instance
export const logger = new Logger({
  minLevel: process.env.LOG_LEVEL as LogLevel | undefined,
  pretty: process.env.NODE_ENV !== 'production',
  includeStack: true,
});

// Export class for custom instances
export { Logger, LogLevel, LogContext };

/**
 * Express middleware for request logging.
 * Adds a child logger to each request with correlation ID.
 */
export function requestLogger() {
  return (req: any, res: any, next: () => void) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || generateRequestId();
    
    // Attach logger to request
    req.log = logger.child({
      requestId,
      method: req.method,
      path: req.path,
      userId: req.user?.id,
    });

    // Log request
    req.log.info('Request started');

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      req.log.info('Request completed', {
        statusCode: res.statusCode,
        duration_ms: duration,
      });
    });

    next();
  };
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Performance tracking utilities.
 */
export const perf = {
  /**
   * Mark the start of an operation.
   */
  start(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      logger.debug(`Performance: ${label}`, { duration_ms: duration.toFixed(2) });
    };
  },

  /**
   * Time an async operation.
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - startTime;
      logger.debug(`Performance: ${label}`, { duration_ms: duration.toFixed(2) });
    }
  },
};
