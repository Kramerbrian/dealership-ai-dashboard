/**
 * SLO (Service Level Objective) Monitoring System
 *
 * Tracks API performance and alerts when SLOs are breached:
 * - p95 read latency ≤ 250ms
 * - p95 write latency ≤ 500ms
 * - Error rate < 1%
 * - Availability > 99.9%
 *
 * Usage:
 * import { trackSLO } from '@/lib/slo-monitor';
 * await trackSLO('api-endpoint-name', async () => { ... });
 */

interface SLOMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  error?: string;
}

interface SLOReport {
  endpoint: string;
  window: string; // '1h', '24h', '7d'
  metrics: {
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    requestCount: number;
    availability: number;
  };
  breaches: Array<{
    type: 'latency' | 'error_rate' | 'availability';
    threshold: number;
    actual: number;
    timestamp: string;
  }>;
}

// SLO Thresholds
const SLO_THRESHOLDS = {
  READ_P95: 250, // ms
  WRITE_P95: 500, // ms
  ERROR_RATE: 0.01, // 1%
  AVAILABILITY: 0.999, // 99.9%
};

// In-memory store (replace with Redis/database in production)
const metricsStore: SLOMetric[] = [];
const MAX_METRICS = 10000;

/**
 * Track an API request and measure SLO compliance
 */
export async function trackSLO<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  let status = 200;
  let error: string | undefined;

  try {
    const result = await fn();
    return result;
  } catch (err) {
    status = 500;
    error = err instanceof Error ? err.message : 'Unknown error';
    throw err;
  } finally {
    const duration = performance.now() - startTime;

    const metric: SLOMetric = {
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date().toISOString(),
      error
    };

    // Store metric
    metricsStore.push(metric);

    // Trim old metrics
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.shift();
    }

    // Check for breaches
    await checkSLOBreaches(metric);

    // Log slow requests
    if (duration > SLO_THRESHOLDS.WRITE_P95) {
      console.warn(`[SLO] Slow request: ${endpoint} took ${duration.toFixed(0)}ms`);
    }
  }
}

/**
 * Check if a metric breaches SLOs and trigger alerts
 */
async function checkSLOBreaches(metric: SLOMetric) {
  const isRead = metric.method === 'GET';
  const threshold = isRead ? SLO_THRESHOLDS.READ_P95 : SLO_THRESHOLDS.WRITE_P95;

  // Breach: Latency
  if (metric.duration > threshold) {
    await triggerAlert({
      type: 'latency',
      endpoint: metric.endpoint,
      threshold,
      actual: metric.duration,
      timestamp: metric.timestamp
    });
  }

  // Breach: Error
  if (metric.status >= 500) {
    const recentMetrics = getRecentMetrics(metric.endpoint, 300000); // 5 minutes
    const errorRate = recentMetrics.filter(m => m.status >= 500).length / recentMetrics.length;

    if (errorRate > SLO_THRESHOLDS.ERROR_RATE) {
      await triggerAlert({
        type: 'error_rate',
        endpoint: metric.endpoint,
        threshold: SLO_THRESHOLDS.ERROR_RATE,
        actual: errorRate,
        timestamp: metric.timestamp
      });
    }
  }
}

/**
 * Trigger an SLO breach alert
 */
async function triggerAlert(breach: {
  type: string;
  endpoint: string;
  threshold: number;
  actual: number;
  timestamp: string;
}) {
  console.error('[SLO BREACH]', breach);

  // In production: Send to alerting system (Slack, PagerDuty, etc.)
  if (process.env.NODE_ENV === 'production') {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 SLO Breach: ${breach.type} on ${breach.endpoint}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*SLO Breach Alert*\n*Type:* ${breach.type}\n*Endpoint:* ${breach.endpoint}\n*Threshold:* ${breach.threshold}\n*Actual:* ${breach.actual.toFixed(2)}\n*Time:* ${breach.timestamp}`
              }
            }
          ]
        })
      });
    } catch (error) {
      console.error('[SLO] Failed to send alert:', error);
    }
  }
}

/**
 * Get metrics for a specific endpoint within a time window
 */
function getRecentMetrics(endpoint: string, windowMs: number): SLOMetric[] {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  return metricsStore.filter(m => m.endpoint === endpoint && m.timestamp >= cutoff);
}

/**
 * Calculate percentile from array of numbers
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Generate SLO report for an endpoint
 */
export function generateSLOReport(
  endpoint: string,
  window: '1h' | '24h' | '7d' = '1h'
): SLOReport {
  const windowMs = {
    '1h': 3600000,
    '24h': 86400000,
    '7d': 604800000
  }[window];

  const metrics = getRecentMetrics(endpoint, windowMs);

  if (metrics.length === 0) {
    return {
      endpoint,
      window,
      metrics: {
        p50: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
        requestCount: 0,
        availability: 1
      },
      breaches: []
    };
  }

  const durations = metrics.map(m => m.duration);
  const errors = metrics.filter(m => m.status >= 500).length;
  const errorRate = errors / metrics.length;
  const availability = 1 - errorRate;

  const breaches: SLOReport['breaches'] = [];

  // Check latency breach
  const p95 = percentile(durations, 95);
  const isRead = metrics[0]?.method === 'GET';
  const latencyThreshold = isRead ? SLO_THRESHOLDS.READ_P95 : SLO_THRESHOLDS.WRITE_P95;

  if (p95 > latencyThreshold) {
    breaches.push({
      type: 'latency',
      threshold: latencyThreshold,
      actual: p95,
      timestamp: new Date().toISOString()
    });
  }

  // Check error rate breach
  if (errorRate > SLO_THRESHOLDS.ERROR_RATE) {
    breaches.push({
      type: 'error_rate',
      threshold: SLO_THRESHOLDS.ERROR_RATE,
      actual: errorRate,
      timestamp: new Date().toISOString()
    });
  }

  // Check availability breach
  if (availability < SLO_THRESHOLDS.AVAILABILITY) {
    breaches.push({
      type: 'availability',
      threshold: SLO_THRESHOLDS.AVAILABILITY,
      actual: availability,
      timestamp: new Date().toISOString()
    });
  }

  return {
    endpoint,
    window,
    metrics: {
      p50: percentile(durations, 50),
      p95,
      p99: percentile(durations, 99),
      errorRate,
      requestCount: metrics.length,
      availability
    },
    breaches
  };
}

/**
 * Get all SLO reports for all endpoints
 */
export function getAllSLOReports(window: '1h' | '24h' | '7d' = '1h'): SLOReport[] {
  const endpoints = [...new Set(metricsStore.map(m => m.endpoint))];
  return endpoints.map(endpoint => generateSLOReport(endpoint, window));
}

/**
 * Export metrics (for external monitoring systems)
 */
export function exportMetrics(): SLOMetric[] {
  return [...metricsStore];
}

/**
 * Clear metrics (for testing)
 */
export function clearMetrics() {
  metricsStore.length = 0;
}
