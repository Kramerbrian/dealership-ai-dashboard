/**
 * Multi-Platform Analytics Integration for DealershipAI
 * Supports: Google Analytics 4, Segment, Mixpanel
 * Tracks key PLG events for conversion optimization
 */

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    dataLayer?: any[];
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      page: (name?: string, properties?: Record<string, any>) => void;
    };
    mixpanel?: {
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string) => void;
      people?: {
        set: (traits: Record<string, any>) => void;
      };
    };
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
  | 'upgrade_clicked'
  | 'instant_scan_started'
  | 'instant_scan_completed'
  | 'email_captured'
  | 'csv_upload_started'
  | 'csv_upload_completed'
  | 'csv_upload_failed'
  | 'origin_verification_started'
  | 'origin_verification_completed'
  | 'bulk_action_executed'
  | 'filter_applied'
  | 'navigation_clicked'
  | 'error_occurred'
  | 'page_viewed';

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
 * Core tracking function that sends to all configured platforms
 */
export function track(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const enrichedProps = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    path: window.location.pathname,
  };

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, enrichedProps);
  }

  // Segment
  if (window.analytics) {
    window.analytics.track(eventName, enrichedProps);
  }

  // Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track(eventName, enrichedProps);
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, enrichedProps);
  }
}

/**
 * Identify user across platforms
 */
export function identify(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Segment
  if (window.analytics) {
    window.analytics.identify(userId, traits);
  }

  // Mixpanel
  if (window.mixpanel) {
    window.mixpanel.identify(userId);
    if (traits && window.mixpanel.people) {
      window.mixpanel.people.set(traits);
    }
  }

  // GA4 user properties
  if (window.gtag) {
    window.gtag('set', 'user_properties', traits);
  }
}

/**
 * Track page views
 */
export function page(name?: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Segment
  if (window.analytics) {
    window.analytics.page(name, properties);
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: name || document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...properties,
    });
  }

  // Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track('Page Viewed', {
      page: name || document.title,
      ...properties,
    });
  }
}

/**
 * Track a custom event (legacy support)
 */
export function trackEvent(eventName: AnalyticsEvent, params?: EventParams) {
  track(eventName, params);
}

/**
 * Track conversion funnel
 */
export function trackFunnel(step: string, params?: EventParams) {
  track('funnel_step', {
    ...params,
    event_category: 'Funnel',
    event_label: step,
  });
}

/**
 * Track user engagement
 */
export function trackEngagement(action: string, params?: EventParams) {
  track('user_engagement', {
    ...params,
    event_category: 'Engagement',
    event_label: action,
  });
}

/**
 * Track audit completion with score data
 */
export function trackAuditComplete(score: number, metrics: Record<string, number>) {
  track('audit_complete', {
    event_category: 'Audit',
    value: score,
    ...metrics,
  });
}

/**
 * Track share events for viral growth
 */
export function trackShare(platform: string, feature: string) {
  track('share_completed', {
    event_category: 'Share',
    platform,
    feature_name: feature,
  });
}

/**
 * Track A/B test variants
 */
export function trackABTest(variant: string, testName: string) {
  track('ab_test', {
    event_category: 'A/B Test',
    event_label: testName,
    variant,
  });
}

// =====================================================
// Pre-Configured Event Trackers
// =====================================================

/**
 * Instant Scan Events
 */
export const InstantScanEvents = {
  scanStarted: (dealer: string) => {
    track('instant_scan_started', {
      event_category: 'Instant Scan',
      dealer,
    });
  },

  scanCompleted: (dealer: string, results: {
    zeroClick: number;
    aiVisibility: number;
    revenueAtRisk: number;
    schemaCoverage?: number;
  }) => {
    track('instant_scan_completed', {
      event_category: 'Instant Scan',
      dealer,
      zero_click_score: results.zeroClick,
      ai_visibility_score: results.aiVisibility,
      revenue_at_risk: results.revenueAtRisk,
      schema_coverage: results.schemaCoverage,
    });
  },

  emailCaptured: (dealer: string, email: string, utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  }) => {
    track('email_captured', {
      event_category: 'Lead Generation',
      dealer,
      email_domain: email.split('@')[1],
      utm_source: utm?.source,
      utm_medium: utm?.medium,
      utm_campaign: utm?.campaign,
    });
  },

  reportUnlocked: (dealer: string) => {
    track('feature_unlocked', {
      event_category: 'Instant Scan',
      feature_name: 'full_report',
      dealer,
    });
  },
};

/**
 * Fleet Management Events
 */
export const FleetEvents = {
  csvUploadStarted: (fileName: string, rowCount: number, fileSize: number) => {
    track('csv_upload_started', {
      event_category: 'Fleet Management',
      file_name: fileName,
      row_count: rowCount,
      file_size_mb: (fileSize / 1024 / 1024).toFixed(2),
    });
  },

  csvUploadCompleted: (fileName: string, results: {
    valid: number;
    invalid: number;
    duplicates: number;
    inserted: number;
    updated: number;
  }) => {
    track('csv_upload_completed', {
      event_category: 'Fleet Management',
      file_name: fileName,
      valid_rows: results.valid,
      invalid_rows: results.invalid,
      duplicate_rows: results.duplicates,
      inserted_rows: results.inserted,
      updated_rows: results.updated,
      success_rate: (results.valid / (results.valid + results.invalid) * 100).toFixed(1),
    });
  },

  csvUploadFailed: (fileName: string, error: string) => {
    track('csv_upload_failed', {
      event_category: 'Fleet Management',
      file_name: fileName,
      error_message: error,
    });
  },

  originVerificationStarted: (origin: string) => {
    track('origin_verification_started', {
      event_category: 'Fleet Management',
      origin,
    });
  },

  originVerificationCompleted: (origin: string, results: {
    aiVisibility: number;
    schemaCoverage: number;
    revenueAtRisk: number;
  }) => {
    track('origin_verification_completed', {
      event_category: 'Fleet Management',
      origin,
      ai_visibility_score: results.aiVisibility,
      schema_coverage: results.schemaCoverage,
      revenue_at_risk: results.revenueAtRisk,
    });
  },

  bulkActionExecuted: (action: string, count: number) => {
    track('bulk_action_executed', {
      event_category: 'Fleet Management',
      action,
      affected_count: count,
    });
  },

  filterApplied: (filters: Record<string, any>) => {
    track('filter_applied', {
      event_category: 'Fleet Management',
      filter_count: Object.keys(filters).length,
      ...filters,
    });
  },
};

/**
 * Navigation Events
 */
export const NavigationEvents = {
  ctaClicked: (ctaName: string, destination: string) => {
    track('cta_clicked', {
      event_category: 'Navigation',
      cta_name: ctaName,
      destination,
    });
  },

  linkClicked: (linkText: string, destination: string) => {
    track('navigation_clicked', {
      event_category: 'Navigation',
      link_text: linkText,
      destination,
    });
  },

  modalOpened: (modalName: string) => {
    track('modal_open', {
      event_category: 'UI Interaction',
      modal_name: modalName,
    });
  },
};

/**
 * Conversion Events
 */
export const ConversionEvents = {
  signupStarted: () => {
    track('signup_started', {
      event_category: 'Conversion',
    });
  },

  signupCompleted: (userId: string, plan: string) => {
    track('signup_completed', {
      event_category: 'Conversion',
      user_id: userId,
      plan,
    });
    identify(userId, { plan, signup_date: new Date().toISOString() });
  },

  trialStarted: (userId: string) => {
    track('trial_started', {
      event_category: 'Conversion',
      user_id: userId,
    });
  },

  upgradeToPaid: (userId: string, plan: string, value: number) => {
    track('upgrade_clicked', {
      event_category: 'Conversion',
      user_id: userId,
      plan,
      value,
    });
  },

  leadConverted: (leadId: string, dealer: string) => {
    track('lead_converted', {
      event_category: 'Conversion',
      lead_id: leadId,
      dealer,
    });
  },
};

/**
 * Engagement Events
 */
export const EngagementEvents = {
  scrollDepth: (percentage: number) => {
    track('scroll_depth', {
      event_category: 'Engagement',
      scroll_percentage: percentage,
    });
  },

  timeOnPage: (seconds: number) => {
    track('time_on_page', {
      event_category: 'Engagement',
      duration_seconds: seconds,
    });
  },

  videoPlayed: (videoName: string) => {
    track('video_played', {
      event_category: 'Engagement',
      video_name: videoName,
    });
  },

  documentDownloaded: (documentName: string) => {
    track('document_downloaded', {
      event_category: 'Engagement',
      document_name: documentName,
    });
  },
};

/**
 * Error Events
 */
export const ErrorEvents = {
  apiError: (endpoint: string, statusCode: number, errorMessage: string) => {
    track('error_occurred', {
      event_category: 'Error',
      error_type: 'api_error',
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  },

  validationError: (field: string, errorMessage: string) => {
    track('error_occurred', {
      event_category: 'Error',
      error_type: 'validation_error',
      field,
      error_message: errorMessage,
    });
  },

  unexpectedError: (componentName: string, errorMessage: string) => {
    track('error_occurred', {
      event_category: 'Error',
      error_type: 'unexpected_error',
      component: componentName,
      error_message: errorMessage,
    });
  },
};
