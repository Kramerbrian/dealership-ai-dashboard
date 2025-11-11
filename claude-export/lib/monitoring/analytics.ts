/**
 * Analytics Tracking
 * Centralized analytics for Vercel Analytics, PostHog, and custom events
 */

let posthog: any = null;
try {
  posthog = require('posthog-js');
} catch {
  // PostHog is optional
}

let posthogInitialized = false;

// Vercel Analytics (already in layout.tsx)
export function trackPageView(path: string) {
  if (typeof window !== 'undefined') {
    // Vercel Analytics tracks automatically
    // Custom tracking if needed
    console.log('[Analytics] Page view:', path);
    
    // Track in PostHog
    if (posthogInitialized && posthog) {
      posthog.capture('$pageview', { path });
    }
  }
}

// PostHog integration
export function initPostHog() {
  if (typeof window === 'undefined') return;
  
  if (posthogInitialized) return;
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!posthogKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY not found. PostHog will not be initialized.');
    }
    return;
  }

  try {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: posthogHost,
      loaded: (ph) => {
        posthogInitialized = true;
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostHog] ✅ Initialized successfully');
        }
      },
      capture_pageview: false, // We'll capture manually for better control
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: process.env.NODE_ENV === 'development',
    });
    
    // Store reference globally
    if (typeof window !== 'undefined') {
      (window as any).posthog = posthog;
    }
  } catch (error) {
    console.error('[PostHog] Failed to initialize:', error);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  // PostHog
  if (posthogInitialized && posthog) {
    posthog.capture(eventName, properties);
  }
  
  // Vercel Analytics custom events
  if ((window as any).va) {
    (window as any).va('event', { name: eventName, ...properties });
  }
  
  // Google Analytics 4
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  if (posthogInitialized && posthog) {
    posthog.identify(userId, traits);
  }
}

export function trackConversion(eventName: string, value?: number) {
  trackEvent(eventName, {
    value,
    category: 'conversion',
    timestamp: new Date().toISOString(),
  });
}

// Custom business metrics
export function trackPulseScore(score: number, dealerId: string) {
  trackEvent('pulse_score_calculated', {
    score,
    dealerId,
    category: 'pulse',
  });
}

export function trackScenarioRun(dealerId: string, scenarioName: string) {
  trackEvent('scenario_run', {
    dealerId,
    scenarioName,
    category: 'scenario',
  });
}

export function trackShareToUnlock(platform: string, featureName: string) {
  trackEvent('share_to_unlock', {
    platform,
    featureName,
    category: 'growth',
  });
}

// Type augmentation for window
declare global {
  interface Window {
    posthog?: typeof posthog;
    va?: (command: string, ...args: any[]) => void;
    gtag?: (command: string, ...args: any[]) => void;
  }
}