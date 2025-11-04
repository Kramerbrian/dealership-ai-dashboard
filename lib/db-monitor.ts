/**
 * Database Query Monitoring
 * 
 * Automatically monitors database queries and detects slow queries
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  slow: boolean;
  model?: string;
  action?: string;
}

const SLOW_QUERY_THRESHOLD = 1000; // 1 second
const queryMetrics: QueryMetrics[] = [];
const MAX_METRICS_STORED = 1000; // Keep last 1000 queries

/**
 * Add query metric to tracking
 */
function addQueryMetric(metric: QueryMetrics) {
  queryMetrics.push(metric);
  
  // Keep only the most recent metrics
  if (queryMetrics.length > MAX_METRICS_STORED) {
    queryMetrics.shift();
  }
}

/**
 * Prisma middleware for query monitoring
 * Automatically tracks all queries and logs slow ones
 */
prisma.$use(async (params, next) => {
  const start = Date.now();
  
  try {
    const result = await next(params);
    const duration = Date.now() - start;
    
    const query = `${params.model ?? 'unknown'}.${params.action}`;
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      await logger.warn('Slow database query detected', {
        query,
        duration,
        model: params.model,
        action: params.action,
        args: params.args ? JSON.stringify(params.args).substring(0, 500) : undefined, // Limit size
      });
      
      addQueryMetric({
        query,
        duration,
        timestamp: new Date(),
        slow: true,
        model: params.model,
        action: params.action,
      });
    } else {
      // Track all queries for metrics
      addQueryMetric({
        query,
        duration,
        timestamp: new Date(),
        slow: false,
        model: params.model,
        action: params.action,
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    await logger.error('Database query error', {
      model: params.model,
      action: params.action,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Track failed queries
    addQueryMetric({
      query: `${params.model ?? 'unknown'}.${params.action}`,
      duration,
      timestamp: new Date(),
      slow: true, // Failed queries are considered slow
      model: params.model,
      action: params.action,
    });
    
    throw error;
  }
});

/**
 * Get query performance metrics
 */
export async function getQueryMetrics(): Promise<{
  slowQueries: QueryMetrics[];
  avgQueryTime: number;
  totalQueries: number;
  slowQueryCount: number;
  queriesByModel: Record<string, { count: number; avgDuration: number }>;
}> {
  const slowQueries = queryMetrics.filter(q => q.slow);
  const avgQueryTime = queryMetrics.length > 0
    ? queryMetrics.reduce((sum, q) => sum + q.duration, 0) / queryMetrics.length
    : 0;
  
  // Group queries by model
  const queriesByModel: Record<string, { count: number; totalDuration: number }> = {};
  
  queryMetrics.forEach(metric => {
    if (metric.model) {
      if (!queriesByModel[metric.model]) {
        queriesByModel[metric.model] = { count: 0, totalDuration: 0 };
      }
      queriesByModel[metric.model].count++;
      queriesByModel[metric.model].totalDuration += metric.duration;
    }
  });
  
  // Calculate averages
  const queriesByModelWithAvg = Object.entries(queriesByModel).reduce(
    (acc, [model, data]) => {
      acc[model] = {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      };
      return acc;
    },
    {} as Record<string, { count: number; avgDuration: number }>
  );
  
  return {
    slowQueries: slowQueries.slice(-10), // Last 10 slow queries
    avgQueryTime: Math.round(avgQueryTime),
    totalQueries: queryMetrics.length,
    slowQueryCount: slowQueries.length,
    queriesByModel: queriesByModelWithAvg,
  };
}

/**
 * Reset query metrics
 * Useful for clearing old data periodically
 */
export function resetQueryMetrics(): void {
  queryMetrics.length = 0;
}

/**
 * Get query statistics for a specific time window
 */
export function getQueryStats(windowMinutes: number = 5): {
  queriesInWindow: number;
  slowQueriesInWindow: number;
  avgQueryTime: number;
} {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
  const recent = queryMetrics.filter(m => m.timestamp > cutoff);
  
  const slowQueries = recent.filter(q => q.slow);
  const avgQueryTime = recent.length > 0
    ? recent.reduce((sum, q) => sum + q.duration, 0) / recent.length
    : 0;
  
  return {
    queriesInWindow: recent.length,
    slowQueriesInWindow: slowQueries.length,
    avgQueryTime: Math.round(avgQueryTime),
  };
}

