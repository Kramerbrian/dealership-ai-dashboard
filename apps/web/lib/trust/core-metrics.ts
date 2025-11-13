/**
 * DealershipAI Algorithmic Trust OS - Core Metrics
 * Implements the core trust scoring system as defined in the spec
 */

export interface CoreMetrics {
  freshness_score: number; // 0-100
  business_identity_match_score: number; // 0-100
  review_trust_score: number; // 0-100
  schema_coverage: number; // 0-100
  ai_mention_rate: number; // 0-100
  zero_click_coverage: number; // 0-100
  trust_score: number; // 0-100 (weighted composite)
}

export interface FreshnessInputs {
  last_modified_headers: Date | null;
  sitemap_timestamps: Date[];
  schema_update_age_days: number;
}

export interface BusinessIdentityInputs {
  gbp_nap: { name: string; address: string; phone: string } | null;
  site_footer_nap: { name: string; address: string; phone: string } | null;
  citations_nap: Array<{ name: string; address: string; phone: string }>;
}

export interface ReviewTrustInputs {
  avg_rating: number;
  review_volume_90d: number;
  response_rate_30d: number;
  authenticity_score: number;
}

export interface SchemaCoverageInputs {
  found_types: string[];
  required_types: string[];
}

export interface AIMentionInputs {
  sources: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
    claude: number;
    copilot: number;
  };
}

export interface ZeroClickInputs {
  intents: {
    buy: number;
    sell: number;
    service: number;
    trade: number;
  };
  engines: {
    google_ai_overviews: number;
    maps_pack: number;
  };
}

export interface TrustScoreWeights {
  freshness: number;
  business_identity: number;
  reviews: number;
  schema: number;
  ai: number;
  zero_click: number;
}

export interface RegionalWeights {
  region_type: 'rural' | 'suburban' | 'metro';
  weights: Partial<TrustScoreWeights>;
}

/**
 * Calculate Freshness Score (0-100)
 * Target: >=85
 * Decay: half-life of 45 days
 */
export function calculateFreshnessScore(inputs: FreshnessInputs): number {
  const { last_modified_headers, sitemap_timestamps, schema_update_age_days } = inputs;
  
  let score = 100;
  
  // Penalize old last-modified headers
  if (last_modified_headers) {
    const daysSinceModified = Math.floor(
      (Date.now() - last_modified_headers.getTime()) / (1000 * 60 * 60 * 24)
    );
    const halfLifeDays = 45;
    const decayFactor = Math.pow(0.5, daysSinceModified / halfLifeDays);
    score *= decayFactor;
  } else {
    score *= 0.7; // Missing header penalty
  }
  
  // Check sitemap freshness
  if (sitemap_timestamps.length > 0) {
    const avgAge = sitemap_timestamps.reduce((sum, ts) => {
      const age = Math.floor((Date.now() - ts.getTime()) / (1000 * 60 * 60 * 24));
      return sum + age;
    }, 0) / sitemap_timestamps.length;
    
    const sitemapDecay = Math.pow(0.5, avgAge / 45);
    score = (score * 0.6) + (sitemapDecay * 100 * 0.4);
  }
  
  // Schema age penalty
  if (schema_update_age_days > 0) {
    const schemaDecay = Math.pow(0.5, schema_update_age_days / 45);
    score = (score * 0.7) + (schemaDecay * 100 * 0.3);
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate Business Identity Match Score (0-100)
 * Target: >=95
 * Penalties: mismatch = 12, missing citation = 6
 */
export function calculateBusinessIdentityMatchScore(
  inputs: BusinessIdentityInputs
): number {
  const { gbp_nap, site_footer_nap, citations_nap } = inputs;
  
  if (!gbp_nap) {
    return 0; // No GBP = no identity
  }
  
  let score = 100;
  const mismatches: string[] = [];
  
  // Check site footer match
  if (site_footer_nap) {
    if (normalizeNAP(site_footer_nap.name) !== normalizeNAP(gbp_nap.name)) {
      score -= 12;
      mismatches.push('name');
    }
    if (normalizeNAP(site_footer_nap.address) !== normalizeNAP(gbp_nap.address)) {
      score -= 12;
      mismatches.push('address');
    }
    if (normalizePhone(site_footer_nap.phone) !== normalizePhone(gbp_nap.phone)) {
      score -= 12;
      mismatches.push('phone');
    }
  } else {
    score -= 12; // Missing footer NAP
  }
  
  // Check citations
  const citationCount = citations_nap.length;
  if (citationCount === 0) {
    score -= 6;
  } else {
    // Verify citation matches
    const matchingCitations = citations_nap.filter(citation => {
      return (
        normalizeNAP(citation.name) === normalizeNAP(gbp_nap.name) &&
        normalizeNAP(citation.address) === normalizeNAP(gbp_nap.address) &&
        normalizePhone(citation.phone) === normalizePhone(gbp_nap.phone)
      );
    }).length;
    
    const mismatchCount = citationCount - matchingCitations;
    score -= mismatchCount * 6;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate Review Trust Score (0-100)
 * Target: >=85
 */
export function calculateReviewTrustScore(inputs: ReviewTrustInputs): number {
  const { avg_rating, review_volume_90d, response_rate_30d, authenticity_score } = inputs;
  
  // Rating component (0-40 points)
  const ratingScore = Math.min(40, (avg_rating / 5) * 40);
  
  // Volume component (0-25 points)
  const volumeScore = Math.min(25, (Math.min(review_volume_90d, 50) / 50) * 25);
  
  // Response rate component (0-20 points)
  const responseScore = (response_rate_30d / 100) * 20;
  
  // Authenticity component (0-15 points)
  const authenticityComponent = (authenticity_score / 100) * 15;
  
  const totalScore = ratingScore + volumeScore + responseScore + authenticityComponent;
  
  return Math.min(100, Math.max(0, Math.round(totalScore)));
}

/**
 * Calculate Schema Coverage (0-100)
 * Target: >=90
 */
export function calculateSchemaCoverage(inputs: SchemaCoverageInputs): number {
  const { found_types, required_types } = inputs;
  
  const foundSet = new Set(found_types.map(t => t.toLowerCase()));
  const requiredSet = new Set(required_types.map(t => t.toLowerCase()));
  
  let foundCount = 0;
  requiredSet.forEach(type => {
    if (foundSet.has(type)) {
      foundCount++;
    }
  });
  
  const coverage = (foundCount / required_types.length) * 100;
  return Math.min(100, Math.max(0, Math.round(coverage)));
}

/**
 * Calculate AI Mention Rate (0-100)
 * Target: >=70
 */
export function calculateAIMentionRate(inputs: AIMentionInputs): number {
  const { sources } = inputs;
  const sourceValues = [
    sources.chatgpt,
    sources.perplexity,
    sources.gemini,
    sources.claude,
    sources.copilot,
  ];
  
  // Average visibility across all sources
  const avgVisibility = sourceValues.reduce((sum, val) => sum + val, 0) / sourceValues.length;
  
  return Math.min(100, Math.max(0, Math.round(avgVisibility)));
}

/**
 * Calculate Zero-Click Coverage (0-100)
 * Target: >=65
 */
export function calculateZeroClickCoverage(inputs: ZeroClickInputs): number {
  const { intents, engines } = inputs;
  
  // Intent coverage (0-50 points)
  const intentValues = [
    intents.buy,
    intents.sell,
    intents.service,
    intents.trade,
  ];
  const avgIntentCoverage = intentValues.reduce((sum, val) => sum + val, 0) / intentValues.length;
  const intentScore = (avgIntentCoverage / 100) * 50;
  
  // Engine coverage (0-50 points)
  const engineValues = [
    engines.google_ai_overviews,
    engines.maps_pack,
  ];
  const avgEngineCoverage = engineValues.reduce((sum, val) => sum + val, 0) / engineValues.length;
  const engineScore = (avgEngineCoverage / 100) * 50;
  
  const totalScore = intentScore + engineScore;
  
  return Math.min(100, Math.max(0, Math.round(totalScore)));
}

/**
 * Calculate composite Trust Score (0-100)
 * Uses weighted average of all core metrics
 */
export function calculateTrustScore(
  metrics: Omit<CoreMetrics, 'trust_score'>,
  weights: TrustScoreWeights,
  regionType?: 'rural' | 'suburban' | 'metro'
): number {
  // Apply regional weight overrides if provided
  let finalWeights = { ...weights };
  
  if (regionType === 'rural') {
    finalWeights = {
      ...finalWeights,
      business_identity: 0.28,
      reviews: 0.22,
    };
  } else if (regionType === 'metro') {
    finalWeights = {
      ...finalWeights,
      reviews: 0.30,
      ai: 0.18,
    };
  }
  
  // Normalize weights to sum to 1.0
  const weightSum = Object.values(finalWeights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights = Object.fromEntries(
    Object.entries(finalWeights).map(([key, val]) => [key, val / weightSum])
  ) as TrustScoreWeights;
  
  const trustScore =
    metrics.freshness_score * normalizedWeights.freshness +
    metrics.business_identity_match_score * normalizedWeights.business_identity +
    metrics.review_trust_score * normalizedWeights.reviews +
    metrics.schema_coverage * normalizedWeights.schema +
    metrics.ai_mention_rate * normalizedWeights.ai +
    metrics.zero_click_coverage * normalizedWeights.zero_click;
  
  return Math.min(100, Math.max(0, Math.round(trustScore)));
}

/**
 * Default trust score weights
 */
export const DEFAULT_TRUST_WEIGHTS: TrustScoreWeights = {
  freshness: 0.15,
  business_identity: 0.20,
  reviews: 0.25,
  schema: 0.15,
  ai: 0.15,
  zero_click: 0.10,
};

// Helper functions
function normalizeNAP(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

