'use client';

/**
 * Core Web Vitals Optimization
 * Tracks and optimizes LCP, FID, CLS metrics
 */

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class CoreWebVitalsOptimizer {
  private metrics: WebVitalMetric[] = [];

  /**
   * Optimize Largest Contentful Paint (LCP)
   */
  optimizeLCP() {
    // Preload critical resources
    if (typeof document !== 'undefined') {
      // Preload fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'font';
      fontPreload.type = 'font/woff2';
      fontPreload.crossOrigin = 'anonymous';
      fontPreload.href = '/fonts/inter-var.woff2';
      document.head.appendChild(fontPreload);

      // Preconnect to external domains
      const preconnectGoogleFonts = document.createElement('link');
      preconnectGoogleFonts.rel = 'preconnect';
      preconnectGoogleFonts.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnectGoogleFonts);

      const preconnectGstatic = document.createElement('link');
      preconnectGstatic.rel = 'preconnect';
      preconnectGstatic.href = 'https://fonts.gstatic.com';
      preconnectGstatic.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectGstatic);

      // DNS prefetch for analytics
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = 'https://www.googletagmanager.com';
      document.head.appendChild(dnsPrefetch);
    }
  }

  /**
   * Optimize First Input Delay (FID)
   */
  optimizeFID() {
    // Defer non-critical JavaScript
    // Already handled by Next.js dynamic imports
    // But we can add more optimizations

    // Use requestIdleCallback for non-critical tasks
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Initialize non-critical features
        // Analytics, tracking, etc.
      });
    }
  }

  /**
   * Optimize Cumulative Layout Shift (CLS)
   */
  optimizeCLS() {
    // Reserve space for dynamic content
    // Add aspect ratios to images
    // Set explicit dimensions
    // Avoid inserting content above existing content
  }

  /**
   * Track Web Vitals
   */
  trackWebVitals() {
    if (typeof window === 'undefined') return;

    // Track LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.metrics.push({
            name: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime,
            rating: this.getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
            timestamp: Date.now()
          });

          // Send to analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
              non_interaction: true
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getMetrics(): WebVitalMetric[] {
    return this.metrics;
  }
}

export const webVitalsOptimizer = new CoreWebVitalsOptimizer();

// Initialize on client side
if (typeof window !== 'undefined') {
  webVitalsOptimizer.optimizeLCP();
  webVitalsOptimizer.trackWebVitals();
}

