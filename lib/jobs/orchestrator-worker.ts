/**
 * Orchestrator Worker with Slack Integration
 * 
 * BullMQ worker that processes orchestrator tasks and updates Slack messages in real-time
 */

import { Worker, Job } from 'bullmq';
import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

// Redis connection
const connection = REDIS_URL && REDIS_TOKEN
  ? {
      host: REDIS_URL.replace('https://', '').replace('http://', ''),
      port: 443,
      password: REDIS_TOKEN,
    }
  : undefined;

interface OrchestratorJobData {
  type: string;
  payload: {
    dealerId: string;
    [key: string]: any;
  };
  source?: string;
  userId?: string;
  userName?: string;
  slackContext?: {
    channel: string;
    ts: string;
    responseUrl?: string;
  };
}

/**
 * Update Slack message with task status
 */
async function updateSlackStatus(
  slackContext: { channel: string; ts: string },
  status: 'running' | 'completed' | 'failed',
  task: string,
  dealer: string,
  details?: {
    progress?: number;
    error?: string;
    taskId?: string;
    grafanaUrl?: string;
    metrics?: {
      arrGain?: number;
      precision?: number;
      kpi?: string;
    };
  }
): Promise<void> {
  try {
    const { updateSlackProgress, fetchCompletionMetrics } = await import('../services/slackUpdate');
    
    // Fetch metrics for completed tasks
    let metrics = details?.metrics;
    if (status === 'completed' && !metrics) {
      metrics = await fetchCompletionMetrics(dealer);
    }

    const success = await updateSlackProgress(
      slackContext.channel,
      slackContext.ts,
      task,
      dealer,
      status === 'running' ? 'progress' : status === 'completed' ? 'completed' : 'failed',
      details?.progress || 0,
      {
        ...details,
        metrics,
      }
    );

    if (!success) {
      console.error('Failed to update Slack message');
    }
  } catch (error) {
    console.error('Error updating Slack message:', error);
  }
}

/**
 * Post threaded progress update
 */
async function postThreadProgress(
  slackContext: { channel: string; ts: string },
  progress: number,
  step?: string
): Promise<void> {
  try {
    const { postProgressThread } = await import('../services/slackUpdate');
    await postProgressThread(
      slackContext.channel,
      slackContext.ts,
      progress,
      step
    );
  } catch (error) {
    console.error('Error posting thread progress:', error);
  }
}

/**
 * Process orchestrator task
 */
async function processTask(job: Job<OrchestratorJobData>): Promise<any> {
  const { type, payload, slackContext } = job.data;
  const dealer = payload.dealerId;
  const taskId = job.id;

  console.log(`Processing task ${taskId}: ${type} for dealer ${dealer}`);

  // Update Slack to "running" if we have context
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(
      slackContext,
      'running',
      type,
      dealer,
      { progress: 0, taskId }
    );
  }

  try {
    // Simulate task processing
    // Replace with actual task logic based on type
    switch (type) {
      case 'schema_fix':
        return await processSchemaFix(payload, job);
      case 'ugc_audit':
        return await processUGCAudit(payload, job);
      case 'arr_forecast':
        return await processARRForecast(payload, job);
      case 'msrp_sync':
        return await processMSRPSync(payload, job);
      case 'ai_score_recompute':
        return await processAIScoreRecompute(payload, job);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  } catch (error) {
    // Update Slack to "failed" if we have context
    if (slackContext?.channel && slackContext?.ts) {
      await updateSlackStatus(
        slackContext,
        'failed',
        type,
        dealer,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          taskId,
        }
      );
    }
    throw error;
  }
}

/**
 * Process schema fix task
 */
async function processSchemaFix(
  payload: any,
  job: Job<OrchestratorJobData>
): Promise<any> {
  const { slackContext } = job.data;
  const dealer = payload.dealerId;

  // Simulate progress updates
  for (let progress = 10; progress <= 100; progress += 30) {
    await job.updateProgress(progress);

    // Update Slack progress if we have context
    if (slackContext?.channel && slackContext?.ts) {
      await updateSlackStatus(
        slackContext,
        'running',
        'schema_fix',
        dealer,
        { progress, taskId: job.id }
      );
    }

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Simulate result
  const result = {
    fixesApplied: Math.floor(Math.random() * 10) + 5,
    errorsFixed: Math.floor(Math.random() * 5) + 1,
    success: true,
  };

  // Update Slack to "completed" if we have context
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(
      slackContext,
      'completed',
      'schema_fix',
      dealer,
      {
        taskId: job.id,
        grafanaUrl: `${process.env.GRAFANA_URL || 'https://grafana.dealershipai.com'}/d/gnn-analytics?dealer=${dealer}`,
      }
    );
  }

  return result;
}

/**
 * Process UGC audit task
 */
async function processUGCAudit(
  payload: any,
  job: Job<OrchestratorJobData>
): Promise<any> {
  const { slackContext } = job.data;
  const dealer = payload.dealerId;

  // Simulate progress
  await job.updateProgress(50);
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'running', 'ugc_audit', dealer, { progress: 50, taskId: job.id });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = {
    auditsCompleted: Math.floor(Math.random() * 20) + 10,
    issuesFound: Math.floor(Math.random() * 5),
    success: true,
  };

  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'completed', 'ugc_audit', dealer, {
      taskId: job.id,
      grafanaUrl: `${process.env.GRAFANA_URL || 'https://grafana.dealershipai.com'}/d/gnn-analytics?dealer=${dealer}`,
    });
  }

  return result;
}

/**
 * Process ARR forecast task
 */
async function processARRForecast(
  payload: any,
  job: Job<OrchestratorJobData>
): Promise<any> {
  const { slackContext } = job.data;
  const dealer = payload.dealerId;

  await job.updateProgress(75);
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'running', 'arr_forecast', dealer, { progress: 75, taskId: job.id });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const result = {
    forecast30d: Math.floor(Math.random() * 100000) + 50000,
    forecast90d: Math.floor(Math.random() * 300000) + 150000,
    confidence: 0.85 + Math.random() * 0.1,
    success: true,
  };

  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'completed', 'arr_forecast', dealer, {
      taskId: job.id,
      grafanaUrl: `${process.env.GRAFANA_URL || 'https://grafana.dealershipai.com'}/d/predictive-analytics?dealer=${dealer}`,
    });
  }

  return result;
}

/**
 * Process MSRP sync task
 */
async function processMSRPSync(
  payload: any,
  job: Job<OrchestratorJobData>
): Promise<any> {
  const { slackContext } = job.data;
  const dealer = payload.dealerId;

  await job.updateProgress(60);
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'running', 'msrp_sync', dealer, { progress: 60, taskId: job.id });
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Simulate MSRP sync results (in production, this would come from actual DB queries)
  const recordsSynced = Math.floor(Math.random() * 1000) + 500;
  const priceChanges = Math.floor(Math.random() * 50);
  
  // Publish MSRP change events for each price change
  if (priceChanges > 0) {
    const { publish } = await import('@/lib/events/bus');
    
    // Simulate price changes for sample VINs
    for (let i = 0; i < Math.min(priceChanges, 10); i++) { // Limit to 10 events per sync
      const sampleVin = `VIN${Math.floor(Math.random() * 10000)}`;
      const oldPrice = Math.floor(Math.random() * 50000) + 20000;
      const newPrice = oldPrice + (Math.random() - 0.5) * 5000;
      const deltaPct = ((newPrice - oldPrice) / oldPrice) * 100;

      await publish('msrp', {
        vin: sampleVin,
        old: oldPrice,
        new: newPrice,
        deltaPct: Math.round(deltaPct * 100) / 100,
        ts: new Date().toISOString(),
      });
    }
  }

  const result = {
    recordsSynced,
    priceChanges,
    success: true,
  };

  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'completed', 'msrp_sync', dealer, {
      taskId: job.id,
      grafanaUrl: `${process.env.GRAFANA_URL || 'https://grafana.dealershipai.com'}/d/gnn-analytics?dealer=${dealer}`,
    });
  }

  return result;
}

/**
 * Process AI score recompute task
 */
async function processAIScoreRecompute(
  payload: any,
  job: Job<OrchestratorJobData>
): Promise<any> {
  const { slackContext } = job.data;
  const dealer = payload.dealerId;

  const scoresUpdated = Math.floor(Math.random() * 100) + 50;
  const newAverageScore = 85 + Math.random() * 10;

  for (let progress = 20; progress <= 100; progress += 20) {
    await job.updateProgress(progress);
    if (slackContext?.channel && slackContext?.ts) {
      await updateSlackStatus(slackContext, 'running', 'ai_score_recompute', dealer, { progress, taskId: job.id });
    }
    
    // Publish score updates as we process (simulate batch processing)
    if (progress === 100) {
      try {
        const { publish } = await import('@/lib/events/bus');
        
        // Publish events for sample VINs (in production, iterate over actual scored entities)
        for (let i = 0; i < Math.min(scoresUpdated, 10); i++) { // Limit to 10 events
          const sampleVin = `VIN${Math.floor(Math.random() * 10000)}`;
          const avi = newAverageScore + (Math.random() - 0.5) * 5;
          const ati = avi * 0.95;
          const cis = newAverageScore + (Math.random() - 0.5) * 3;

          await publish('ai', {
            vin: sampleVin,
            dealerId: dealer,
            reason: 'recompute',
            avi: Math.round(avi * 10) / 10,
            ati: Math.round(ati * 10) / 10,
            cis: Math.round(cis * 10) / 10,
            ts: new Date().toISOString(),
          });
        }
      } catch (error) {
        // Don't fail the job if event publishing fails
        console.error('Failed to publish AI score events:', error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  const result = {
    scoresUpdated,
    newAverageScore,
    success: true,
  };

  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(slackContext, 'completed', 'ai_score_recompute', dealer, {
      taskId: job.id,
      grafanaUrl: `${process.env.GRAFANA_URL || 'https://grafana.dealershipai.com'}/d/gnn-analytics?dealer=${dealer}`,
    });
  }

  return result;
}

/**
 * Create orchestrator worker
 */
export function createOrchestratorWorker(): Worker<OrchestratorJobData> | null {
  if (!connection) {
    console.warn('Orchestrator worker not created: Redis connection not configured');
    return null;
  }

  const worker = new Worker<OrchestratorJobData>(
    'orchestrator-jobs',
    async (job) => {
      try {
        const result = await processTask(job);
        return result;
      } catch (error) {
        console.error(`Task ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  // Log job completion
  worker.on('completed', (job) => {
    console.log(`✅ Task ${job.id} (${job.data.type}) completed for ${job.data.payload.dealerId}`);
  });

  // Log job failure
  worker.on('failed', (job, err) => {
    console.error(`❌ Task ${job?.id} (${job?.data.type}) failed:`, err);
  });

  // Log job progress and post to Slack thread
  worker.on('progress', async (job, progress) => {
    console.log(`📊 Task ${job.id} progress: ${progress}%`);
    
    // Post threaded updates for major milestones
    if (job.data.slackContext && (progress % 20 === 0 || progress === 100)) {
      const step = progress === 20 ? 'Schema detected'
        : progress === 40 ? 'Validation started'
        : progress === 60 ? 'Processing'
        : progress === 80 ? 'Injected into site'
        : progress === 100 ? 'Completed'
        : undefined;
      
      await postThreadProgress(job.data.slackContext, progress, step);
    }
  });

  return worker;
}

/**
 * Start orchestrator worker (for standalone script)
 */
if (require.main === module) {
  const worker = createOrchestratorWorker();
  
  if (worker) {
    console.log('🚀 Orchestrator worker started');
    console.log('Listening for jobs on queue: orchestrator-jobs');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down worker...');
      await worker.close();
      process.exit(0);
    });
  } else {
    console.error('❌ Failed to start worker: Redis connection not configured');
    process.exit(1);
  }
}

export { processTask, updateSlackStatus };
