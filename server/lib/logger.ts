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

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
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
  const entry: Record<string, unknown> = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...context,
  };
  
  if (context.err) {
    entry.error = formatError(context.err);
    delete entry.err;
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

export const logger = {
  debug: (contextOrMessage: LogContext | string, message?: string) => 
    log('debug', contextOrMessage, message),
  info: (contextOrMessage: LogContext | string, message?: string) => 
    log('info', contextOrMessage, message),
  warn: (contextOrMessage: LogContext | string, message?: string) => 
    log('warn', contextOrMessage, message),
  error: (contextOrMessage: LogContext | string, message?: string) => 
    log('error', contextOrMessage, message),
};
