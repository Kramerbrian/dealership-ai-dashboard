/**
 * A/B Testing React Hooks
 * 
 * Integrates A/B testing service with React components
 */

'use client';

import { useState, useEffect } from 'react';
import { ABTestingService } from './services/ABTestingService';

const abTestingService = ABTestingService.getInstance();

interface ABTestResult {
  variant: string;
  testId: string;
  userId: string;
}

/**
 * Hook for A/B testing
 */
export function useABTest(
  testId: string,
  userId?: string
): {
  variant: string | null;
  isLoading: boolean;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
} {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const test = abTestingService.getTest(testId);
    if (test && test.status === 'running') {
      const assignedVariant = abTestingService.getVariantForUser(testId, userId);
      setVariant(assignedVariant?.id || null);
    }

    setIsLoading(false);
  }, [testId, userId]);

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    if (!userId || !variant) return;

    const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
    abTestingService.trackEvent(testId, variant, userId, sessionId, event, properties || {});
  };

  return {
    variant,
    isLoading,
    trackEvent,
  };
}

/**
 * Hook for conditional rendering based on A/B test
 */
export function useABTestVariant(
  testId: string,
  userId?: string
): {
  isVariantA: boolean;
  isVariantB: boolean;
  variant: string | null;
} {
  const { variant } = useABTest(testId, userId);

  return {
    isVariantA: variant === 'A' || variant === 'control',
    isVariantB: variant === 'B',
    variant,
  };
}

