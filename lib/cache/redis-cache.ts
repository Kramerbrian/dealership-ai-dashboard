/**
 * Redis Caching Strategy
 * Provides caching utilities with TTL, invalidation, and key management
 */

import { redis } from '@/lib/redis';

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
      const client = redis();
      if (!client) return null;

      const value = await client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
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
      const client = redis();
      if (!client) return false;

      const ttl = options.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);

      await client.setex(key, ttl, serialized);

      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await client.sadd(`cache:tag:${tag}`, key);
          await client.expire(`cache:tag:${tag}`, ttl);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const client = redis();
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
      const client = redis();
      if (!client) return 0;

      const keys = await client.smembers(`cache:tag:${tag}`);
      if (keys.length === 0) return 0;

      let deleted = 0;
      for (const key of keys) {
        await client.del(key);
        deleted++;
      }

      await client.del(`cache:tag:${tag}`);
      return deleted;
    } catch (error) {
      console.error('Cache invalidate tag error:', error);
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
   * Get or set pattern (cache-aside)
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
   * Generate cache key
   */
  static key(parts: (string | number)[]): string {
    return parts.map(p => String(p)).join(':');
  }
}

export const cache = new CacheService();
export default cache;
