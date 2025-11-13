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

// PostHog initialization
export function initPostHog() {
  if (typeof window === 'undefined') return;

  // Only initialize if PostHog is available and not already initialized
  if (window.posthog) {
    return;
  }

  // PostHog initialization would go here if needed
  // For now, this is a no-op since PostHog should be loaded via script tag
}

// Track page view
export function trackPageView(pathname: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Vercel Analytics
  if (window.va) {
    window.va('track', 'page_view', { pathname, ...properties });
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture('$pageview', { pathname, ...properties });
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', { page_path: pathname, ...properties });
  }

  // Console fallback for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Page view:', pathname, properties);
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
