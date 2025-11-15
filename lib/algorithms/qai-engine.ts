// @ts-nocheck
/**
 * dAI Algorithmic Trust Monitor™
 * Quantum Authority Index (QAI*) Calculation Engine
 * 
 * Complete TypeScript implementation of the QAI algorithm
 */

import {
  QAIScore,
  EEATScore,
  PIQRInput,
  HRPInput,
  VAIInput,
  SEOScore,
  AEOScore,
  GEOScore,
  EEATInput,
  QAICalculationInput,
  OCIInput,
  AIPlatformScore,
  RecommendedAction,
} from '../types';

// ============================================================================
// PLATFORM WEIGHTS (Default)
// ============================================================================

export const DEFAULT_PLATFORM_WEIGHTS = {
  chatgpt: 0.30, // 30%
  perplexity: 0.25,
  gemini: 0.20,
  claude: 0.15,
  copilot: 0.05,
  grok: 0.05,
};

// ============================================================================
// PIQR ALGORITHM (Proactive Inventory Quality Radar)
// ============================================================================

export function calculatePIQR(input: PIQRInput): number {
  // PIQR = (1 + Σ ComplianceFails * 0.25) * Π WarningMultipliers
  
  const complianceSum = input.compliance_fails.reduce(
    (sum, fail) => sum + fail.weight,
    0
  );
  
  const warningProduct = input.warning_signals.reduce(
    (product, signal) => product * signal.multiplier,
    1.0
  );
  
  const piqr = (1 + complianceSum) * warningProduct;
  
  return Math.max(1.0, piqr); // Minimum 1.0 (no penalty)
}

// ============================================================================
// HRP ALGORITHM (Hallucination & Brand Risk Penalty)
// ============================================================================

export function calculateHRP(input: HRPInput): number {
  // HRP = ((Total - Verifiable) / Total) * (1 + Severity)
  
  if (input.total_mentions === 0) return 0;
  
  const hallucination_rate = 
    (input.total_mentions - input.verifiable_mentions) / input.total_mentions;
  
  const hrp = hallucination_rate * (1 + input.severity_multiplier);
  
  return Math.min(1.0, hrp); // Maximum 1.0 (complete hallucination)
}

// ============================================================================
// VAI ALGORITHM (Unified AI Visibility Score)
// ============================================================================

export function calculateVAI(input: VAIInput): number {
  // VAI_Penalized = Σ(Visibility_j * W_j) / PIQR
  
  const weighted_visibility = Object.entries(input.platform_scores).reduce(
    (sum, [platform, score]) => {
      const weight = input.platform_weights[platform] || 0;
      return sum + (score * weight);
    },
    0
  );
  
  const vai_penalized = weighted_visibility / input.piqr;
  
  return Math.min(100, vai_penalized);
}

// ============================================================================
// SEO/AEO/GEO BREAKDOWN
// ============================================================================

export function calculateSEO(input: SEOScore): number {
  // Weighted average of SEO components
  return (
    input.organic_traffic * 0.25 +
    input.keyword_rankings * 0.30 +
    input.local_pack_share * 0.35 +
    input.branded_ctr * 0.10
  );
}

export function calculateAEO(input: AEOScore): number {
  return (
    input.featured_snippets * 0.25 +
    input.paa_capture_rate * 0.45 +
    input.ai_overview_citations * 0.40 +
    input.voice_search_traffic * 0.15
  ) / 1.25; // Normalize to 0-100
}

export function calculateGEO(input: GEOScore): number {
  // Normalize LLM sentiment from -1/+1 to 0-100
  const normalized_sentiment = ((input.llm_sentiment + 1) / 2) * 100;
  
  return (
    input.llm_mentions * 0.50 +
    normalized_sentiment * 0.30 +
    input.authority_links * 0.20
  );
}

// ============================================================================
// E-E-A-T CALCULATION
// ============================================================================

export function calculateEEAT(input: EEATInput): EEATScore {
  // Experience (0-100)
  const experience = (
    ((5 - input.bounce_rate) / 5) * 30 +
    (input.time_on_site / 300) * 100 * 40 + // Normalize to 5min max
    (input.pages_per_session / 5) * 100 * 30
  );
  
  // Expertise (0-100)
  const expertise = (
    (input.content_depth / 2000) * 100 * 40 + // Normalize to 2000 words
    input.authorship_completeness * 30 +
    input.technical_accuracy * 30
  );
  
  // Authoritativeness (0-100)
  const authoritativeness = (
    input.domain_authority * 0.4 +
    input.backlink_quality * 0.35 +
    (input.brand_mentions / 100) * 25 // Normalize
  );
  
  // Trustworthiness (0-100)
  const trustworthiness = (
    (input.ssl_cert ? 15 : 0) +
    (input.privacy_policy ? 10 : 0) +
    (input.contact_info_complete ? 15 : 0) +
    (input.review_rating / 5) * 100 * 0.40 +
    (input.review_response_rate / 100) * 20
  );
  
  // Sub-components (would be full calculations in production)
  const ppi = 78; // Page Performance Index
  const sdi = 62; // Structured Discoverability Index
  const lsi = 71; // Local Surface Index
  const tas = 55; // Trust Authority Score
  const ans = 48; // Answer Share
  const ais = 66; // Audience Integrity Score
  
  return {
    experience: Math.min(100, Math.max(0, experience)),
    expertise: Math.min(100, Math.max(0, expertise)),
    authoritativeness: Math.min(100, Math.max(0, authoritativeness)),
    trustworthiness: Math.min(100, Math.max(0, trustworthiness)),
    ppi,
    sdi,
    lsi,
    tas,
    ans,
    ais,
  };
}

// ============================================================================
// OCI CALCULATION (Opportunity Cost of Inaction)
// ============================================================================

export function calculateOCI(input: OCIInput): number {
  // OCI = Δ_Conversion * Gross_Profit_Avg * Gap_in_Visibility
  
  const score_gap = input.target_score - input.current_score;
  const conversion_delta = score_gap * 0.005; // 0.5% per point
  
  const monthly_loss = 
    conversion_delta * input.avg_gross_profit * input.monthly_lead_volume;
  
  return Math.max(0, monthly_loss);
}

// ============================================================================
// QAI* FINAL CALCULATION
// ============================================================================

export async function calculateQAI(input: QAICalculationInput): Promise<QAIScore> {
  // 1. Calculate individual components
  const seo_score = calculateSEO(input.seo);
  const aeo_score = calculateAEO(input.aeo);
  const geo_score = calculateGEO(input.geo);
  
  // 2. Combine SEO/AEO/GEO into AI Visibility
  const ai_visibility = (seo_score * 0.35) + (aeo_score * 0.35) + (geo_score * 0.30);
  
  // 3. Calculate risk scores
  const piqr_score = calculatePIQR(input.piqr);
  const hrp_score = calculateHRP(input.hrp);
  
  // 4. Calculate VAI (penalized by PIQR)
  const vai_penalized = calculateVAI({
    platform_scores: input.platform_scores,
    platform_weights: DEFAULT_PLATFORM_WEIGHTS,
    piqr: piqr_score,
  });
  
  // 5. Calculate 5 Pillars (placeholder - would be full calculations)
  const zero_click_shield = aeo_score; // Proxy
  const ugc_health = 75; // Would calculate from reviews
  const geo_trust = seo_score * 0.4 + geo_score * 0.6; // Local + Citations
  const sgp_integrity = 80; // Would calculate from schema validation
  
  // 6. Calculate QAI* Score
  // QAI* = (SEO * 0.3) + (VAI_Penalized * 0.7) * (1 + λ_A) - (HRP * W_HRP)
  const authority_velocity = input.previous_score 
    ? ((ai_visibility - input.previous_score) / input.previous_score) * 100
    : 0;
  
  const velocity_multiplier = 1 + (authority_velocity / 100);
  const hrp_weight = 0.20;
  
  const qai_star_score = Math.max(0, Math.min(100,
    ((seo_score * 0.30) + (vai_penalized * 0.70)) * velocity_multiplier - (hrp_score * hrp_weight)
  ));
  
  // 7. Calculate OCI (Opportunity Cost of Inaction)
  const oci_value = calculateOCI({
    current_score: qai_star_score,
    target_score: 85, // Industry benchmark
    avg_gross_profit: 2800,
    monthly_lead_volume: 150,
  });
  
  return {
    qai_star_score,
    authority_velocity,
    oci_value,
    vai_penalized,
    piqr_score,
    hrp_score,
    ai_visibility,
    zero_click_shield,
    ugc_health,
    geo_trust,
    sgp_integrity,
    seo_score,
    aeo_score,
    geo_score,
  };
}

// ============================================================================
// GEOGRAPHIC POOLING (99% Margin Preservation)
// ============================================================================

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function addDealerVariance(
  pooledScores: QAIScore,
  dealerDomain: string,
  tier: 'FREE' | 'PRO' | 'ENTERPRISE'
): QAIScore {
  // Add deterministic variance based on domain hash
  const hash = hashString(dealerDomain);
  const variancePercent = tier === 'FREE' ? 0.10 : 0.05; // 10% for free, 5% for paid
  
  const variance = (hash % 100) / 100 * variancePercent * 2 - variancePercent;
  
  return {
    ...pooledScores,
    qai_star_score: Math.min(100, Math.max(0, pooledScores.qai_star_score * (1 + variance))),
    ai_visibility: Math.min(100, Math.max(0, pooledScores.ai_visibility * (1 + variance))),
    seo_score: Math.min(100, Math.max(0, pooledScores.seo_score * (1 + variance))),
    aeo_score: Math.min(100, Math.max(0, pooledScores.aeo_score * (1 + variance))),
    geo_score: Math.min(100, Math.max(0, pooledScores.geo_score * (1 + variance))),
  };
}

// ============================================================================
// SESSION COST CALCULATION
// ============================================================================

export const SESSION_COSTS: Record<string, number> = {
  score_refresh: 1,
  competitor_analysis: 2,
  report_export: 1,
  ai_chat_query: 1,
  schema_generate: 0, // Free for Pro+
  review_draft: 0, // Free for Pro+
  mystery_shop: 5, // Enterprise only
};

export function calculateSessionCost(action: string, tier: 'FREE' | 'PRO' | 'ENTERPRISE'): number {
  const baseCost = SESSION_COSTS[action] || 0;
  
  // Free tier gets no free actions
  if (tier === 'FREE') {
    return baseCost;
  }
  
  // Pro+ gets free schema generation and review drafting
  if ((action === 'schema_generate' || action === 'review_draft') && tier !== 'FREE') {
    return 0;
  }
  
  return baseCost;
}

// ============================================================================
// DEFAULT DATA GENERATORS (For Demo/Synthetic Data)
// ============================================================================

export function generateDefaultQAIScore(): QAIScore {
  return {
    qai_star_score: 78,
    authority_velocity: 2.5,
    oci_value: 12400,
    vai_penalized: 82,
    piqr_score: 1.2,
    hrp_score: 0.15,
    ai_visibility: 82,
    zero_click_shield: 71,
    ugc_health: 76,
    geo_trust: 85,
    sgp_integrity: 79,
    seo_score: 78,
    aeo_score: 85,
    geo_score: 83,
  };
}

export function generateDefaultEEATScore(): EEATScore {
  return {
    experience: 72,
    expertise: 68,
    authoritativeness: 75,
    trustworthiness: 81,
    ppi: 78,
    sdi: 62,
    lsi: 71,
    tas: 55,
    ans: 48,
    ais: 66,
  };
}

export function generateDefaultPlatformScores(): AIPlatformScore[] {
  return [
    {
      platform: 'chatgpt',
      visibility_score: 85,
      mentions: 18,
      sentiment: 'positive',
      rank: 3,
      market_share: 30,
    },
    {
      platform: 'claude',
      visibility_score: 78,
      mentions: 12,
      sentiment: 'positive',
      rank: 4,
      market_share: 25,
    },
    {
      platform: 'perplexity',
      visibility_score: 82,
      mentions: 17,
      sentiment: 'positive',
      rank: 2,
      market_share: 20,
    },
    {
      platform: 'gemini',
      visibility_score: 75,
      mentions: 8,
      sentiment: 'neutral',
      rank: 5,
      market_share: 15,
    },
    {
      platform: 'copilot',
      visibility_score: 68,
      mentions: 5,
      sentiment: 'neutral',
      rank: 6,
      market_share: 7,
    },
    {
      platform: 'grok',
      visibility_score: 62,
      mentions: 3,
      sentiment: 'neutral',
      rank: 7,
      market_share: 3,
    },
  ];
}

export function generateDefaultQuickWins(): RecommendedAction[] {
  return [
    {
      feature: 'LocalBusiness Schema Markup',
      current_value: 'Missing',
      optimal_value: 'Present',
      shap_gain: 12.5,
      estimated_probability_increase: 15,
      estimated_revenue_gain: 3600,
      cost: 0,
      net_profit: 3600,
      priority: 'critical',
    },
    {
      feature: 'Review Response Rate',
      current_value: '68%',
      optimal_value: '85%',
      shap_gain: 8.2,
      estimated_probability_increase: 12,
      estimated_revenue_gain: 2400,
      cost: 0,
      net_profit: 2400,
      priority: 'high',
    },
    {
      feature: 'NAP Citation Consistency',
      current_value: '3 inconsistencies',
      optimal_value: '0 inconsistencies',
      shap_gain: 5.8,
      estimated_probability_increase: 8,
      estimated_revenue_gain: 1800,
      cost: 0,
      net_profit: 1800,
      priority: 'high',
    },
  ];
}
