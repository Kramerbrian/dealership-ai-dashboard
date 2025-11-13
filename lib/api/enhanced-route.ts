/**
 * Enhanced API Route Wrapper
 * Provides: Authentication, Rate Limiting, Zod Validation, Error Handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { allow, rl_publicAPI, rl_telemetry } from '@/lib/ratelimit';
import { requireAdmin } from '@/lib/authRoles';

interface EnhancedRouteConfig {
  /** Require authentication */
  requireAuth?: boolean;
  /** Require admin role */
  requireAdmin?: boolean;
  /** Rate limit configuration */
  rateLimit?: {
    limiter: typeof rl_publicAPI | typeof rl_telemetry;
    key?: string;
  };
  /** Zod schema for request body validation */
  schema?: z.ZodSchema<any>;
  /** Zod schema for query params validation */
  querySchema?: z.ZodSchema<any>;
}

/**
 * Create an enhanced API route handler with built-in security
 */
export function createEnhancedApiRoute<T = any>(
  handler: (req: NextRequest, context: { userId?: string; user?: any; tenantId?: string }) => Promise<NextResponse<T>>,
  config: EnhancedRouteConfig = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Authentication check
      if (config.requireAuth || config.requireAdmin) {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json(
            { ok: false, error: 'Authentication required' },
            { status: 401 }
          );
        }

        // Admin check
        if (config.requireAdmin) {
          const adminCheck = await requireAdmin();
          if (!adminCheck.ok) {
            return NextResponse.json(
              { ok: false, error: adminCheck.reason === 'not_signed_in' ? 'Authentication required' : 'Admin access required' },
              { status: adminCheck.reason === 'not_signed_in' ? 401 : 403 }
            );
          }
        }

        // Get user and tenant context
        const user = await currentUser();
        const tenantId = user?.organizationMemberships?.[0]?.organization.id || userId;

        // 2. Rate limiting
        if (config.rateLimit) {
          const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
          const rateLimitKey = config.rateLimit.key || `${userId || ip}:${req.nextUrl.pathname}`;
          const rateLimitResult = await allow(config.rateLimit.limiter!, rateLimitKey);
          
          if (!rateLimitResult.success) {
            return NextResponse.json(
              { ok: false, error: 'Rate limit exceeded', rateLimited: true },
              { status: 429 }
            );
          }
        }

        // 3. Query params validation
        if (config.querySchema) {
          const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
          const queryResult = config.querySchema.safeParse(queryParams);
          if (!queryResult.success) {
            return NextResponse.json(
              { ok: false, error: 'Invalid query parameters', details: queryResult.error.errors },
              { status: 400 }
            );
          }
        }

        // 4. Request body validation
        if (config.schema && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
          let body;
          try {
            body = await req.json();
          } catch {
            return NextResponse.json(
              { ok: false, error: 'Invalid JSON in request body' },
              { status: 400 }
            );
          }

          const bodyResult = config.schema.safeParse(body);
          if (!bodyResult.success) {
            return NextResponse.json(
              { ok: false, error: 'Invalid request body', details: bodyResult.error.errors },
              { status: 400 }
            );
          }
        }

        // 5. Execute handler with context
        const userObj = await currentUser();
        const context = {
          userId: userObj?.id,
          user: userObj,
          tenantId: userObj?.organizationMemberships?.[0]?.organization.id || userObj?.id,
        };

        return await handler(req, context);
      } else {
        // Public endpoint - only rate limiting
        if (config.rateLimit) {
          const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
          const rateLimitKey = config.rateLimit.key || `public:${ip}:${req.nextUrl.pathname}`;
          const rateLimitResult = await allow(config.rateLimit.limiter!, rateLimitKey);
          
          if (!rateLimitResult.success) {
            return NextResponse.json(
              { ok: false, error: 'Rate limit exceeded', rateLimited: true },
              { status: 429 }
            );
          }
        }

        // Query params validation for public endpoints
        if (config.querySchema) {
          const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
          const queryResult = config.querySchema.safeParse(queryParams);
          if (!queryResult.success) {
            return NextResponse.json(
              { ok: false, error: 'Invalid query parameters', details: queryResult.error.errors },
              { status: 400 }
            );
          }
        }

        return await handler(req, {});
      }
    } catch (error: any) {
      console.error('Enhanced API route error:', error);
      return NextResponse.json(
        { ok: false, error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to create admin-protected routes
 */
export function createAdminRoute<T = any>(
  handler: (req: NextRequest, context: { userId: string; user: any; tenantId: string }) => Promise<NextResponse<T>>,
  options: Omit<EnhancedRouteConfig, 'requireAuth' | 'requireAdmin'> = {}
) {
  return createEnhancedApiRoute(handler, {
    ...options,
    requireAuth: true,
    requireAdmin: true,
    rateLimit: options.rateLimit || { limiter: rl_publicAPI },
  });
}

/**
 * Helper to create authenticated routes
 */
export function createAuthRoute<T = any>(
  handler: (req: NextRequest, context: { userId: string; user: any; tenantId: string }) => Promise<NextResponse<T>>,
  options: Omit<EnhancedRouteConfig, 'requireAuth'> = {}
) {
  return createEnhancedApiRoute(handler, {
    ...options,
    requireAuth: true,
    rateLimit: options.rateLimit || { limiter: rl_publicAPI },
  });
}

/**
 * Helper to create public routes with rate limiting
 */
export function createPublicRoute<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  options: Omit<EnhancedRouteConfig, 'requireAuth' | 'requireAdmin'> = {}
) {
  return createEnhancedApiRoute(handler, {
    ...options,
    rateLimit: options.rateLimit || { limiter: rl_publicAPI },
  });
}

