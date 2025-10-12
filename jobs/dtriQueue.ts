import { Queue } from 'bullmq';

export const dtriQueue = new Queue('dtri_jobs', {
  connection: { url: process.env.REDIS_URL! },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 2,
    backoff: { type: 'exponential', delay: 10000 }
  }
});
