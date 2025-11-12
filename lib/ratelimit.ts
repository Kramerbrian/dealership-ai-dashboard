import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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
    console.warn('[RateLimit] Redis not configured - rate limiting disabled');
    return null;
  }

  // Check if URL looks valid (basic validation)
  if (!url.includes('.upstash.io') && !url.startsWith('http')) {
    console.warn('[RateLimit] Invalid Redis URL format - rate limiting disabled');
    return null;
  }

  try {
    redis = new Redis({
      url,
      token,
    });
    return redis;
  } catch (error) {
    console.error('[RateLimit] Failed to initialize Redis:', error);
    return null;
  }
}

// Create rate limiters only if Redis is available
const redisClient = getRedis();

// Create rate limiter with token bucket algorithm
export const ratelimit = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.tokenBucket(10, '10 s', 10), // 10 requests per 10 seconds, burst of 10
      analytics: true,
      prefix: 'dealershipai',
    })
  : null;

// SEO-specific rate limiter (more restrictive)
export const seoRatelimit = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.tokenBucket(5, '60 s', 5), // 5 requests per minute, burst of 5
      analytics: true,
      prefix: 'dealershipai:seo',
    })
  : null;

// API key rate limiter
export const apiKeyRatelimit = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.tokenBucket(100, '60 s', 100), // 100 requests per minute, burst of 100
      analytics: true,
      prefix: 'dealershipai:api',
    })
  : null;

// Webhook rate limiter
export const webhookRatelimit = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.tokenBucket(20, '60 s', 20), // 20 requests per minute, burst of 20
      analytics: true,
      prefix: 'dealershipai:webhook',
    })
  : null;

// Helper function to get client identifier
export function getClientId(request: Request): string {
  // Try to get from API key header first
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return `api:${apiKey}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

// Rate limit check helper
export async function checkRateLimit(
  request: Request,
  limiter: Ratelimit | null = ratelimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If rate limiting is not available, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  try {
    const clientId = getClientId(request);
    const result = await limiter.limit(clientId);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}
