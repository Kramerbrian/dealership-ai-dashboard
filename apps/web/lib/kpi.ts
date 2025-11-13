export const KPI = {
  SEARCH_HEALTH: 'search_health_score',
  ZERO_CLICK: 'zero_click_coverage',
  GEO_INTEGRITY: 'geo_integrity',
  REVIEW_TRUST: 'review_trust_score',
  RISK_ADJ_IMPACT: 'risk_adjusted_impact_score',
  AI_MENTION_RATE: 'ai_mention_rate',
  TRUST: 'trust_score',
  REVENUE_AT_RISK: 'revenue_at_risk',
  QUALITY_AUTHORITY: 'quality_authority_index',
  BI_MATCH: 'business_identity_match_score',
  CORE_WEB_VITALS: 'core_web_vitals_score',
  MYSTERY_SHOP: 'mystery_shop_score',
  DTRI: 'digital_trust_revenue_index',
  FRESHNESS: 'freshness_score',
  SCHEMA_COVERAGE: 'schema_coverage',
  CLARITY: 'clarity_score',
  // NEW
  OPPORTUNITY_EFFICIENCY_LOSS: 'opportunity_efficiency_loss', // OEL
} as const;

export type KpiKey = typeof KPI[keyof typeof KPI];

export const KPI_LABEL: Record<KpiKey, string> = {
  [KPI.SEARCH_HEALTH]: 'Search Health Score',
  [KPI.ZERO_CLICK]: 'Zero-Click Coverage',
  [KPI.GEO_INTEGRITY]: 'GEO Integrity',
  [KPI.REVIEW_TRUST]: 'Review Trust Score',
  [KPI.RISK_ADJ_IMPACT]: 'Risk-Adjusted Impact Score',
  [KPI.AI_MENTION_RATE]: 'AI Mention Rate',
  [KPI.TRUST]: 'Trust Score',
  [KPI.REVENUE_AT_RISK]: 'Revenue at Risk',
  [KPI.QUALITY_AUTHORITY]: 'Quality Authority Index',
  [KPI.BI_MATCH]: 'Business Identity Match Score',
  [KPI.CORE_WEB_VITALS]: 'Core Web Vitals Score',
  [KPI.MYSTERY_SHOP]: 'Mystery Shop Score',
  [KPI.DTRI]: 'Digital Trust Revenue Index',
  [KPI.FRESHNESS]: 'Freshness Score',
  [KPI.SCHEMA_COVERAGE]: 'Schema Coverage',
  [KPI.CLARITY]: 'Clarity Score',
  // NEW
  [KPI.OPPORTUNITY_EFFICIENCY_LOSS]: 'Opportunity Efficiency Loss (OEL)',
};

// Alias for compatibility
export const KPI_DISPLAY_NAMES = KPI_LABEL;

// Acronym to KPI mapping for voice commands
export const ACRONYM_TO_KPI: Record<string, KpiKey> = {
  'SEO': KPI.SEARCH_HEALTH,
  'AEO': KPI.ZERO_CLICK,
  'GEO': KPI.GEO_INTEGRITY,
  'UGC': KPI.REVIEW_TRUST,
  'PIQR': KPI.RISK_ADJ_IMPACT,
  'AVI': KPI.AI_MENTION_RATE,
  'ATI': KPI.TRUST,
  'OCI': KPI.REVENUE_AT_RISK,
  'QAI': KPI.QUALITY_AUTHORITY,
  'NAP': KPI.BI_MATCH,
  'CWV': KPI.CORE_WEB_VITALS,
  'MYSTERY': KPI.MYSTERY_SHOP,
  'DTRI': KPI.DTRI,
  'FRESH': KPI.FRESHNESS,
  'SCHEMA': KPI.SCHEMA_COVERAGE,
  'OVERALL': KPI.CLARITY,
  'OEL': KPI.OPPORTUNITY_EFFICIENCY_LOSS,
};
