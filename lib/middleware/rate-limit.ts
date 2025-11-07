/**
 * Rate Limiting Middleware
 * 
 * Per-tenant and per-origin rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Generate key (tenant ID, origin, or custom)
    const key = keyGenerator 
      ? keyGenerator(req)
      : getDefaultKey(req);

    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      return null; // Allow request
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter,
          limit: maxRequests,
          window: windowMs
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetAt).toISOString()
          }
        }
      );
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupExpiredEntries();
    }

    return null; // Allow request
  };
}

function getDefaultKey(req: NextRequest): string {
  // Try to get tenant ID from headers or session
  const tenantId = req.headers.get('x-tenant-id') || 
                   req.headers.get('x-dealer-id') ||
                   'anonymous';
  
  // Include origin for per-origin limiting
  const origin = req.headers.get('origin') || 'unknown';
  
  return `${tenantId}:${origin}`;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Pre-configured rate limiters
export const tenantRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute per tenant
  keyGenerator: (req) => {
    return req.headers.get('x-tenant-id') || 
           req.headers.get('x-dealer-id') || 
           'anonymous';
  }
});

export const originRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute per origin (for heavy routes)
  keyGenerator: (req) => {
    return req.headers.get('origin') || 'unknown';
  }
});
