/**
 * Production Error Handling & Logging
 * Centralized error handling for production environment
 */

export interface ErrorContext {
  userId?: string;
  dealerId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  path?: string;
  method?: string;
  timestamp?: Date;
}

export class ProductionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: ErrorContext,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'ProductionError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error logger for production
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logLevel: 'error' | 'warn' | 'info' | 'debug' = 'error';

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as any) || 'error';
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log error with context
   */
  logError(error: Error | ProductionError, context?: ErrorContext): void {
    const errorData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error instanceof ProductionError ? error.code : 'UNKNOWN_ERROR',
      statusCode: error instanceof ProductionError ? error.statusCode : 500,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    };

    // Log to console in production (will be captured by logging service)
    console.error('[ERROR]', JSON.stringify(errorData, null, 2));

    // Send to external logging service (Sentry, LogRocket, etc.)
    if (process.env.SENTRY_DSN) {
      this.sendToSentry(error, context);
    }
  }

  /**
   * Log warning
   */
  logWarning(message: string, context?: ErrorContext): void {
    if (this.logLevel === 'error') return;

    console.warn('[WARNING]', {
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: ErrorContext): void {
    if (this.logLevel === 'error' || this.logLevel === 'warn') return;

    console.info('[INFO]', {
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(error: Error, context?: ErrorContext): void {
    // Sentry integration would go here
    // For now, just log that it would be sent
    if (process.env.NODE_ENV === 'production') {
      // In production, this would actually send to Sentry
      // import * as Sentry from '@sentry/nextjs';
      // Sentry.captureException(error, { contexts: { custom: context } });
    }
  }
}

/**
 * API Error Handler Wrapper
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const logger = ErrorLogger.getInstance();
    const context: ErrorContext = {
      timestamp: new Date(),
      path: args[0]?.url,
      method: args[0]?.method,
    };

    try {
      return await handler(...args);
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );

      const statusCode =
        error instanceof ProductionError
          ? error.statusCode
          : 500;

      const message =
        process.env.NODE_ENV === 'production'
          ? 'An internal error occurred'
          : error instanceof Error
          ? error.message
          : 'Unknown error';

      return new Response(
        JSON.stringify({
          error: message,
          code: error instanceof ProductionError ? error.code : 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number = 500,
  context?: ErrorContext
): Response {
  const logger = ErrorLogger.getInstance();
  const error = new ProductionError(message, code, statusCode, context);
  logger.logError(error, context);

  return new Response(
    JSON.stringify({
      error: message,
      code,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Common error codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

