import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getTenantIdFromReq } from '@/lib/authz';
import { checkIdempotency } from '@/lib/idempotency';
import { verifyHmacSignature } from '@/lib/hmac';
import { addServerTiming, PerformanceTimer } from '@/lib/server-timing';
import { createRateLimiters } from '@/lib/rate-limiter-redis';
import { getTierFromString } from '@/lib/feature-flags';
import { tenantManager } from '@/lib/tenant-manager';
import { withTelemetry } from '@/lib/telemetry-instrumentation';
import { config } from '@/lib/config';
import { Redis } from 'ioredis';

interface MiddlewareConfig {
  requireAuth?: boolean;
  requireHmac?: boolean;
  rateLimit?: 'api' | 'webhook' | 'tenant' | 'burst';
  idempotency?: boolean;
  featureCheck?: string;
}

export class EnhancedMiddleware {
  private redis: Redis;
  private rateLimiters: ReturnType<typeof createRateLimiters>;

  constructor(redis: Redis) {
    this.redis = redis;
    this.rateLimiters = createRateLimiters(redis);
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
          const tenantId = getTenantIdFromReq(req);
          if (!tenantId) {
            return NextResponse.json(
              { success: false, error: 'Authentication required' },
              { status: 401 }
            );
          }
          timer.mark('auth');
        }

        // Rate limiting
        if (config.rateLimit && config.rateLimit.enabled) {
          const tenantId = getTenantIdFromReq(req) || 'anonymous';
          const rateLimiter = this.rateLimiters[config.rateLimit];
          const rateLimitResult = await rateLimiter.checkLimit(tenantId);
          
          if (!rateLimitResult.allowed) {
            const response = NextResponse.json(
              { 
                success: false, 
                error: 'Rate limit exceeded',
                retryAfter: rateLimitResult.retryAfter
              },
              { status: 429 }
            );
            
            response.headers.set('X-RateLimit-Limit', rateLimiter.config.maxRequests.toString());
            response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
            response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
            response.headers.set('Retry-After', rateLimitResult.retryAfter?.toString() || '60');
            
            return response;
          }
          timer.mark('rateLimit');
        }

        // HMAC verification
        if (config.requireHmac) {
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
        if (config.idempotency && config.idempotency.enabled) {
          const tenantId = getTenantIdFromReq(req);
          if (tenantId) {
            const idempotencyKey = req.headers.get('idempotency-key') || crypto.randomUUID();
            const { isDuplicate } = await checkIdempotency({
              key: idempotencyKey,
              tenantId,
              route: req.nextUrl.pathname,
            });

            if (isDuplicate) {
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
          const tenantId = getTenantIdFromReq(req);
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
        response.headers.set('X-Processing-Time', `${Date.now() - timer.startTime}ms`);
        
        // Add Server-Timing headers
        for (const [name, duration] of timer.measurements) {
          addServerTiming(response, name, duration);
        }

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
