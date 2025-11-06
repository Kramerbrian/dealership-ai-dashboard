export const KPI = {
  // Core Clarity Metrics
  CLARITY: 'clarity_score',
  AIV: 'ai_mention_rate',
  OEL: 'opportunity_efficiency_loss',
  TRUST: 'trust_score',

  // Technical Health
  SEARCH_HEALTH: 'search_health_score',
  ZERO_CLICK: 'zero_click_coverage',
  SCHEMA: 'schema_coverage',
  CWV: 'core_web_vitals_score',

  // Trust Signals
  GEO: 'geo_integrity',
  UGC: 'review_trust_score',
  NAP: 'business_identity_match_score',

  // Business Impact
  RAR: 'revenue_at_risk',
  DTRI: 'digital_trust_revenue_index',
  FRESHNESS: 'freshness_score',
} as const;

export const KPI_LABELS: Record<string, string> = {
  [KPI.CLARITY]: 'Clarity Score',
  [KPI.AIV]: 'AI Mention Rate',
  [KPI.OEL]: 'Opportunity Efficiency Loss',
  [KPI.TRUST]: 'Trust Score',
  [KPI.SEARCH_HEALTH]: 'Search Health',
  [KPI.ZERO_CLICK]: 'Zero-Click Coverage',
  [KPI.SCHEMA]: 'Schema Coverage',
  [KPI.CWV]: 'Core Web Vitals',
  [KPI.GEO]: 'GEO Integrity',
  [KPI.UGC]: 'Review Trust',
  [KPI.NAP]: 'Business Identity Match',
  [KPI.RAR]: 'Revenue at Risk',
  [KPI.DTRI]: 'Digital Trust Revenue Index',
  [KPI.FRESHNESS]: 'Freshness Score',
};
