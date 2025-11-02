/**
 * Rate Limiting Utilities
 * Uses Upstash Redis for distributed rate limiting
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (with fallback for development)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * AI API Rate Limiter
 * 50 requests per day per IP (for expensive AI calls)
 */
export const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
      analytics: true,
      prefix: "@ratelimit:ai",
    })
  : null;

/**
 * General API Rate Limiter
 * 100 requests per hour per IP
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      analytics: true,
      prefix: "@ratelimit:api",
    })
  : null;

/**
 * Strict Rate Limiter (for sensitive operations)
 * 10 requests per minute per IP
 */
export const strictRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "@ratelimit:strict",
    })
  : null;

/**
 * Helper to get client IP from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for real IP (handles proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback for development
  return "127.0.0.1";
}

/**
 * Check rate limit and return response if exceeded
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number; response?: Response }> {
  if (!limiter) {
    // No rate limiting in development (when Upstash not configured)
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    
    if (!success) {
      const retryAfter = reset ? Math.ceil((reset - Date.now()) / 1000) : 60;
      return {
        success: false,
        limit,
        remaining,
        reset,
        response: new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
            retryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(reset),
            },
          }
        ),
      };
    }

    return { success: true, limit, remaining, reset };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error("[RateLimit] Error checking rate limit:", error);
    return { success: true };
  }
}
