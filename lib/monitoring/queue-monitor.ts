/**
 * Queue Monitoring Service
 * 
 * Monitors BullMQ queue health and statistics
 */

import { getQueueStats } from '@/lib/job-queue';
import { sendSlackAlert } from '@/lib/alerts/slack';

export interface QueueHealth {
  healthy: boolean;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  issues: string[];
}

export async function checkQueueHealth(): Promise<QueueHealth> {
  const stats = await getQueueStats();
  const issues: string[] = [];

  if (!stats) {
    return {
      healthy: false,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      issues: ['Queue not configured (Redis missing)'],
    };
  }

  // Check for issues
  if (stats.failed > 10) {
    issues.push(`High failure count: ${stats.failed} failed jobs`);
  }

  if (stats.waiting > 100) {
    issues.push(`Queue backlog: ${stats.waiting} waiting jobs`);
  }

  if (stats.active > 20) {
    issues.push(`High concurrency: ${stats.active} active jobs`);
  }

  return {
    healthy: issues.length === 0,
    ...stats,
    issues,
  };
}

export async function monitorQueue(tenantId: string): Promise<void> {
  const health = await checkQueueHealth();

  if (!health.healthy && health.issues.length > 0) {
    await sendSlackAlert({
      title: 'Queue Health Alert',
      message: health.issues.join(', '),
      severity: health.failed > 10 ? 'error' : 'warning',
      tenantId,
      metadata: {
        waiting: health.waiting,
        active: health.active,
        failed: health.failed,
        completed: health.completed,
      },
    });
  }
}

export async function getQueueMetrics() {
  const stats = await getQueueStats();
  
  if (!stats) {
    return null;
  }

  return {
    ...stats,
    throughput: stats.completed / (stats.completed + stats.failed || 1),
    utilization: (stats.active / (stats.active + stats.waiting || 1)) * 100,
  };
}

