// @ts-nocheck
/**
 * A/B Testing Utilities for DealershipAI
 * Simple localStorage-based A/B testing
 */

export interface ABTest {
  name: string;
  variants: string[];
  weights?: number[];
}

export interface TestResult {
  variant: string;
  testName: string;
}

/**
 * Get or assign A/B test variant
 */
export function getABTest(testName: string, variants: string[], weights?: number[]): string {
  if (typeof window === 'undefined') return variants[0];
  
  const key = `ab_test_${testName}`;
  const stored = localStorage.getItem(key);
  
  if (stored) return stored;
  
  // Assign variant based on weights or equal distribution
  let variant: string;
  if (weights && weights.length === variants.length) {
    const total = weights.reduce((a, b) => a + b, 0);
    const random = Math.random() * total;
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        variant = variants[i];
        break;
      }
    }
    variant = variant || variants[0];
  } else {
    variant = variants[Math.floor(Math.random() * variants.length)];
  }
  
  localStorage.setItem(key, variant);
  return variant;
}

/**
 * Predefined A/B tests
 */
export const AB_TESTS = {
  HERO_HEADLINE: {
    name: 'hero_headline',
    variants: [
      'See What AI Says About Your Dealership',
      'Discover Your AI Visibility Score in 60 Seconds',
      'The Algorithmic Trust Dashboard for Dealerships'
    ],
    weights: [33, 33, 34]
  },
  PRIMARY_CTA: {
    name: 'primary_cta',
    variants: [
      'Run Free Audit',
      'Start Your Free Audit',
      'Get Instant AI Visibility Score'
    ]
  },
  AUDIT_BUTTON: {
    name: 'audit_button',
    variants: [
      'Analyze My Dealership',
      'Check AI Visibility',
      'Run 60-Second Audit'
    ]
  }
};

/**
 * Get variant for a specific test
 */
export function useABTest(testKey: keyof typeof AB_TESTS): string {
  const test = AB_TESTS[testKey];
  return getABTest(test.name, test.variants, (test as any).weights);
}
