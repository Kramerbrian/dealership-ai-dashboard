/**
 * ATI (Algorithmic Trust Index) Calculator
 * Five-pillar trust measurement system for DealershipAI Command Center
 */

import { ATI_WEIGHTS, ATI_PILLAR_DESCRIPTIONS } from './constants';

export interface ATIPillars {
  precision: number;      // Data accuracy (0-100)
  consistency: number;    // Cross-channel parity (0-100)
  recency: number;        // Freshness/latency (0-100)
  authenticity: number;   // Review/backlink credibility (0-100)
  alignment: number;      // Query/task match (0-100)
}

export interface ATIResult extends ATIPillars {
  ati: number;            // Composite score (0-100)
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
}

/**
 * Calculate composite ATI score from five pillars
 */
export function calculateATI(pillars: ATIPillars): number {
  const score =
    pillars.precision * ATI_WEIGHTS.precision +
    pillars.consistency * ATI_WEIGHTS.consistency +
    pillars.recency * ATI_WEIGHTS.recency +
    pillars.authenticity * ATI_WEIGHTS.authenticity +
    pillars.alignment * ATI_WEIGHTS.alignment;

  // Cap at 100 (though mathematically should not exceed)
  return Math.min(100, score);
}

/**
 * Grade ATI score
 */
export function gradeATI(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}

/**
 * Generate recommendation based on ATI score and pillars
 */
export function getATIRecommendation(pillars: ATIPillars, score: number): string {
  const grade = gradeATI(score);

  // Find weakest pillar
  const weakestPillar = Object.entries(pillars).reduce((min, [key, value]) =>
    value < min.value ? { key, value } : min,
    { key: 'precision', value: 100 }
  );

  const pillarName = weakestPillar.key as keyof typeof ATI_PILLAR_DESCRIPTIONS;
  const pillarDesc = ATI_PILLAR_DESCRIPTIONS[pillarName];

  switch (grade) {
    case 'excellent':
      return `Excellent algorithmic trust! Maintain consistency across all pillars. Monitor for drift in ${pillarName} (currently ${weakestPillar.value.toFixed(1)}%).`;

    case 'good':
      return `Good trust signals. Focus on improving ${pillarName} (${weakestPillar.value.toFixed(1)}%) to reach excellent tier. ${pillarDesc}.`;

    case 'fair':
      return `Fair trust. Urgent: improve ${pillarName} (${weakestPillar.value.toFixed(1)}%). ${pillarDesc}. This is impacting your AI visibility.`;

    case 'poor':
      return `Critical trust issues. Immediate action required on ${pillarName} (${weakestPillar.value.toFixed(1)}%). ${pillarDesc}. Sentinel should trigger SOW.`;
  }
}

/**
 * Calculate complete ATI result with grade and recommendation
 */
export function calculateATIResult(pillars: ATIPillars): ATIResult {
  const ati = calculateATI(pillars);
  const grade = gradeATI(ati);
  const recommendation = getATIRecommendation(pillars, ati);

  return {
    ...pillars,
    ati,
    grade,
    recommendation,
  };
}

/**
 * Calculate CRS (Composite Reputation Score) - Bayesian fusion of AIV and ATI
 * Formula: CRS = (AIV * w_aiv + ATI * w_ati) where weights sum to 1.0
 */
export function calculateCRS(
  aiv: number,
  ati: number,
  weights = { aiv: 0.6, ati: 0.4 }
): number {
  const crs = aiv * weights.aiv + ati * weights.ati;
  return Math.min(100, Math.max(0, crs));
}

/**
 * Example ATI calculation for testing
 */
export function exampleATICalculation(): ATIResult {
  const pillars: ATIPillars = {
    precision: 92,      // Excellent data accuracy
    consistency: 88,    // Good cross-channel parity
    recency: 75,        // Fair freshness (data updated weekly)
    authenticity: 85,   // Good review credibility
    alignment: 90,      // Excellent query matching
  };

  return calculateATIResult(pillars);
}

/**
 * Validate ATI pillars are within range
 */
export function validateATIPillars(pillars: ATIPillars): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  Object.entries(pillars).forEach(([key, value]) => {
    if (typeof value !== 'number') {
      errors.push(`${key} must be a number`);
    } else if (value < 0 || value > 100) {
      errors.push(`${key} must be between 0 and 100 (got ${value})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate pillar contribution to overall ATI
 */
export function getPillarContributions(pillars: ATIPillars): Record<
  keyof ATIPillars,
  number
> {
  return {
    precision: pillars.precision * ATI_WEIGHTS.precision,
    consistency: pillars.consistency * ATI_WEIGHTS.consistency,
    recency: pillars.recency * ATI_WEIGHTS.recency,
    authenticity: pillars.authenticity * ATI_WEIGHTS.authenticity,
    alignment: pillars.alignment * ATI_WEIGHTS.alignment,
  };
}
