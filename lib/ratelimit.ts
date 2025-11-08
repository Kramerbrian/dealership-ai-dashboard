import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Sanitize Redis URL (remove newlines/whitespace)
const getRedisUrl = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  if (!url || !url.startsWith('https://')) return undefined;
  return url;
};

const redis = getRedisUrl() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ? new Redis({ 
      url: getRedisUrl()!, 
      token: process.env.UPSTASH_REDIS_REST_TOKEN.trim() 
    })
  : undefined as any;
export const rl_telemetry = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m') }) : undefined;
export const rl_publicAPI = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') }) : undefined;
export async function allow(limiter: Ratelimit | undefined, key: string) {
  if (!limiter) return { success: true } as any;
  return limiter.limit(key);
}
