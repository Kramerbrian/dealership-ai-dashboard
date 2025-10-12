/**
 * Scoring Utilities
 * DealershipAI Command Center - VLI penalty multipliers and score adjustments
 */

export interface Issue {
  severity: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  description?: string;
  pillar?: 'precision' | 'consistency' | 'recency' | 'authenticity' | 'alignment';
}

/**
 * Calculate VLI (Visibility Loss Index) penalty multiplier
 *
 * Each issue adds a penalty based on severity:
 * - Severity 1 (low): +4% penalty
 * - Severity 2 (medium): +8% penalty
 * - Severity 3 (high): +12% penalty
 *
 * Formula: multiplier = 1 + Σ(severity × 0.04)
 *
 * Example:
 * ```typescript
 * const issues = [
 *   { severity: 3 }, // High: +12%
 *   { severity: 2 }, // Medium: +8%
 *   { severity: 1 }, // Low: +4%
 * ];
 * const multiplier = vliMultiplier(issues);
 * // = 1 + (3×0.04 + 2×0.04 + 1×0.04)
 * // = 1 + (0.12 + 0.08 + 0.04)
 * // = 1.24 (24% penalty)
 * ```
 *
 * @param issues - Array of issues with severity levels
 * @returns Penalty multiplier (≥1.0)
 */
export function vliMultiplier(issues: Issue[]): number {
  const penalty = issues.reduce((sum, issue) => sum + issue.severity * 0.04, 1);
  return Math.max(1, penalty);
}

/**
 * Apply VLI penalty to a score
 *
 * Reduces the score by the penalty multiplier:
 * ```
 * penalized_score = original_score / multiplier
 * ```
 *
 * Example:
 * ```typescript
 * const originalScore = 85;
 * const issues = [{ severity: 3 }, { severity: 2 }];
 * const penalized = applyVLIPenalty(originalScore, issues);
 * // = 85 / 1.20 = 70.83
 * ```
 *
 * @param score - Original score (0-100)
 * @param issues - Array of issues
 * @returns Penalized score (0-100)
 */
export function applyVLIPenalty(score: number, issues: Issue[]): number {
  const multiplier = vliMultiplier(issues);
  const penalized = score / multiplier;
  return Math.max(0, Math.min(100, penalized));
}

/**
 * Calculate ATI with VLI penalty applied
 *
 * Adjusts ATI score based on detected issues in the five pillars.
 *
 * @param baseATI - Base ATI score (0-100)
 * @param issues - Array of issues affecting trust signals
 * @returns Penalized ATI score
 */
export function calculatePenalizedATI(baseATI: number, issues: Issue[]): number {
  return applyVLIPenalty(baseATI, issues);
}

/**
 * Get severity level from percentage drop
 *
 * Maps a percentage drop to a severity level:
 * - 0-5%: Severity 1 (low)
 * - 5-15%: Severity 2 (medium)
 * - >15%: Severity 3 (high)
 *
 * @param percentDrop - Percentage drop (0-100)
 * @returns Severity level (1, 2, or 3)
 */
export function getSeverityFromDrop(percentDrop: number): 1 | 2 | 3 {
  if (percentDrop > 15) return 3;
  if (percentDrop > 5) return 2;
  return 1;
}

/**
 * Calculate penalty percentage from multiplier
 *
 * Converts a multiplier back to penalty percentage:
 * ```
 * penalty% = (multiplier - 1) × 100
 * ```
 *
 * Example: multiplier 1.24 → 24% penalty
 *
 * @param multiplier - VLI multiplier (≥1.0)
 * @returns Penalty percentage (0-100+)
 */
export function getPenaltyPercentage(multiplier: number): number {
  return Math.max(0, (multiplier - 1) * 100);
}

/**
 * Example: Calculate VLI penalty for common issues
 */
export function exampleVLIPenalty() {
  // Scenario: Dealership has NAP inconsistencies and stale content
  const issues: Issue[] = [
    {
      severity: 3,
      description: 'Phone number mismatch across 5+ platforms',
      pillar: 'precision',
    },
    {
      severity: 2,
      description: 'Business hours outdated (6 months old)',
      pillar: 'recency',
    },
    {
      severity: 1,
      description: 'Minor address formatting difference',
      pillar: 'consistency',
    },
  ];

  const baseATI = 85; // Good base score
  const multiplier = vliMultiplier(issues);
  const penalizedATI = calculatePenalizedATI(baseATI, issues);
  const penaltyPercent = getPenaltyPercentage(multiplier);

  return {
    baseATI,
    issues: issues.length,
    multiplier,
    penaltyPercent: penaltyPercent.toFixed(1),
    penalizedATI: penalizedATI.toFixed(1),
    impactPoints: (baseATI - penalizedATI).toFixed(1),
  };
}

// Example output:
// {
//   baseATI: 85,
//   issues: 3,
//   multiplier: 1.24,
//   penaltyPercent: "24.0",
//   penalizedATI: "68.5",
//   impactPoints: "16.5"
// }
