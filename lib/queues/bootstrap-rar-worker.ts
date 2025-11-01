/**
 * Bootstrap RaR Worker
 * Import this once in a server-only context to start the RaR queue worker
 */

let workerInitialized = false;

export async function bootstrapRaRWorker() {
  if (workerInitialized) {
    return;
  }

  // Dynamic import to avoid loading BullMQ during build
  if (typeof window === 'undefined' && process.env.REDIS_URL) {
    try {
      const { rarWorker } = await import('@/lib/queues/rarQueue');
      
      if (rarWorker) {
        rarWorker.on('completed', (job) => {
          console.log(`[RaR Worker] Job ${job.id} completed`);
        });

        rarWorker.on('failed', (job, err) => {
          console.error(`[RaR Worker] Job ${job?.id} failed:`, err);
        });

        console.log('[RaR Worker] Initialized and listening for jobs');
        workerInitialized = true;
      }
    } catch (error) {
      console.warn('[RaR Worker] Failed to initialize:', error);
    }
  }
}

// Auto-initialize if in server environment
if (typeof window === 'undefined') {
  bootstrapRaRWorker().catch(console.error);
}

