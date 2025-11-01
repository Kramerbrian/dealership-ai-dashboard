import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { track, identify, setUserProperties } from '@/lib/analytics/mixpanel';

/**
 * Analytics hook for tracking user events
 */
export function useAnalytics() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Identify user in Mixpanel
      identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        createdAt: user.createdAt,
      });
    }
  }, [user, isLoaded]);

  return {
    track,
    identify: (userId: string, properties?: Record<string, any>) => identify(userId, properties),
    setUserProperties,
  };
}
