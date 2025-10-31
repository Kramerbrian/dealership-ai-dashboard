/**
 * Redis Client and Utilities
 * Handles caching and session management
 */

interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

class MockRedisClient {
  private cache: Map<string, { value: any; expiry?: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
  }

  async set(key: string, value: any, options?: { ex?: number; px?: number }): Promise<string> {
    let expiry: number | undefined;
    
    if (options?.ex) {
      expiry = Date.now() + (options.ex * 1000);
    } else if (options?.px) {
      expiry = Date.now() + options.px;
    }
    
    this.cache.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    return existed ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return 0;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return 0;
    }
    
    return 1;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async flushall(): Promise<string> {
    this.cache.clear();
    return 'OK';
  }

  async keys(pattern: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());
    
    if (pattern === '*') {
      return keys;
    }
    
    // Simple pattern matching (only supports * wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  // Cleanup expired keys
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Global Redis client instance
let redisClient: MockRedisClient | null = null;

export function getRedisClient(): MockRedisClient {
  if (!redisClient) {
    redisClient = new MockRedisClient();
    
    // Cleanup expired keys every 5 minutes
    setInterval(() => {
      redisClient?.cleanup();
    }, 5 * 60 * 1000);
  }
  
  return redisClient;
}

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Cache utilities
export class CacheService {
  private client: MockRedisClient;

  constructor() {
    this.client = getRedisClient();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      await this.client.set(key, JSON.stringify(value), { ex: ttlSeconds });
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // Cache with automatic refresh
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  // Generate cache key
  generateKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}

// Export singleton instance
export const cacheService = new CacheService();