/**
 * Performance Monitoring System
 * Tracks Core Web Vitals, custom metrics, and performance insights
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

export interface WebVitals {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
}

export interface PerformanceReport {
  webVitals: WebVitals;
  customMetrics: Record<string, number>;
  userAgent: string;
  connection: string;
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private customMetrics: Record<string, number> = {};
  private isEnabled: boolean = true;

  private constructor() {
    this.initializeWebVitals();
    this.initializeCustomMetrics();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    this.observeMetric('CLS', 'layout-shift');
    this.observeMetric('FID', 'first-input');
    this.observeMetric('FCP', 'first-contentful-paint');
    this.observeMetric('LCP', 'largest-contentful-paint');
    this.observeMetric('TTFB', 'navigation');

    // Additional performance metrics
    this.observeMetric('INP', 'event');
  }

  private observeMetric(name: string, type: string): void {
    if (typeof window === 'undefined') return;

    try {
      // Use web-vitals library if available, otherwise fallback to PerformanceObserver
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handleMetric(name, entry);
          }
        });

        observer.observe({ type, buffered: true });
      }
    } catch (error) {
      console.warn(`Failed to observe ${name}:`, error);
    }
  }

  private handleMetric(name: string, entry: PerformanceEntry): void {
    const metric: PerformanceMetric = {
      name,
      value: entry.startTime,
      delta: entry.startTime,
      id: entry.name || 'unknown',
      navigationType: 'navigate',
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.sendMetric(metric);
  }

  private initializeCustomMetrics(): void {
    if (typeof window === 'undefined') return;

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordCustomMetric('page_load_time', loadTime);
    });

    // Track time to interactive
    window.addEventListener('DOMContentLoaded', () => {
      const domContentLoaded = performance.now();
      this.recordCustomMetric('dom_content_loaded', domContentLoaded);
    });

    // Track memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordCustomMetric('memory_used', memory.usedJSHeapSize);
        this.recordCustomMetric('memory_total', memory.totalJSHeapSize);
      }, 30000); // Every 30 seconds
    }
  }

  public recordCustomMetric(name: string, value: number): void {
    this.customMetrics[name] = value;
    this.sendCustomMetric(name, value);
  }

  public startTiming(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordCustomMetric(name, duration);
    };
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const endTiming = this.startTiming(name);
    return fn().finally(endTiming);
  }

  public measureSync<T>(name: string, fn: () => T): T {
    const endTiming = this.startTiming(name);
    try {
      return fn();
    } finally {
      endTiming();
    }
  }

  private sendMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    // Send to analytics service
    this.sendToAnalytics('performance_metric', {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: metric.timestamp,
    });
  }

  private sendCustomMetric(name: string, value: number): void {
    if (!this.isEnabled) return;

    this.sendToAnalytics('custom_metric', {
      name,
      value,
      timestamp: Date.now(),
    });
  }

  private sendToAnalytics(type: string, data: any): void {
    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Mixpanel, or custom endpoint
      this.sendToEndpoint('/api/analytics/performance', { type, data });
    } else {
      console.log(`[Performance] ${type}:`, data);
    }
  }

  private async sendToEndpoint(endpoint: string, data: any): Promise<void> {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to send performance data:', error);
    }
  }

  public getReport(): PerformanceReport {
    const webVitals: WebVitals = {
      CLS: this.getMetricValue('CLS'),
      FID: this.getMetricValue('FID'),
      FCP: this.getMetricValue('FCP'),
      LCP: this.getMetricValue('LCP'),
      TTFB: this.getMetricValue('TTFB'),
    };

    return {
      webVitals,
      customMetrics: { ...this.customMetrics },
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      timestamp: Date.now(),
      url: window.location.href,
    };
  }

  private getMetricValue(name: string): number | null {
    const metric = this.metrics.find(m => m.name === name);
    return metric ? metric.value : null;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.customMetrics = {};
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = performanceMonitor;

  const measureComponent = (componentName: string) => {
    return monitor.startTiming(`component_${componentName}`);
  };

  const measureAsync = <T>(name: string, fn: () => Promise<T>) => {
    return monitor.measureAsync(name, fn);
  };

  const measureSync = <T>(name: string, fn: () => T) => {
    return monitor.measureSync(name, fn);
  };

  const recordMetric = (name: string, value: number) => {
    monitor.recordCustomMetric(name, value);
  };

  return {
    measureComponent,
    measureAsync,
    measureSync,
    recordMetric,
    getReport: () => monitor.getReport(),
  };
}

// Performance decorators
export function measurePerformance(name: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const endTiming = performanceMonitor.startTiming(name);
      try {
        const result = method.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(endTiming);
        }
        endTiming();
        return result;
      } catch (error) {
        endTiming();
        throw error;
      }
    };
  };
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Auto-initialize in browser
  performanceMonitor.enable();
}
