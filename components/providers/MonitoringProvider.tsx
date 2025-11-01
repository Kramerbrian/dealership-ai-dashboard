'use client';

/**
 * Monitoring Provider Component
 * Initializes Sentry, PostHog, and analytics on the client side
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initPostHog, trackPageView } from '@/lib/monitoring/analytics';
import { initSentry, setUser } from '@/lib/monitoring/sentry';
import { useUser } from '@clerk/nextjs';

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

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

  // Set user context for Sentry and PostHog
  useEffect(() => {
    if (isLoaded && user) {
      // Set Sentry user context
      setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        tier: (user.publicMetadata?.tier as string) || 'free',
      });

      // Identify user in PostHog
      import('@/lib/monitoring/analytics').then(({ identifyUser }) => {
        identifyUser(user.id, {
          email: user.emailAddresses[0]?.emailAddress,
          tier: (user.publicMetadata?.tier as string) || 'free',
          createdAt: user.createdAt?.toISOString(),
        });
      });
    }
  }, [isLoaded, user]);

  return <>{children}</>;
}
