/**
 * Standardized Error Handling
 * Provides consistent error responses across all API endpoints
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Standard error response format
 */
export function createErrorResponse(error: Error | AppError | unknown): NextResponse {
  let apiError: ApiError;

  if (error instanceof AppError) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };
  } else if (error instanceof Error) {
    apiError = {
      code: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  } else {
    apiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500,
    };
  }

  // Log error
  logger.error('API Error', {
    code: apiError.code,
    message: apiError.message,
    details: apiError.details,
    statusCode: apiError.statusCode,
  });

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        ...(apiError.details && { details: apiError.details }),
      },
    },
    { status: apiError.statusCode }
  );
}

/**
 * Success response format
 */
export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super('RATE_LIMIT_ERROR', message, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}
