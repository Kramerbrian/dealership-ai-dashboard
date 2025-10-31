/**
 * Service Level Objective (SLO) Tracking
 * Monitors API performance and reliability metrics
 */

interface SLOMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

interface SLOStats {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  successRate: number;
  lastUpdated: number;
}

class SLOTracker {
  private metrics: Map<string, SLOMetric[]> = new Map();
  private readonly maxMetricsPerEndpoint = 1000;
  private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours

  trackSLO(name: string, duration: number, success: boolean = true) {
    const metric: SLOMetric = {
      name,
      duration,
      timestamp: Date.now(),
      success
    };

    let endpointMetrics = this.metrics.get(name) || [];
    endpointMetrics.push(metric);

    // Keep only recent metrics
    const cutoff = Date.now() - this.retentionPeriod;
    endpointMetrics = endpointMetrics.filter(m => m.timestamp > cutoff);

    // Limit the number of metrics per endpoint
    if (endpointMetrics.length > this.maxMetricsPerEndpoint) {
      endpointMetrics = endpointMetrics.slice(-this.maxMetricsPerEndpoint);
    }

    this.metrics.set(name, endpointMetrics);

    // Log if performance is degraded
    if (duration > 5000) { // 5 seconds
      console.warn(`SLO Alert: ${name} took ${duration}ms`);
    }
  }

  getSLOStats(name: string): SLOStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const successfulRequests = metrics.filter(m => m.success).length;

    return {
      name,
      totalRequests: metrics.length,
      successfulRequests,
      averageLatency: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Latency: durations[Math.floor(durations.length * 0.95)] || 0,
      p99Latency: durations[Math.floor(durations.length * 0.99)] || 0,
      successRate: (successfulRequests / metrics.length) * 100,
      lastUpdated: Date.now()
    };
  }

  getAllSLOStats(): SLOStats[] {
    const stats: SLOStats[] = [];
    for (const name of this.metrics.keys()) {
      const stat = this.getSLOStats(name);
      if (stat) {
        stats.push(stat);
      }
    }
    return stats.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  // Check if SLO targets are being met
  checkSLOHealth(): { healthy: boolean; violations: string[] } {
    const violations: string[] = [];
    const stats = this.getAllSLOStats();

    for (const stat of stats) {
      // Check success rate (target: 99.5%)
      if (stat.successRate < 99.5) {
        violations.push(`${stat.name}: Success rate ${stat.successRate.toFixed(2)}% below 99.5%`);
      }

      // Check P95 latency (target: < 1000ms)
      if (stat.p95Latency > 1000) {
        violations.push(`${stat.name}: P95 latency ${stat.p95Latency}ms above 1000ms`);
      }

      // Check P99 latency (target: < 2000ms)
      if (stat.p99Latency > 2000) {
        violations.push(`${stat.name}: P99 latency ${stat.p99Latency}ms above 2000ms`);
      }
    }

    return {
      healthy: violations.length === 0,
      violations
    };
  }

  // Clean up old metrics
  cleanup() {
    const cutoff = Date.now() - this.retentionPeriod;
    
    for (const [name, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoff);
      
      if (filteredMetrics.length === 0) {
        this.metrics.delete(name);
      } else {
        this.metrics.set(name, filteredMetrics);
      }
    }
  }
}

// Global SLO tracker instance
const sloTracker = new SLOTracker();

// Export the tracking function
export function trackSLO(name: string, duration: number, success: boolean = true) {
  sloTracker.trackSLO(name, duration, success);
}

// Export stats functions
export function getSLOStats(name: string) {
  return sloTracker.getSLOStats(name);
}

export function getAllSLOStats() {
  return sloTracker.getAllSLOStats();
}

export function checkSLOHealth() {
  return sloTracker.checkSLOHealth();
}

// Cleanup interval
setInterval(() => {
  sloTracker.cleanup();
}, 60 * 60 * 1000); // Cleanup every hour