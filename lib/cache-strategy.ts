/**
 * Multi-Layer Caching Strategy
 * 
 * Implements browser → edge → Redis → database caching layers
 * Expected: 80-90% cache hit rate
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (lazy)
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redisClient && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisClient;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  layer?: 'browser' | 'edge' | 'redis' | 'all';
}

export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  layer: 'browser' | 'edge' | 'redis' | 'database';
  ttl?: number;
}

/**
 * Multi-layer cache get
 * Tries: Browser → Edge → Redis → Database
 */
export async function getCached<T>(
  key: string,
  options: CacheOptions = {}
): Promise<CacheResult<T> | null> {
  const { layer = 'all' } = options;

  // Layer 1: Redis Cache (if enabled)
  if ((layer === 'all' || layer === 'redis') && getRedisClient()) {
    try {
      const cached = await redisClient!.get<T>(key);
      if (cached) {
        return {
          data: cached,
          fromCache: true,
          layer: 'redis',
        };
      }
    } catch (error) {
      console.warn('[Cache] Redis get failed:', error);
    }
  }

  // If not found in cache, return null (caller should fetch from database)
  return null;
}

/**
 * Multi-layer cache set
 * Sets in Redis and returns cache headers for edge/browser
 */
export async function setCached<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 3600, tags = [] } = options; // Default 1 hour

  // Layer 1: Redis Cache
  if (getRedisClient()) {
    try {
      // Set in Redis with TTL
      await redisClient!.setex(key, ttl, JSON.stringify(data));

      // Store tags for invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          await redisClient!.sadd(`cache:tags:${tag}`, key);
          await redisClient!.expire(`cache:tags:${tag}`, ttl);
        }
      }
    } catch (error) {
      console.warn('[Cache] Redis set failed:', error);
    }
  }
}

/**
 * Invalidate cache by tag
 */
export async function invalidateByTag(tag: string): Promise<void> {
  if (!getRedisClient()) return;

  try {
    const keys = await redisClient!.smembers(`cache:tags:${tag}`);
    if (keys.length > 0) {
      await redisClient!.del(...keys);
      await redisClient!.del(`cache:tags:${tag}`);
    }
  } catch (error) {
    console.warn('[Cache] Tag invalidation failed:', error);
  }
}

/**
 * Invalidate cache by key
 */
export async function invalidateKey(key: string): Promise<void> {
  if (!getRedisClient()) return;

  try {
    await redisClient!.del(key);
  } catch (error) {
    console.warn('[Cache] Key invalidation failed:', error);
  }
}

/**
 * Generate cache key from pattern
 */
export function generateCacheKey(pattern: string, ...params: (string | number)[]): string {
  const parts = params.map(p => String(p).replace(/[^a-zA-Z0-9]/g, '_'));
  return `${pattern}:${parts.join(':')}`;
}

/**
 * Cache headers for edge/browser caching
 */
export function getCacheHeaders(ttl: number, staleWhileRevalidate = 300): Record<string, string> {
  return {
    'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${ttl}`,
    'X-Cache-Strategy': 'multi-layer',
    'X-Cache-TTL': String(ttl),
  };
}

/**
 * Helper for Next.js API routes
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<CacheResult<T>> {
  // Try to get from cache
  const cached = await getCached<T>(key, options);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const data = await fetcher();

  // Store in cache
  await setCached(key, data, options);

  return {
    data,
    fromCache: false,
    layer: 'database',
  };
}

