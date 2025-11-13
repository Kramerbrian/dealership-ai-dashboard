/**
 * Standardized Error Response Format
 * Provides consistent error handling across all API endpoints
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export interface ApiSuccess<T = any> {
  ok: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Create standardized error response
 */
export function errorResponse(
  error: string | Error,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiError> {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorCode = code || (error instanceof Error ? error.name : 'UNKNOWN_ERROR');

  return NextResponse.json(
    {
      ok: false,
      error: errorMessage,
      code: errorCode,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ApiError> {
  return errorResponse(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    {
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    }
  );
}

/**
 * Handle authentication errors
 */
export function authError(reason: 'unauthenticated' | 'unauthorized' = 'unauthenticated'): NextResponse<ApiError> {
  return errorResponse(
    reason === 'unauthenticated' ? 'Authentication required' : 'Unauthorized',
    reason === 'unauthenticated' ? 401 : 403,
    reason === 'unauthenticated' ? 'UNAUTHENTICATED' : 'UNAUTHORIZED'
  );
}

/**
 * Handle rate limit errors
 */
export function rateLimitError(retryAfter?: number): NextResponse<ApiError> {
  const response = errorResponse(
    'Rate limit exceeded',
    429,
    'RATE_LIMIT_EXCEEDED',
    retryAfter ? { retryAfter } : undefined
  );

  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter));
  }

  return response;
}

/**
 * Handle not found errors
 */
export function notFoundError(resource: string = 'Resource'): NextResponse<ApiError> {
  return errorResponse(
    `${resource} not found`,
    404,
    'NOT_FOUND'
  );
}

/**
 * Handle internal server errors
 */
export function internalError(error: Error | string, details?: any): NextResponse<ApiError> {
  const message = error instanceof Error ? error.message : error;
  
  // Log error for monitoring
  console.error('Internal server error:', error, details);

  return errorResponse(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? details : undefined
  );
}

