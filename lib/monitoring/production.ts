/**
 * Production Performance Monitoring
 * Tracks API performance, errors, and usage metrics
 */

import { logger } from '@/lib/logger';

interface MetricData {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  tenantId?: string;
  error?: string;
}

class ProductionMonitor {
  private metrics: MetricData[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics in memory

  /**
   * Record API call metric
   */
  async recordMetric(data: MetricData): Promise<void> {
    this.metrics.push(data);

    // Trim if over limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to structured logger
    await logger.info('API metric', {
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      userId: data.userId,
      tenantId: data.tenantId,
      error: data.error,
    });

    // Log slow requests
    if (data.responseTime > 1000) {
      await logger.warn('Slow API request', {
        endpoint: data.endpoint,
        responseTime: data.responseTime,
      });
    }

    // Log errors
    if (data.statusCode >= 500 || data.error) {
      await logger.error('API error', {
        endpoint: data.endpoint,
        statusCode: data.statusCode,
        error: data.error,
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(timeWindowMinutes: number = 60): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowRequests: number;
    endpoints: Record<string, {
      count: number;
      avgResponseTime: number;
      errorCount: number;
    }>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recent = this.metrics.filter(m => m.timestamp >= cutoff);

    const totalRequests = recent.length;
    const averageResponseTime = recent.length > 0
      ? recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length
      : 0;
    const errorCount = recent.filter(m => m.statusCode >= 400).length;
    const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
    const slowRequests = recent.filter(m => m.responseTime > 1000).length;

    // Group by endpoint
    const endpoints: Record<string, {
      count: number;
      avgResponseTime: number;
      errorCount: number;
    }> = {};

    for (const metric of recent) {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpoints[key]) {
        endpoints[key] = {
          count: 0,
          avgResponseTime: 0,
          errorCount: 0,
        };
      }
      endpoints[key].count++;
      endpoints[key].avgResponseTime += metric.responseTime;
      if (metric.statusCode >= 400) {
        endpoints[key].errorCount++;
      }
    }

    // Calculate averages
    for (const key in endpoints) {
      endpoints[key].avgResponseTime /= endpoints[key].count;
    }

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests,
      endpoints,
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.getStats(60);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check error rate
    if (stats.errorRate > 0.05) {
      issues.push(`High error rate: ${(stats.errorRate * 100).toFixed(1)}%`);
      recommendations.push('Investigate error logs');
    }

    // Check response time
    if (stats.averageResponseTime > 500) {
      issues.push(`Slow average response time: ${stats.averageResponseTime}ms`);
      recommendations.push('Optimize slow endpoints');
    }

    // Check slow requests
    if (stats.slowRequests > 10) {
      issues.push(`${stats.slowRequests} slow requests in last hour`);
      recommendations.push('Review slow endpoint performance');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
  }
}

// Singleton instance
let monitorInstance: ProductionMonitor | null = null;

/**
 * Get the production monitor instance
 */
export function getProductionMonitor(): ProductionMonitor {
  if (!monitorInstance) {
    monitorInstance = new ProductionMonitor();
  }
  return monitorInstance;
}

/**
 * Record an API metric
 */
export async function recordAPIMetric(data: MetricData): Promise<void> {
  return getProductionMonitor().recordMetric(data);
}

/**
 * Get performance stats
 */
export function getPerformanceStats(timeWindowMinutes?: number) {
  return getProductionMonitor().getStats(timeWindowMinutes);
}

/**
 * Get health status
 */
export function getHealthStatus() {
  return getProductionMonitor().getHealthStatus();
}

