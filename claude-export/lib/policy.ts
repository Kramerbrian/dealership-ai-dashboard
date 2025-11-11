/**
 * DealershipAI Policy Constants
 * Thresholds and configuration for Sentinel governance system
 */

export const THRESH = {
  // Vehicle Listing Integrity
  VLI_MIN: 85,            // integrity %
  
  // Algorithmic Trust Index
  ATI_DROP_7D: 10,        // points drop in 7 days
  
  // AI Visibility Index
  AIV_FLAT_WEEKS: 3,      // weeks of flat growth
  
  // Hallucination Risk Penalty
  HRP_WARN: 0.35,         // warning threshold
  HRP_CRIT: 0.50,         // critical threshold
  
  // Review Crisis Detection
  REVIEW_CRISIS_RATE: 0.15, // 15% negative review spike
  
  // Economic Time-Sensitive Metrics
  ECON_TSM_THRESHOLD: 0.20, // 20% revenue impact
} as const;

export const SENTINEL_KINDS = {
  REVIEW_CRISIS: 'REVIEW_CRISIS',
  VLI_DEGRADE: 'VLI_DEGRADE', 
  ATI_DROP: 'ATI_DROP',
  AIV_STALL: 'AIV_STALL',
  ECON_TSM: 'ECON_TSM',
  HRP_CRIT: 'HRP_CRIT',
  HRP_WARN: 'HRP_WARN',
} as const;

export const SENTINEL_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning', 
  INFO: 'info',
} as const;

export const REGIME_STATES = {
  NORMAL: 'Normal',
  SHIFT_DETECTED: 'ShiftDetected',
  QUARANTINE: 'Quarantine',
} as const;

export type SentinelKind = typeof SENTINEL_KINDS[keyof typeof SENTINEL_KINDS];
export type SentinelSeverity = typeof SENTINEL_SEVERITY[keyof typeof SENTINEL_SEVERITY];
export type RegimeState = typeof REGIME_STATES[keyof typeof REGIME_STATES];