/**
 * Redis Client - Upstash Integration
 * Lightweight caching for fleet API responses
 */

import { Redis } from '@upstash/redis';

// Helper to safely get and trim env vars
function getRedisUrl(): string | undefined {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || process.env.KV_URL;
  if (!url) return undefined;
  const trimmed = url.trim();
  // Validate URL format
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('redis://')) {
    return undefined;
  }
  return trimmed;
}

function getRedisToken(): string | undefined {
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!token) return undefined;
  return token.trim();
}

export const redis = (() => {
  try {
    const url = getRedisUrl();
    const token = getRedisToken();
    if (url && token) {
      return new Redis({
        url,
        token,
      });
    }
  } catch (error) {
    console.warn('Redis initialization failed:', error);
  }
  return null as unknown as Redis;
})();

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

/**
 * Cache Keys Generator - For compatibility
 */
export const cacheKeys = {
  qaiScore: (domain: string) => `qai:score:${domain}`,
  fleetOrigins: () => 'fleet:origins',
  bulkChecksum: (checksum: string) => `bulk:checksum:${checksum}`,
  bulkCommit: (idempotencyKey: string) => `bulk:commit:${idempotencyKey}`,
};

/**
 * Get Cached with fallback - For compatibility
 */
export async function getCached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttl);
  return fresh;
}
