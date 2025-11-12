import { kv } from '@vercel/kv';
import { Redis } from 'redis';

// Vercel KV (Recommended for Vercel deployments)
export class VercelKVCache {
  private static instance: VercelKVCache;
  private prefix = 'dealershipai:';

  static getInstance(): VercelKVCache {
    if (!VercelKVCache.instance) {
      VercelKVCache.instance = new VercelKVCache();
    }
    return VercelKVCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kv.get(`${this.prefix}${key}`);
      return value as T | null;
    } catch (error) {
      console.error('Vercel KV get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await kv.setex(`${this.prefix}${key}`, ttlSeconds, JSON.stringify(value));
      } else {
        await kv.set(`${this.prefix}${key}`, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Vercel KV set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await kv.del(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Vercel KV delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await kv.exists(`${this.prefix}${key}`);
      return result === 1;
    } catch (error) {
      console.error('Vercel KV exists error:', error);
      return false;
    }
  }
}

// Redis (For self-hosted or other deployments)
export class RedisCache {
  private static instance: RedisCache;
  private client: Redis;
  private prefix = 'dealershipai:';

  constructor() {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL || 'redis://localhost:6379';
    
    // Only initialize if URL looks valid
    if (redisUrl && (redisUrl.includes('://') || redisUrl.includes('.upstash.io'))) {
      try {
        this.client = new Redis({
          url: redisUrl,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          lazyConnect: true, // Don't connect immediately
          retryStrategy: (times) => {
            if (times > 3) {
              console.warn('[Cache] Redis connection failed, using in-memory fallback');
              return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
          },
        });

        this.client.on('error', (error) => {
          console.error('[Cache] Redis connection error:', error.message);
          // Don't throw - just log
        });

        // Try to connect, but don't fail if it doesn't work
        this.client.connect().catch((error) => {
          console.warn('[Cache] Redis connection failed, using in-memory fallback:', error.message);
        });
      } catch (error) {
        console.error('[Cache] Failed to create Redis client:', error);
        // Create a mock client that does nothing
        this.client = {
          get: async () => null,
          set: async () => 'OK',
          setex: async () => 'OK',
          del: async () => 1,
          exists: async () => 0,
          quit: async () => {},
          connect: async () => {},
        } as any;
      }
    } else {
      // Invalid URL - use mock client
      console.warn('[Cache] Invalid Redis URL, using in-memory fallback');
      this.client = {
        get: async () => null,
        set: async () => 'OK',
        setex: async () => 'OK',
        del: async () => 1,
        exists: async () => 0,
        quit: async () => {},
        connect: async () => {},
      } as any;
    }
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(`${this.prefix}${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(`${this.prefix}${key}`, ttlSeconds, serialized);
      } else {
        await this.client.set(`${this.prefix}${key}`, serialized);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(`${this.prefix}${key}`);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// Cache Manager - Automatically chooses the best available cache
export class CacheManager {
  private static instance: CacheManager;
  private cache: VercelKVCache | RedisCache;

  constructor() {
    // Prefer Vercel KV for Vercel deployments, fallback to Redis
    if (process.env.KV_URL || process.env.VERCEL) {
      this.cache = VercelKVCache.getInstance();
    } else {
      this.cache = RedisCache.getInstance();
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    return this.cache.set<T>(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    return this.cache.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.exists(key);
  }
}

// Cache decorator for API routes
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttlSeconds: number = 300 // 5 minutes default
) {
  return async (...args: T): Promise<R> => {
    const cache = CacheManager.getInstance();
    const cacheKey = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = await cache.get<R>(cacheKey);
    if (cached) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cached;
    }

    // Execute function and cache result
    console.log(`Cache miss for key: ${cacheKey}`);
    const result = await fn(...args);
    await cache.set(cacheKey, result, ttlSeconds);
    
    return result;
  };
}

// Cache keys for different data types
export const CACHE_KEYS = {
  SEO_DATA: (domain: string, timeRange: string) => `seo:${domain}:${timeRange}`,
  AEO_DATA: (domain: string, timeRange: string) => `aeo:${domain}:${timeRange}`,
  GEO_DATA: (domain: string, timeRange: string) => `geo:${domain}:${timeRange}`,
  DASHBOARD_OVERVIEW: (timeRange: string) => `dashboard:overview:${timeRange}`,
  AI_HEALTH_DATA: (timeRange: string) => `ai-health:${timeRange}`,
  WEBSITE_DATA: (domain: string, timeRange: string) => `website:${domain}:${timeRange}`,
  REVIEWS_DATA: (domain: string, timeRange: string) => `reviews:${domain}:${timeRange}`,
  SCHEMA_DATA: (domain: string, timeRange: string) => `schema:${domain}:${timeRange}`,
  MYSTERY_SHOP_DATA: (domain: string, timeRange: string) => `mystery-shop:${domain}:${timeRange}`,
  PREDICTIVE_DATA: (domain: string, timeRange: string) => `predictive:${domain}:${timeRange}`,
  GEO_SGE_DATA: (domain: string, timeRange: string) => `geo-sge:${domain}:${timeRange}`,
  USER_SESSION: (userId: string) => `user:session:${userId}`,
  USER_SUBSCRIPTION: (userId: string) => `user:subscription:${userId}`,
  USAGE_STATS: (userId: string, feature?: string) => 
    feature ? `usage:${userId}:${feature}` : `usage:${userId}`,
  ANALYTICS_EVENTS: (userId: string, days: number) => `analytics:${userId}:${days}d`,
  API_RESPONSE: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
  ONBOARDING_ANALYSIS: (domain: string) => `onboarding:analysis:${domain}`,
  ONBOARDING_PROFILE: (domain: string) => `onboarding:profile:${domain}`,
  ONBOARDING_PROGRESS: (userId: string) => `onboarding:progress:${userId}`,
  PERSONALIZED_MESSAGES: (userId: string, step: string) => `personalized:${userId}:${step}`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SEO_DATA: 300, // 5 minutes
  AEO_DATA: 300, // 5 minutes
  GEO_DATA: 300, // 5 minutes
  DASHBOARD_OVERVIEW: 60, // 1 minute
  AI_HEALTH_DATA: 120, // 2 minutes
  WEBSITE_DATA: 300, // 5 minutes
  REVIEWS_DATA: 600, // 10 minutes
  SCHEMA_DATA: 1800, // 30 minutes
  MYSTERY_SHOP_DATA: 3600, // 1 hour
  PREDICTIVE_DATA: 1800, // 30 minutes
  GEO_SGE_DATA: 300, // 5 minutes
  USER_SESSION: 1800, // 30 minutes
  USER_SUBSCRIPTION: 300, // 5 minutes
  USAGE_STATS: 60, // 1 minute
  ANALYTICS_EVENTS: 300, // 5 minutes
  API_RESPONSE: 300, // 5 minutes
  ONBOARDING_ANALYSIS: 1800, // 30 minutes
  ONBOARDING_PROFILE: 3600, // 1 hour
  ONBOARDING_PROGRESS: 300, // 5 minutes
  PERSONALIZED_MESSAGES: 600, // 10 minutes
} as const;