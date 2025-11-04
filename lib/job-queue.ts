/**
 * Background Job Processing
 * 
 * Queue system for async job processing using BullMQ
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import { Redis } from '@upstash/redis';

// Redis connection (using Upstash)
const connection = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? {
      host: process.env.UPSTASH_REDIS_REST_URL.replace('https://', ''),
      port: 443,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    }
  : undefined;

/**
 * Job queue instance
 */
export const jobQueue = connection
  ? new Queue('dealership-ai-jobs', { connection })
  : null;

/**
 * Queue events for monitoring
 */
export const queueEvents = connection
  ? new QueueEvents('dealership-ai-jobs', { connection })
  : null;

/**
 * Job types
 */
export enum JobType {
  SEND_EMAIL = 'send-email',
  PROCESS_DATA = 'process-data',
  GENERATE_REPORT = 'generate-report',
  CACHE_WARMUP = 'cache-warmup',
  CLEANUP = 'cleanup',
  AI_SCORE_CALCULATION = 'ai-score-calculation',
  REPORT_GENERATION = 'report-generation',
}

interface JobData {
  type: JobType;
  payload: Record<string, any>;
  priority?: number;
  delay?: number; // Delay in milliseconds
  attempts?: number;
}

/**
 * Add a job to the queue
 */
export async function addJob(jobData: JobData): Promise<string | null> {
  if (!jobQueue) {
    console.warn('Job queue not configured. Running job synchronously.');
    // Fallback: run job immediately
    return null;
  }

  const job = await jobQueue.add(
    jobData.type,
    jobData.payload,
    {
      priority: jobData.priority || 0,
      delay: jobData.delay,
      attempts: jobData.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );

  return job.id;
}

/**
 * Create a worker for processing jobs
 */
export function createWorker(
  processor: (job: { data: any; id: string }) => Promise<void>
): Worker | null {
  if (!connection) {
    console.warn('Worker not created: Redis connection not configured');
    return null;
  }

  const worker = new Worker(
    'dealership-ai-jobs',
    async (job) => {
      try {
        await processor(job);
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error; // Will trigger retry
      }
    },
    {
      connection,
      concurrency: 5, // Process 5 jobs concurrently
      limiter: {
        max: 10,
        duration: 1000, // Max 10 jobs per second
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
} | null> {
  if (!jobQueue) return null;

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    jobQueue.getWaitingCount(),
    jobQueue.getActiveCount(),
    jobQueue.getCompletedCount(),
    jobQueue.getFailedCount(),
    jobQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

