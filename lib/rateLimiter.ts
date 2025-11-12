import { Redis } from '@upstash/redis'

// Initialize Redis client only if valid URL and token are provided
let redis: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  if (redisInitialized) {
    return redis;
  }

  redisInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Validate URL format before initializing
  if (!url || !token) {
    console.warn('[RateLimiter] Redis not configured - rate limiting disabled');
    return null;
  }

  // Check if URL looks valid (basic validation)
  if (!url.includes('.upstash.io') && !url.startsWith('http')) {
    console.warn('[RateLimiter] Invalid Redis URL format - rate limiting disabled');
    return null;
  }

  try {
    redis = new Redis({
      url,
      token,
    });
    return redis;
  } catch (error) {
    console.error('[RateLimiter] Failed to initialize Redis:', error);
    return null;
  }
}

const redisClient = getRedis();

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
}

/**
 * Token bucket rate limiter using Redis
 * Implements sliding window with token bucket algorithm
 */
export class RedisRateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if request is within rate limit
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  async checkLimit(req: Request): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(req)
      : this.getDefaultKey(req)

    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Get current tokens for this key
      const script = `
        local key = KEYS[1]
        local window_start = tonumber(ARGV[1])
        local window_ms = tonumber(ARGV[2])
        local max_requests = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])
        
        -- Remove expired tokens
        redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
        
        -- Count current tokens
        local current_tokens = redis.call('ZCARD', key)
        
        if current_tokens < max_requests then
          -- Add new token
          redis.call('ZADD', key, now, now)
          redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
          
          return {1, max_requests - current_tokens - 1, now + window_ms}
        else
          -- Rate limit exceeded
          local oldest_token = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
          local retry_after = oldest_token[2] + window_ms - now
          
          return {0, 0, now + window_ms, retry_after}
        end
      `

      if (!redisClient) {
        // Redis not available - allow request
        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: now + this.config.windowMs
        };
      }

      const result = await redisClient.eval(
        script,
        [key],
        [windowStart, this.config.windowMs, this.config.maxRequests, now]
      ) as [number, number, number, number?]

      const [allowed, remaining, resetTime, retryAfter] = result

      return {
        allowed: allowed === 1,
        remaining,
        resetTime,
        retryAfter: retryAfter ? Math.ceil(retryAfter / 1000) : undefined
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }
  }

  /**
   * Default key generator based on IP and tenant
   */
  private getDefaultKey(req: Request): string {
    const url = new URL(req.url)
    const tenantId = url.searchParams.get('tenantId') || 'anonymous'
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    return `rate_limit:${tenantId}:${ip}`
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // General API rate limiting
  api: new RedisRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    keyGenerator: (req) => {
      const url = new URL(req.url)
      const tenantId = url.searchParams.get('tenantId') || 'anonymous'
      return `api:${tenantId}`
    }
  }),

  // SEO generation (more restrictive)
  seoGeneration: new RedisRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => {
      const url = new URL(req.url)
      const tenantId = url.searchParams.get('tenantId') || 'anonymous'
      return `seo_gen:${tenantId}`
    }
  }),

  // Metrics webhook (very permissive)
  metricsWebhook: new RedisRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: (req) => {
      const url = new URL(req.url)
      const tenantId = url.searchParams.get('tenantId') || 'anonymous'
      return `metrics:${tenantId}`
    }
  })
}

/**
 * Middleware helper for rate limiting
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  limiter: RedisRateLimiter
) {
  return async (req: Request): Promise<Response> => {
    const limit = await limiter.checkLimit(req)
    
    if (!limit.allowed) {
      const response = new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
          retryAfter: limit.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
            ...(limit.retryAfter && { 'Retry-After': limit.retryAfter.toString() })
          }
        }
      )
      return response
    }
    
    const response = await handler(req)
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', limiter.config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(limit.resetTime).toISOString())
    
    return response
  }
}
