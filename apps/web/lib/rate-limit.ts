/**
 * Rate Limiting Service using Upstash Redis
 * Protects API endpoints from abuse
 */

import { NextRequest } from "next/server";

// Simple in-memory fallback if Upstash not configured
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  uniqueTokenPerInterval: number; // Max requests per interval
  interval: number; // Interval in milliseconds
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Get client identifier from request (IP or token)
 */
function getClientId(req: NextRequest): string {
  // Try to get IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  // For authenticated requests, use user ID from token
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      // Extract user ID from JWT (simplified)
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      return `user:${payload.sub || payload.user_id}`;
    } catch {
      // Fall back to IP
    }
  }

  return `ip:${ip}`;
}

/**
 * Check rate limit using Upstash Redis or in-memory fallback
 */
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const clientId = getClientId(req);
  const key = `ratelimit:${clientId}`;

  // If Upstash is configured, use Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return checkUpstashRateLimit(key, config);
  }

  // Fall back to in-memory (dev only)
  return checkInMemoryRateLimit(key, config);
}

/**
 * Rate limit using Upstash Redis REST API
 */
async function checkUpstashRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()!;

  try {
    // Use Redis pipeline to increment and get TTL atomically
    const pipeline = [
      ["INCR", key],
      ["PEXPIRE", key, config.interval],
      ["PTTL", key],
    ];

    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    const results = await response.json();
    const count = results[0]?.result || 0;
    const ttl = results[2]?.result || config.interval;

    const remaining = Math.max(0, config.uniqueTokenPerInterval - count);
    const reset = Date.now() + ttl;

    return {
      success: count <= config.uniqueTokenPerInterval,
      limit: config.uniqueTokenPerInterval,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("[RateLimit] Upstash error:", error);
    // Fall back to allowing request on error
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval,
      reset: Date.now() + config.interval,
    };
  }
}

/**
 * Rate limit using in-memory store (dev fallback)
 */
function checkInMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of inMemoryStore.entries()) {
      if (v.resetAt < now) {
        inMemoryStore.delete(k);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // First request or expired window
    inMemoryStore.set(key, {
      count: 1,
      resetAt: now + config.interval,
    });

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval,
    };
  }

  // Increment count
  record.count++;
  inMemoryStore.set(key, record);

  const remaining = Math.max(0, config.uniqueTokenPerInterval - record.count);

  return {
    success: record.count <= config.uniqueTokenPerInterval,
    limit: config.uniqueTokenPerInterval,
    remaining,
    reset: record.resetAt,
  };
}

/**
 * Pre-configured rate limits
 */
export const RateLimits = {
  // Instant analyzer: 10 scans per hour
  instantScan: {
    uniqueTokenPerInterval: 10,
    interval: 60 * 60 * 1000, // 1 hour
  },

  // Email capture: 5 captures per hour
  emailCapture: {
    uniqueTokenPerInterval: 5,
    interval: 60 * 60 * 1000, // 1 hour
  },

  // CSV upload: 10 uploads per day
  csvUpload: {
    uniqueTokenPerInterval: 10,
    interval: 24 * 60 * 60 * 1000, // 24 hours
  },

  // API general: 100 requests per minute
  apiGeneral: {
    uniqueTokenPerInterval: 100,
    interval: 60 * 1000, // 1 minute
  },

  // Auth endpoints: 5 attempts per 15 minutes
  auth: {
    uniqueTokenPerInterval: 5,
    interval: 15 * 60 * 1000, // 15 minutes
  },
};

/**
 * Middleware-compatible rate limiter
 */
export async function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig
): Promise<Response | null> {
  const result = await checkRateLimit(req, config);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // Add rate limit headers to response (for transparency)
  return null; // null means proceed with request
}
