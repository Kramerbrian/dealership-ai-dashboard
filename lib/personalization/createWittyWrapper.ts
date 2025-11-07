/**
 * dAI Personality Agent - Witty Quote Wrapper
 * 
 * Implements Usage Decay Weighting with maximum scarcity (Easter Egg effect).
 * Only 10% of requests will receive a quote (90% default text).
 * 
 * Persona: Ryan Reynolds + Dave Chappelle + Jerry Seinfeld + Shane Gillis
 * Style: Subtle, dry humor, sharp-witted, respectful, confident coach
 */

import { QuoteMatrix, Quote } from './QuoteMatrix';

export interface QuoteContext {
  type: 'error' | 'success' | 'warning' | 'info' | 'action' | 'data' | 'competitor' | 'urgency' | 'vision' | 'roi';
  severity?: 'low' | 'medium' | 'high';
  keywords?: string[];
}

export interface WittyWrapperResult {
  quote: string | null;
  movieSource: string | null;
  defaultText: string;
  wasQuoted: boolean;
}

/**
 * Calculate Usage Decay Weight for a quote
 * 
 * Formula: Higher weight = less recently used + lower usage count + higher subtlety
 * 
 * @param quote - Quote from QuoteMatrix
 * @param currentTimestamp - Current Unix timestamp
 * @returns Weight score (higher = better candidate)
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
  
  // Context type mapping
  const contextTypeMap: Record<QuoteContext['type'], string[]> = {
    error: ['error', 'failure', 'system limitation', 'unmet request'],
    success: ['success', 'breakthrough', 'achievement', 'high conversion'],
    warning: ['urgency', 'scaling', 'capacity', 'high-volume problem'],
    info: ['data insight', 'kpi spike', 'validation', 'discovery'],
    action: ['action item', 'delegation', 'task management', 'process demand'],
    data: ['data insight', 'kpi spike', 'validation', 'discovery'],
    competitor: ['competitive intel', 'market share', 'dominance', 'acquisition'],
    urgency: ['urgency', 'procrastination', 'action', 'deadlines'],
    vision: ['vision', 'introduction', 'opportunity', 'ambition'],
    roi: ['roi', 'revenue', 'value proposition', 'negotiation']
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
 * Select best matching quote with Usage Decay Weighting
 * 
 * @param context - User's context
 * @returns Selected quote or null
 */
function selectQuote(context: QuoteContext): Quote | null {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  
  // Filter PG-rated quotes only (guardrail)
  const pgQuotes = QuoteMatrix.filter(q => q.rating === 'PG');
  
  if (pgQuotes.length === 0) {
    return null;
  }
  
  // Calculate scores for all matching quotes
  const scoredQuotes = pgQuotes.map(quote => {
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
    return null;
  }
  
  // Sort by score (highest first)
  viableQuotes.sort((a, b) => b.score - a.score);
  
  // Select top candidate
  return viableQuotes[0].quote;
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
 * Create witty wrapper with PG-rated Easter Egg quotes
 * 
 * MAXIMUM SCARCITY: Only 10% chance of returning a quote (90% default text)
 * 
 * @param defaultText - Default text to return if no quote is selected
 * @param context - Context for quote matching
 * @returns WittyWrapperResult with quote (if selected) or default text
 */
export function createWittyWrapper(
  defaultText: string,
  context: QuoteContext
): WittyWrapperResult {
  // MAXIMUM SCARCITY: 10% overall selection chance
  const OVERALL_SELECTION_CHANCE = 0.10;
  const shouldAttemptQuote = Math.random() < OVERALL_SELECTION_CHANCE;
  
  if (!shouldAttemptQuote) {
    return {
      quote: null,
      movieSource: null,
      defaultText,
      wasQuoted: false
    };
  }
  
  // Attempt to select a quote
  const selectedQuote = selectQuote(context);
  
  if (!selectedQuote) {
    return {
      quote: null,
      movieSource: null,
      defaultText,
      wasQuoted: false
    };
  }
  
  // Update usage tracking
  updateQuoteUsage(selectedQuote.id);
  
  // Return quote with subtle attribution (only for high subtlety)
  const attribution = selectedQuote.subtletyIndex >= 4 
    ? ` — ${selectedQuote.movieSource}`
    : '';
  
  return {
    quote: `${selectedQuote.quote}${attribution}`,
    movieSource: selectedQuote.movieSource,
    defaultText,
    wasQuoted: true
  };
}

/**
 * Generate dashboard message with witty wrapper
 * 
 * Example usage for dashboard scenarios
 */
export function createDashboardMessage(
  message: string,
  context: QuoteContext
): string {
  const wrapper = createWittyWrapper(message, context);
  
  if (wrapper.wasQuoted && wrapper.quote) {
    // For dashboard, integrate quote naturally
    return `${message}\n\n${wrapper.quote}`;
  }
  
  return wrapper.defaultText;
}

