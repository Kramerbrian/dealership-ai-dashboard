/**
 * Performance Monitoring
 * 
 * Tracks performance metrics and alerts on slow operations
 */

interface PerformanceMetric {
  label: string;
  duration: number;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private slowThreshold: number = 1000; // 1 second

  /**
   * Start measuring a performance operation
   */
  startMeasure(label: string) {
    if (typeof window === 'undefined') return;
    performance.mark(`${label}-start`);
  }

  /**
   * End measuring and record the duration
   */
  endMeasure(label: string): number | null {
    if (typeof window === 'undefined') return null;

    try {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      const measure = performance.getEntriesByName(label)[0];
      if (measure && 'duration' in measure) {
        const duration = measure.duration;
        const existing = this.metrics.get(label) || [];
        existing.push(duration);
        this.metrics.set(label, existing);

        // Clean up old marks/measures (keep last 100)
        if (this.metrics.get(label)?.length > 100) {
          this.metrics.set(label, existing.slice(-100));
        }

        // Alert if slow
        if (duration > this.slowThreshold) {
          console.warn(`[Perf] Slow operation: ${label} took ${duration.toFixed(2)}ms`);
          
          // Send to analytics if available
          if (typeof window !== 'undefined' && (window as any).mixpanel) {
            (window as any).mixpanel.track('slow_operation', {
              label,
              duration: Math.round(duration)
            });
          }
        }

        // Clean up
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);

        return duration;
      }
    } catch (error) {
      console.error('[Perf] Failed to measure:', error);
    }

    return null;
  }

  /**
   * Get average time for a label
   */
  getAverageTime(label: string): number {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((values, key) => {
      result[key] = values;
    });
    return result;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Get performance report
   */
  getReport(): Record<string, {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  }> {
    const report: Record<string, any> = {};
    
    this.metrics.forEach((times, label) => {
      report[label] = {
        count: times.length,
        average: this.getAverageTime(label),
        min: Math.min(...times),
        max: Math.max(...times),
        total: times.reduce((a, b) => a + b, 0)
      };
    });

    return report;
  }
}

export const perfMonitor = new PerformanceMonitor();

