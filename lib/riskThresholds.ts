// PIQR cutoffs (hard-fail & dilution)
export const PIQR = {
  minPhotosWarn: 5,             // < 5 = auto-fail
  idealPhotosMin: 20, 
  idealPhotosMax: 30,
  dilutionPhotos: 60,           // >60 = dilution penalty
  firstImageDisallow: ['logo', 'placeholder', 'rear-angle', 'stock'],
  require: { 
    vin: true, 
    price: true, 
    mileage: true, 
    schemaOffer: true 
  },
} as const;

// Hallucination Risk Penalty (blocks replies above threshold)
export const HRP = { 
  blockReviewReplyAbove: 0.5 
} as const;

// Red banner threshold
export const RED = { 
  hrp: HRP.blockReviewReplyAbove 
} as const;

// Revenue-at-Risk default coefficients
export const OCI = { 
  convDeltaToUSD: 1.0 
} as const;

// Used Acquisition KPIs
export const USED_ACQ = {
  appraisalToSalesTarget: 0.25,    // 25% target
  tradeCaptureTarget: 0.30,        // 30% target
  wholesaleFallbackThreshold: 0.15 // 15% minimum
} as const;

// AEMD Financial Weighting
export const AEMD_WEIGHTS = {
  featuredSnippets: 0.40,
  aioCitations: 0.35,
  paaOwnership: 0.25
} as const;

// AI Volatility Thresholds
export const V_AI = {
  stableThreshold: 0.10,      // <10% = stable
  warningThreshold: 0.20,     // 10-20% = warning
  criticalThreshold: 0.30     // >30% = critical
} as const;