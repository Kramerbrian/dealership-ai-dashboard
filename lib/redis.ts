/**
 * Redis Client - Upstash Integration
 * Lightweight caching for fleet API responses
 */

import { Redis } from '@upstash/redis';

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : (null as unknown as Redis);

/**
 * Cache Get - Safe wrapper with error handling
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

/**
 * Cache Set - Safe wrapper with TTL
 */
export async function cacheSet(key: string, value: any, ttl = 180): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttl });
  } catch {
    // Silent fail on cache errors
  }
}

/**
 * Cache Delete - Remove cached entry
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // Silent fail
  }
}
