/**
 * dAI Quote Fetcher Component
 * 
 * Implements Usage Decay Weighting with tier gating for the dAI Personality Agent.
 * 
 * Technical Implementation:
 * - Tier Gating: Filters quotes by user subscription tier (free/pro/enterprise)
 * - Usage Decay Weighting: Prioritizes fresh, rarely-used quotes
 * - Context Matching: Matches quotes to user context (error, success, data, etc.)
 * - Maximum Scarcity: 10% overall selection chance (Easter Egg effect)
 * 
 * Formula: Selection_Weight = Time_Decay × Usage_Penalty × Subtlety_Bonus × Context_Match
 */

import { QuoteMatrix, Quote } from './QuoteMatrix';

export type UserTier = 'free' | 'pro' | 'enterprise';
export type QuoteContextType = 
  | 'error' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'action' 
  | 'data' 
  | 'competitor' 
  | 'urgency' 
  | 'vision' 
  | 'roi'
  | 'introduction'
  | 'endurance';

export interface QuoteContext {
  type: QuoteContextType;
  severity?: 'low' | 'medium' | 'high';
  keywords?: string[];
  channel?: string; // Optional: specific channel (e.g., 'dashboard', 'chatbot', 'footer')
}

export interface QuoteSelectionResult {
  quote: Quote | null;
  wasSelected: boolean;
  selectionWeight?: number;
  contextMatch?: number;
  decayWeight?: number;
}

/**
 * Tier Gating Configuration
 * Maps user tiers to allowed quote tiers
 */
const TIER_GATING: Record<UserTier, { allowedTiers: ('tier1' | 'tier2' | 'tier3')[], maxRating: 'PG' | 'PG-13' }> = {
  free: {
    allowedTiers: ['tier1'],
    maxRating: 'PG'
  },
  pro: {
    allowedTiers: ['tier1', 'tier2'],
    maxRating: 'PG-13'
  },
  enterprise: {
    allowedTiers: ['tier1', 'tier2', 'tier3'],
    maxRating: 'PG-13'
  }
};

/**
 * Calculate Usage Decay Weight
 * 
 * Formula components:
 * - Time_Decay: 0 (just used) to 1 (never used or 30+ days ago)
 * - Usage_Penalty: 1 / (1 + usageCount) - first use = 1.0, second = 0.5, etc.
 * - Subtlety_Bonus: 1 + (subtletyIndex / 10) - max 1.5x multiplier
 * 
 * @param quote - Quote from QuoteMatrix
 * @param currentTimestamp - Current Unix timestamp
 * @returns Decay weight (higher = better candidate)
 */
function calculateUsageDecayWeight(
  quote: Quote,
  currentTimestamp: number
): number {
  const HOURS_IN_DAY = 24;
  const DAYS_DECAY_WINDOW = 30; // Full decay after 30 days
  
  // Time since last use (in hours)
  const hoursSinceLastUse = (currentTimestamp - quote.lastUsedTimestamp) / 3600;
  
  // Decay factor: 0 (just used) to 1 (never used or 30+ days ago)
  const timeDecay = Math.min(1, hoursSinceLastUse / (DAYS_DECAY_WINDOW * HOURS_IN_DAY));
  
  // Usage count penalty: More uses = lower weight
  // Formula: 1 / (1 + usageCount) ensures first use gets weight 1.0, second gets 0.5, etc.
  const usagePenalty = 1 / (1 + quote.usageCount);
  
  // Subtlety bonus: Higher subtlety = slightly higher weight (max 1.2x multiplier)
  const subtletyBonus = 1 + (quote.subtletyIndex / 10); // 1.1 to 1.5 multiplier
  
  // Final weight: Time decay × Usage penalty × Subtlety bonus
  return timeDecay * usagePenalty * subtletyBonus;
}

/**
 * Match context to quote tags
 * 
 * @param context - User's context
 * @param quoteTags - Quote's context_tag string
 * @returns Match score (0-1)
 */
function matchContextToTags(context: QuoteContext, quoteTags: string): number {
  const tags = quoteTags.split(',').map(t => t.trim().toLowerCase());
  const contextKeywords = context.keywords || [];
  
  // Context type mapping to relevant keywords
  const contextTypeMap: Record<QuoteContextType, string[]> = {
    error: ['error', 'failure', 'system limitation', 'unmet request'],
    success: ['success', 'breakthrough', 'achievement', 'high conversion'],
    warning: ['urgency', 'scaling', 'capacity', 'high-volume problem'],
    info: ['data insight', 'kpi spike', 'validation', 'discovery'],
    action: ['action item', 'delegation', 'task management', 'process demand'],
    data: ['data insight', 'kpi spike', 'validation', 'discovery'],
    competitor: ['competitive intel', 'market share', 'dominance', 'acquisition'],
    urgency: ['urgency', 'procrastination', 'action', 'deadlines'],
    vision: ['vision', 'introduction', 'opportunity', 'ambition'],
    roi: ['roi', 'revenue', 'value proposition', 'negotiation'],
    introduction: ['vision', 'introduction', 'opportunity', 'ambition'],
    endurance: ['endurance', 'long-term strategy', 'motivation']
  };
  
  const relevantKeywords = contextTypeMap[context.type] || [];
  const allKeywords = [...relevantKeywords, ...contextKeywords].map(k => k.toLowerCase());
  
  // Count matches
  let matches = 0;
  for (const tag of tags) {
    if (allKeywords.some(keyword => tag.includes(keyword) || keyword.includes(tag))) {
      matches++;
    }
  }
  
  // Return match ratio
  return matches / Math.max(tags.length, 1);
}

/**
 * Filter quotes by tier and rating
 * 
 * @param userTier - User's subscription tier
 * @returns Filtered quotes available to user
 */
function filterQuotesByTier(userTier: UserTier): Quote[] {
  const gating = TIER_GATING[userTier];
  
  return QuoteMatrix.filter(quote => 
    gating.allowedTiers.includes(quote.tier) &&
    quote.rating <= gating.maxRating
  );
}

/**
 * Select best matching quote with Usage Decay Weighting
 * 
 * @param context - User's context
 * @param userTier - User's subscription tier
 * @returns Selected quote or null
 */
function selectQuote(
  context: QuoteContext,
  userTier: UserTier
): QuoteSelectionResult {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  
  // Filter by tier gating
  const availableQuotes = filterQuotesByTier(userTier);
  
  if (availableQuotes.length === 0) {
    return {
      quote: null,
      wasSelected: false
    };
  }
  
  // Calculate scores for all matching quotes
  const scoredQuotes = availableQuotes.map(quote => {
    const contextMatch = matchContextToTags(context, quote.context_tag);
    const decayWeight = calculateUsageDecayWeight(quote, currentTimestamp);
    
    // Combined score: Context match (70%) + Decay weight (30%)
    const finalScore = (contextMatch * 0.7) + (decayWeight * 0.3);
    
    return {
      quote,
      score: finalScore,
      contextMatch,
      decayWeight
    };
  });
  
  // Filter: Must have at least 20% context match
  const viableQuotes = scoredQuotes.filter(sq => sq.contextMatch >= 0.2);
  
  if (viableQuotes.length === 0) {
    return {
      quote: null,
      wasSelected: false
    };
  }
  
  // Sort by score (highest first)
  viableQuotes.sort((a, b) => b.score - a.score);
  
  // Select top candidate
  const selected = viableQuotes[0];
  
  return {
    quote: selected.quote,
    wasSelected: true,
    selectionWeight: selected.score,
    contextMatch: selected.contextMatch,
    decayWeight: selected.decayWeight
  };
}

/**
 * Update quote usage tracking
 * 
 * @param quoteId - ID of the quote that was used
 */
export function updateQuoteUsage(quoteId: string): void {
  const quote = QuoteMatrix.find(q => q.id === quoteId);
  if (quote) {
    quote.usageCount++;
    quote.lastUsedTimestamp = Math.floor(Date.now() / 1000);
    
    // In production, persist to database/Redis here
    // For now, in-memory update is sufficient
  }
}

/**
 * dAI Quote Fetcher - Main Entry Point
 * 
 * Implements maximum scarcity (10% selection chance) with Usage Decay Weighting.
 * 
 * @param defaultText - Default text to return if no quote is selected
 * @param context - Context for quote matching
 * @param userTier - User's subscription tier (defaults to 'free')
 * @returns QuoteSelectionResult with quote (if selected) or default text
 */
export function dAIQuoteFetcher(
  defaultText: string,
  context: QuoteContext,
  userTier: UserTier = 'free'
): QuoteSelectionResult {
  // MAXIMUM SCARCITY: 10% overall selection chance
  const OVERALL_SELECTION_CHANCE = 0.10;
  const shouldAttemptQuote = Math.random() < OVERALL_SELECTION_CHANCE;
  
  if (!shouldAttemptQuote) {
    return {
      quote: null,
      wasSelected: false
    };
  }
  
  // Attempt to select a quote
  const result = selectQuote(context, userTier);
  
  if (result.wasSelected && result.quote) {
    // Update usage tracking
    updateQuoteUsage(result.quote.id);
  }
  
  return result;
}

/**
 * Format quote for display
 * 
 * @param quote - Selected quote
 * @param includeAttribution - Whether to include movie source (default: only for high subtlety)
 * @returns Formatted quote string
 */
export function formatQuote(quote: Quote, includeAttribution?: boolean): string {
  const shouldAttribute = includeAttribution ?? (quote.subtletyIndex >= 4);
  
  if (shouldAttribute) {
    return `${quote.quote} — ${quote.movieSource}`;
  }
  
  return quote.quote;
}

/**
 * Generate dashboard message with witty wrapper
 * 
 * Example usage for dashboard scenarios
 */
export function createDashboardMessage(
  message: string,
  context: QuoteContext,
  userTier: UserTier = 'free'
): string {
  const result = dAIQuoteFetcher(message, context, userTier);
  
  if (result.wasSelected && result.quote) {
    // For dashboard, integrate quote naturally
    const formattedQuote = formatQuote(result.quote);
    return `${message}\n\n${formattedQuote}`;
  }
  
  return message;
}

