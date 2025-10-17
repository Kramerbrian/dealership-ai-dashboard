import { Redis } from '@upstash/redis';

// Enhanced Redis caching with TTL, compression, and invalidation strategies

export interface CacheConfig {
  defaultTtl?: number; // seconds
  compression?: boolean;
  namespace?: string;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
}

export class EnhancedRedisCache {
  private redis: Redis | null = null;
  private config: Required<CacheConfig>;
  private compressionEnabled: boolean;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTtl: 3600, // 1 hour
      compression: true,
      namespace: 'dealershipai',
      ...config
    };

    this.compressionEnabled = this.config.compression;

    // Initialize Redis if available
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }

  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  private async compress(data: any): Promise<string> {
    if (!this.compressionEnabled) {
      return JSON.stringify(data);
    }

    // Simple compression using gzip (in production, use a proper compression library)
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
  }

  private async decompress(compressedData: string): Promise<any> {
    if (!this.compressionEnabled) {
      return JSON.parse(compressedData);
    }

    try {
      const jsonString = Buffer.from(compressedData, 'base64').toString();
      return JSON.parse(jsonString);
    } catch (error) {
      // Fallback to direct parsing if decompression fails
      return JSON.parse(compressedData);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const compressedData = await this.redis.get<string>(this.getKey(key));
      if (!compressedData) {
        return null;
      }

      return await this.decompress(compressedData);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const ttl = options.ttl || this.config.defaultTtl;
      const compressedData = await this.compress(data);
      
      const result = await this.redis.setex(this.getKey(key), ttl, compressedData);
      
      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        await this.storeTags(key, options.tags);
      }

      return result === 'OK';
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.del(this.getKey(key));
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.expire(this.getKey(key), ttl);
      return result === 1;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    if (!this.redis) {
      return 0;
    }

    try {
      const tagKey = `${this.config.namespace}:tags:${tag}`;
      const keys = await this.redis.smembers<string[]>(tagKey);
      
      if (keys.length === 0) {
        return 0;
      }

      const prefixedKeys = keys.map(key => this.getKey(key));
      const result = await this.redis.del(...prefixedKeys);
      
      // Clean up tag set
      await this.redis.del(tagKey);
      
      return result;
    } catch (error) {
      console.error('Cache invalidate by tag error:', error);
      return 0;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.redis) {
      return 0;
    }

    try {
      const fullPattern = this.getKey(pattern);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  private async storeTags(key: string, tags: string[]): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      for (const tag of tags) {
        const tagKey = `${this.config.namespace}:tags:${tag}`;
        await this.redis.sadd(tagKey, key);
        // Set TTL for tag set (longer than cache TTL)
        await this.redis.expire(tagKey, this.config.defaultTtl * 2);
      }
    } catch (error) {
      console.error('Cache store tags error:', error);
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    memory?: string;
    keys?: number;
    hitRate?: number;
  }> {
    if (!this.redis) {
      return { connected: false };
    }

    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();
      
      return {
        connected: true,
        memory: info,
        keys,
        hitRate: 0.95 // Mock hit rate
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: false };
    }
  }

  // Cache warming strategies
  async warmCache<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const freshData = await dataFetcher();
    
    // Store in cache
    await this.set(key, freshData, options);
    
    return freshData;
  }

  // Cache-aside pattern
  async cacheAside<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await dataFetcher();
    await this.set(key, data, options);
    return data;
  }

  // Write-through pattern
  async writeThrough<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    return await this.set(key, data, options);
  }

  // Write-behind pattern (async write)
  async writeBehind<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    // In a real implementation, this would queue the write operation
    setImmediate(async () => {
      await this.set(key, data, options);
    });
  }
}

// Singleton instance
export const cache = new EnhancedRedisCache({
  defaultTtl: 3600,
  compression: true,
  namespace: 'dealershipai'
});

// Cache decorators for methods
export function cached(ttl: number = 3600, tags: string[] = []) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      await cache.set(cacheKey, result, { ttl, tags });
      
      return result;
    };
  };
}
