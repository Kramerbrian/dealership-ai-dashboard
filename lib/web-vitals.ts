/**
 * Core Web Vitals Tracking
 * 
 * Tracks and reports Core Web Vitals metrics:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * Integrates with:
 * - Google Analytics 4
 * - Custom API endpoint
 * - Sentry (for error tracking)
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

interface WebVitalsEvent {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

// Rating thresholds based on web.dev/vitals
const RATINGS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = RATINGS[name as keyof typeof RATINGS];
  if (!thresholds) return 'needs-improvement';
  
  if (value <= thresholds.good) return 'good';
  if (value >= thresholds.poor) return 'poor';
  return 'needs-improvement';
}

function sendToAnalytics(metric: Metric) {
  const event: WebVitalsEvent = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType || 'unknown',
  };

  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
      // Custom dimensions
      metric_rating: event.rating,
      metric_delta: Math.round(metric.delta),
      navigation_type: metric.navigationType,
    });
  }

  // Send to custom API endpoint for logging
  if (typeof fetch !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch((error) => {
      // Silently fail - don't break the app if analytics fails
      console.debug('Failed to send Web Vitals to API:', error);
    });
  }

  // Log poor ratings in development
  if (process.env.NODE_ENV === 'development' && event.rating === 'poor') {
    console.warn(`Poor Web Vital: ${metric.name} = ${metric.value}`, event);
  }

  // Send to Sentry if available (for poor ratings)
  if (event.rating === 'poor' && typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `Poor ${metric.name}: ${metric.value}`,
      level: 'warning',
      data: event,
    });
  }
}

/**
 * Initialize Web Vitals tracking
 * 
 * Call this in your root layout or _app.tsx
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals (all browsers)
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    // INP (replaces FID in newer metrics)
    if (typeof onINP !== 'undefined') {
      onINP(sendToAnalytics);
    }
  } catch (error) {
    console.error('Failed to initialize Web Vitals tracking:', error);
  }
}

/**
 * Get current Web Vitals values (if stored)
 */
export function getStoredWebVitals(): Partial<Record<string, number>> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem('web-vitals');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export default initWebVitals;
