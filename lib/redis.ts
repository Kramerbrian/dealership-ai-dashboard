import { Redis } from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL || 'redis://localhost:6379';
    
    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      // Graceful shutdown
      onClose: () => {
        console.log('Redis connection closed');
      },
      onError: (err) => {
        console.error('Redis error:', err);
      }
    });

    // Test connection
    redis.ping().catch(err => {
      console.error('Failed to connect to Redis:', err);
    });
  }

  return redis;
}

export function closeRedis(): Promise<void> {
  if (redis) {
    const connection = redis;
    redis = null;
    return connection.quit();
  }
  return Promise.resolve();
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeRedis().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  closeRedis().then(() => process.exit(0));
});