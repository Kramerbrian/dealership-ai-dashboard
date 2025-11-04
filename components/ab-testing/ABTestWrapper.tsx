'use client';

import { ReactNode, useEffect, useState } from 'react';
import { abTesting, TestConfig, TestVariant } from '@/lib/ab-testing/framework';

interface ABTestWrapperProps {
  testId: string;
  variants: TestVariant[];
  defaultVariant?: string;
  onVariantLoad?: (variantId: string) => void;
  children?: ReactNode;
}

/**
 * A/B Test Wrapper Component
 * Renders the appropriate variant based on test assignment
 */
export function ABTestWrapper({
  testId,
  variants,
  defaultVariant,
  onVariantLoad,
  children
}: ABTestWrapperProps) {
  const [variantId, setVariantId] = useState<string | null>(null);
  const [variant, setVariant] = useState<ReactNode | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Get assigned variant
    const assignedVariant = abTesting.getVariant(testId) || defaultVariant || variants[0]?.id;
    
    if (!assignedVariant) {
      console.warn(`No variant found for test ${testId}`);
      return;
    }

    // Find variant component
    const variantConfig = variants.find(v => v.id === assignedVariant);
    if (!variantConfig) {
      console.warn(`Variant ${assignedVariant} not found in variants list`);
      return;
    }

    setVariantId(assignedVariant);
    setVariant(variantConfig.component);
    
    // Callback
    if (onVariantLoad) {
      onVariantLoad(assignedVariant);
    }
  }, [testId, variants, defaultVariant, onVariantLoad]);

  if (!variant) {
    // Show default variant while loading
    return <>{variants[0]?.component || children}</>;
  }

  return <>{variant}</>;
}

/**
 * Hook to track conversions for A/B tests
 */
export function useABTestConversion(testId: string) {
  const trackConversion = (variantId: string, metadata?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    abTesting.trackConversion(testId, variantId, metadata);
  };

  return { trackConversion };
}

