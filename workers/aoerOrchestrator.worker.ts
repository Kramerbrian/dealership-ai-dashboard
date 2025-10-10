/**
 * AOER Orchestrator Worker
 * Handles automated AOER computation and real-time updates
 */

import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.REDIS_URL!,
});

interface TenantRecomputeJob {
  tenantId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt: string;
  retryCount: number;
  maxRetries: number;
}

interface AOERResult {
  tenantId: string;
  aoerScore: number;
  visibilityRisk: number;
  lastUpdated: string;
  metrics: {
    avgAEO: number;
    avgGEO: number;
    avgUGC: number;
    volatility: number;
    dataPoints: number;
  };
}

class AOEROrchestrator {
  private isRunning = false;
  private workerId: string;
  private queueName = 'aoer-recompute-queue';
  private processingQueue = 'aoer-processing-queue';
  private completedQueue = 'aoer-completed-queue';

  constructor() {
    this.workerId = `aoer-worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[AOER] Worker initialized: ${this.workerId}`);
  }

  async start() {
    if (this.isRunning) {
      console.log('[AOER] Worker already running');
      return;
    }

    this.isRunning = true;
    console.log('[AOER] AOER Orchestrator worker active');

    // Start processing loop
    this.processQueue();
    
    // Start cron job if enabled
    if (process.env.RUN_CRON === 'true') {
      this.startCronJob();
    }
  }

  async stop() {
    this.isRunning = false;
    console.log('[AOER] Worker stopped');
  }

  private async processQueue() {
    while (this.isRunning) {
      try {
        // Check for jobs in the queue
        const job = await this.getNextJob();
        
        if (job) {
          await this.processJob(job);
        } else {
          // No jobs, wait a bit
          await this.sleep(5000);
        }
      } catch (error) {
        console.error('[AOER] Error in processing loop:', error);
        await this.sleep(10000); // Wait longer on error
      }
    }
  }

  private async getNextJob(): Promise<TenantRecomputeJob | null> {
    try {
      // Get job from Redis queue (FIFO)
      const jobData = await redis.lpop(this.queueName);
      
      if (jobData) {
        const job: TenantRecomputeJob = JSON.parse(jobData);
        console.log(`[AOER] Retrieved job for tenant: ${job.tenantId}`);
        return job;
      }
      
      return null;
    } catch (error) {
      console.error('[AOER] Error getting next job:', error);
      return null;
    }
  }

  private async processJob(job: TenantRecomputeJob) {
    const startTime = Date.now();
    console.log(`[AOER] Processing recompute for tenant: ${job.tenantId}`);

    try {
      // Move job to processing queue
      await redis.lpush(this.processingQueue, JSON.stringify({
        ...job,
        startedAt: new Date().toISOString(),
        workerId: this.workerId,
      }));

      // Compute AOER for the tenant
      const result = await this.computeAOER(job.tenantId);
      
      if (result) {
        // Update Supabase
        await this.updateAOERSummary(result);
        
        // Log metrics event
        await this.logMetricsEvent(job.tenantId, result);
        
        // Move to completed queue
        await redis.lpush(this.completedQueue, JSON.stringify({
          ...job,
          completedAt: new Date().toISOString(),
          result,
          processingTime: Date.now() - startTime,
        }));

        console.log(`[AOER] ✅ Completed recompute for tenant: ${job.tenantId} (${Date.now() - startTime}ms)`);
      } else {
        throw new Error('AOER computation failed');
      }

    } catch (error) {
      console.error(`[AOER] ❌ Failed recompute for tenant: ${job.tenantId}`, error);
      
      // Handle retry logic
      if (job.retryCount < job.maxRetries) {
        const retryJob = {
          ...job,
          retryCount: job.retryCount + 1,
          scheduledAt: new Date(Date.now() + Math.pow(2, job.retryCount) * 60000).toISOString(), // Exponential backoff
        };
        
        await redis.lpush(this.queueName, JSON.stringify(retryJob));
        console.log(`[AOER] Retrying job for tenant: ${job.tenantId} (attempt ${retryJob.retryCount})`);
      } else {
        console.error(`[AOER] Max retries exceeded for tenant: ${job.tenantId}`);
      }
    } finally {
      // Remove from processing queue
      await redis.lrem(this.processingQueue, 1, JSON.stringify(job));
    }
  }

  private async computeAOER(tenantId: string): Promise<AOERResult | null> {
    try {
      // Get tenant data from last 30 days
      const { data: signals, error } = await supabase
        .from('aiv_raw_signals')
        .select('*')
        .eq('dealer_id', tenantId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('[AOER] Error fetching signals:', error);
        return null;
      }

      if (!signals || signals.length === 0) {
        console.log(`[AOER] No signals found for tenant: ${tenantId}`);
        return null;
      }

      // Calculate metrics
      const aeoValues = signals.map(s => s.aeo || 0).filter(v => v > 0);
      const geoValues = signals.map(s => s.geo || 0).filter(v => v > 0);
      const ugcValues = signals.map(s => s.ugc || 0).filter(v => v > 0);

      const avgAEO = aeoValues.length > 0 ? aeoValues.reduce((a, b) => a + b, 0) / aeoValues.length : 0;
      const avgGEO = geoValues.length > 0 ? geoValues.reduce((a, b) => a + b, 0) / geoValues.length : 0;
      const avgUGC = ugcValues.length > 0 ? ugcValues.reduce((a, b) => a + b, 0) / ugcValues.length : 0;

      // Calculate volatility (standard deviation)
      const aeoVariance = aeoValues.length > 1 ? 
        aeoValues.reduce((sum, val) => sum + Math.pow(val - avgAEO, 2), 0) / (aeoValues.length - 1) : 0;
      const volatility = Math.sqrt(aeoVariance);

      // Calculate AOER score with volatility penalty
      const aoerScore = (avgAEO * 0.4 + avgGEO * 0.35 + avgUGC * 0.25) * 
        (1 - Math.min(volatility / 20, 0.3));

      // Calculate visibility risk
      const dataPoints = signals.length;
      const lastDate = new Date(signals[0].date);
      const daysSinceLastData = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      
      let visibilityRisk = 0.2; // Default low risk
      if (dataPoints < 5) visibilityRisk = 0.8;
      else if (daysSinceLastData > 7) visibilityRisk = 0.6;
      else if (volatility > 15) visibilityRisk = 0.4;

      return {
        tenantId,
        aoerScore: Math.round(aoerScore * 100) / 100,
        visibilityRisk: Math.round(visibilityRisk * 100) / 100,
        lastUpdated: new Date().toISOString(),
        metrics: {
          avgAEO: Math.round(avgAEO * 100) / 100,
          avgGEO: Math.round(avgGEO * 100) / 100,
          avgUGC: Math.round(avgUGC * 100) / 100,
          volatility: Math.round(volatility * 100) / 100,
          dataPoints,
        },
      };

    } catch (error) {
      console.error('[AOER] Error computing AOER:', error);
      return null;
    }
  }

  private async updateAOERSummary(result: AOERResult) {
    try {
      const { error } = await supabase
        .from('aoer_summary')
        .upsert({
          tenant_id: result.tenantId,
          aoer_score: result.aoerScore,
          visibility_risk: result.visibilityRisk,
          last_updated: result.lastUpdated,
          metrics: result.metrics,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'tenant_id',
        });

      if (error) {
        console.error('[AOER] Error updating AOER summary:', error);
        throw error;
      }

      console.log(`[AOER] Updated AOER summary for tenant: ${result.tenantId}`);
    } catch (error) {
      console.error('[AOER] Error in updateAOERSummary:', error);
      throw error;
    }
  }

  private async logMetricsEvent(tenantId: string, result: AOERResult) {
    try {
      const { error } = await supabase
        .from('metrics_events')
        .insert({
          tenant_id: tenantId,
          event_type: 'aoer_recompute',
          event_data: {
            aoer_score: result.aoerScore,
            visibility_risk: result.visibilityRisk,
            metrics: result.metrics,
          },
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[AOER] Error logging metrics event:', error);
        throw error;
      }

      console.log(`[AOER] Logged metrics event for tenant: ${tenantId}`);
    } catch (error) {
      console.error('[AOER] Error in logMetricsEvent:', error);
      throw error;
    }
  }

  private startCronJob() {
    console.log('[AOER] Starting cron job for automated recomputation');
    
    // Run every hour
    setInterval(async () => {
      try {
        console.log('[AOER] Cron job triggered - queuing all tenants for recompute');
        await this.queueAllTenantsForRecompute();
      } catch (error) {
        console.error('[AOER] Cron job error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  private async queueAllTenantsForRecompute() {
    try {
      // Get all active tenants
      const { data: tenants, error } = await supabase
        .from('aiv_raw_signals')
        .select('dealer_id')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .not('dealer_id', 'is', null);

      if (error) {
        console.error('[AOER] Error fetching tenants:', error);
        return;
      }

      const uniqueTenants = [...new Set(tenants?.map(t => t.dealer_id) || [])];
      
      for (const tenantId of uniqueTenants) {
        await this.enqueueTenantRecompute(tenantId, 'low');
      }

      console.log(`[AOER] Queued ${uniqueTenants.length} tenants for recompute`);
    } catch (error) {
      console.error('[AOER] Error in queueAllTenantsForRecompute:', error);
    }
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to enqueue a tenant for recomputation
  async enqueueTenantRecompute(tenantId: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    const job: TenantRecomputeJob = {
      tenantId,
      priority,
      scheduledAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    };

    try {
      await redis.lpush(this.queueName, JSON.stringify(job));
      console.log(`[AOER] Queued recompute for tenant: ${tenantId} (priority: ${priority})`);
      return true;
    } catch (error) {
      console.error(`[AOER] Error queuing tenant ${tenantId}:`, error);
      return false;
    }
  }

  // Get queue status
  async getQueueStatus() {
    try {
      const queueLength = await redis.llen(this.queueName);
      const processingLength = await redis.llen(this.processingQueue);
      const completedLength = await redis.llen(this.completedQueue);

      return {
        queue: queueLength,
        processing: processingLength,
        completed: completedLength,
        workerId: this.workerId,
        isRunning: this.isRunning,
      };
    } catch (error) {
      console.error('[AOER] Error getting queue status:', error);
      return null;
    }
  }
}

// Export for use in other modules
export const aoerOrchestrator = new AOEROrchestrator();

// Export the enqueue function for external use
export async function enqueueTenantRecompute(tenantId: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
  return aoerOrchestrator.enqueueTenantRecompute(tenantId, priority);
}

// Start the worker if this file is run directly
if (require.main === module) {
  console.log('[AOER] Starting AOER Orchestrator Worker...');
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('[AOER] Received SIGINT, shutting down gracefully...');
    await aoerOrchestrator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('[AOER] Received SIGTERM, shutting down gracefully...');
    await aoerOrchestrator.stop();
    process.exit(0);
  });

  // Start the worker
  aoerOrchestrator.start().catch(error => {
    console.error('[AOER] Failed to start worker:', error);
    process.exit(1);
  });
}
