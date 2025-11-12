/**
 * Standardized API Error Handler
 * Ensures consistent error responses across all endpoints
 */

import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
  timestamp: string
}

export interface ApiErrorResponse {
  success: false
  error: ApiError
}

/**
 * Create a standardized error response
 */
export function apiError(
  message: string,
  code: string,
  status: number = 500,
  details?: Record<string, any>
): NextResponse<ApiErrorResponse> {
  const error: ApiError = {
    message,
    code,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  }

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT: 'INVALID_INPUT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Not Found
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',

  // Business Logic
  INVALID_STATE: 'INVALID_STATE',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const

/**
 * Helper functions for common errors
 */
export const apiErrors = {
  unauthorized: (message = 'Authentication required') =>
    apiError(message, ErrorCodes.UNAUTHORIZED, 401),

  forbidden: (message = 'Access denied') =>
    apiError(message, ErrorCodes.FORBIDDEN, 403),

  notFound: (message = 'Resource not found') =>
    apiError(message, ErrorCodes.NOT_FOUND, 404),

  validation: (message: string, details?: Record<string, any>) =>
    apiError(message, ErrorCodes.VALIDATION_ERROR, 400, details),

  rateLimit: (message = 'Rate limit exceeded') =>
    apiError(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429),

  internal: (message = 'Internal server error') =>
    apiError(message, ErrorCodes.INTERNAL_ERROR, 500),

  database: (message = 'Database operation failed') =>
    apiError(message, ErrorCodes.DATABASE_ERROR, 500),
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error: any) {
      console.error('[API Error]:', error)

      // Handle known error types
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          return apiErrors.unauthorized(error.message)
        }
        if (error.message.includes('Forbidden')) {
          return apiErrors.forbidden(error.message)
        }
        if (error.message.includes('Not found')) {
          return apiErrors.notFound(error.message)
        }
        if (error.message.includes('Validation')) {
          return apiErrors.validation(error.message)
        }
      }

      // Default to internal error
      return apiErrors.internal(
        error?.message || 'An unexpected error occurred'
      )
    }
  }
}

