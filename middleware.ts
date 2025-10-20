import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Rate limiting store (in production, use Redis/Upstash)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Route matchers
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dash(.*)',
  '/compliance(.*)',
  '/onboarding(.*)',
  '/api/protected(.*)',
]);

const isApiRoute = createRouteMatcher(['/api(.*)']);

// Rate limiting configuration
const RATE_LIMITS = {
  // Per-IP limits
  ip: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
  },
  // Per-tenant limits (when authenticated)
  tenant: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
  },
  // Per-user limits (when authenticated)
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
  },
  // Specific API endpoints
  scoring: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 scoring requests per minute
  },
  webhooks: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 webhook calls per minute
  },
};

/**
 * Check rate limit for a given key
 */
function checkRateLimit(
  key: string,
  limit: { windowMs: number; max: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    
    return {
      allowed: true,
      remaining: limit.max - 1,
      resetTime: now + limit.windowMs,
    };
  }
  
  if (current.count >= limit.max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    allowed: true,
    remaining: limit.max - current.count,
    resetTime: current.resetTime,
  };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new NextResponse(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  );
}

/**
 * Main middleware function
 */
export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth();
  const clientIP = getClientIP(req);
  const url = new URL(req.url);
  
  // Apply rate limiting to API routes
  if (isApiRoute(req)) {
    // IP-based rate limiting
    const ipLimit = checkRateLimit(`ip:${clientIP}`, RATE_LIMITS.ip);
    if (!ipLimit.allowed) {
      return createRateLimitResponse(ipLimit.resetTime);
    }
    
    // User-based rate limiting (if authenticated)
    if (userId) {
      const userLimit = checkRateLimit(`user:${userId}`, RATE_LIMITS.user);
      if (!userLimit.allowed) {
        return createRateLimitResponse(userLimit.resetTime);
      }
    }
    
    // Tenant-based rate limiting (if tenant context available)
    const tenantId = sessionClaims?.metadata?.tenantId;
    if (tenantId) {
      const tenantLimit = checkRateLimit(`tenant:${tenantId}`, RATE_LIMITS.tenant);
      if (!tenantLimit.allowed) {
        return createRateLimitResponse(tenantLimit.resetTime);
      }
    }
    
    // Specific endpoint rate limiting
    if (url.pathname.includes('/api/ai-scores')) {
      const scoringKey = userId ? `scoring:${userId}` : `scoring:${clientIP}`;
      const scoringLimit = checkRateLimit(scoringKey, RATE_LIMITS.scoring);
      if (!scoringLimit.allowed) {
        return createRateLimitResponse(scoringLimit.resetTime);
      }
    }
    
    if (url.pathname.includes('/api/stripe/webhook') || url.pathname.includes('/api/clerk/webhook')) {
      const webhookKey = `webhook:${clientIP}`;
      const webhookLimit = checkRateLimit(webhookKey, RATE_LIMITS.webhooks);
      if (!webhookLimit.allowed) {
        return createRateLimitResponse(webhookLimit.resetTime);
      }
    }
  }
  
  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    auth().protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};