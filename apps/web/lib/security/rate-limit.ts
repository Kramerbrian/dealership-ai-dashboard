/**
 * Rate Limiting Utility
 * IP-based rate limiting using Redis/Upstash
 */

import { cacheGet, cacheSet } from '@/lib/redis';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit check
 * @param identifier - IP address or unique identifier
 * @param limit - Maximum requests allowed
 * @param window - Time window in seconds
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  limit = 10,
  window = 60
): Promise<RateLimitResult> {
  const key = `rate-limit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  
  try {
    // Get current count
    const cached = await cacheGet<{ count: number; resetAt: number }>(key);
    
    let count = 0;
    let resetAt = now + window;

    if (cached && cached.resetAt > now) {
      // Window still active
      count = cached.count;
      resetAt = cached.resetAt;
    } else {
      // New window or expired
      count = 0;
      resetAt = now + window;
    }

    // Increment count
    count += 1;

    // Save updated count
    await cacheSet(key, { count, resetAt }, window);

    // Check if limit exceeded
    const success = count <= limit;
    const remaining = Math.max(0, limit - count);

    return {
      success,
      remaining,
      resetAt,
    };
  } catch (error) {
    // On error, allow request (fail open for availability)
    console.error('Rate limit error:', error);
    return {
      success: true,
      remaining: limit,
      resetAt: now + window,
    };
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(req: {
  headers: Headers | { get: (key: string) => string | null };
  ip?: string;
}): string {
  // Try X-Forwarded-For header (Vercel/proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Get first IP in chain
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }

  // Try X-Real-IP header
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;

  // Try req.ip (if available)
  if (req.ip) return req.ip;

  // Fallback to 'unknown' (will be rate limited together)
  return 'unknown';
}

