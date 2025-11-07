import { redis } from "./cache";

export interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  identifier: string; // tenantId or IP
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Rate limiting using Redis
 * Returns 429 with Retry-After if exceeded
 */
export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { windowSeconds, maxRequests, identifier } = options;
  const key = `rate_limit:${identifier}`;

  if (!redis) {
    // No Redis: allow all (fallback for development)
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: Date.now() + windowSeconds * 1000
    };
  }

  try {
    const current = await redis.get<number>(key) || 0;

    if (current >= maxRequests) {
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
        retryAfter: ttl > 0 ? ttl : windowSeconds
      };
    }

    // Increment counter
    const newCount = current + 1;
    await redis.set(key, newCount, { ex: windowSeconds });

    return {
      allowed: true,
      remaining: maxRequests - newCount,
      resetAt: Date.now() + windowSeconds * 1000
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open (allow request) if Redis fails
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: Date.now() + windowSeconds * 1000
    };
  }
}
