/**
 * AOER (AI Optimization Engine & Reporting) Orchestrator
 * 
 * Advanced orchestration system for AI optimization workflows:
 * - Task scheduling and distribution
 * - Worker management and monitoring
 * - Job queuing and prioritization
 * - Performance optimization
 * - Error handling and recovery
 */

import { supabaseAdmin } from './supabase';

export interface AOERJob {
  id: string;
  type: 'data_collection' | 'analysis' | 'optimization' | 'reporting' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: any;
  assigned_worker?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  estimated_duration: number; // seconds
  actual_duration?: number;
  dependencies: string[];
  tags: string[];
}

export interface AOERWorker {
  id: string;
  name: string;
  type: 'data_processor' | 'ai_analyzer' | 'optimizer' | 'reporter' | 'maintenance';
  status: 'idle' | 'busy' | 'offline' | 'error';
  capabilities: string[];
  current_job?: string;
  last_heartbeat: string;
  performance_metrics: {
    jobs_completed: number;
    average_duration: number;
    success_rate: number;
    cpu_usage: number;
    memory_usage: number;
  };
  created_at: string;
}

export interface AOERQueue {
  id: string;
  name: string;
  priority: number;
  job_types: string[];
  max_concurrent_jobs: number;
  current_jobs: number;
  pending_jobs: number;
  is_active: boolean;
}

export interface AOERMetrics {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  pending_jobs: number;
  running_jobs: number;
  average_job_duration: number;
  system_throughput: number;
  worker_utilization: number;
  queue_health: Record<string, number>;
  error_rate: number;
}

export class AOEROrchestrator {
  private supabase: any;
  private workers: Map<string, AOERWorker> = new Map();
  private queues: Map<string, AOERQueue> = new Map();
  private jobs: Map<string, AOERJob> = new Map();
  private isRunning: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = supabaseAdmin;
    this.initializeQueues();
  }

  /**
   * Initialize the orchestrator
   */
  async initialize(): Promise<void> {
    try {
      // Load existing workers and jobs
      await this.loadWorkers();
      await this.loadPendingJobs();
      
      // Start the orchestrator
      this.start();
      
      console.log('AOER Orchestrator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AOER Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Start the orchestrator
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Start heartbeat monitoring
    this.heartbeatInterval = setInterval(() => {
      this.monitorWorkers();
    }, 30000); // Every 30 seconds

    // Start job scheduler
    this.schedulerInterval = setInterval(() => {
      this.scheduleJobs();
    }, 10000); // Every 10 seconds

    console.log('AOER Orchestrator started');
  }

  /**
   * Stop the orchestrator
   */
  stop(): void {
    this.isRunning = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    console.log('AOER Orchestrator stopped');
  }

  /**
   * Register a worker
   */
  async registerWorker(worker: Omit<AOERWorker, 'id' | 'created_at'>): Promise<AOERWorker> {
    const newWorker: AOERWorker = {
      ...worker,
      id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    this.workers.set(newWorker.id, newWorker);

    try {
      if (this.supabase) {
        await this.supabase
          .from('aoer_workers')
          .insert(newWorker);
      }
    } catch (error) {
      console.error('Error registering worker:', error);
    }

    console.log(`Worker ${newWorker.name} registered with ID: ${newWorker.id}`);
    return newWorker;
  }

  /**
   * Submit a job to the orchestrator
   */
  async submitJob(job: Omit<AOERJob, 'id' | 'created_at' | 'retry_count'>): Promise<AOERJob> {
    const newJob: AOERJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    this.jobs.set(newJob.id, newJob);

    try {
      if (this.supabase) {
        await this.supabase
          .from('aoer_jobs')
          .insert(newJob);
      }
    } catch (error) {
      console.error('Error submitting job:', error);
    }

    console.log(`Job ${newJob.type} submitted with ID: ${newJob.id}`);
    return newJob;
  }

  /**
   * Schedule jobs to available workers
   */
  private async scheduleJobs(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Get pending jobs sorted by priority
      const pendingJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'pending')
        .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

      // Get available workers
      const availableWorkers = Array.from(this.workers.values())
        .filter(worker => worker.status === 'idle');

      // Assign jobs to workers
      for (const job of pendingJobs) {
        const suitableWorker = this.findSuitableWorker(job, availableWorkers);
        
        if (suitableWorker) {
          await this.assignJobToWorker(job, suitableWorker);
          availableWorkers.splice(availableWorkers.indexOf(suitableWorker), 1);
        }
      }
    } catch (error) {
      console.error('Error scheduling jobs:', error);
    }
  }

  /**
   * Find a suitable worker for a job
   */
  private findSuitableWorker(job: AOERJob, availableWorkers: AOERWorker[]): AOERWorker | null {
    // Filter workers by job type capability
    const suitableWorkers = availableWorkers.filter(worker => {
      const workerType = worker.type;
      const jobType = job.type;

      // Map job types to worker types
      const typeMapping: Record<string, string[]> = {
        'data_collection': ['data_processor'],
        'analysis': ['ai_analyzer', 'data_processor'],
        'optimization': ['optimizer', 'ai_analyzer'],
        'reporting': ['reporter', 'data_processor'],
        'maintenance': ['maintenance'],
      };

      return typeMapping[jobType]?.includes(workerType) || false;
    });

    if (suitableWorkers.length === 0) return null;

    // Select worker with best performance metrics
    return suitableWorkers.reduce((best, current) => {
      const bestScore = this.calculateWorkerScore(best);
      const currentScore = this.calculateWorkerScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate worker performance score
   */
  private calculateWorkerScore(worker: AOERWorker): number {
    const metrics = worker.performance_metrics;
    const successRate = metrics.success_rate;
    const avgDuration = metrics.average_duration;
    const jobsCompleted = metrics.jobs_completed;

    // Higher score is better
    return (successRate * 0.4) + ((100 - avgDuration) * 0.3) + (jobsCompleted * 0.3);
  }

  /**
   * Assign job to worker
   */
  private async assignJobToWorker(job: AOERJob, worker: AOERWorker): Promise<void> {
    try {
      // Update job status
      job.status = 'running';
      job.assigned_worker = worker.id;
      job.started_at = new Date().toISOString();

      // Update worker status
      worker.status = 'busy';
      worker.current_job = job.id;
      worker.last_heartbeat = new Date().toISOString();

      // Update in database
      if (this.supabase) {
        await this.supabase
          .from('aoer_jobs')
          .update({
            status: job.status,
            assigned_worker: job.assigned_worker,
            started_at: job.started_at,
          })
          .eq('id', job.id);

        await this.supabase
          .from('aoer_workers')
          .update({
            status: worker.status,
            current_job: worker.current_job,
            last_heartbeat: worker.last_heartbeat,
          })
          .eq('id', worker.id);
      }

      console.log(`Job ${job.id} assigned to worker ${worker.name}`);
    } catch (error) {
      console.error('Error assigning job to worker:', error);
    }
  }

  /**
   * Complete a job
   */
  async completeJob(jobId: string, result?: any, error?: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const worker = job.assigned_worker ? this.workers.get(job.assigned_worker) : null;

    try {
      if (error) {
        // Job failed
        job.status = 'failed';
        job.error_message = error;
        job.retry_count++;

        // Check if we should retry
        if (job.retry_count < job.max_retries) {
          job.status = 'pending';
          job.assigned_worker = undefined;
          job.started_at = undefined;
          console.log(`Job ${jobId} failed, retrying (${job.retry_count}/${job.max_retries})`);
        } else {
          console.log(`Job ${jobId} failed permanently after ${job.max_retries} retries`);
        }
      } else {
        // Job completed successfully
        job.status = 'completed';
        job.completed_at = new Date().toISOString();
        job.actual_duration = Math.floor(
          (new Date(job.completed_at).getTime() - new Date(job.started_at!).getTime()) / 1000
        );

        // Update worker performance metrics
        if (worker) {
          worker.performance_metrics.jobs_completed++;
          const totalDuration = worker.performance_metrics.average_duration * (worker.performance_metrics.jobs_completed - 1) + job.actual_duration;
          worker.performance_metrics.average_duration = totalDuration / worker.performance_metrics.jobs_completed;
          worker.performance_metrics.success_rate = (worker.performance_metrics.success_rate * (worker.performance_metrics.jobs_completed - 1) + 100) / worker.performance_metrics.jobs_completed;
        }

        console.log(`Job ${jobId} completed successfully in ${job.actual_duration}s`);
      }

      // Free up worker
      if (worker) {
        worker.status = 'idle';
        worker.current_job = undefined;
        worker.last_heartbeat = new Date().toISOString();
      }

      // Update in database
      if (this.supabase) {
        await this.supabase
          .from('aoer_jobs')
          .update({
            status: job.status,
            completed_at: job.completed_at,
            actual_duration: job.actual_duration,
            error_message: job.error_message,
            retry_count: job.retry_count,
          })
          .eq('id', jobId);

        if (worker) {
          await this.supabase
            .from('aoer_workers')
            .update({
              status: worker.status,
              current_job: worker.current_job,
              last_heartbeat: worker.last_heartbeat,
              performance_metrics: worker.performance_metrics,
            })
            .eq('id', worker.id);
        }
      }
    } catch (error) {
      console.error('Error completing job:', error);
    }
  }

  /**
   * Monitor worker health
   */
  private async monitorWorkers(): Promise<void> {
    const now = new Date();
    const timeoutThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [workerId, worker] of this.workers) {
      const lastHeartbeat = new Date(worker.last_heartbeat);
      const timeSinceHeartbeat = now.getTime() - lastHeartbeat.getTime();

      if (timeSinceHeartbeat > timeoutThreshold && worker.status !== 'offline') {
        console.warn(`Worker ${worker.name} appears to be unresponsive`);
        
        // Mark worker as offline
        worker.status = 'offline';
        
        // Reassign current job if any
        if (worker.current_job) {
          const job = this.jobs.get(worker.current_job);
          if (job) {
            job.status = 'pending';
            job.assigned_worker = undefined;
            job.started_at = undefined;
            console.log(`Reassigning job ${job.id} from offline worker`);
          }
        }

        // Update in database
        if (this.supabase) {
          await this.supabase
            .from('aoer_workers')
            .update({ status: worker.status })
            .eq('id', workerId);
        }
      }
    }
  }

  /**
   * Get orchestrator metrics
   */
  async getMetrics(): Promise<AOERMetrics> {
    const allJobs = Array.from(this.jobs.values());
    const allWorkers = Array.from(this.workers.values());

    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter(job => job.status === 'completed').length;
    const failedJobs = allJobs.filter(job => job.status === 'failed').length;
    const pendingJobs = allJobs.filter(job => job.status === 'pending').length;
    const runningJobs = allJobs.filter(job => job.status === 'running').length;

    const completedJobsWithDuration = allJobs.filter(job => job.actual_duration);
    const averageJobDuration = completedJobsWithDuration.length > 0
      ? completedJobsWithDuration.reduce((sum, job) => sum + job.actual_duration!, 0) / completedJobsWithDuration.length
      : 0;

    const systemThroughput = completedJobs > 0 ? completedJobs / (totalJobs / 100) : 0;
    const workerUtilization = allWorkers.length > 0
      ? (allWorkers.filter(w => w.status === 'busy').length / allWorkers.length) * 100
      : 0;

    const errorRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0;

    const queueHealth: Record<string, number> = {};
    for (const [queueId, queue] of this.queues) {
      queueHealth[queueId] = queue.pending_jobs / (queue.max_concurrent_jobs * 2) * 100;
    }

    return {
      total_jobs: totalJobs,
      completed_jobs: completedJobs,
      failed_jobs: failedJobs,
      pending_jobs: pendingJobs,
      running_jobs: runningJobs,
      average_job_duration: averageJobDuration,
      system_throughput: systemThroughput,
      worker_utilization: workerUtilization,
      queue_health: queueHealth,
      error_rate: errorRate,
    };
  }

  /**
   * Get priority value for sorting
   */
  private getPriorityValue(priority: string): number {
    const priorityMap = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
    };
    return priorityMap[priority as keyof typeof priorityMap] || 1;
  }

  /**
   * Initialize default queues
   */
  private initializeQueues(): void {
    const defaultQueues: AOERQueue[] = [
      {
        id: 'high-priority',
        name: 'High Priority Queue',
        priority: 1,
        job_types: ['analysis', 'optimization'],
        max_concurrent_jobs: 5,
        current_jobs: 0,
        pending_jobs: 0,
        is_active: true,
      },
      {
        id: 'data-processing',
        name: 'Data Processing Queue',
        priority: 2,
        job_types: ['data_collection', 'analysis'],
        max_concurrent_jobs: 10,
        current_jobs: 0,
        pending_jobs: 0,
        is_active: true,
      },
      {
        id: 'reporting',
        name: 'Reporting Queue',
        priority: 3,
        job_types: ['reporting'],
        max_concurrent_jobs: 3,
        current_jobs: 0,
        pending_jobs: 0,
        is_active: true,
      },
      {
        id: 'maintenance',
        name: 'Maintenance Queue',
        priority: 4,
        job_types: ['maintenance'],
        max_concurrent_jobs: 2,
        current_jobs: 0,
        pending_jobs: 0,
        is_active: true,
      },
    ];

    defaultQueues.forEach(queue => {
      this.queues.set(queue.id, queue);
    });
  }

  /**
   * Load workers from database
   */
  private async loadWorkers(): Promise<void> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('aoer_workers')
          .select('*');

        data?.forEach((worker: AOERWorker) => {
          this.workers.set(worker.id, worker);
        });
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  }

  /**
   * Load pending jobs from database
   */
  private async loadPendingJobs(): Promise<void> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('aoer_jobs')
          .select('*')
          .in('status', ['pending', 'running']);

        data?.forEach((job: AOERJob) => {
          this.jobs.set(job.id, job);
        });
      }
    } catch (error) {
      console.error('Error loading pending jobs:', error);
    }
  }

  /**
   * Get worker by ID
   */
  getWorker(workerId: string): AOERWorker | undefined {
    return this.workers.get(workerId);
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): AOERJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all workers
   */
  getAllWorkers(): AOERWorker[] {
    return Array.from(this.workers.values());
  }

  /**
   * Get all jobs
   */
  getAllJobs(): AOERJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed') return false;

    try {
      job.status = 'cancelled';
      job.completed_at = new Date().toISOString();

      // Free up worker if assigned
      if (job.assigned_worker) {
        const worker = this.workers.get(job.assigned_worker);
        if (worker) {
          worker.status = 'idle';
          worker.current_job = undefined;
        }
      }

      // Update in database
      if (this.supabase) {
        await this.supabase
          .from('aoer_jobs')
          .update({
            status: job.status,
            completed_at: job.completed_at,
          })
          .eq('id', jobId);
      }

      console.log(`Job ${jobId} cancelled`);
      return true;
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aoerOrchestrator = new AOEROrchestrator();
