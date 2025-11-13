/**
 * Web Vitals tracking integration for Next.js
 *
 * Captures Core Web Vitals using the web-vitals library and reports them
 * to the analytics endpoint for monitoring and alerting.
 *
 * Usage:
 * 1. Import in app/layout.tsx or _app.tsx
 * 2. Call reportWebVitals() on client side
 * 3. View metrics in PerformanceBudgetMonitor component
 */

import type { Metric } from 'web-vitals';

interface VitalReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  pageUrl: string;
  timestamp: number;
}

// Thresholds based on https://web.dev/vitals/
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  FID: { good: 100, poor: 300 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Reports a Web Vital metric to the analytics endpoint
 */
async function sendToAnalytics(metric: Metric) {
  const report: VitalReport = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
    pageUrl: window.location.pathname,
    timestamp: Date.now(),
  };

  // Send to analytics endpoint
  const body = JSON.stringify([report]);

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', body);
  } else {
    fetch('/api/web-vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(console.error);
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating: report.rating,
      delta: metric.delta.toFixed(2),
    });
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this once on app initialization (client-side only)
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') {
    return;
  }

  // Dynamically import web-vitals to avoid SSR issues
  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }).catch(error => {
    console.error('[Web Vitals] Failed to load library:', error);
  });
}

/**
 * Report a custom performance metric
 */
export function reportCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') {
    return;
  }

  const report = {
    name,
    value,
    rating: 'good' as const,
    delta: 0,
    id: `custom-${Date.now()}-${Math.random()}`,
    navigationType: 'unknown',
    pageUrl: window.location.pathname,
    timestamp: Date.now(),
    metadata,
  };

  fetch('/api/web-vitals', {
    method: 'POST',
    body: JSON.stringify([report]),
    headers: { 'Content-Type': 'application/json' },
  }).catch(console.error);
}

/**
 * Get navigation timing metrics
 * Useful for understanding page load performance
 */
export function getNavigationTimings() {
  if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = {
    // DNS lookup
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    // TCP connection
    tcpConnection: timing.connectEnd - timing.connectStart,
    // Request + response
    requestTime: timing.responseEnd - timing.requestStart,
    // DOM processing
    domProcessing: timing.domComplete - timing.domLoading,
    // Total page load
    totalLoadTime: timing.loadEventEnd - timing.navigationStart,
  };

  return navigation;
}

/**
 * Check if current connection is slow (2G/3G or Save-Data enabled)
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const conn = (navigator as any).connection;
  if (!conn) return false;

  // Check for explicit save-data mode
  if (conn.saveData === true) {
    return true;
  }

  // Check for slow effective connection type
  const slowConnections = ['slow-2g', '2g', '3g'];
  if (slowConnections.includes(conn.effectiveType)) {
    return true;
  }

  return false;
}
