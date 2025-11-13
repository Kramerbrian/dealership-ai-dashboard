/**
 * PulseEngine - Ranking and prioritization logic for pulses
 * Implements role-aware ranking and impact-based sorting
 */

export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: 'schema' | 'faq' | 'reviews' | 'visibility' | 'traffic' | 'funnel' | 'geo' | 'seo';
  priority?: 'low' | 'medium' | 'high' | 'critical';
};

export type Role = 'gm' | 'marketing' | 'service' | 'owner';

/**
 * Role-based priority weights
 * Different roles care about different pulse types
 */
const ROLE_WEIGHTS: Record<Role, Record<Pulse['kind'], number>> = {
  gm: {
    schema: 1.0,
    faq: 0.8,
    reviews: 0.9,
    visibility: 1.0,
    traffic: 0.7,
    funnel: 0.6,
    geo: 0.8,
    seo: 0.7,
  },
  marketing: {
    schema: 0.9,
    faq: 0.7,
    reviews: 0.8,
    visibility: 1.0,
    traffic: 1.0,
    funnel: 1.0,
    geo: 0.9,
    seo: 1.0,
  },
  service: {
    schema: 0.6,
    faq: 1.0,
    reviews: 1.0,
    visibility: 0.7,
    traffic: 0.5,
    funnel: 0.6,
    geo: 0.8,
    seo: 0.5,
  },
  owner: {
    schema: 1.0,
    faq: 0.9,
    reviews: 1.0,
    visibility: 1.0,
    traffic: 0.9,
    funnel: 0.8,
    geo: 0.9,
    seo: 0.8,
  },
};

/**
 * Calculate priority score for a pulse
 * Higher score = higher priority
 */
function calculatePriorityScore(pulse: Pulse, role: Role): number {
  const roleWeight = ROLE_WEIGHTS[role][pulse.kind] || 0.5;
  
  // Impact score (normalized to 0-1, assuming max $50K/month)
  const impactScore = Math.min(pulse.impactMonthlyUSD / 50000, 1);
  
  // Confidence score (already 0-1)
  const confidenceScore = pulse.confidenceScore;
  
  // Recency score (newer = higher, max 7 days = 10080 minutes)
  const recencyScore = Math.max(0, 1 - pulse.recencyMinutes / 10080);
  
  // ETA score (faster = higher, max 8 hours = 28800 seconds)
  const etaScore = Math.max(0, 1 - pulse.etaSeconds / 28800);
  
  // Priority multiplier (if explicitly set)
  const priorityMultiplier = {
    critical: 1.5,
    high: 1.2,
    medium: 1.0,
    low: 0.8,
  }[pulse.priority || 'medium'];
  
  // Weighted composite score
  const score = (
    roleWeight * 0.3 +
    impactScore * 0.3 +
    confidenceScore * 0.2 +
    recencyScore * 0.1 +
    etaScore * 0.1
  ) * priorityMultiplier;
  
  return score;
}

/**
 * Rank pulses by priority for a given role
 * Returns sorted array (highest priority first)
 */
export function rankPulse(pulses: Pulse[], role: Role = 'gm'): Pulse[] {
  return [...pulses]
    .map(pulse => ({
      pulse,
      score: calculatePriorityScore(pulse, role),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ pulse }) => pulse);
}

/**
 * Filter pulses by kind
 */
export function filterPulsesByKind(pulses: Pulse[], kinds: Pulse['kind'][]): Pulse[] {
  return pulses.filter(p => kinds.includes(p.kind));
}

/**
 * Filter pulses by impact threshold
 */
export function filterPulsesByImpact(pulses: Pulse[], minImpact: number): Pulse[] {
  return pulses.filter(p => p.impactMonthlyUSD >= minImpact);
}

/**
 * Group pulses by kind
 */
export function groupPulsesByKind(pulses: Pulse[]): Record<Pulse['kind'], Pulse[]> {
  const grouped: Record<string, Pulse[]> = {};
  
  pulses.forEach(pulse => {
    if (!grouped[pulse.kind]) {
      grouped[pulse.kind] = [];
    }
    grouped[pulse.kind].push(pulse);
  });
  
  return grouped as Record<Pulse['kind'], Pulse[]>;
}

/**
 * Get top N pulses by priority
 */
export function getTopPulses(pulses: Pulse[], role: Role, limit: number = 5): Pulse[] {
  return rankPulse(pulses, role).slice(0, limit);
}

/**
 * Calculate total impact of pulses
 */
export function calculateTotalImpact(pulses: Pulse[]): number {
  return pulses.reduce((sum, p) => sum + p.impactMonthlyUSD, 0);
}

/**
 * Get pulse statistics
 */
export function getPulseStats(pulses: Pulse[]): {
  total: number;
  totalImpact: number;
  byKind: Record<Pulse['kind'], number>;
  avgConfidence: number;
  avgEta: number;
} {
  const byKind: Record<string, number> = {};
  let totalConfidence = 0;
  let totalEta = 0;
  
  pulses.forEach(pulse => {
    byKind[pulse.kind] = (byKind[pulse.kind] || 0) + 1;
    totalConfidence += pulse.confidenceScore;
    totalEta += pulse.etaSeconds;
  });
  
  return {
    total: pulses.length,
    totalImpact: calculateTotalImpact(pulses),
    byKind: byKind as Record<Pulse['kind'], number>,
    avgConfidence: pulses.length > 0 ? totalConfidence / pulses.length : 0,
    avgEta: pulses.length > 0 ? totalEta / pulses.length : 0,
  };
}

