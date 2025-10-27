/**
 * Zero-Click Rate Math Utilities
 * Core calculations for ZCR, ZCCO, and AIRI
 */

export const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

export function calcZCR(clicks: number, impressions: number) {
  if (impressions <= 0) return { ctrActual: 0, zcr: 0 };
  const ctr = clicks / impressions;
  return { ctrActual: ctr, zcr: clamp(1 - ctr) };
}

export function calcZCCO(gbpActions: number, gbpImpressions: number) {
  if (gbpImpressions <= 0) return 0;
  return clamp(gbpActions / gbpImpressions);
}

export function calcAIRI(aiPresenceRate: number, ctrBaseline: number, ctrActual: number) {
  const delta = Math.max(0, (ctrBaseline || 0) - (ctrActual || 0));
  return clamp((aiPresenceRate || 0) * delta);
}

export function adjustedZeroClick(zcr: number, zcco: number) {
  return clamp(zcr - zcco);
}

