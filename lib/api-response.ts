/**
 * API Response Utilities
 * 
 * Provides utilities for standardized API responses with:
 * - Response caching strategies
 * - Error handling
 * - Metadata attachment
 * - Type safety
 */

import { NextResponse } from 'next/server';
import { trackAPIRequest } from './api-analytics';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a cached API response
 * 
 * @param data - Response data
 * @param maxAge - Maximum age in seconds (default: 60)
 * @param staleWhileRevalidate - Stale-while-revalidate time in seconds (default: 300)
 */
export function cachedResponse<T>(
  data: T,
  maxAge = 60,
  staleWhileRevalidate = 300,
  tags?: string[]
): NextResponse<ApiResponse<T>> {
  const response = NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>,
    {
      headers: {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
        'X-Cache-Strategy': 'stale-while-revalidate',
      },
    }
  );

  // Add cache tags if provided
  if (tags && tags.length > 0) {
    return addCacheTags(response, tags);
  }

  return response;
}

/**
 * Create a no-cache API response
 * 
 * Use for sensitive data, real-time data, or POST/PUT/DELETE responses
 */
export function noCacheResponse<T>(
  data: T,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>,
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Strategy': 'no-cache',
      },
    }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string | Error,
  status = 500,
  metadata?: Record<string, any>
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      ...(metadata && { metadata }),
    } as ApiResponse,
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  metadata?: Record<string, any>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      ...(metadata && { metadata }),
    } as ApiResponse<T>,
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  maxAge = 60
): NextResponse<ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>> {
  const totalPages = Math.ceil(total / pageSize);
  
  return NextResponse.json(
    {
      success: true,
      data: {
        items: data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=300`,
        'X-Cache-Strategy': 'paginated',
      },
    }
  );
}

/**
 * Add request ID to response
 */
export function withRequestId<T>(
  response: NextResponse<T>,
  requestId: string
): NextResponse<T> {
  response.headers.set('X-Request-ID', requestId);
  return response;
}

/**
 * Combine multiple response utilities
 */
export function createCachedSuccessResponse<T>(
  data: T,
  requestId?: string,
  maxAge = 60
): NextResponse<ApiResponse<T>> {
  let response = cachedResponse(data, maxAge);
  
  if (requestId) {
    response = withRequestId(response, requestId);
  }
  
  return response;
}

/**
 * Wrap API handler with automatic analytics tracking
 */
export function withAPIAnalytics<T>(
  handler: (req: Request) => Promise<Response>,
  endpoint: string
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const startTime = Date.now();
    let statusCode = 200;
    let error: string | undefined;

    try {
      const response = await handler(req);
      statusCode = response.status;

      // Track successful request
      const responseTime = Date.now() - startTime;
      await trackAPIRequest(
        endpoint,
        req.method,
        statusCode,
        responseTime
      );

      return response;
    } catch (err) {
      statusCode = 500;
      error = err instanceof Error ? err.message : 'Unknown error';
      const responseTime = Date.now() - startTime;

      // Track failed request
      await trackAPIRequest(
        endpoint,
        req.method,
        statusCode,
        responseTime,
        { error }
      );

      throw err;
    }
  };
}

