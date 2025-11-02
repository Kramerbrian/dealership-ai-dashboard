/**
 * BullMQ Setup for DTRI System
 *
 * Handles automated nightly ADA re-analysis jobs
 * Manages queue processing and job scheduling
 */

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { createClient } from '@supabase/supabase-js';

// Build-time guard: Skip initialization during build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    process.env.NODE_ENV === 'test';

// Lazy initialization functions
let redis: Redis | null = null;
let supabase: ReturnType<typeof createClient> | null = null;
let dtriAnalysisQueueInstance: Queue | null = null;
let trustMetricsQueueInstance: Queue | null = null;
let elasticityAnalysisQueueInstance: Queue | null = null;

function getRedis(): Redis {
  if (isBuildTime) {
    throw new Error('Cannot initialize Redis during build time');
  }
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redis;
}

function getSupabase() {
  if (isBuildTime) {
    throw new Error('Cannot initialize Supabase during build time');
  }
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Lazy queue getters
export function getDtriAnalysisQueue(): Queue {
  if (isBuildTime) {
    throw new Error('Cannot initialize queues during build time');
  }
  if (!dtriAnalysisQueueInstance) {
    dtriAnalysisQueueInstance = new Queue('dtri-analysis', {
      connection: getRedis(),
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }
  return dtriAnalysisQueueInstance;
}

export function getTrustMetricsQueue(): Queue {
  if (isBuildTime) {
    throw new Error('Cannot initialize queues during build time');
  }
  if (!trustMetricsQueueInstance) {
    trustMetricsQueueInstance = new Queue('trust-metrics', {
      connection: getRedis(),
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }
  return trustMetricsQueueInstance;
}

export function getElasticityAnalysisQueue(): Queue {
  if (isBuildTime) {
    throw new Error('Cannot initialize queues during build time');
  }
  if (!elasticityAnalysisQueueInstance) {
    elasticityAnalysisQueueInstance = new Queue('elasticity-analysis', {
      connection: getRedis(),
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }
  return elasticityAnalysisQueueInstance;
}

// Export for backward compatibility (deprecated - use getters instead)
export const dtriAnalysisQueue = {
  get instance() { return getDtriAnalysisQueue(); }
};
export const trustMetricsQueue = {
  get instance() { return getTrustMetricsQueue(); }
};
export const elasticityAnalysisQueue = {
  get instance() { return getElasticityAnalysisQueue(); }
};

// Job types
export interface DTRIAnalysisJob {
  dealerId: string;
  tenantId: string;
  analysisType: 'comprehensive' | 'trust' | 'elasticity' | 'performance';
  priority: 'high' | 'medium' | 'low';
  scheduledFor?: Date;
}

export interface TrustMetricsJob {
  dealerId: string;
  tenantId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeBreakdown: boolean;
}

export interface ElasticityAnalysisJob {
  dealerId: string;
  tenantId: string;
  timePeriod: 'weekly' | 'monthly' | 'quarterly';
  includeProjections: boolean;
}

// Job processors
export class DTRIJobProcessor {
  private adaEngineUrl: string;

  constructor() {
    this.adaEngineUrl = process.env.ADA_ENGINE_URL || 'https://dealershipai-dtri-ada.fly.dev';
  }

  async processDTRIAnalysis(job: Job<DTRIAnalysisJob>) {
    const { dealerId, tenantId, analysisType, priority } = job.data;

    console.log(`🔄 Processing DTRI analysis for dealer ${dealerId} (${analysisType})`);

    try {
      const supabase = getSupabase();
      // Fetch dealer data from Supabase
      const { data: dealerData, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .eq('tenant_id', tenantId)
        .single();

      if (error || !dealerData) {
        throw new Error(`Dealer not found: ${dealerId}`);
      }

      // Fetch related metrics data
      const { data: metricsData } = await supabase
        .from('scores')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('created_at', { ascending: false })
        .limit(30);

      // Prepare analysis payload
      const analysisPayload = {
        dealerData: [dealerData],
        benchmarks: await this.getBenchmarks(tenantId),
        analysisType,
        vertical: 'automotive',
        metadata: {
          jobId: job.id,
          priority,
          scheduledAt: job.timestamp
        }
      };

      // Call ADA engine
      const response = await fetch(`${this.adaEngineUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADA_ENGINE_TOKEN || ''}`
        },
        body: JSON.stringify(analysisPayload),
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });

      if (!response.ok) {
        throw new Error(`ADA engine error: ${response.status}`);
      }

      const results = await response.json();

      // Store results in Supabase
      await this.storeAnalysisResults(dealerId, tenantId, analysisType, results);

      console.log(`✅ DTRI analysis completed for dealer ${dealerId}`);
      
      return {
        success: true,
        dealerId,
        analysisType,
        results: results.results,
        processingTime: results.metadata?.processing_time_ms || 0
      };

    } catch (error) {
      console.error(`❌ DTRI analysis failed for dealer ${dealerId}:`, error);
      throw error;
    }
  }

  async processTrustMetrics(job: Job<TrustMetricsJob>) {
    const { dealerId, tenantId, timeRange, includeBreakdown } = job.data;

    console.log(`🔍 Processing trust metrics for dealer ${dealerId} (${timeRange})`);

    try {
      const supabase = getSupabase();
      // Fetch historical trust data
      const { data: trustData } = await supabase
        .from('scores')
        .select('trust_score, created_at, seo_score, aeo_score, geo_score')
        .eq('dealer_id', dealerId)
        .gte('created_at', this.getDateRange(timeRange))
        .order('created_at', { ascending: true });

      if (!trustData || trustData.length === 0) {
        throw new Error(`No trust data found for dealer ${dealerId}`);
      }

      // Prepare analysis payload
      const analysisPayload = {
        dealerData: trustData.map(record => ({
          trust_score: record.trust_score,
          seo_score: record.seo_score,
          aeo_score: record.aeo_score,
          geo_score: record.geo_score,
          timestamp: record.created_at
        })),
        timeRange,
        includeBreakdown
      };

      // Call ADA engine for trust metrics
      const response = await fetch(`${this.adaEngineUrl}/analyze/trust-metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisPayload),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Trust metrics analysis error: ${response.status}`);
      }

      const results = await response.json();

      // Store trust metrics results
      await this.storeTrustMetricsResults(dealerId, tenantId, results);

      console.log(`✅ Trust metrics analysis completed for dealer ${dealerId}`);
      
      return {
        success: true,
        dealerId,
        timeRange,
        trustMetrics: results.trust_metrics
      };

    } catch (error) {
      console.error(`❌ Trust metrics analysis failed for dealer ${dealerId}:`, error);
      throw error;
    }
  }

  async processElasticityAnalysis(job: Job<ElasticityAnalysisJob>) {
    const { dealerId, tenantId, timePeriod, includeProjections } = job.data;

    console.log(`📈 Processing elasticity analysis for dealer ${dealerId} (${timePeriod})`);

    try {
      const supabase = getSupabase();
      // Fetch revenue and trust data
      const { data: revenueData } = await supabase
        .from('scores')
        .select('trust_score, revenue, created_at')
        .eq('dealer_id', dealerId)
        .gte('created_at', this.getDateRange('1y'))
        .order('created_at', { ascending: true });

      if (!revenueData || revenueData.length === 0) {
        throw new Error(`No revenue data found for dealer ${dealerId}`);
      }

      // Prepare analysis payload
      const analysisPayload = {
        dealerData: revenueData.map(record => ({
          trust_score: record.trust_score,
          revenue: record.revenue,
          timestamp: record.created_at
        })),
        timePeriod,
        includeProjections
      };

      // Call ADA engine for elasticity analysis
      const response = await fetch(`${this.adaEngineUrl}/analyze/elasticity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisPayload),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Elasticity analysis error: ${response.status}`);
      }

      const results = await response.json();

      // Store elasticity results
      await this.storeElasticityResults(dealerId, tenantId, results);

      console.log(`✅ Elasticity analysis completed for dealer ${dealerId}`);
      
      return {
        success: true,
        dealerId,
        timePeriod,
        elasticityAnalysis: results.elasticity_analysis
      };

    } catch (error) {
      console.error(`❌ Elasticity analysis failed for dealer ${dealerId}:`, error);
      throw error;
    }
  }

  private async getBenchmarks(tenantId: string) {
    const supabase = getSupabase();
    // Fetch industry benchmarks for the tenant
    const { data: benchmarks } = await supabase
      .from('scores')
      .select('trust_score, revenue, seo_score, aeo_score, geo_score')
      .eq('tenant_id', tenantId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!benchmarks || benchmarks.length === 0) {
      return {
        industry_average: {
          trust_score: 75,
          revenue: 250000,
          seo_score: 70,
          aeo_score: 65,
          geo_score: 80
        }
      };
    }

    return {
      industry_average: {
        trust_score: benchmarks.reduce((sum, b) => sum + (b.trust_score || 0), 0) / benchmarks.length,
        revenue: benchmarks.reduce((sum, b) => sum + (b.revenue || 0), 0) / benchmarks.length,
        seo_score: benchmarks.reduce((sum, b) => sum + (b.seo_score || 0), 0) / benchmarks.length,
        aeo_score: benchmarks.reduce((sum, b) => sum + (b.aeo_score || 0), 0) / benchmarks.length,
        geo_score: benchmarks.reduce((sum, b) => sum + (b.geo_score || 0), 0) / benchmarks.length
      }
    };
  }

  private getDateRange(timeRange: string): string {
    const now = new Date();
    const ranges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    
    return ranges[timeRange as keyof typeof ranges]?.toISOString() || ranges['30d'].toISOString();
  }

  private async storeAnalysisResults(dealerId: string, tenantId: string, analysisType: string, results: any) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('dtri_analysis_results')
      .insert({
        dealer_id: dealerId,
        tenant_id: tenantId,
        analysis_type: analysisType,
        results: results.results,
        confidence_score: results.results?.dtri_metrics?.confidence_score || 0,
        processing_time_ms: results.metadata?.processing_time_ms || 0,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store analysis results:', error);
    }
  }

  private async storeTrustMetricsResults(dealerId: string, tenantId: string, results: any) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('trust_metrics_results')
      .insert({
        dealer_id: dealerId,
        tenant_id: tenantId,
        trust_metrics: results.trust_metrics,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store trust metrics results:', error);
    }
  }

  private async storeElasticityResults(dealerId: string, tenantId: string, results: any) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('elasticity_results')
      .insert({
        dealer_id: dealerId,
        tenant_id: tenantId,
        elasticity_analysis: results.elasticity_analysis,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store elasticity results:', error);
    }
  }
}

// Initialize job processor
const jobProcessor = new DTRIJobProcessor();

// Lazy worker getters
let dtriAnalysisWorkerInstance: Worker | null = null;
let trustMetricsWorkerInstance: Worker | null = null;
let elasticityAnalysisWorkerInstance: Worker | null = null;

export function getDtriAnalysisWorker(): Worker {
  if (isBuildTime) {
    throw new Error('Cannot initialize workers during build time');
  }
  if (!dtriAnalysisWorkerInstance) {
    dtriAnalysisWorkerInstance = new Worker(
      'dtri-analysis',
      async (job) => jobProcessor.processDTRIAnalysis(job),
      { connection: getRedis() }
    );
  }
  return dtriAnalysisWorkerInstance;
}

export function getTrustMetricsWorker(): Worker {
  if (isBuildTime) {
    throw new Error('Cannot initialize workers during build time');
  }
  if (!trustMetricsWorkerInstance) {
    trustMetricsWorkerInstance = new Worker(
      'trust-metrics',
      async (job) => jobProcessor.processTrustMetrics(job),
      { connection: getRedis() }
    );
  }
  return trustMetricsWorkerInstance;
}

export function getElasticityAnalysisWorker(): Worker {
  if (isBuildTime) {
    throw new Error('Cannot initialize workers during build time');
  }
  if (!elasticityAnalysisWorkerInstance) {
    elasticityAnalysisWorkerInstance = new Worker(
      'elasticity-analysis',
      async (job) => jobProcessor.processElasticityAnalysis(job),
      { connection: getRedis() }
    );
  }
  return elasticityAnalysisWorkerInstance;
}

// Export for backward compatibility
export const dtriAnalysisWorker = {
  get instance() { return getDtriAnalysisWorker(); }
};
export const trustMetricsWorker = {
  get instance() { return getTrustMetricsWorker(); }
};
export const elasticityAnalysisWorker = {
  get instance() { return getElasticityAnalysisWorker(); }
};

// Job scheduling functions
export async function scheduleNightlyDTRIAnalysis() {
  console.log('🌙 Scheduling nightly DTRI analysis for all dealers');

  try {
    const supabase = getSupabase();
    // Fetch all active dealers
    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('id, tenant_id, tier')
      .eq('active', true);

    if (error) {
      throw new Error(`Failed to fetch dealers: ${error.message}`);
    }

    if (!dealers || dealers.length === 0) {
      console.log('No active dealers found for analysis');
      return;
    }

    // Schedule jobs for each dealer
    const jobs = dealers.map(dealer => ({
      name: `nightly-dtri-${dealer.id}`,
      data: {
        dealerId: dealer.id,
        tenantId: dealer.tenant_id,
        analysisType: 'comprehensive' as const,
        priority: dealer.tier === 'enterprise' ? 'high' as const : 'medium' as const
      },
      opts: {
        delay: Math.random() * 3600000, // Random delay up to 1 hour to spread load
        jobId: `nightly-dtri-${dealer.id}-${Date.now()}`
      }
    }));

    await getDtriAnalysisQueue().addBulk(jobs);
    
    console.log(`✅ Scheduled ${jobs.length} nightly DTRI analysis jobs`);
    
    return {
      success: true,
      jobsScheduled: jobs.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Failed to schedule nightly DTRI analysis:', error);
    throw error;
  }
}

export async function scheduleTrustMetricsUpdate(dealerIds: string[], timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  console.log(`🔍 Scheduling trust metrics update for ${dealerIds.length} dealers`);
  
  try {
    const jobs = dealerIds.map(dealerId => ({
      name: `trust-metrics-${dealerId}`,
      data: {
        dealerId,
        tenantId: 'default', // You might want to fetch this from the dealer record
        timeRange,
        includeBreakdown: true
      },
      opts: {
        jobId: `trust-metrics-${dealerId}-${Date.now()}`
      }
    }));

    await getTrustMetricsQueue().addBulk(jobs);
    
    console.log(`✅ Scheduled ${jobs.length} trust metrics jobs`);
    
    return {
      success: true,
      jobsScheduled: jobs.length,
      timeRange,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Failed to schedule trust metrics update:', error);
    throw error;
  }
}

export async function scheduleElasticityAnalysis(dealerIds: string[], timePeriod: 'weekly' | 'monthly' | 'quarterly' = 'monthly') {
  console.log(`📈 Scheduling elasticity analysis for ${dealerIds.length} dealers`);
  
  try {
    const jobs = dealerIds.map(dealerId => ({
      name: `elasticity-${dealerId}`,
      data: {
        dealerId,
        tenantId: 'default', // You might want to fetch this from the dealer record
        timePeriod,
        includeProjections: true
      },
      opts: {
        jobId: `elasticity-${dealerId}-${Date.now()}`
      }
    }));

    await getElasticityAnalysisQueue().addBulk(jobs);
    
    console.log(`✅ Scheduled ${jobs.length} elasticity analysis jobs`);
    
    return {
      success: true,
      jobsScheduled: jobs.length,
      timePeriod,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Failed to schedule elasticity analysis:', error);
    throw error;
  }
}

// Queue monitoring
export async function getQueueStats() {
  try {
    const [dtriStats, trustStats, elasticityStats] = await Promise.all([
      getDtriAnalysisQueue().getJobCounts(),
      getTrustMetricsQueue().getJobCounts(),
      getElasticityAnalysisQueue().getJobCounts()
    ]);

    return {
      dtri_analysis: dtriStats,
      trust_metrics: trustStats,
      elasticity_analysis: elasticityStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    throw error;
  }
}

// Cleanup function
export async function cleanup() {
  const closePromises = [];

  if (dtriAnalysisQueueInstance) closePromises.push(dtriAnalysisQueueInstance.close());
  if (trustMetricsQueueInstance) closePromises.push(trustMetricsQueueInstance.close());
  if (elasticityAnalysisQueueInstance) closePromises.push(elasticityAnalysisQueueInstance.close());
  if (dtriAnalysisWorkerInstance) closePromises.push(dtriAnalysisWorkerInstance.close());
  if (trustMetricsWorkerInstance) closePromises.push(trustMetricsWorkerInstance.close());
  if (elasticityAnalysisWorkerInstance) closePromises.push(elasticityAnalysisWorkerInstance.close());
  if (redis) closePromises.push(redis.disconnect());

  await Promise.all(closePromises);
}
