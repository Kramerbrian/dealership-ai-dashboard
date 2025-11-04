/**
 * API Analytics & Insights
 * 
 * Tracks API endpoint usage, performance, and patterns
 */

import { logger } from './logger';

interface APIMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  error?: string;
}

interface EndpointStats {
  endpoint: string;
  method: string;
  totalRequests: number;
  avgResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
  successRate: number;
  lastRequest: Date;
}

const metrics: APIMetric[] = [];
const MAX_METRICS = 10000;

/**
 * Track an API request
 */
export async function trackAPIRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  options?: {
    userId?: string;
    error?: string;
  }
): Promise<void> {
  const metric: APIMetric = {
    endpoint,
    method,
    statusCode,
    responseTime,
    timestamp: new Date(),
    userId: options?.userId,
    error: options?.error,
  };

  metrics.push(metric);

  // Trim old metrics
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }

  // Log slow requests (>1 second)
  if (responseTime > 1000) {
    await logger.warn('Slow API request detected', {
      endpoint,
      method,
      responseTime,
      statusCode,
    });
  }

  // Log errors
  if (statusCode >= 400) {
    await logger.error('API request error', {
      endpoint,
      method,
      statusCode,
      responseTime,
      error: options?.error,
    });
  }
}

/**
 * Get analytics for all endpoints
 */
export function getAPIAnalytics(): {
  endpoints: EndpointStats[];
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    topEndpoints: EndpointStats[];
    slowEndpoints: EndpointStats[];
  };
} {
  // Group metrics by endpoint + method
  const endpointMap = new Map<string, APIMetric[]>();

  metrics.forEach(metric => {
    const key = `${metric.method}:${metric.endpoint}`;
    if (!endpointMap.has(key)) {
      endpointMap.set(key, []);
    }
    endpointMap.get(key)!.push(metric);
  });

  // Calculate stats for each endpoint
  const endpoints: EndpointStats[] = [];

  endpointMap.forEach((endpointMetrics, key) => {
    const [method, endpoint] = key.split(':');
    const responseTimes = endpointMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const errors = endpointMetrics.filter(m => m.statusCode >= 400);
    const successes = endpointMetrics.filter(m => m.statusCode < 400);

    const stats: EndpointStats = {
      endpoint,
      method,
      totalRequests: endpointMetrics.length,
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p50: responseTimes[Math.floor(responseTimes.length * 0.5)] || 0,
      p95: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
      p99: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
      errorRate: errors.length / endpointMetrics.length,
      successRate: successes.length / endpointMetrics.length,
      lastRequest: endpointMetrics[endpointMetrics.length - 1]?.timestamp || new Date(),
    };

    endpoints.push(stats);
  });

  // Calculate summary
  const allResponseTimes = metrics.map(m => m.responseTime);
  const allErrors = metrics.filter(m => m.statusCode >= 400);

  const summary = {
    totalRequests: metrics.length,
    avgResponseTime: allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length || 0,
    errorRate: allErrors.length / metrics.length || 0,
    topEndpoints: [...endpoints]
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10),
    slowEndpoints: [...endpoints]
      .filter(e => e.avgResponseTime > 500)
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 10),
  };

  return { endpoints, summary };
}

/**
 * Get stats for a specific endpoint
 */
export function getEndpointStats(endpoint: string, method: string): EndpointStats | null {
  const analytics = getAPIAnalytics();
  return analytics.endpoints.find(e => e.endpoint === endpoint && e.method === method) || null;
}

/**
 * Clear old metrics (call periodically)
 */
export function clearOldMetrics(hours: number = 24): void {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const filtered = metrics.filter(m => m.timestamp > cutoff);
  metrics.length = 0;
  metrics.push(...filtered);
}

