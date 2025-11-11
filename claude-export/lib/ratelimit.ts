import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Trim whitespace from environment variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

const redis = redisUrl && redisToken
  ? new Redis({ 
      url: redisUrl, 
      token: redisToken
    })
  : undefined as any;

export const rl_telemetry = redis 
  ? new Ratelimit({ 
      redis, 
      limiter: Ratelimit.slidingWindow(30, '1 m') 
    }) 
  : undefined;

export const rl_publicAPI = redis 
  ? new Ratelimit({ 
      redis, 
      limiter: Ratelimit.slidingWindow(60, '1 m') 
    }) 
  : undefined;

export async function allow(limiter: Ratelimit | undefined, key: string) {
  if (!limiter) return { success: true } as any;
  return limiter.limit(key);
}
