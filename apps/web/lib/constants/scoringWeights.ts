// DealershipAI Scoring Weights Configuration
// Centralized constants for all dashboard scoring algorithms

export const SCORING_WEIGHTS = {
  // AIV (Algorithmic Visibility Index) Pillars
  AIV: {
    SEO: 0.25,
    AEO: 0.30,
    GEO: 0.25,
    UGC: 0.10,
    GEO_LOCAL: 0.05,
    TEMPORAL_WEIGHT: 1.0,
    ENTITY_CONFIDENCE: 1.0,
    CRAWL_BUDGET_MULTIPLIER: 1.0,
    INVENTORY_TRUTH_MULTIPLIER: 1.0
  },

  // ATI (Algorithmic Trust Index) Components
  ATI: {
    SCHEMA_CONSISTENCY: 0.25,
    REVIEW_LEGITIMACY: 0.25,
    TOPICAL_AUTHORITY: 0.25,
    SOURCE_CREDIBILITY: 0.25,
    SRV_MULTIPLIER: 1.0,
    FPS_MULTIPLIER: 1.0,
    HALLUCINATION_PENALTY: 0.0,
    FRAUD_GUARD: 1.0,
    LOCAL_ACCURACY_MULTIPLIER: 1.0
  },

  // Service/Parts/Body Shop Visibility
  SERVICE_VISIBILITY: {
    SEO: 0.40,
    AEO: 0.40,
    GEO: 0.20
  },

  // ITI (Inventory Truth Index) Components
  ITI: {
    SPEC_ACCURACY: 0.35,
    PRICE_FRESHNESS: 0.25,
    PHOTO_COMPLETENESS: 0.15,
    SCHEMA_VALIDITY: 0.15,
    DISCREPANCY_RATE: 0.10,
    TEMPORAL_WEIGHT: 1.0,
    VERIFICATION_CONFIDENCE: 0.9
  },

  // Used Acquisition Intelligence
  USED_ACQUISITION: {
    APPRAISAL_TO_SALES: 0.30,
    LOOK_TO_BOOK: 0.25,
    VIN_DISCIPLINE: 0.20,
    WHOLESALE_FALLOUT: 0.15,
    CONDITION_ROI: 0.10
  },

  // EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)
  EEAT: {
    EXPERIENCE: 0.30,
    EXPERTISE: 0.25,
    AUTHORITATIVENESS: 0.25,
    TRUSTWORTHINESS: 0.20
  }
} as const;

// Revenue Impact Multipliers
export const REVENUE_MULTIPLIERS = {
  PER_VIN_ITI_POINT: 500, // $500 per VIN per ITI point
  PER_SERVICE_VISIBILITY_POINT: 150, // $150 per service visibility point
  PER_AIV_POINT: 1000, // $1000 per AIV point
  PER_ATI_POINT: 800 // $800 per ATI point
} as const;

// Thresholds for alerts and status levels
export const THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  FAIR: 70,
  POOR: 60,
  CRITICAL: 50
} as const;

// Trend calculation periods
export const TREND_PERIODS = {
  SHORT_TERM: 7, // days
  MEDIUM_TERM: 30, // days
  LONG_TERM: 90 // days
} as const;

// Cache TTL settings
export const CACHE_TTL = {
  SCORES: 24 * 60 * 60, // 24 hours in seconds
  METRICS: 4 * 60 * 60, // 4 hours in seconds
  PREDICTIONS: 12 * 60 * 60, // 12 hours in seconds
  REAL_TIME: 5 * 60 // 5 minutes in seconds
} as const;

// Department types
export const DEPARTMENTS = {
  SALES: 'sales',
  SERVICE: 'service',
  PARTS: 'parts',
  BODY_SHOP: 'body_shop',
  USED_ACQUISITION: 'used_acquisition',
  TRUST: 'trust'
} as const;

// Signal types
export const SIGNAL_TYPES = {
  SEO: 'seo',
  AEO: 'aeo',
  GEO: 'geo',
  UGC: 'ugc',
  ATI: 'ati',
  EEAT: 'eeat',
  ITI: 'iti',
  ACP: 'acp'
} as const;

// Source systems
export const SOURCE_SYSTEMS = {
  GSC: 'gsc',
  LIGHTHOUSE: 'lighthouse',
  CHATGPT: 'chatgpt',
  PERPLEXITY: 'perplexity',
  GEMINI: 'gemini',
  GMB: 'gmb',
  YELP: 'yelp',
  DMS: 'dms',
  WEBSITE: 'website',
  SYNDICATION: 'syndication',
  OEM: 'oem',
  MANUAL: 'manual'
} as const;

// Transaction types for ACP
export const ACP_TRANSACTION_TYPES = {
  TRADE_IN: 'trade_in',
  PARTS_PURCHASE: 'parts_purchase',
  SERVICE_DEPOSIT: 'service_deposit',
  INSTANT_CHECKOUT: 'instant_checkout'
} as const;

// Status levels
export const STATUS_LEVELS = {
  SAFE: 'safe',
  WARN: 'warn',
  CRITICAL: 'critical'
} as const;

// Trend directions
export const TREND_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable'
} as const;

export type ScoringWeights = typeof SCORING_WEIGHTS;
export type RevenueMultipliers = typeof REVENUE_MULTIPLIERS;
export type Thresholds = typeof THRESHOLDS;
export type TrendPeriods = typeof TREND_PERIODS;
export type CacheTTL = typeof CACHE_TTL;
export type Departments = typeof DEPARTMENTS;
export type SignalTypes = typeof SIGNAL_TYPES;
export type SourceSystems = typeof SOURCE_SYSTEMS;
export type ACPTransactionTypes = typeof ACP_TRANSACTION_TYPES;
export type StatusLevels = typeof STATUS_LEVELS;
export type TrendDirections = typeof TREND_DIRECTIONS;
