import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Build-time guard
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    process.env.NODE_ENV === 'test';

// Lazy initialization
let redis: Redis | null = null;
let ratelimitInstance: Ratelimit | null = null;
let seoRatelimitInstance: Ratelimit | null = null;
let apiKeyRatelimitInstance: Ratelimit | null = null;
let webhookRatelimitInstance: Ratelimit | null = null;

function getRedis(): Redis {
  if (isBuildTime) {
    throw new Error('Cannot initialize Redis during build time');
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// Create rate limiter with token bucket algorithm
export function getRatelimit(): Ratelimit {
  if (isBuildTime) {
    throw new Error('Cannot initialize Ratelimit during build time');
  }
  if (!ratelimitInstance) {
    ratelimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.tokenBucket(10, '10 s', 10), // 10 requests per 10 seconds, burst of 10
      analytics: true,
      prefix: 'dealershipai',
    });
  }
  return ratelimitInstance;
}

// SEO-specific rate limiter (more restrictive)
export function getSeoRatelimit(): Ratelimit {
  if (isBuildTime) {
    throw new Error('Cannot initialize Ratelimit during build time');
  }
  if (!seoRatelimitInstance) {
    seoRatelimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.tokenBucket(5, '60 s', 5), // 5 requests per minute, burst of 5
      analytics: true,
      prefix: 'dealershipai:seo',
    });
  }
  return seoRatelimitInstance;
}

// API key rate limiter
export function getApiKeyRatelimit(): Ratelimit {
  if (isBuildTime) {
    throw new Error('Cannot initialize Ratelimit during build time');
  }
  if (!apiKeyRatelimitInstance) {
    apiKeyRatelimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.tokenBucket(100, '60 s', 100), // 100 requests per minute, burst of 100
      analytics: true,
      prefix: 'dealershipai:api',
    });
  }
  return apiKeyRatelimitInstance;
}

// Webhook rate limiter
export function getWebhookRatelimit(): Ratelimit {
  if (isBuildTime) {
    throw new Error('Cannot initialize Ratelimit during build time');
  }
  if (!webhookRatelimitInstance) {
    webhookRatelimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.tokenBucket(20, '60 s', 20), // 20 requests per minute, burst of 20
      analytics: true,
      prefix: 'dealershipai:webhook',
    });
  }
  return webhookRatelimitInstance;
}

// Backward compatibility (deprecated - use getters instead)
export const ratelimit = {
  get instance() { return getRatelimit(); }
};
export const seoRatelimit = {
  get instance() { return getSeoRatelimit(); }
};
export const apiKeyRatelimit = {
  get instance() { return getApiKeyRatelimit(); }
};
export const webhookRatelimit = {
  get instance() { return getWebhookRatelimit(); }
};

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
  limiter: Ratelimit = ratelimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const clientId = getClientId(request);
  const result = await limiter.limit(clientId);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
