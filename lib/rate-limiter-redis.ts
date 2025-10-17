import { Redis } from 'ioredis';
import { getRedis } from './redis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix: string; // Redis key prefix
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RedisRateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
  }

  /**
   * Check if request is allowed and update counters
   */
  async checkLimit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const windowEnd = windowStart + this.config.windowMs;
    const redisKey = `${this.config.keyPrefix}:${key}:${windowStart}`;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Increment counter
      pipeline.incr(redisKey);
      
      // Set expiration
      pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
      
      // Get current count
      pipeline.get(redisKey);
      
      const results = await pipeline.exec();
      
      if (!results || results.some(([err]) => err)) {
        throw new Error('Redis pipeline failed');
      }
      
      const currentCount = parseInt(results[2][1] as string, 10);
      const remaining = Math.max(0, this.config.maxRequests - currentCount);
      const allowed = currentCount <= this.config.maxRequests;
      
      return {
        allowed,
        remaining,
        resetTime: windowEnd,
        retryAfter: allowed ? undefined : Math.ceil((windowEnd - now) / 1000)
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If Redis is unavailable, allow the request
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: windowEnd
      };
    }
  }

  /**
   * Get current usage without incrementing
   */
  async getUsage(key: string): Promise<{ count: number; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const windowEnd = windowStart + this.config.windowMs;
    const redisKey = `${this.config.keyPrefix}:${key}:${windowStart}`;

    try {
      const count = await this.redis.get(redisKey);
      const currentCount = count ? parseInt(count, 10) : 0;
      const remaining = Math.max(0, this.config.maxRequests - currentCount);
      
      return {
        count: currentCount,
        remaining,
        resetTime: windowEnd
      };
    } catch (error) {
      console.error('Rate limiter usage check error:', error);
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: windowEnd
      };
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetLimit(key: string): Promise<void> {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const redisKey = `${this.config.keyPrefix}:${key}:${windowStart}`;

    try {
      await this.redis.del(redisKey);
    } catch (error) {
      console.error('Rate limiter reset error:', error);
    }
  }
}

/**
 * Token bucket rate limiter for more sophisticated rate limiting
 */
export class TokenBucketRateLimiter {
  private redis: Redis;
  private config: {
    capacity: number; // Maximum tokens
    refillRate: number; // Tokens per second
    keyPrefix: string;
  };

  constructor(redis: Redis, config: { capacity: number; refillRate: number; keyPrefix: string }) {
    this.redis = redis;
    this.config = config;
  }

  /**
   * Try to consume tokens from the bucket
   */
  async consume(key: string, tokens: number = 1): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
    const redisKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    const script = `
      local key = KEYS[1]
      local tokens = tonumber(ARGV[1])
      local capacity = tonumber(ARGV[2])
      local refillRate = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      
      local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local currentTokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now
      
      -- Calculate tokens to add based on time elapsed
      local timePassed = (now - lastRefill) / 1000
      local tokensToAdd = math.floor(timePassed * refillRate)
      currentTokens = math.min(capacity, currentTokens + tokensToAdd)
      
      -- Check if we have enough tokens
      if currentTokens >= tokens then
        currentTokens = currentTokens - tokens
        redis.call('HMSET', key, 'tokens', currentTokens, 'lastRefill', now)
        redis.call('EXPIRE', key, 3600) -- 1 hour expiration
        return {1, currentTokens} -- allowed, remaining
      else
        redis.call('HMSET', key, 'tokens', currentTokens, 'lastRefill', now)
        redis.call('EXPIRE', key, 3600)
        return {0, currentTokens} -- not allowed, remaining
      end
    `;

    try {
      const result = await this.redis.eval(script, 1, redisKey, tokens, this.config.capacity, this.config.refillRate, now);
      const [allowed, remaining] = result as [number, number];
      
      return {
        allowed: allowed === 1,
        remaining,
        retryAfter: allowed === 0 ? Math.ceil(tokens / this.config.refillRate) : undefined
      };
    } catch (error) {
      console.error('Token bucket error:', error);
      // If Redis is unavailable, allow the request
      return {
        allowed: true,
        remaining: this.config.capacity
      };
    }
  }
}

/**
 * Create rate limiter instances for different use cases
 */
export function createRateLimiters(redis?: Redis) {
  const redisClient = redis || getRedis();
  return {
    // API rate limiter: 1000 requests per minute
    api: new RedisRateLimiter(redisClient, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000,
      keyPrefix: 'rate_limit:api'
    }),
    
    // Webhook rate limiter: 100 requests per minute
    webhook: new RedisRateLimiter(redisClient, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyPrefix: 'rate_limit:webhook'
    }),
    
    // Tenant-specific rate limiter: 10000 requests per hour
    tenant: new RedisRateLimiter(redisClient, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10000,
      keyPrefix: 'rate_limit:tenant'
    }),
    
    // Token bucket for burst handling
    burst: new TokenBucketRateLimiter(redisClient, {
      capacity: 100,
      refillRate: 10, // 10 tokens per second
      keyPrefix: 'token_bucket'
    })
  };
}
