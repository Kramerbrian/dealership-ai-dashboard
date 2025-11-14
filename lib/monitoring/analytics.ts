/**
 * Analytics Integration
 * Supports Vercel Analytics, PostHog, and Google Analytics
 */

// Vercel Analytics (already included via @vercel/analytics/react)
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Vercel Analytics
  if (window.va) {
    window.va('track', event, properties);
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture(event, properties);
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', event, properties);
  }

  // Console fallback for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // PostHog
  if (window.posthog) {
    window.posthog.identify(userId, traits);
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('set', { user_id: userId });
  }
}

export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // PostHog
  if (window.posthog) {
    window.posthog.setPersonProperties(properties);
  }
}

export function initPostHog() {
  // PostHog initialization (stub - implement if needed)
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // PostHog initialization would go here
    // import posthog from 'posthog-js';
    // posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, { api_host: 'https://app.posthog.com' });
  }
}

export function trackPageView(pathname: string) {
  // Track page view via analytics
  trackEvent('page_view', { path: pathname });
  
  // Also track via Google Analytics if available
  if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA, {
      page_path: pathname,
    });
  }
}

// Type declarations
declare global {
  interface Window {
    va?: (command: string, event: string, properties?: Record<string, any>) => void;
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      setPersonProperties: (properties: Record<string, any>) => void;
    };
    gtag?: (command: string, event: string, properties?: Record<string, any>) => void;
  }
}
