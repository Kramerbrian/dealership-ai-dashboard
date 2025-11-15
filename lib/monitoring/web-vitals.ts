/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and sends to analytics
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB, Metric } from 'web-vitals';

// Send to analytics endpoint
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  });

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  } else {
    fetch('/api/analytics/web-vitals', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(console.error);
  }
}

// Log to console in development
function logMetric(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }
}

// Report all available metrics
export function reportWebVitals() {
  try {
    onCLS((metric: any) => {
      logMetric(metric);
      sendToAnalytics(metric);
    });
    onFID((metric: any) => {
      logMetric(metric);
      sendToAnalytics(metric);
    });
    onFCP((metric: any) => {
      logMetric(metric);
      sendToAnalytics(metric);
    });
    onLCP((metric: any) => {
      logMetric(metric);
      sendToAnalytics(metric);
    });
    onTTFB((metric: any) => {
      logMetric(metric);
      sendToAnalytics(metric);
    });
  } catch (error) {
    console.error('[Web Vitals] Error reporting metrics:', error);
  }
}

// Thresholds for good/needs-improvement/poor
export const WEB_VITALS_THRESHOLDS = {
  // Cumulative Layout Shift (lower is better)
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  // First Input Delay (ms, lower is better)
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  // First Contentful Paint (ms, lower is better)
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  // Largest Contentful Paint (ms, lower is better)
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  // Time to First Byte (ms, lower is better)
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
} as const;
