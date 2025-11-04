/**
 * Rate Limiting Middleware
 * Protects all API endpoints from abuse and DDoS attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (with fallback for development)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // Default: 100 requests per minute
      analytics: true,
      prefix: '@dealershipai/ratelimit',
    });
  }
} catch (error) {
  console.warn('Rate limiting not available - Redis not configured:', error);
}

// Rate limit configurations by endpoint pattern
const rateLimitConfigs: Record<string, { requests: number; window: string }> = {
  // Strict limits for expensive operations
  '/api/ai/analysis': { requests: 10, window: '1 m' },
  '/api/ai/predictive-analytics': { requests: 5, window: '1 m' },
  '/api/compliance/audit': { requests: 5, window: '1 m' },
  '/api/automation/tasks': { requests: 20, window: '1 m' },
  
  // Moderate limits for standard operations
  '/api/dashboard': { requests: 60, window: '1 m' },
  '/api/analytics': { requests: 100, window: '1 m' },
  '/api/user': { requests: 30, window: '1 m' },
  
  // Lenient limits for read-only endpoints
  '/api/health': { requests: 1000, window: '1 m' },
  '/api/system/status': { requests: 100, window: '1 m' },
  
  // Default limit
  default: { requests: 100, window: '1 m' },
};

/**
 * Get rate limit configuration for an endpoint
 */
function getRateLimitConfig(pathname: string): { requests: number; window: string } {
  // Check for exact matches first
  for (const [pattern, config] of Object.entries(rateLimitConfigs)) {
    if (pathname.startsWith(pattern)) {
      return config;
    }
  }
  
  return rateLimitConfigs.default;
}

/**
 * Create a rate limiter instance for a specific configuration
 */
function createRateLimiter(requests: number, window: string): Ratelimit | null {
  if (!redis) return null;
  
  try {
    return new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix: `@dealershipai/ratelimit/${requests}/${window}`,
    });
  } catch (error) {
    console.error('Failed to create rate limiter:', error);
    return null;
  }
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from auth header first
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware
 * Returns null if rate limit passed, or a Response if rate limit exceeded
 */
export async function rateLimitMiddleware(
  req: NextRequest
): Promise<NextResponse | null> {
  // Skip rate limiting in development if Redis not configured
  if (!ratelimit && process.env.NODE_ENV === 'development') {
    return null;
  }
  
  // Skip rate limiting for health checks
  if (req.nextUrl.pathname === '/api/health') {
    return null;
  }
  
  const identifier = getIdentifier(req);
  const pathname = req.nextUrl.pathname;
  const config = getRateLimitConfig(pathname);
  
  // Use default limiter if no specific config
  const limiter = config !== rateLimitConfigs.default
    ? createRateLimiter(config.requests, config.window)
    : ratelimit;
  
  if (!limiter) {
    // If rate limiting unavailable, log warning but allow request
    console.warn('Rate limiting unavailable, allowing request');
    return null;
  }
  
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    
    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
    
    if (!success) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${limit} requests per ${config.window}. Please try again later.`,
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }
    
    // Rate limit passed - return null to continue
    // Headers will be added by the response wrapper
    return null;
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow request but log warning
    return null;
  }
}

/**
 * Get rate limit headers for successful requests
 */
export function getRateLimitHeaders(
  req: NextRequest,
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(reset).toISOString(),
  };
}

/**
 * Check if rate limiting is available
 */
export function isRateLimitAvailable(): boolean {
  return ratelimit !== null;
}

