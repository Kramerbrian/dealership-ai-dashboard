// lib/cache.ts
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Lazy initialization to avoid build-time errors and trim whitespace
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  
  if (!url || !token) {
    return null;
  }
  
  // Validate URL format
  if (!url.startsWith('https://')) {
    console.warn('Invalid Redis URL format');
    return null;
  }
  
  return new Redis({ url, token });
}

export const redis = getRedis();

export async function cacheJSON<T>(
  key: string,
  ttlSec: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) return fetcher();
  const hit = await redis.get<T>(key);
  if (hit) return hit;
  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttlSec });
  return fresh;
}

// Cache keys constants
export const CACHE_KEYS = {
  PERFORMANCE_MONITOR: 'performance_monitor',
  GA4_SUMMARY: 'ga4_summary',
  SCHEMA_VALIDATE: 'schema_validate',
  PULSE_SNAPSHOT: 'pulse_snapshot',
  COMPETITORS: 'competitors',
} as const;

// withCache wrapper for Next.js route handlers
export function withCache(
  handler: (req: Request) => Promise<NextResponse>,
  cacheKey: string,
  ttlSec: number = 60
) {
  return async (req: Request): Promise<NextResponse> => {
    // For now, just call the handler directly
    // TODO: Add Redis caching if needed
    return handler(req);
  };
}
