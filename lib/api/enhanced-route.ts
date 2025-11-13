import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

// Initialize rate limiter (10 requests per 10 seconds per IP)
// Clean environment variables (trim whitespace)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

const ratelimit = redisUrl && redisToken
  ? new Ratelimit({
      redis: new Redis({
        url: redisUrl,
        token: redisToken,
      }),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null;

interface RouteOptions {
  requireAuth?: boolean;
  rateLimit?: boolean;
  validateSchema?: z.ZodSchema;
}

export function createAuthRoute(
  handler: (req: NextRequest, context?: { userId?: string }) => Promise<NextResponse>,
  options: RouteOptions = {}
) {
  const { requireAuth = false, rateLimit: enableRateLimit = true, validateSchema } = options;

  return async function (req: NextRequest) {
    const startTime = Date.now();
    let userId: string | undefined;

    try {
      // Rate limiting
      if (enableRateLimit && ratelimit) {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const { success, limit, reset, remaining } = await ratelimit.limit(ip);

        if (!success) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              limit,
              reset: new Date(reset).toISOString(),
              remaining
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
              }
            }
          );
        }
      }

      // Authentication
      if (requireAuth) {
        const { userId: authUserId } = getAuth(req);

        if (!authUserId) {
          return NextResponse.json(
            { error: 'Unauthorized - Authentication required' },
            { status: 401 }
          );
        }

        userId = authUserId;
      }

      // Request validation
      if (validateSchema) {
        try {
          const body = await req.json();
          validateSchema.parse(body);
          // Re-create request with validated body
          req = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(body),
          });
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Validation failed',
                details: validationError.errors
              },
              { status: 400 }
            );
          }
          throw validationError;
        }
      }

      // Execute handler
      const response = await handler(req, { userId });

      // Add performance metrics
      const duration = Date.now() - startTime;
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;

    } catch (error) {
      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          route: req.nextUrl.pathname,
          method: req.method,
        },
        extra: {
          userId,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
        },
      });

      console.error('Route error:', error);

      // Return appropriate error response
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = (error as any).statusCode || 500;

      return NextResponse.json(
        {
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }
  };
}

// Helper function for public routes
export function createPublicRoute(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: Omit<RouteOptions, 'requireAuth'> = {}
) {
  return createAuthRoute(handler, { ...options, requireAuth: false });
}

// Helper function for protected routes
export function createProtectedRoute(
  handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>,
  options: Omit<RouteOptions, 'requireAuth'> = {}
) {
  return createAuthRoute(
    handler as (req: NextRequest, context?: { userId?: string }) => Promise<NextResponse>,
    { ...options, requireAuth: true }
  );
}
