/**
 * Zero-Click Math Utilities
 * 
 * Core calculations for ZCR, AIRI, ZCCO, and Adjusted Zero-Click
 */

export const clamp = (x: number, lo: number = 0, hi: number = 1): number => {
  return Math.max(lo, Math.min(hi, x));
};

/**
 * Calculate Zero-Click Rate (ZCR) from GSC data
 * ZCR = 1 - (Clicks / Impressions)
 */
export function calcZCR(clicks: number, impressions: number): {
  ctrActual: number;
  zcr: number;
} {
  if (impressions <= 0) {
    return { ctrActual: 0, zcr: 0 };
  }
  
  const ctr = clicks / impressions;
  return {
    ctrActual: ctr,
    zcr: clamp(1 - ctr)
  };
}

/**
 * Calculate Zero-Click Conversion Offset (ZCCO) from GBP actions
 * ZCCO = GBP Actions / GBP Impressions
 */
export function calcZCCO(gbpActions: number, gbpImpressions: number): number {
  if (gbpImpressions <= 0) {
    return 0;
  }
  
  return clamp(gbpActions / gbpImpressions);
}

/**
 * Calculate AI Replacement Index (AIRI)
 * AIRI = AI Presence Rate × max(0, CTR_baseline - CTR_actual)
 */
export function calcAIRI(
  aiPresenceRate: number,
  ctrBaseline: number,
  ctrActual: number
): number {
  const delta = Math.max(0, (ctrBaseline || 0) - (ctrActual || 0));
  return clamp((aiPresenceRate || 0) * delta);
}

/**
 * Calculate Adjusted Zero-Click percentage
 * Adjusted = ZCR - ZCCO (prevents double-counting when GBP absorbs demand)
 */
export function adjustedZeroClick(zcr: number, zcco: number): number {
  return clamp(zcr - zcco);
}
