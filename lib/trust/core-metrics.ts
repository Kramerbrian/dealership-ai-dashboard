export interface CoreMetrics {
  freshness_score: number;
  business_identity_match_score: number;
  review_trust_score: number;
  schema_coverage: number;
  ai_mention_rate: number;
  zero_click_coverage: number;
  trust_score: number;
}

export const DEFAULT_TRUST_WEIGHTS = {
  freshness: 0.15,
  business_identity: 0.20,
  reviews: 0.15,
  schema: 0.15,
  ai_mentions: 0.20,
  zero_click: 0.15,
};

export function calculateFreshnessScore(data: any): number {
  return 0.8;
}

export function calculateBusinessIdentityMatchScore(data: any): number {
  return 0.9;
}

export function calculateReviewTrustScore(data: any): number {
  return 0.85;
}

export function calculateSchemaCoverage(data: any): number {
  return 0.75;
}

export function calculateAIMentionRate(data: any): number {
  return 0.7;
}

export function calculateZeroClickCoverage(data: any): number {
  return 0.65;
}

export function calculateTrustScore(metrics: CoreMetrics): number {
  const {
    freshness_score,
    business_identity_match_score,
    review_trust_score,
    schema_coverage,
    ai_mention_rate,
    zero_click_coverage,
  } = metrics;

  return (
    freshness_score * DEFAULT_TRUST_WEIGHTS.freshness +
    business_identity_match_score * DEFAULT_TRUST_WEIGHTS.business_identity +
    review_trust_score * DEFAULT_TRUST_WEIGHTS.reviews +
    schema_coverage * DEFAULT_TRUST_WEIGHTS.schema +
    ai_mention_rate * DEFAULT_TRUST_WEIGHTS.ai_mentions +
    zero_click_coverage * DEFAULT_TRUST_WEIGHTS.zero_click
  );
}
