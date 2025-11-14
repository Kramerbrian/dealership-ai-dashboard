import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getTenantIdFromReq } from '@/lib/authz';
import { checkIdempotencyKey } from '@/lib/idempotency';
import { verifyHmacSignature } from '@/lib/hmac';
import { addServerTiming, PerformanceTimer } from '@/lib/server-timing';
import { createRateLimiters } from '@/lib/rate-limiter-redis';
import { getTierFromString } from '@/lib/feature-flags';
import { tenantManager } from '@/lib/tenant-manager';
import { withTelemetry } from '@/lib/telemetry-instrumentation';
import { config } from '@/lib/config';
import type { Redis } from '@upstash/redis';

interface MiddlewareConfig {
  requireAuth?: boolean;
  requireHmac?: boolean;
  rateLimit?: 'api' | 'webhook' | 'tenant' | 'burst';
  idempotency?: boolean;
  featureCheck?: string;
  webhook?: {
    secret: string;
  };
}

export class EnhancedMiddleware {
  private redis: Redis;
  private rateLimiters: ReturnType<typeof createRateLimiters>;

  constructor(redis: Redis) {
    this.redis = redis;
    this.rateLimiters = createRateLimiters(redis as any);
  }

  /**
   * Create middleware with specified configuration
   */
  create(config: MiddlewareConfig) {
    return async (req: NextRequest, context: any): Promise<NextResponse | null> => {
      const timer = new PerformanceTimer();
      
      try {
        // Authentication check
        if (config.requireAuth) {
          const tenantId = getTenantIdFromReq(req.headers);
          if (!tenantId) {
            return NextResponse.json(
              { success: false, error: 'Authentication required' },
              { status: 401 }
            );
          }
          timer.mark('auth');
        }

        // Rate limiting
        if (config.rateLimit) {
          const tenantId = getTenantIdFromReq(req.headers) || 'anonymous';
          const rateLimiter = this.rateLimiters[config.rateLimit];

          // Handle different rate limiter interfaces
          let rateLimitResult: any;
          if ('checkLimit' in rateLimiter) {
            rateLimitResult = await rateLimiter.checkLimit(tenantId);
          } else if ('consume' in rateLimiter) {
            rateLimitResult = await rateLimiter.consume(tenantId);
          } else {
            throw new Error('Invalid rate limiter');
          }

          if (!rateLimitResult.allowed) {
            const response = NextResponse.json(
              {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimitResult.retryAfter
              },
              { status: 429 }
            );

            response.headers.set('X-RateLimit-Limit', (rateLimitResult.limit || 100).toString());
            response.headers.set('X-RateLimit-Remaining', (rateLimitResult.remaining || 0).toString());
            response.headers.set('X-RateLimit-Reset', (rateLimitResult.resetTime || Date.now() + 60000).toString());
            response.headers.set('Retry-After', rateLimitResult.retryAfter?.toString() || '60');

            return response;
          }
          timer.mark('rateLimit');
        }

        // HMAC verification
        if (config.requireHmac && config.webhook) {
          const body = await req.text();
          const secret = config.webhook.secret;

          if (!verifyHmacSignature(req, secret, body)) {
            return NextResponse.json(
              { success: false, error: 'Invalid signature' },
              { status: 401 }
            );
          }
          timer.mark('hmac');
        }

        // Idempotency check
        if (config.idempotency) {
          const tenantId = getTenantIdFromReq(req.headers);
          if (tenantId) {
            const idempotencyKey = req.headers.get('idempotency-key') || crypto.randomUUID();
            const result = await checkIdempotencyKey(
              idempotencyKey,
              tenantId
            );

            if (result.cached) {
              return NextResponse.json(
                { success: false, error: 'Duplicate request detected' },
                { status: 409 }
              );
            }
          }
          timer.mark('idempotency');
        }

        // Feature check
        if (config.featureCheck) {
          const tenantId = getTenantIdFromReq(req.headers);
          if (tenantId) {
            try {
              await tenantManager.requireFeature(tenantId, config.featureCheck as any);
            } catch (error) {
              return NextResponse.json(
                {
                  success: false,
                  error: error instanceof Error ? error.message : 'Feature not available',
                  code: 'FEATURE_NOT_AVAILABLE'
                },
                { status: 403 }
              );
            }
          }
          timer.mark('featureCheck');
        }

        // Add timing headers to response
        const response = NextResponse.next();
        const timings = timer.getTimings();
        const totalTime = Object.values(timings).reduce((sum, t) => Math.max(sum, t), 0);
        response.headers.set('X-Processing-Time', `${totalTime.toFixed(2)}ms`);

        // Add Server-Timing headers using timer's built-in method
        timer.addToResponse(response);

        return response;

      } catch (error) {
        console.error('Middleware error:', error);
        // If middleware fails, allow the request to proceed
        return NextResponse.next();
      }
    };
  }
}

/**
 * Convenience functions for common middleware patterns
 */
export function createApiMiddleware(redis: Redis) {
  const middleware = new EnhancedMiddleware(redis);
  
  return {
    // Standard API middleware
    standard: middleware.create({
      requireAuth: true,
      rateLimit: 'api',
      idempotency: true
    }),
    
    // Webhook middleware
    webhook: middleware.create({
      requireAuth: true,
      requireHmac: true,
      rateLimit: 'webhook',
      idempotency: true
    }),
    
    // Admin middleware
    admin: middleware.create({
      requireAuth: true,
      rateLimit: 'tenant',
      featureCheck: 'apiAccess'
    }),
    
    // Public middleware (minimal checks)
    public: middleware.create({
      rateLimit: 'burst'
    })
  };
}

/**
 * Apply middleware to API routes
 */
export function withMiddleware(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  middlewareConfig: MiddlewareConfig,
  operationName?: string
) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    // Initialize Redis connection
    const { getRedis } = await import('./redis');
    const redis = getRedis();
    const middleware = new EnhancedMiddleware(redis);
    
    // Apply middleware
    const middlewareResult = await middleware.create(middlewareConfig)(req, context);
    
    if (middlewareResult) {
      return middlewareResult;
    }
    
    // Apply telemetry if enabled
    if (config.otel.enabled && operationName) {
      return withTelemetry(handler, operationName)(req, context);
    }
    
    return handler(req, context);
  };
}
