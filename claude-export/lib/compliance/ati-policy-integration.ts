/**
 * ATI + Google Policy Compliance Integration
 *
 * Extends the ATI (Algorithmic Trust Index) calculator to incorporate
 * Google Ads pricing policy violations into:
 *
 * 1. Consistency Pillar (25% weight) - Price parity, offer integrity
 * 2. Precision Pillar (30% weight) - Disclosure accuracy, fee transparency
 *
 * Usage:
 *   const enhancedPillars = applyPolicyPenalties(basePillars, policyResult);
 *   const ati = calculateATI(enhancedPillars);
 */

import type { ATIPillars } from '../ati-calculator';
import type { DishonestPricingResult } from './google-pricing-policy';

// ============================================================================
// POLICY PENALTY WEIGHTS
// ============================================================================

const POLICY_WEIGHTS = {
  // Consistency pillar (25% of ATI)
  offerIntegrity: 0.40,        // Jaccard similarity violations → 40% of consistency penalty
  priceParity: 0.60,           // Cross-channel price mismatches → 60% of consistency penalty

  // Precision pillar (30% of ATI)
  disclosureAccuracy: 0.70,    // Missing/insufficient disclosures → 70% of precision penalty
  feeTransparency: 0.30,       // Hidden fees → 30% of precision penalty
} as const;

// ============================================================================
// APPLY POLICY PENALTIES TO ATI PILLARS
// ============================================================================

/**
 * Apply Google Ads policy violations to ATI pillars
 *
 * @param basePillars - Original ATI pillars before policy adjustments
 * @param policyResult - Google pricing policy scan result
 * @returns Adjusted ATI pillars with policy penalties applied
 */
export function applyPolicyPenalties(
  basePillars: ATIPillars,
  policyResult: DishonestPricingResult
): ATIPillars {
  const adjusted = { ...basePillars };

  // ============================================================================
  // CONSISTENCY PILLAR PENALTIES
  // ============================================================================

  let consistencyPenalty = 0;

  // Penalty 1: Offer Integrity (Jaccard similarity)
  // Jaccard < 0.3 = critical (15 pts), 0.3-0.5 = warning (5 pts)
  const jaccard = policyResult.breakdown.jaccard;
  if (jaccard < 0.3) {
    consistencyPenalty += 15 * POLICY_WEIGHTS.offerIntegrity;
  } else if (jaccard < 0.5) {
    consistencyPenalty += 5 * POLICY_WEIGHTS.offerIntegrity;
  }

  // Penalty 2: Price Parity (cross-channel price mismatches)
  if (policyResult.breakdown.priceMismatch) {
    // Critical violations (from scanDishonestPricing) already calculated penalty
    consistencyPenalty += policyResult.atiImpact.consistencyPenalty * POLICY_WEIGHTS.priceParity;
  }

  // Apply consistency penalty (cap at 25 points = full pillar weight)
  adjusted.consistency = Math.max(0, basePillars.consistency - Math.min(25, consistencyPenalty));

  // ============================================================================
  // PRECISION PILLAR PENALTIES
  // ============================================================================

  let precisionPenalty = 0;

  // Penalty 1: Disclosure Accuracy
  // Score < 70 = critical (10 pts), 70-85 = warning (3 pts)
  const disclosureScore = policyResult.breakdown.disclosureClarity;
  if (disclosureScore < 70) {
    precisionPenalty += 10 * POLICY_WEIGHTS.disclosureAccuracy;
  } else if (disclosureScore < 85) {
    precisionPenalty += 3 * POLICY_WEIGHTS.disclosureAccuracy;
  }

  // Penalty 2: Fee Transparency
  if (policyResult.breakdown.hiddenFees) {
    precisionPenalty += 15 * POLICY_WEIGHTS.feeTransparency;
  }

  // Apply precision penalty (cap at 30 points = full pillar weight)
  adjusted.precision = Math.max(0, basePillars.precision - Math.min(30, precisionPenalty));

  return adjusted;
}

// ============================================================================
// CALCULATE POLICY COMPLIANCE SCORE (0-100)
// ============================================================================

/**
 * Convert policy risk score (0-100, higher = worse) to compliance score (0-100, higher = better)
 */
export function calculatePolicyComplianceScore(
  policyResult: DishonestPricingResult
): number {
  return Math.max(0, 100 - policyResult.riskScore);
}

// ============================================================================
// POLICY IMPACT SUMMARY
// ============================================================================

export interface PolicyImpactSummary {
  originalATI: number;
  adjustedATI: number;
  totalPenalty: number;
  breakdown: {
    consistencyLost: number;
    precisionLost: number;
  };
  recommendations: string[];
}

/**
 * Calculate full impact of policy violations on ATI
 *
 * @param basePillars - Original ATI pillars
 * @param policyResult - Google pricing policy result
 * @returns Detailed impact summary
 */
export function calculatePolicyImpact(
  basePillars: ATIPillars,
  policyResult: DishonestPricingResult
): PolicyImpactSummary {
  const adjustedPillars = applyPolicyPenalties(basePillars, policyResult);

  const consistencyLost = basePillars.consistency - adjustedPillars.consistency;
  const precisionLost = basePillars.precision - adjustedPillars.precision;
  const totalPenalty = consistencyLost + precisionLost;

  // Calculate ATI scores
  const originalATI = calculateATIFromPillars(basePillars);
  const adjustedATI = calculateATIFromPillars(adjustedPillars);

  // Generate recommendations
  const recommendations: string[] = [];

  if (policyResult.breakdown.jaccard < 0.5) {
    recommendations.push(
      `Improve offer consistency between ad and landing page (current: ${(policyResult.breakdown.jaccard * 100).toFixed(0)}%, target: >50%)`
    );
  }

  if (policyResult.breakdown.priceMismatch) {
    recommendations.push('Ensure exact price matching across all channels (ad, LP, VDP)');
  }

  if (policyResult.breakdown.disclosureClarity < 85) {
    recommendations.push(
      `Enhance disclosure quality (current: ${policyResult.breakdown.disclosureClarity.toFixed(0)}/100, target: >85)`
    );
  }

  if (policyResult.breakdown.hiddenFees) {
    recommendations.push('Disclose all fees prominently in ad copy and landing page');
  }

  if (!policyResult.compliant) {
    recommendations.push(
      `Critical: Resolve ${policyResult.violations.filter(v => v.type === 'critical').length} critical violations immediately`
    );
  }

  return {
    originalATI,
    adjustedATI,
    totalPenalty,
    breakdown: {
      consistencyLost,
      precisionLost,
    },
    recommendations,
  };
}

// ============================================================================
// HELPER: CALCULATE ATI FROM PILLARS
// ============================================================================

/**
 * Internal ATI calculation (mirrors lib/ati-calculator.ts)
 * Uses standard ATI weights: precision 30%, consistency 25%, recency 20%, authenticity 15%, alignment 10%
 */
function calculateATIFromPillars(pillars: ATIPillars): number {
  const ATI_WEIGHTS = {
    precision: 0.30,
    consistency: 0.25,
    recency: 0.20,
    authenticity: 0.15,
    alignment: 0.10,
  };

  const score =
    pillars.precision * ATI_WEIGHTS.precision +
    pillars.consistency * ATI_WEIGHTS.consistency +
    pillars.recency * ATI_WEIGHTS.recency +
    pillars.authenticity * ATI_WEIGHTS.authenticity +
    pillars.alignment * ATI_WEIGHTS.alignment;

  return Math.min(100, score);
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Apply policy penalties to ATI calculation
 */
export function examplePolicyATIIntegration() {
  // Base ATI pillars (before policy check)
  const basePillars: ATIPillars = {
    precision: 92,
    consistency: 88,
    recency: 75,
    authenticity: 85,
    alignment: 90,
  };

  // Simulated policy result
  const policyResult: DishonestPricingResult = {
    compliant: false,
    riskScore: 45,
    violations: [
      {
        type: 'critical',
        rule: 'Price Consistency',
        description: 'Ad price $299/mo vs VDP price $349/mo',
        affectedChannels: ['ad', 'vdp'],
        recommendation: 'Update ad copy to match VDP pricing',
      },
      {
        type: 'warning',
        rule: 'Disclosure Requirements',
        description: 'Missing APR disclosure for payment offer',
        affectedChannels: ['ad', 'landing_page'],
        recommendation: 'Add APR, term, and down payment to disclosures',
      },
    ],
    breakdown: {
      jaccard: 0.42,
      priceMismatch: true,
      hiddenFees: false,
      disclosureClarity: 68,
    },
    atiImpact: {
      consistencyPenalty: 15,
      precisionPenalty: 10,
    },
  };

  // Calculate impact
  const impact = calculatePolicyImpact(basePillars, policyResult);

  console.log('=== Policy Impact on ATI ===');
  console.log(`Original ATI: ${impact.originalATI.toFixed(1)}`);
  console.log(`Adjusted ATI: ${impact.adjustedATI.toFixed(1)}`);
  console.log(`Total Penalty: -${impact.totalPenalty.toFixed(1)} points`);
  console.log(`  - Consistency: -${impact.breakdown.consistencyLost.toFixed(1)}`);
  console.log(`  - Precision: -${impact.breakdown.precisionLost.toFixed(1)}`);
  console.log('\nRecommendations:');
  impact.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));

  return impact;
}
