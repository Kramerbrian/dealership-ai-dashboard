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
  }
): Promise<void> {
  try {
    const response = await fetch(`${APP_URL}/api/slack/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackContext.channel,
        ts: slackContext.ts,
        status,
        task,
        dealer,
        ...details,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to update Slack message: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating Slack message:', error);
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

  const result = {
    recordsSynced: Math.floor(Math.random() * 1000) + 500,
    priceChanges: Math.floor(Math.random() * 50),
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

  for (let progress = 20; progress <= 100; progress += 20) {
    await job.updateProgress(progress);
    if (slackContext?.channel && slackContext?.ts) {
      await updateSlackStatus(slackContext, 'running', 'ai_score_recompute', dealer, { progress, taskId: job.id });
    }
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  const result = {
    scoresUpdated: Math.floor(Math.random() * 100) + 50,
    newAverageScore: 85 + Math.random() * 10,
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

  // Log job progress
  worker.on('progress', (job, progress) => {
    console.log(`📊 Task ${job.id} progress: ${progress}%`);
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
