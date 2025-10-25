/**
 * Redis Configuration
 * Redis client for caching and rate limiting
 */

import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

export async function checkRateLimitHealth(): Promise<boolean> {
  try {
    // Test basic Redis operations
    await redis.set('health_check', 'ok', 'EX', 10)
    const result = await redis.get('health_check')
    await redis.del('health_check')
    return result === 'ok'
  } catch (error) {
    console.error('Rate limit health check failed:', error)
    return false
  }
}

export { redis }