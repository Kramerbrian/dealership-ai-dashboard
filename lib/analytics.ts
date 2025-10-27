/**
 * GA4 Analytics Integration for DealershipAI
 * Tracks key PLG events for conversion optimization
 */

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    dataLayer?: any[];
  }
}

// Event types
export type AnalyticsEvent = 
  | 'audit_started'
  | 'audit_complete'
  | 'share_modal_opened'
  | 'share_completed'
  | 'feature_unlocked'
  | 'cta_clicked'
  | 'modal_open'
  | 'scroll_depth'
  | 'session_start'
  | 'pricing_viewed'
  | 'upgrade_clicked';

export interface EventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  feature_name?: string;
  score?: number;
  platform?: string;
  [key: string]: any;
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: AnalyticsEvent, params?: EventParams) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    event_category: params?.event_category || 'Landing',
    event_label: params?.event_label,
    value: params?.value,
    ...params
  });
}

/**
 * Track conversion funnel
 */
export function trackFunnel(step: string, params?: EventParams) {
  trackEvent('funnel_step' as AnalyticsEvent, {
    ...params,
    event_category: 'Funnel',
    event_label: step
  });
}

/**
 * Track user engagement
 */
export function trackEngagement(action: string, params?: EventParams) {
  trackEvent('user_engagement' as AnalyticsEvent, {
    ...params,
    event_category: 'Engagement',
    event_label: action
  });
}

/**
 * Track audit completion with score data
 */
export function trackAuditComplete(score: number, metrics: Record<string, number>) {
  trackEvent('audit_complete', {
    event_category: 'Audit',
    value: score,
    ...metrics
  });
}

/**
 * Track share events for viral growth
 */
export function trackShare(platform: string, feature: string) {
  trackEvent('share_completed', {
    event_category: 'Share',
    platform,
    feature_name: feature
  });
}

/**
 * Track A/B test variants
 */
export function trackABTest(variant: string, testName: string) {
  trackEvent('ab_test' as AnalyticsEvent, {
    event_category: 'A/B Test',
    event_label: testName,
    variant
  });
}
