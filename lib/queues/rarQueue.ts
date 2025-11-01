// Lazy-loaded queue imports to avoid build-time dependencies
import { computeMonthlyRaR } from '@/lib/rar/calc';

// Type definitions
type Queue = any;
type Worker = any;
type JobsOptions = any;

let _rarQueue: Queue | null = null;
let _rarWorker: Worker | null = null;

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

// Parse Redis URL for ioredis
function getRedisConnection() {
  if (!redisUrl) {
    console.warn('REDIS_URL not set - RaR queue will use stub mode');
    return null;
  }

  try {
    // Lazy require to avoid build-time dependency
    // @ts-ignore
    const IORedis = require('ioredis');
    
    // Handle Upstash URL format or standard Redis URL
    if (redisUrl.includes('upstash.io')) {
      // Upstash format: redis://default:password@host:port
      return new IORedis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
      });
    } else {
      // Standard Redis
      return new IORedis(redisUrl);
    }
  } catch (error) {
    console.error('Invalid Redis URL:', error);
    return null;
  }
}

// Get queue instance (lazy initialization)
function getRarQueue(): Queue {
  if (_rarQueue) return _rarQueue;

  const connection = getRedisConnection();

  if (connection && process.env.REDIS_URL) {
    try {
      // @ts-ignore - lazy require
      const { Queue } = require('bullmq');
      
      _rarQueue = new Queue('rarQueue', {
        connection: connection as any,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });
    } catch (error) {
      console.warn('BullMQ not available, using stub queue:', error);
      _rarQueue = {
        add: async () => {
          console.warn('RaR queue: BullMQ not installed, job skipped');
          return { id: 'noop' };
        },
      } as any;
    }
  } else {
    // NOOP stub
    _rarQueue = {
      add: async () => {
        console.warn('RaR queue: Redis not configured, job skipped');
        return { id: 'noop' };
      },
    } as any;
  }

  return _rarQueue;
}

// Create worker (lazy initialization)
function getRarWorker(): Worker | null {
  if (_rarWorker !== null) return _rarWorker;
  
  const connection = getRedisConnection();

  if (connection && process.env.REDIS_URL) {
    try {
      // @ts-ignore - lazy require
      const { Worker } = require('bullmq');
      
      _rarWorker = new Worker(
        'rarQueue',
        async (job: any) => {
          const { dealerId, month } = job.data;
          return computeMonthlyRaR({ dealerId, month });
        },
        { connection: connection as any }
      );
    } catch (error) {
      console.warn('BullMQ not available, worker disabled:', error);
      _rarWorker = null;
    }
  } else {
    _rarWorker = null;
  }

  return _rarWorker;
}

// Export queue instance
export const rarQueue = getRarQueue();

// Export worker instance (initialize on first access)
export const rarWorker = getRarWorker();

export type RarJobOptions = JobsOptions;

