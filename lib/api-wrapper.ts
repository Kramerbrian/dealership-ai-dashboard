/**
 * API Route Wrapper
 * Combines all middleware: rate limiting, auth, validation, performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { requireAuth, getOptionalAuth, type AuthResult } from './middleware/auth';
import { validateRequestBody, validateQueryParams } from './validation/schemas';
import { withPerformanceMonitoring } from './middleware/performance';
import type { z } from 'zod';

export interface RouteConfig {
  endpoint: string;
  requireAuth?: boolean;
  requireOrg?: string;
  requirePermission?: string;
  validateBody?: z.ZodSchema;
  validateQuery?: z.ZodSchema;
  rateLimit?: boolean;
  performanceMonitoring?: boolean;
}

/**
 * Create a wrapped API route handler
 */
export function createApiRoute<T = any>(
  config: RouteConfig,
  handler: (req: NextRequest, auth: AuthResult | null) => Promise<NextResponse<T>>
) {
  return withPerformanceMonitoring(
    async (req: NextRequest): Promise<NextResponse<T>> => {
      // 1. Rate limiting
      if (config.rateLimit !== false) {
        const rateLimitResult = await rateLimitMiddleware(req);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // 2. Authentication
      let authResult: AuthResult | null = null;
      
      if (config.requireAuth) {
        const authCheck = await requireAuth(req);
        if (authCheck instanceof NextResponse) {
          return authCheck;
        }
        authResult = authCheck;
        
        // Check organization if required
        if (config.requireOrg && authResult.orgId !== config.requireOrg) {
          return NextResponse.json(
            {
              success: false,
              error: 'Forbidden',
              message: 'Organization access denied',
            },
            { status: 403 }
          );
        }
      } else {
        // Optional auth
        authResult = await getOptionalAuth(req);
      }
      
      // 3. Input validation
      if (config.validateBody) {
        const bodyValidation = await validateRequestBody(req, config.validateBody);
        if (!bodyValidation.success) {
          return bodyValidation.response;
        }
      }
      
      if (config.validateQuery) {
        const queryValidation = validateQueryParams(req, config.validateQuery);
        if (!queryValidation.success) {
          return queryValidation.response;
        }
      }
      
      // 4. Execute handler
      return handler(req, authResult);
    },
    config.endpoint
  );
}

/**
 * Example usage:
 * 
 * export const GET = createApiRoute(
 *   {
 *     endpoint: '/api/dashboard/overview',
 *     requireAuth: true,
 *     validateQuery: dashboardQuerySchema,
 *   },
 *   async (req, auth) => {
 *     // Handler logic here
 *     // auth is guaranteed to be non-null if requireAuth is true
 *     return NextResponse.json({ data: '...' });
 *   }
 * );
 */

