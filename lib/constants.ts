/**
 * Constants for DealershipAI Command Center
 * ATI Weights, thresholds, and configuration
 */

/**
 * ATI (Algorithmic Trust Index) Five-Pillar Weights
 * Must sum to 1.0 (100%)
 */
export const ATI_WEIGHTS = {
  precision: 0.30,    // Data accuracy (highest weight)
  consistency: 0.25,  // Cross-channel parity
  recency: 0.20,      // Freshness/latency
  authenticity: 0.15, // Review/backlink credibility
  alignment: 0.10,    // Query/task match
} as const;

/**
 * ATI Pillar Descriptions
 */
export const ATI_PILLAR_DESCRIPTIONS = {
  precision: 'Data accuracy - correctness of business information across platforms',
  consistency: 'Cross-channel parity - alignment of NAP and key data across all channels',
  recency: 'Freshness - how up-to-date your information is (hours/days since last update)',
  authenticity: 'Credibility - quality and authenticity of reviews, backlinks, and citations',
  alignment: 'Search intent matching - how well your content aligns with target queries',
} as const;

/**
 * ATI Scoring Thresholds
 */
export const ATI_THRESHOLDS = {
  excellent: 90, // 90-100: Excellent algorithmic trust
  good: 75,      // 75-89: Good trust signals
  fair: 60,      // 60-74: Fair, needs improvement
  poor: 60,      // <60: Poor trust signals, urgent action needed
} as const;

/**
 * DTRI (Digital Trust & Reputation Index) Thresholds
 */
export const DTRI_THRESHOLDS = {
  excellent: 80,
  good: 65,
  fair: 50,
  poor: 50,
} as const;

/**
 * Sentinel Monitoring Thresholds
 */
export const SENTINEL_THRESHOLDS = {
  reviewResponseTime: 4, // hours
  vdpLCP: 3,            // seconds
  economicTSM: 1.4,     // ratio
  competitiveDTRI: 10,  // point delta
} as const;

/**
 * Geographic Pooling Configuration
 */
export const GEO_POOLING = {
  cacheTTL: 86400,        // 24 hours in seconds
  costPerQuery: 0.0125,   // $0.0125 per pooled query
  costSavings: 50,        // 50x reduction
} as const;

/**
 * Tier Configuration
 */
export const TIERS = {
  testDrive: {
    name: 'Test Drive',
    price: 0,
    sessions: 100,
    description: 'All the AI visibility, none of the commitment',
  },
  intelligence: {
    name: 'Intelligence',
    price: 499,
    sessions: 10000,
    description: "Because 'amateur hour' is what your competitors are doing",
  },
  bossMode: {
    name: 'Boss Mode',
    price: 999,
    sessions: 50000,
    description: 'This is the good timeline',
  },
} as const;
