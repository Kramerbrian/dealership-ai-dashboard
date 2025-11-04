/**
 * Background Job Worker
 * 
 * Processes jobs from the queue
 */

import { createWorker, JobType } from '@/lib/job-queue';
import { processAIScoreCalculation } from './ai-score-calculator';
import { processReportGeneration } from './report-generator';

/**
 * Initialize job worker
 * Call this in your application startup
 */
export function initializeJobWorker() {
  const worker = createWorker(async (job) => {
    const { data } = job;
    const { jobType, ...payload } = data;

    switch (jobType) {
      case 'ai-score-calculation':
        await processAIScoreCalculation(payload);
        break;
      
      case 'report-generation':
        await processReportGeneration(payload);
        break;
      
      default:
        console.warn(`Unknown job type: ${jobType}`);
    }
  });

  if (worker) {
    console.log('[Worker] Background job worker initialized');
    
    worker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed:`, err);
    });
  } else {
    console.warn('[Worker] Job worker not initialized (Redis not configured)');
  }

  return worker;
}

