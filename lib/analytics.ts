/**
 * Analytics tracking for DealershipAI
 * 
 * Supports Mixpanel, PostHog, and Amplitude
 */

// User events to track
export type UserEvent =
  | 'dashboard_viewed'
  | 'trust_score_clicked'
  | 'pillar_expanded'
  | 'agent_message_sent'
  | 'fix_button_clicked'
  | 'tier_gate_hit'
  | 'upgrade_clicked'
  | 'report_exported'
  | 'onboarding_step_completed'
  | 'url_submitted'
  | 'scan_completed'
  | 'account_created';

interface AnalyticsEvent {
  event: UserEvent;
  properties?: Record<string, any>;
  userId?: string;
  dealerId?: string;
}

class Analytics {
  private mixpanel: any = null;
  private posthog: any = null;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Initialize Mixpanel if available
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      try {
        // Dynamic import to avoid SSR issues
        import('mixpanel-browser').then((mixpanel) => {
          mixpanel.default.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
            track_pageview: true,
            persistence: 'localStorage',
          });
          this.mixpanel = mixpanel.default;
        });
      } catch (error) {
        console.error('Mixpanel init error:', error);
      }
    }

    // Initialize PostHog if available
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        import('posthog-js').then((posthog) => {
          posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            loaded: (posthogInstance) => {
              this.posthog = posthogInstance;
            },
          });
        });
      } catch (error) {
        console.error('PostHog init error:', error);
      }
    }

    this.initialized = true;
  }

  track(event: AnalyticsEvent) {
    if (!this.initialized && typeof window !== 'undefined') {
      this.init();
    }

    // Track in Mixpanel
    if (this.mixpanel) {
      this.mixpanel.track(event.event, {
        ...event.properties,
        userId: event.userId,
        dealerId: event.dealerId,
        timestamp: new Date().toISOString(),
      });
    }

    // Track in PostHog
    if (this.posthog) {
      this.posthog.capture(event.event, {
        ...event.properties,
        userId: event.userId,
        dealerId: event.dealerId,
      });
    }

    // Send to server-side analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.error('Analytics tracking error:', error);
      });
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (this.mixpanel) {
      this.mixpanel.identify(userId);
      if (traits) {
        this.mixpanel.people.set(traits);
      }
    }

    if (this.posthog) {
      this.posthog.identify(userId, traits);
    }
  }

  // Business metrics helpers
  trackBusinessMetric(metric: string, value: number, dealerId?: string) {
    this.track({
      event: 'business_metric' as UserEvent,
      properties: {
        metric,
        value,
      },
      dealerId,
    });
  }

  // Funnel tracking
  trackFunnelStep(funnelName: string, step: string, userId?: string) {
    this.track({
      event: 'funnel_step' as UserEvent,
      properties: {
        funnel: funnelName,
        step,
      },
      userId,
    });
  }
}

export const analytics = new Analytics();

