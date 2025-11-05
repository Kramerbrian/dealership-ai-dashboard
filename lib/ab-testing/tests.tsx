'use client';

import React from 'react';
import { abTesting, TestConfig, TestVariant } from './framework';

/**
 * A/B Test Configurations
 * Define all active tests here
 */

// Headline Test Variants
export const headlineVariants: TestVariant[] = [
  {
    id: 'headline-control',
    name: 'Control',
    component: (
      <>
        Stop Being Invisible<br />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          to AI Car Shoppers
        </span>
      </>
    ),
    weight: 50
  },
  {
    id: 'headline-benefit',
    name: 'Benefit-Focused',
    component: (
      <>
        Win More Car Sales<br />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          from AI-Powered Recommendations
        </span>
      </>
    ),
    weight: 50
  },
  {
    id: 'headline-urgency',
    name: 'Urgency-Focused',
    component: (
      <>
        Your Competitors Are Winning<br />
        <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          AI Car Shoppers (And You're Not)
        </span>
      </>
    ),
    weight: 0 // Disabled by default, can enable later
  }
];

// CTA Button Test Variants
export const ctaButtonVariants: TestVariant[] = [
  {
    id: 'cta-control',
    name: 'Control - "Analyze Free"',
    component: 'Analyze Free',
    weight: 50
  },
  {
    id: 'cta-value',
    name: 'Value-Focused',
    component: 'Get Your AI Score',
    weight: 50
  },
  {
    id: 'cta-urgency',
    name: 'Urgency-Focused',
    component: 'Check Your Visibility Now',
    weight: 0 // Disabled by default
  }
];

// Subheadline Test Variants
export const subheadlineVariants: TestVariant[] = [
  {
    id: 'subheadline-control',
    name: 'Control',
    component: (
      <>
        ChatGPT, Gemini, Perplexity, and Google AI Overviews are recommending your competitors.
        <span className="block mt-2 text-blue-600 font-semibold">Find out why in 30 seconds (no signup required)</span>
      </>
    ),
    weight: 50
  },
  {
    id: 'subheadline-stat',
    name: 'Stat-Focused',
    component: (
      <>
        67% of car shoppers start with AI assistants. Are they finding you?
        <span className="block mt-2 text-blue-600 font-semibold">Get your free AI visibility score in 30 seconds</span>
      </>
    ),
    weight: 50
  }
];

/**
 * Register all active tests
 */
export function initializeABTests() {
  // Headline Test
  abTesting.registerTest({
    id: 'headline-test',
    name: 'Headline Variations',
    description: 'Test different headline messaging to optimize conversion',
    variants: headlineVariants,
    active: true,
    startDate: new Date(),
    minSampleSize: 200,
    confidenceLevel: 0.95
  });

  // CTA Button Test
  abTesting.registerTest({
    id: 'cta-button-test',
    name: 'CTA Button Text',
    description: 'Test different CTA button text variations',
    variants: ctaButtonVariants,
    active: true,
    startDate: new Date(),
    minSampleSize: 300,
    confidenceLevel: 0.95
  });

  // Subheadline Test
  abTesting.registerTest({
    id: 'subheadline-test',
    name: 'Subheadline Variations',
    description: 'Test different subheadline messaging',
    variants: subheadlineVariants,
    active: true,
    startDate: new Date(),
    minSampleSize: 200,
    confidenceLevel: 0.95
  });
}

/**
 * Helper to get headline variant as string (for non-React components)
 */
export function getHeadlineVariant(testId: string = 'headline-test'): string {
  const variantId = abTesting.getVariant(testId);
  const variant = headlineVariants.find(v => v.id === variantId);
  if (variant && typeof variant.component === 'string') {
    return variant.component;
  }
  return headlineVariants[0].component as string;
}

