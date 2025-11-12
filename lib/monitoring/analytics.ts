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

/**
 * Initialize PostHog (if configured)
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;
  
  const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!postHogKey) {
    // PostHog not configured - silently skip
    return;
  }

  // Only initialize if not already loaded
  if (window.posthog) {
    return;
  }

  // Dynamic import to avoid SSR issues
  if (typeof window !== 'undefined') {
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(postHogKey, {
        api_host: postHogHost,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[PostHog] Initialized');
          }
        },
      });
      window.posthog = posthog;
    }).catch(() => {
      // PostHog not installed or failed to load - silently fail
    });
  }
}

/**
 * Track page view
 */
export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return;

  const pageUrl = url || window.location.pathname;

  // Vercel Analytics
  if (window.va) {
    window.va('track', 'pageview', { url: pageUrl });
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture('$pageview', { $current_url: pageUrl });
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pageUrl,
    });
  }

  // Console fallback for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Page view:', pageUrl);
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
      init?: (key: string, options?: any) => void;
    };
    gtag?: (command: string, event: string, properties?: Record<string, any>) => void;
  }
}
