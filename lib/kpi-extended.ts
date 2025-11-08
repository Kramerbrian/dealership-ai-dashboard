/**
 * Extended KPI definitions for DealershipAI v3.6
 * Includes all canonical KPIs plus new metrics
 */

export const KPI_EXTENDED = {
  // Core Visibility Metrics
  AIV: 'ai_visibility',                    // AI Visibility (AIV)
  ATI: 'algorithmic_trust_index',            // Algorithmic Trust Index (ATI)
  QAI: 'quality_authority_index',         // Quality Authority Index (QAI)
  PIQR: 'performance_impact_quality_risk', // Performance Impact Quality Risk (PIQR)
  OCI: 'opportunity_cost_of_inaction',     // Opportunity Cost of Inaction (OCI)
  ASR_ROI: 'autonomous_strategy_recommendation_roi', // Autonomous Strategy Recommendation ROI (ASR-ROI)
  
  // Existing KPIs
  SEARCH_HEALTH: 'search_health_score',
  ZERO_CLICK: 'zero_click_coverage',
  GEO_INTEGRITY: 'geo_integrity',
  REVIEW_TRUST: 'review_trust_score',
  RISK_ADJ_IMPACT: 'risk_adjusted_impact_score',
  AI_MENTION_RATE: 'ai_mention_rate',
  TRUST: 'trust_score',
  REVENUE_AT_RISK: 'revenue_at_risk',
  BI_MATCH: 'business_identity_match_score',
  CORE_WEB_VITALS: 'core_web_vitals_score',
  MYSTERY_SHOP: 'mystery_shop_score',
  DTRI: 'digital_trust_revenue_index',
  FRESHNESS: 'freshness_score',
  SCHEMA_COVERAGE: 'schema_coverage',
  CLARITY: 'clarity_score',
  OEL: 'opportunity_efficiency_loss',
  DPI: 'dealership_performance_index',
  D_LOC: 'lost_opportunity_cost',
  LEE: 'lead_engagement_efficiency'
} as const;

export type ExtendedKpiKey = typeof KPI_EXTENDED[keyof typeof KPI_EXTENDED];

export const KPI_DISPLAY_NAMES_EXTENDED: Record<ExtendedKpiKey, string> = {
  ai_visibility: 'AI Visibility (AIV)',
  algorithmic_trust_index: 'Algorithmic Trust Index (ATI)',
  quality_authority_index: 'Quality Authority Index (QAI)',
  performance_impact_quality_risk: 'Performance Impact Quality Risk (PIQR)',
  opportunity_cost_of_inaction: 'Opportunity Cost of Inaction (OCI)',
  autonomous_strategy_recommendation_roi: 'Autonomous Strategy Recommendation ROI (ASR-ROI)',
  search_health_score: 'Search Health Score',
  zero_click_coverage: 'Zero-Click Coverage',
  geo_integrity: 'GEO Integrity',
  review_trust_score: 'Review Trust Score',
  risk_adjusted_impact_score: 'Risk-Adjusted Impact Score',
  ai_mention_rate: 'AI Mention Rate',
  trust_score: 'Trust Score',
  revenue_at_risk: 'Revenue at Risk',
  business_identity_match_score: 'Business Identity Match Score',
  core_web_vitals_score: 'Core Web Vitals Score',
  mystery_shop_score: 'Mystery Shop Score',
  digital_trust_revenue_index: 'Digital Trust Revenue Index',
  freshness_score: 'Freshness Score',
  schema_coverage: 'Schema Coverage',
  clarity_score: 'Clarity Score',
  opportunity_efficiency_loss: 'Opportunity Efficiency Loss',
  dealership_performance_index: 'Dealership Performance Index',
  lost_opportunity_cost: 'Lost Opportunity Cost',
  lead_engagement_efficiency: 'Lead Engagement Efficiency'
};

export const ACRONYM_TO_KPI_EXTENDED: Record<string, ExtendedKpiKey> = {
  'AIV': 'ai_visibility',
  'ATI': 'algorithmic_trust_index',
  'QAI': 'quality_authority_index',
  'PIQR': 'performance_impact_quality_risk',
  'OCI': 'opportunity_cost_of_inaction',
  'ASR-ROI': 'autonomous_strategy_recommendation_roi',
  'ASR_ROI': 'autonomous_strategy_recommendation_roi',
  'SEO': 'search_health_score',
  'AEO': 'zero_click_coverage',
  'GEO': 'geo_integrity',
  'UGC': 'review_trust_score',
  'AVI': 'ai_mention_rate',
  'NAP': 'business_identity_match_score',
  'CWV': 'core_web_vitals_score',
  'MYSTERY': 'mystery_shop_score',
  'DTRI': 'digital_trust_revenue_index',
  'FRESH': 'freshness_score',
  'SCHEMA': 'schema_coverage',
  'OVERALL': 'clarity_score',
  'OEL': 'opportunity_efficiency_loss',
  'DPI': 'dealership_performance_index',
  'D-LOC': 'lost_opportunity_cost',
  'DLOC': 'lost_opportunity_cost',
  'LEE': 'lead_engagement_efficiency'
};

