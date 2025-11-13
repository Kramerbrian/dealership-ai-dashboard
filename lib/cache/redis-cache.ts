/**
 * Redis Caching Strategy
 * Provides caching utilities with TTL, invalidation, and cache warming
 */

import { Redis } from '@upstash/redis';

// Get Redis client
function getRedisClient(): Redis | null {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!redisUrl || !redisToken) {
    return null;
  }

  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

class CacheService {
  private defaultTTL = 3600; // 1 hour

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      if (!client) return null;

      const value = await client.get(key);
      if (!value) return null;

      return value as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client) return false;

      const ttl = options.ttl || this.defaultTTL;
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);

      await client.setex(key, ttl, serialized);

      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await client.sadd(`cache:tags:${tag}`, key);
          await client.expire(`cache:tags:${tag}`, ttl);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client) return false;

      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateTag(tag: string): Promise<number> {
    try {
      const client = getRedisClient();
      if (!client) return 0;

      const keys = await client.smembers(`cache:tags:${tag}`);
      if (keys.length === 0) return 0;

      const deleted = await client.del(...keys);
      await client.del(`cache:tags:${tag}`);

      return deleted;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Invalidate multiple tags
   */
  async invalidateTags(tags: string[]): Promise<number> {
    let total = 0;
    for (const tag of tags) {
      total += await this.invalidateTag(tag);
    }
    return total;
  }

  /**
   * Get or set with cache
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Cache key generators
   */
  static keys = {
    dealer: (dealerId: string) => `dealer:${dealerId}`,
    scores: (dealerId: string) => `scores:${dealerId}`,
    metrics: (dealerId: string, type: string) => `metrics:${dealerId}:${type}`,
    analysis: (domain: string) => `analysis:${domain}`,
    ga4: (domain: string, days: number) => `ga4:${domain}:${days}`,
  };
}

export const cache = new CacheService();
export default cache;
