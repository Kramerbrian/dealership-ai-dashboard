/**
 * Redis Caching Strategy
 * Provides caching utilities with TTL management and cache invalidation
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags?: string[];
}

class RedisCache {
  private redis: any;
  private defaultTTL: number = 300; // 5 minutes default

  constructor() {
    // Lazy initialization - only import Redis when needed
    try {
      this.redis = this.getRedisClient();
    } catch (error) {
      console.warn('Redis not available, caching disabled');
      this.redis = null;
    }
  }

  private getRedisClient() {
    // Try to get Redis client from various sources
    if (typeof process !== 'undefined' && process.env.UPSTASH_REDIS_REST_URL) {
      // Upstash Redis (serverless)
      const { Redis } = require('@upstash/redis');
      return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }

    // Try to import from lib/redis if it exists
    try {
      const { redis } = require('@/lib/redis');
      if (redis) return redis();
    } catch {}

    return null;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check expiration
      if (entry.expiresAt < Date.now()) {
        await this.redis.del(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const ttl = options.ttl || this.defaultTTL;
      const expiresAt = Date.now() + (ttl * 1000);

      const entry: CacheEntry<T> = {
        data: value,
        expiresAt,
        tags: options.tags,
      };

      // Store with expiration
      await this.redis.setex(key, ttl, JSON.stringify(entry));

      // Store tag mappings for invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await this.redis.sadd(`cache:tag:${tag}`, key);
          await this.redis.expire(`cache:tag:${tag}`, ttl);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.del(key);
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
    if (!this.redis) return 0;

    try {
      const keys = await this.redis.smembers(`cache:tag:${tag}`);
      if (keys.length === 0) return 0;

      let deleted = 0;
      for (const key of keys) {
        await this.redis.del(key);
        deleted++;
      }

      // Clean up tag set
      await this.redis.del(`cache:tag:${tag}`);

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
   * Clear all cache (use with caution)
   */
  async clear(): Promise<boolean> {
    if (!this.redis) return false;

    try {
      // This is destructive - only use in development
      if (process.env.NODE_ENV === 'production') {
        console.warn('Cache clear called in production - skipping');
        return false;
      }

      const keys = await this.redis.keys('cache:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    enabled: boolean;
    keys?: number;
    memory?: string;
  }> {
    if (!this.redis) {
      return { enabled: false };
    }

    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();

      return {
        enabled: true,
        keys,
        memory: info,
      };
    } catch (error) {
      return { enabled: true };
    }
  }
}

// Singleton instance
let cacheInstance: RedisCache | null = null;

/**
 * Get the cache instance
 */
export function getCache(): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache();
  }
  return cacheInstance;
}

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    return getCache().get<T>(key);
  },

  /**
   * Set cached value
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    return getCache().set(key, value, options);
  },

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    return getCache().delete(key);
  },

  /**
   * Invalidate by tag
   */
  async invalidateTag(tag: string): Promise<number> {
    return getCache().invalidateTag(tag);
  },

  /**
   * Invalidate by tags
   */
  async invalidateTags(tags: string[]): Promise<number> {
    return getCache().invalidateTags(tags);
  },

  /**
   * Get cache stats
   */
  async stats() {
    return getCache().getStats();
  },
};

/**
 * Cache TTL presets (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 1800,       // 30 minutes
  VERY_LONG: 3600,  // 1 hour
  DAY: 86400,       // 24 hours
} as const;

/**
 * Cache key generators
 */
export const cacheKeys = {
  aiScores: (domain: string) => `ai-scores:${domain}`,
  visibility: (domain: string) => `visibility:${domain}`,
  competitor: (domain: string) => `competitor:${domain}`,
  user: (userId: string) => `user:${userId}`,
  tenant: (tenantId: string) => `tenant:${tenantId}`,
  metrics: (type: string, id: string) => `metrics:${type}:${id}`,
};

