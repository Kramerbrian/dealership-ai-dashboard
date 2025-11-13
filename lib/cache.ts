import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

// Only initialize Redis if we have valid URL and token (not placeholders)
let redis: Redis | null = null;
try {
  if (url && token && url.startsWith('https://') && !url.includes('...') && token !== '...') {
    redis = new Redis({ url, token });
  }
} catch (e) {
  // Redis initialization failed, continue without cache
  console.warn('[Cache] Redis not available:', e);
}

export async function cacheJSON<T>(key: string, ttlSec: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redis) return fetcher();
  const hit = await redis.get<T>(key);
  if (hit) return hit;
  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttlSec });
  return fresh;
}

// Cache manager for compatibility
export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    return await redis.get<T>(key);
  }

  static async set<T>(key: string, value: T, ttlSec: number): Promise<void> {
    if (!redis) return;
    await redis.set(key, value, { ex: ttlSec });
  }

  static async delete(key: string): Promise<void> {
    if (!redis) return;
    await redis.del(key);
  }
}

// Cache keys
export const CACHE_KEYS = {
  VISIBILITY_AEO: 'visibility:aeo',
  VISIBILITY_GEO: 'visibility:geo',
  VISIBILITY_SEO: 'visibility:seo',
  AI_SCORES: 'ai:scores',
  PRESENCE: 'visibility:presence',
  ANALYTICS_EVENTS: 'analytics:events',
  ANALYTICS_METRICS: 'analytics:metrics',
  ANALYTICS_REALTIME: 'analytics:realtime',
  CUSTOM_REPORTS: 'analytics:custom_reports',
  USER_CUSTOM_REPORTS: 'analytics:user_reports',
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  ANALYTICS_EVENTS: 300, // 5 minutes
  ANALYTICS_METRICS: 1800, // 30 minutes
  CUSTOM_REPORTS: 3600, // 1 hour
} as const;
