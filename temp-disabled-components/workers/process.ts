/**
 * DealershipAI Site Intelligence - Process Worker
 * 
 * Processes crawled page data and calculates AIV/EEAT scores
 */

import { Worker } from 'bullmq';
import { db, pages, aivScores, eeatScores } from '../src/lib/db';
import { AivCalculator, EeatCalculator, saveAivScore, saveEeatScore } from '../src/lib/site-intelligence-calculators';
import { RevenueAtRiskCalculator } from '../src/lib/revenue-at-risk-calculator';
import { addAivCalculateJob, addEeatCalculateJob, addRevenueCalculateJob } from '../src/lib/queue';

export interface ProcessJobData {
  tenantId: string;
  pageId: string;
  url: string;
  pageData: any;
  jobType: 'aiv' | 'eeat' | 'revenue' | 'all';
}

export class ProcessWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('process-queue', this.processJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      concurrency: 5,
      removeOnComplete: 100,
      removeOnFail: 50
    });

    this.worker.on('completed', (job) => {
      console.log(`Process job completed: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Process job failed: ${job?.id}`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Process worker error:', err);
    });
  }

  private async processJob(job: any): Promise<any> {
    const { tenantId, pageId, url, pageData, jobType } = job.data as ProcessJobData;
    
    console.log(`Processing page ${pageId} for tenant ${tenantId} (${jobType})`);
    
    try {
      const results: any = {};

      // Process based on job type
      switch (jobType) {
        case 'aiv':
          results.aiv = await this.processAivCalculation(tenantId, pageId, url, pageData);
          break;
          
        case 'eeat':
          results.eeat = await this.processEeatCalculation(tenantId, pageId, url, pageData);
          break;
          
        case 'revenue':
          results.revenue = await this.processRevenueCalculation(tenantId, pageId, url, pageData);
          break;
          
        case 'all':
          // Process all calculations
          results.aiv = await this.processAivCalculation(tenantId, pageId, url, pageData);
          results.eeat = await this.processEeatCalculation(tenantId, pageId, url, pageData);
          results.revenue = await this.processRevenueCalculation(tenantId, pageId, url, pageData);
          break;
          
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }

      console.log(`Successfully processed page ${pageId}`);
      return results;

    } catch (error) {
      console.error(`Error processing page ${pageId}:`, error);
      throw error;
    }
  }

  private async processAivCalculation(
    tenantId: string, 
    pageId: string, 
    url: string, 
    pageData: any
  ): Promise<any> {
    try {
      // Calculate AIV score
      const aivResult = await AivCalculator.calculateAiv(tenantId, pageId, pageData);
      
      // Save to database
      await saveAivScore(tenantId, pageId, url, aivResult);
      
      console.log(`AIV calculation completed for ${url}: ${aivResult.overallScore}`);
      return aivResult;
      
    } catch (error) {
      console.error(`AIV calculation failed for ${url}:`, error);
      throw error;
    }
  }

  private async processEeatCalculation(
    tenantId: string, 
    pageId: string, 
    url: string, 
    pageData: any
  ): Promise<any> {
    try {
      // Calculate EEAT score
      const eeatResult = await EeatCalculator.calculateEeat(tenantId, pageId, pageData);
      
      // Save to database
      await saveEeatScore(tenantId, pageId, url, eeatResult);
      
      console.log(`EEAT calculation completed for ${url}: ${eeatResult.overallScore}`);
      return eeatResult;
      
    } catch (error) {
      console.error(`EEAT calculation failed for ${url}:`, error);
      throw error;
    }
  }

  private async processRevenueCalculation(
    tenantId: string, 
    pageId: string, 
    url: string, 
    pageData: any
  ): Promise<any> {
    try {
      // Calculate revenue at risk
      const revenueResult = await RevenueAtRiskCalculator.calculateRevenueAtRisk(
        tenantId,
        pageId,
        url,
        pageData
      );
      
      // Save to database
      await RevenueAtRiskCalculator.saveRevenueAtRisk(
        tenantId,
        pageId,
        url,
        revenueResult,
        {
          monthlyTraffic: 1000, // This would come from analytics
          conversionRate: 0.02,
          averageOrderValue: 25000
        }
      );
      
      console.log(`Revenue calculation completed for ${url}: $${revenueResult.revenueAtRisk}`);
      return revenueResult;
      
    } catch (error) {
      console.error(`Revenue calculation failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    console.log('Process worker started');
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    await this.worker.close();
    console.log('Process worker stopped');
  }
}

// Export worker instance
export const processWorker = new ProcessWorker();

// Start worker if this file is run directly
if (require.main === module) {
  processWorker.start().catch(console.error);
}
