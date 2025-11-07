// lib/cache.ts
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL!;
const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
export const redis = url && token ? new Redis({ url, token }) : null;

export async function cacheJSON<T>(
  key: string,
  ttlSec: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) return fetcher();
  const hit = await redis.get<T>(key);
  if (hit) return hit;
  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttlSec });
  return fresh;
}
