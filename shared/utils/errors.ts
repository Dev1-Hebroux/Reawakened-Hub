/**
 * Error Handling System
 * 
 * Comprehensive error handling with typed error codes,
 * user-friendly messages, and recovery suggestions.
 * Used consistently across client and server.
 */

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCode = {
  // Authentication Errors (1xxx)
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_REFRESH_FAILED: 'AUTH_TOKEN_REFRESH_FAILED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_ACCOUNT_DISABLED: 'AUTH_ACCOUNT_DISABLED',
  
  // Validation Errors (2xxx)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  VALIDATION_TOO_LONG: 'VALIDATION_TOO_LONG',
  VALIDATION_TOO_SHORT: 'VALIDATION_TOO_SHORT',
  VALIDATION_DUPLICATE: 'VALIDATION_DUPLICATE',
  
  // Resource Errors (3xxx)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_DELETED: 'RESOURCE_DELETED',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business Logic Errors (4xxx)
  BUSINESS_DAY_LOCKED: 'BUSINESS_DAY_LOCKED',
  BUSINESS_PREREQUISITE_NOT_MET: 'BUSINESS_PREREQUISITE_NOT_MET',
  BUSINESS_LIMIT_REACHED: 'BUSINESS_LIMIT_REACHED',
  BUSINESS_INVALID_STATE: 'BUSINESS_INVALID_STATE',
  BUSINESS_ALREADY_COMPLETED: 'BUSINESS_ALREADY_COMPLETED',
  BUSINESS_NOT_ENROLLED: 'BUSINESS_NOT_ENROLLED',
  BUSINESS_GROUP_FULL: 'BUSINESS_GROUP_FULL',
  BUSINESS_INVALID_CODE: 'BUSINESS_INVALID_CODE',
  
  // Rate Limiting Errors (5xxx)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_AUTH: 'RATE_LIMIT_AUTH',
  RATE_LIMIT_API: 'RATE_LIMIT_API',
  
  // Network Errors (6xxx)
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_REQUEST_FAILED: 'NETWORK_REQUEST_FAILED',
  
  // Server Errors (7xxx)
  SERVER_ERROR: 'SERVER_ERROR',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
  SERVER_DATABASE_ERROR: 'SERVER_DATABASE_ERROR',
  SERVER_EXTERNAL_SERVICE_ERROR: 'SERVER_EXTERNAL_SERVICE_ERROR',
  
  // File Errors (8xxx)
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',
  
  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ============================================================================
// Error Messages
// ============================================================================

interface ErrorDefinition {
  message: string;
  userMessage: string;
  httpStatus: number;
  recoveryAction?: string;
  retryable: boolean;
}

export const errorDefinitions: Record<ErrorCodeType, ErrorDefinition> = {
  // Authentication Errors
  [ErrorCode.AUTH_REQUIRED]: {
    message: 'Authentication required',
    userMessage: 'Please sign in to continue.',
    httpStatus: 401,
    recoveryAction: 'Sign in to your account',
    retryable: false,
  },
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    message: 'Invalid credentials',
    userMessage: 'The email or password you entered is incorrect.',
    httpStatus: 401,
    recoveryAction: 'Check your credentials and try again',
    retryable: false,
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    message: 'Session expired',
    userMessage: 'Your session has expired. Please sign in again.',
    httpStatus: 401,
    recoveryAction: 'Sign in again',
    retryable: false,
  },
  [ErrorCode.AUTH_TOKEN_INVALID]: {
    message: 'Invalid token',
    userMessage: 'Your session is invalid. Please sign in again.',
    httpStatus: 401,
    retryable: false,
  },
  [ErrorCode.AUTH_TOKEN_REFRESH_FAILED]: {
    message: 'Token refresh failed',
    userMessage: 'Unable to refresh your session. Please sign in again.',
    httpStatus: 401,
    retryable: false,
  },
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: {
    message: 'Insufficient permissions',
    userMessage: "You don't have permission to perform this action.",
    httpStatus: 403,
    retryable: false,
  },
  [ErrorCode.AUTH_ACCOUNT_DISABLED]: {
    message: 'Account disabled',
    userMessage: 'Your account has been disabled. Please contact support.',
    httpStatus: 403,
    recoveryAction: 'Contact support',
    retryable: false,
  },
  
  // Validation Errors
  [ErrorCode.VALIDATION_FAILED]: {
    message: 'Validation failed',
    userMessage: 'Please check your input and try again.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: {
    message: 'Required field missing',
    userMessage: 'Please fill in all required fields.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.VALIDATION_INVALID_FORMAT]: {
    message: 'Invalid format',
    userMessage: 'Please check the format of your input.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: {
    message: 'Value out of range',
    userMessage: 'The value you entered is outside the allowed range.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.VALIDATION_TOO_LONG]: {
    message: 'Value too long',
    userMessage: 'Your input exceeds the maximum length.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.VALIDATION_TOO_SHORT]: {
    message: 'Value too short',
    userMessage: 'Your input is too short.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.VALIDATION_DUPLICATE]: {
    message: 'Duplicate value',
    userMessage: 'This value already exists.',
    httpStatus: 400,
    retryable: false,
  },
  
  // Resource Errors
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    message: 'Resource not found',
    userMessage: "The item you're looking for doesn't exist or has been removed.",
    httpStatus: 404,
    retryable: false,
  },
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: {
    message: 'Resource already exists',
    userMessage: 'This item already exists.',
    httpStatus: 409,
    retryable: false,
  },
  [ErrorCode.RESOURCE_DELETED]: {
    message: 'Resource deleted',
    userMessage: 'This item has been deleted.',
    httpStatus: 410,
    retryable: false,
  },
  [ErrorCode.RESOURCE_LOCKED]: {
    message: 'Resource locked',
    userMessage: 'This item is currently locked and cannot be modified.',
    httpStatus: 423,
    retryable: true,
  },
  [ErrorCode.RESOURCE_CONFLICT]: {
    message: 'Resource conflict',
    userMessage: 'This item was modified by someone else. Please refresh and try again.',
    httpStatus: 409,
    recoveryAction: 'Refresh the page',
    retryable: true,
  },
  
  // Business Logic Errors
  [ErrorCode.BUSINESS_DAY_LOCKED]: {
    message: 'Day is locked',
    userMessage: 'Complete the previous day to unlock this one.',
    httpStatus: 403,
    retryable: false,
  },
  [ErrorCode.BUSINESS_PREREQUISITE_NOT_MET]: {
    message: 'Prerequisite not met',
    userMessage: 'Please complete the required prerequisites first.',
    httpStatus: 403,
    retryable: false,
  },
  [ErrorCode.BUSINESS_LIMIT_REACHED]: {
    message: 'Limit reached',
    userMessage: "You've reached the maximum limit.",
    httpStatus: 403,
    retryable: false,
  },
  [ErrorCode.BUSINESS_INVALID_STATE]: {
    message: 'Invalid state',
    userMessage: 'This action cannot be performed in the current state.',
    httpStatus: 400,
    retryable: false,
  },
  [ErrorCode.BUSINESS_ALREADY_COMPLETED]: {
    message: 'Already completed',
    userMessage: "You've already completed this.",
    httpStatus: 409,
    retryable: false,
  },
  [ErrorCode.BUSINESS_NOT_ENROLLED]: {
    message: 'Not enrolled',
    userMessage: 'You need to enroll first.',
    httpStatus: 403,
    recoveryAction: 'Enroll to get started',
    retryable: false,
  },
  [ErrorCode.BUSINESS_GROUP_FULL]: {
    message: 'Group is full',
    userMessage: 'This group has reached its maximum capacity.',
    httpStatus: 403,
    retryable: false,
  },
  [ErrorCode.BUSINESS_INVALID_CODE]: {
    message: 'Invalid code',
    userMessage: 'The code you entered is invalid or has expired.',
    httpStatus: 400,
    retryable: false,
  },
  
  // Rate Limiting Errors
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    message: 'Rate limit exceeded',
    userMessage: "You're doing that too fast. Please wait a moment.",
    httpStatus: 429,
    recoveryAction: 'Wait and try again',
    retryable: true,
  },
  [ErrorCode.RATE_LIMIT_AUTH]: {
    message: 'Too many authentication attempts',
    userMessage: 'Too many sign-in attempts. Please wait before trying again.',
    httpStatus: 429,
    retryable: true,
  },
  [ErrorCode.RATE_LIMIT_API]: {
    message: 'API rate limit exceeded',
    userMessage: "You've made too many requests. Please wait a moment.",
    httpStatus: 429,
    retryable: true,
  },
  
  // Network Errors
  [ErrorCode.NETWORK_OFFLINE]: {
    message: 'Network offline',
    userMessage: "You're offline. Please check your internet connection.",
    httpStatus: 0,
    recoveryAction: 'Check your connection',
    retryable: true,
  },
  [ErrorCode.NETWORK_TIMEOUT]: {
    message: 'Request timeout',
    userMessage: 'The request took too long. Please try again.',
    httpStatus: 408,
    retryable: true,
  },
  [ErrorCode.NETWORK_REQUEST_FAILED]: {
    message: 'Request failed',
    userMessage: 'Unable to connect. Please check your internet connection.',
    httpStatus: 0,
    retryable: true,
  },
  
  // Server Errors
  [ErrorCode.SERVER_ERROR]: {
    message: 'Server error',
    userMessage: 'Something went wrong on our end. Please try again.',
    httpStatus: 500,
    retryable: true,
  },
  [ErrorCode.SERVER_UNAVAILABLE]: {
    message: 'Server unavailable',
    userMessage: "We're currently experiencing issues. Please try again later.",
    httpStatus: 503,
    retryable: true,
  },
  [ErrorCode.SERVER_DATABASE_ERROR]: {
    message: 'Database error',
    userMessage: 'A technical error occurred. Please try again.',
    httpStatus: 500,
    retryable: true,
  },
  [ErrorCode.SERVER_EXTERNAL_SERVICE_ERROR]: {
    message: 'External service error',
    userMessage: 'An external service is unavailable. Please try again later.',
    httpStatus: 502,
    retryable: true,
  },
  
  // File Errors
  [ErrorCode.FILE_TOO_LARGE]: {
    message: 'File too large',
    userMessage: 'The file is too large. Please choose a smaller file.',
    httpStatus: 413,
    retryable: false,
  },
  [ErrorCode.FILE_INVALID_TYPE]: {
    message: 'Invalid file type',
    userMessage: 'This file type is not supported.',
    httpStatus: 415,
    retryable: false,
  },
  [ErrorCode.FILE_UPLOAD_FAILED]: {
    message: 'Upload failed',
    userMessage: 'Failed to upload the file. Please try again.',
    httpStatus: 500,
    retryable: true,
  },
  [ErrorCode.FILE_PROCESSING_FAILED]: {
    message: 'File processing failed',
    userMessage: 'Failed to process the file. Please try a different file.',
    httpStatus: 422,
    retryable: false,
  },
  
  // Unknown
  [ErrorCode.UNKNOWN]: {
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    httpStatus: 500,
    retryable: true,
  },
};

// ============================================================================
// Application Error Class
// ============================================================================

export interface AppErrorDetails {
  field?: string;
  value?: unknown;
  constraint?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly httpStatus: number;
  public readonly userMessage: string;
  public readonly details?: AppErrorDetails;
  public readonly retryable: boolean;
  public readonly recoveryAction?: string;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  
  constructor(
    code: ErrorCodeType,
    options?: {
      message?: string;
      details?: AppErrorDetails;
      requestId?: string;
      cause?: Error;
    }
  ) {
    const definition = errorDefinitions[code] || errorDefinitions[ErrorCode.UNKNOWN];
    
    super(options?.message || definition.message);
    
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = definition.httpStatus;
    this.userMessage = definition.userMessage;
    this.retryable = definition.retryable;
    this.recoveryAction = definition.recoveryAction;
    this.details = options?.details;
    this.requestId = options?.requestId;
    this.timestamp = new Date();
    
    if (options?.cause) {
      this.cause = options.cause;
    }
    
    Error.captureStackTrace?.(this, AppError);
  }
  
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      httpStatus: this.httpStatus,
      retryable: this.retryable,
      recoveryAction: this.recoveryAction,
      details: this.details,
      requestId: this.requestId,
      timestamp: this.timestamp.toISOString(),
    };
  }
  
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
  
  static fromUnknown(error: unknown, requestId?: string): AppError {
    if (AppError.isAppError(error)) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AppError(ErrorCode.UNKNOWN, {
        message: error.message,
        requestId,
        cause: error,
      });
    }
    
    return new AppError(ErrorCode.UNKNOWN, {
      message: String(error),
      requestId,
    });
  }
}

// ============================================================================
// Error Factory Functions
// ============================================================================

export const Errors = {
  // Authentication
  authRequired: (requestId?: string) => 
    new AppError(ErrorCode.AUTH_REQUIRED, { requestId }),
  
  invalidCredentials: (requestId?: string) => 
    new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, { requestId }),
  
  sessionExpired: (requestId?: string) => 
    new AppError(ErrorCode.AUTH_SESSION_EXPIRED, { requestId }),
  
  insufficientPermissions: (requiredRole?: string, requestId?: string) => 
    new AppError(ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS, { 
      details: requiredRole ? { requiredRole } : undefined,
      requestId,
    }),
  
  // Resources
  notFound: (resourceType: string, resourceId?: string | number, requestId?: string) => 
    new AppError(ErrorCode.RESOURCE_NOT_FOUND, { 
      message: `${resourceType} not found`,
      details: resourceId ? { resourceType, resourceId } : { resourceType },
      requestId,
    }),
  
  alreadyExists: (resourceType: string, field?: string, requestId?: string) => 
    new AppError(ErrorCode.RESOURCE_ALREADY_EXISTS, { 
      message: `${resourceType} already exists`,
      details: { resourceType, field },
      requestId,
    }),
  
  conflict: (message?: string, requestId?: string) => 
    new AppError(ErrorCode.RESOURCE_CONFLICT, { message, requestId }),
  
  // Validation
  validationFailed: (errors: Record<string, string[]>, requestId?: string) => 
    new AppError(ErrorCode.VALIDATION_FAILED, { 
      details: { errors },
      requestId,
    }),
  
  requiredField: (field: string, requestId?: string) => 
    new AppError(ErrorCode.VALIDATION_REQUIRED_FIELD, { 
      message: `${field} is required`,
      details: { field },
      requestId,
    }),
  
  invalidFormat: (field: string, expectedFormat?: string, requestId?: string) => 
    new AppError(ErrorCode.VALIDATION_INVALID_FORMAT, { 
      message: `Invalid format for ${field}`,
      details: { field, expectedFormat },
      requestId,
    }),
  
  // Business Logic
  dayLocked: (dayNumber: number, requestId?: string) => 
    new AppError(ErrorCode.BUSINESS_DAY_LOCKED, { 
      message: `Day ${dayNumber} is locked`,
      details: { dayNumber },
      requestId,
    }),
  
  notEnrolled: (contentType: string, contentId: number, requestId?: string) => 
    new AppError(ErrorCode.BUSINESS_NOT_ENROLLED, { 
      details: { contentType, contentId },
      requestId,
    }),
  
  groupFull: (groupId: number, maxMembers: number, requestId?: string) => 
    new AppError(ErrorCode.BUSINESS_GROUP_FULL, { 
      details: { groupId, maxMembers },
      requestId,
    }),
  
  limitReached: (limitType: string, currentCount: number, maxCount: number, requestId?: string) => 
    new AppError(ErrorCode.BUSINESS_LIMIT_REACHED, { 
      message: `${limitType} limit reached`,
      details: { limitType, currentCount, maxCount },
      requestId,
    }),
  
  // Rate Limiting
  rateLimitExceeded: (retryAfter?: number, requestId?: string) => 
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, { 
      details: retryAfter ? { retryAfter } : undefined,
      requestId,
    }),
  
  // Server
  serverError: (message?: string, requestId?: string) => 
    new AppError(ErrorCode.SERVER_ERROR, { message, requestId }),
  
  databaseError: (message?: string, requestId?: string) => 
    new AppError(ErrorCode.SERVER_DATABASE_ERROR, { message, requestId }),
  
  // File
  fileTooLarge: (maxSize: number, actualSize: number, requestId?: string) => 
    new AppError(ErrorCode.FILE_TOO_LARGE, { 
      details: { maxSize, actualSize },
      requestId,
    }),
  
  invalidFileType: (allowedTypes: string[], actualType: string, requestId?: string) => 
    new AppError(ErrorCode.FILE_INVALID_TYPE, { 
      details: { allowedTypes, actualType },
      requestId,
    }),
};

// ============================================================================
// Error Utilities
// ============================================================================

const LOGIN_REDIRECT_CODES: ErrorCodeType[] = [
  ErrorCode.AUTH_REQUIRED,
  ErrorCode.AUTH_SESSION_EXPIRED,
  ErrorCode.AUTH_TOKEN_INVALID,
  ErrorCode.AUTH_TOKEN_REFRESH_FAILED,
];

export function shouldRedirectToLogin(error: unknown): boolean {
  if (!AppError.isAppError(error)) return false;
  
  return LOGIN_REDIRECT_CODES.includes(error.code);
}

export function isRetryable(error: unknown): boolean {
  if (AppError.isAppError(error)) {
    return error.retryable;
  }
  
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }
  
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (AppError.isAppError(error)) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function getRecoveryAction(error: unknown): string | undefined {
  if (AppError.isAppError(error)) {
    return error.recoveryAction;
  }
  
  return undefined;
}
