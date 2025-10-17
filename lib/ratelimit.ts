import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter with token bucket algorithm
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.tokenBucket(10, '10 s', 10), // 10 requests per 10 seconds, burst of 10
  analytics: true,
  prefix: 'dealershipai',
});

// SEO-specific rate limiter (more restrictive)
export const seoRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.tokenBucket(5, '60 s', 5), // 5 requests per minute, burst of 5
  analytics: true,
  prefix: 'dealershipai:seo',
});

// API key rate limiter
export const apiKeyRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.tokenBucket(100, '60 s', 100), // 100 requests per minute, burst of 100
  analytics: true,
  prefix: 'dealershipai:api',
});

// Webhook rate limiter
export const webhookRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.tokenBucket(20, '60 s', 20), // 20 requests per minute, burst of 20
  analytics: true,
  prefix: 'dealershipai:webhook',
});

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
