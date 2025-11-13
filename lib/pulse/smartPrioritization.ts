/**
 * Smart Prioritization Engine for Pulse Cards
 * Uses ML-based ranking, user behavior patterns, and business impact
 */

import type { PulseCard } from '@/lib/types/pulse';

interface PrioritizationFactors {
  level: number; // 0-100
  recency: number; // 0-100 (newer = higher)
  userHistory: number; // 0-100 (based on past actions)
  businessImpact: number; // 0-100 (revenue, customer impact)
  urgency: number; // 0-100 (time-sensitive)
  similarity: number; // 0-100 (similar to recently acted cards)
}

export interface PrioritizedCard extends PulseCard {
  priorityScore: number;
  priorityFactors: PrioritizationFactors;
  suggestedActions?: string[];
  predictedResolutionTime?: number; // minutes
}

const LEVEL_WEIGHTS: Record<string, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
  info: 10,
};

const KIND_IMPACT: Record<string, number> = {
  kpi_delta: 80,
  incident_opened: 90,
  sla_breach: 95,
  market_signal: 60,
  auto_fix: 40,
  system_health: 50,
  incident_resolved: 20,
};

/**
 * Calculate priority score for a card
 */
export function calculatePriorityScore(
  card: PulseCard,
  userHistory: {
    actionFrequency: Record<string, number>;
    avgResponseTime: Record<string, number>;
    preferredActions: string[];
  } = {
    actionFrequency: {},
    avgResponseTime: {},
    preferredActions: [],
  },
  similarCards: PulseCard[] = []
): PrioritizedCard {
  const now = Date.now();
  const cardTime = new Date(card.ts).getTime();
  const ageHours = (now - cardTime) / (1000 * 60 * 60);

  // Factor 1: Level (0-100)
  const levelScore = LEVEL_WEIGHTS[card.level] || 50;

  // Factor 2: Recency (0-100) - newer cards get higher score
  const recencyScore = Math.max(0, 100 - ageHours * 2); // Decay 2 points per hour

  // Factor 3: User History (0-100) - based on past actions on similar cards
  const userHistoryScore = calculateUserHistoryScore(card, userHistory);

  // Factor 4: Business Impact (0-100)
  const businessImpactScore = calculateBusinessImpact(card);

  // Factor 5: Urgency (0-100) - time-sensitive issues
  const urgencyScore = calculateUrgency(card, ageHours);

  // Factor 6: Similarity (0-100) - similar to recently acted cards
  const similarityScore = calculateSimilarityScore(card, similarCards);

  const factors: PrioritizationFactors = {
    level: levelScore,
    recency: recencyScore,
    userHistory: userHistoryScore,
    businessImpact: businessImpactScore,
    urgency: urgencyScore,
    similarity: similarityScore,
  };

  // Weighted priority score
  const priorityScore =
    levelScore * 0.3 +
    recencyScore * 0.2 +
    userHistoryScore * 0.15 +
    businessImpactScore * 0.2 +
    urgencyScore * 0.1 +
    similarityScore * 0.05;

  // Generate suggested actions
  const suggestedActions = generateSuggestedActions(card, userHistory);

  // Predict resolution time based on similar past actions
  const predictedResolutionTime = predictResolutionTime(card, userHistory);

  return {
    ...card,
    priorityScore: Math.round(priorityScore),
    priorityFactors: factors,
    suggestedActions,
    predictedResolutionTime,
  };
}

function calculateUserHistoryScore(
  card: PulseCard,
  userHistory: {
    actionFrequency: Record<string, number>;
    avgResponseTime: Record<string, number>;
    preferredActions: string[];
  }
): number {
  // If user frequently acts on this type of card, increase score
  const kindFrequency = userHistory.actionFrequency[card.kind] || 0;
  const levelFrequency = userHistory.actionFrequency[card.level] || 0;
  
  // Normalize to 0-100
  return Math.min(100, (kindFrequency + levelFrequency) * 10);
}

function calculateBusinessImpact(card: PulseCard): number {
  let impact = KIND_IMPACT[card.kind] || 50;

  // Adjust based on delta (if KPI-related)
  if (card.delta !== undefined) {
    const deltaMagnitude = Math.abs(card.delta);
    impact += Math.min(20, deltaMagnitude * 2); // Up to +20 for large deltas
  }

  // Adjust based on context (revenue, customer impact)
  if (card.context?.kpi === 'VAI' || card.context?.kpi === 'ATI') {
    impact += 10; // Higher impact for visibility metrics
  }

  return Math.min(100, impact);
}

function calculateUrgency(card: PulseCard, ageHours: number): number {
  let urgency = 50;

  // Critical issues are always urgent
  if (card.level === 'critical') {
    urgency = 100;
  }

  // SLA breaches are urgent
  if (card.kind === 'sla_breach') {
    urgency = 95;
  }

  // Time-sensitive: older critical issues are more urgent
  if (card.level === 'critical' && ageHours > 24) {
    urgency = 100; // Max urgency for old critical issues
  }

  return urgency;
}

function calculateSimilarityScore(card: PulseCard, similarCards: PulseCard[]): number {
  if (similarCards.length === 0) return 0;

  // Find most similar card
  const similarities = similarCards.map(similar => {
    let score = 0;
    if (similar.kind === card.kind) score += 30;
    if (similar.level === card.level) score += 20;
    if (similar.context?.kpi === card.context?.kpi) score += 30;
    if (similar.thread?.id === card.thread?.id) score += 20;
    return score;
  });

  return Math.max(...similarities, 0);
}

function generateSuggestedActions(
  card: PulseCard,
  userHistory: {
    actionFrequency: Record<string, number>;
    avgResponseTime: Record<string, number>;
    preferredActions: string[];
  }
): string[] {
  const suggestions: string[] = [];

  // Based on card type
  if (card.kind === 'kpi_delta' && card.delta && card.delta < 0) {
    suggestions.push('Investigate root cause');
    suggestions.push('Check recent changes');
  }

  if (card.kind === 'incident_opened') {
    suggestions.push('Review incident details');
    suggestions.push('Assign to team member');
  }

  if (card.kind === 'schema_validation_failed') {
    suggestions.push('Fix JSON-LD schema');
    suggestions.push('Validate with Google Rich Results');
  }

  // Based on user history
  if (userHistory.preferredActions.length > 0) {
    suggestions.push(...userHistory.preferredActions.slice(0, 2));
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

function predictResolutionTime(
  card: PulseCard,
  userHistory: {
    actionFrequency: Record<string, number>;
    avgResponseTime: Record<string, number>;
    preferredActions: string[];
  }
): number {
  // Base time on similar past actions
  const avgTime = userHistory.avgResponseTime[card.kind] || 
                  userHistory.avgResponseTime[card.level] || 
                  60; // Default 60 minutes

  // Adjust based on complexity
  let multiplier = 1.0;
  if (card.level === 'critical') multiplier = 0.7; // Faster for critical
  if (card.kind === 'auto_fix') multiplier = 0.3; // Much faster for auto-fix

  return Math.round(avgTime * multiplier);
}

/**
 * Prioritize array of cards
 */
export function prioritizeCards(
  cards: PulseCard[],
  userHistory?: {
    actionFrequency: Record<string, number>;
    avgResponseTime: Record<string, number>;
    preferredActions: string[];
  }
): PrioritizedCard[] {
  const prioritized = cards.map(card => 
    calculatePriorityScore(card, userHistory, cards)
  );

  // Sort by priority score (descending)
  return prioritized.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Group similar cards together
 */
export function groupSimilarCards(cards: PulseCard[]): Map<string, PulseCard[]> {
  const groups = new Map<string, PulseCard[]>();

  cards.forEach(card => {
    // Create group key based on similarity factors
    const groupKey = [
      card.kind,
      card.level,
      card.context?.kpi || 'none',
      card.thread?.id || 'none',
    ].join('|');

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(card);
  });

  return groups;
}


