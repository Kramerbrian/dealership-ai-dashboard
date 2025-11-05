/**
 * Advanced CTA Tracking
 * 
 * Tracks comprehensive metrics for CTA optimization:
 * - Click-through rates
 * - Hover time
 * - Scroll depth
 * - View duration
 * - Heatmap data
 * - Conversion funnel
 */

export interface CTAMetrics {
  ctaId: string;
  variant: string;
  clicks: number;
  impressions: number;
  hoverTime: number;
  scrollDepth: number;
  conversionRate: number;
  timestamp: string;
}

export class CTATracker {
  private metrics: Map<string, CTAMetrics> = new Map();
  private hoverStartTimes: Map<string, number> = new Map();

  /**
   * Track CTA impression
   */
  trackImpression(ctaId: string, variant: string) {
    const key = `${ctaId}-${variant}`;
    const existing = this.metrics.get(key);

    if (!existing) {
      this.metrics.set(key, {
        ctaId,
        variant,
        clicks: 0,
        impressions: 1,
        hoverTime: 0,
        scrollDepth: 0,
        conversionRate: 0,
        timestamp: new Date().toISOString(),
      });
    } else {
      existing.impressions++;
      this.metrics.set(key, existing);
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_impression', {
        cta_id: ctaId,
        variant,
      });
    }
  }

  /**
   * Track CTA click
   */
  trackClick(ctaId: string, variant: string, metadata?: Record<string, any>) {
    const key = `${ctaId}-${variant}`;
    const existing = this.metrics.get(key);

    if (existing) {
      existing.clicks++;
      existing.conversionRate = (existing.clicks / existing.impressions) * 100;
      this.metrics.set(key, existing);
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        cta_id: ctaId,
        variant,
        ...metadata,
      });
    }

    // Track conversion funnel
    this.trackFunnelStep('cta_click', { ctaId, variant });
  }

  /**
   * Track hover start
   */
  trackHoverStart(ctaId: string) {
    this.hoverStartTimes.set(ctaId, Date.now());
  }

  /**
   * Track hover end
   */
  trackHoverEnd(ctaId: string, variant: string) {
    const startTime = this.hoverStartTimes.get(ctaId);
    if (!startTime) return;

    const hoverTime = Date.now() - startTime;
    const key = `${ctaId}-${variant}`;
    const existing = this.metrics.get(key);

    if (existing) {
      existing.hoverTime = (existing.hoverTime + hoverTime) / 2; // Average
      this.metrics.set(key, existing);
    }

    this.hoverStartTimes.delete(ctaId);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_hover', {
        cta_id: ctaId,
        hover_duration: hoverTime,
      });
    }
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(ctaId: string, variant: string, depth: number) {
    const key = `${ctaId}-${variant}`;
    const existing = this.metrics.get(key);

    if (existing) {
      existing.scrollDepth = Math.max(existing.scrollDepth, depth);
      this.metrics.set(key, existing);
    }
  }

  /**
   * Track conversion funnel step
   */
  trackFunnelStep(step: string, metadata?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'funnel_step', {
        step,
        ...metadata,
      });
    }
  }

  /**
   * Get metrics for a specific CTA
   */
  getMetrics(ctaId: string, variant: string): CTAMetrics | undefined {
    return this.metrics.get(`${ctaId}-${variant}`);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): CTAMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }
}

// Singleton instance
export const ctaTracker = new CTATracker();

/**
 * Heatmap tracking for CTAs
 */
export class CTAHeatmap {
  private heatmapData: Map<string, number[]> = new Map();

  /**
   * Track click position on CTA
   */
  trackClickPosition(ctaId: string, x: number, y: number, width: number, height: number) {
    const normalizedX = (x / width) * 100;
    const normalizedY = (y / height) * 100;

    const key = ctaId;
    const existing = this.heatmapData.get(key) || [];
    existing.push(normalizedX, normalizedY);
    this.heatmapData.set(key, existing);
  }

  /**
   * Get heatmap data
   */
  getHeatmapData(ctaId: string): number[] {
    return this.heatmapData.get(ctaId) || [];
  }
}

export const ctaHeatmap = new CTAHeatmap();

