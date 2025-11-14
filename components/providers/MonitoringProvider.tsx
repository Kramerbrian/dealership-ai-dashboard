'use client';

/**
 * Monitoring Provider Component
 * Initializes Sentry, PostHog, and analytics on the client side
 * 
 * Note: User tracking is optional and will be skipped if Clerk is not configured
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initPostHog, trackPageView, trackEvent } from '@/lib/monitoring/analytics';
import { initSentry, setUser } from '@/lib/monitoring/sentry';

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // User tracking is optional - skip if Clerk not available
  // This avoids hook errors when ClerkProvider isn't rendered

  // Initialize monitoring on mount
  useEffect(() => {
    // Initialize Sentry
    try {
      initSentry();
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }

    // Initialize PostHog
    try {
      initPostHog();
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  // User tracking is skipped for now to avoid hook errors
  // Can be re-enabled once ClerkProvider is confirmed working
  // The monitoring will still work for page views and errors

  return <>{children}</>;
}
