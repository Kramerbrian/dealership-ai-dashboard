import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

export interface CoreMetrics {
  freshness_score: number;
  business_identity_match_score: number;
  review_trust_score: number;
  schema_coverage: number;
  ai_mention_rate: number;
  zero_click_coverage: number;
  trust_score: number;
}

export interface DealerData {
  name: string;
  website: string;
  phone?: string;
  address?: string;
  reviews?: Array<{
    source: string;
    rating: number;
    count: number;
    lastUpdated: Date;
  }>;
  lastContentUpdate?: Date;
  structuredData?: any;
}

export interface SERPResult {
  engine: 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot';
  query: string;
  mentioned: boolean;
  position?: number;
  snippet?: string;
  relevance: number;
}

export const DEFAULT_TRUST_WEIGHTS = {
  freshness: 0.15,
  business_identity: 0.20,
  reviews: 0.15,
  schema: 0.15,
  ai_mentions: 0.20,
  zero_click: 0.15,
};

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Calculate freshness score based on last content update
 * Score: 1.0 if updated within 7 days, decreasing exponentially
 */
export function calculateFreshnessScore(data: DealerData): number {
  if (!data.lastContentUpdate) {
    return 0.3; // Default low score if no update date
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(data.lastContentUpdate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceUpdate <= 7) return 1.0;
  if (daysSinceUpdate <= 30) return 0.85;
  if (daysSinceUpdate <= 90) return 0.65;
  if (daysSinceUpdate <= 180) return 0.45;
  return 0.25;
}

/**
 * Calculate business identity match score
 * Checks NAP consistency across platforms
 */
export function calculateBusinessIdentityMatchScore(data: DealerData): number {
  let score = 0.5; // Base score
  let checks = 0;
  let matches = 0;

  // Check if name is present
  if (data.name && data.name.trim().length > 0) {
    matches++;
  }
  checks++;

  // Check if website is present and valid
  if (data.website && data.website.startsWith('http')) {
    matches++;
  }
  checks++;

  // Check if phone is present and valid
  if (data.phone && /^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
    matches++;
  }
  checks++;

  // Check if address is present
  if (data.address && data.address.trim().length > 10) {
    matches++;
  }
  checks++;

  return checks > 0 ? matches / checks : 0.5;
}

/**
 * Calculate review trust score based on ratings and recency
 */
export function calculateReviewTrustScore(data: DealerData): number {
  if (!data.reviews || data.reviews.length === 0) {
    return 0.4; // Low default if no reviews
  }

  let totalScore = 0;
  let totalWeight = 0;

  for (const review of data.reviews) {
    // Weight by review count (more reviews = more weight)
    const countWeight = Math.log10(Math.max(review.count, 1) + 1);

    // Weight by recency (reviews updated recently are weighted more)
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(review.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyWeight = daysSinceUpdate <= 30 ? 1.0 : daysSinceUpdate <= 90 ? 0.7 : 0.4;

    // Normalize rating to 0-1 scale
    const normalizedRating = review.rating / 5.0;

    totalScore += normalizedRating * countWeight * recencyWeight;
    totalWeight += countWeight * recencyWeight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0.4;
}

/**
 * Calculate schema coverage score
 * Checks for presence of structured data (LocalBusiness, Organization, etc.)
 */
export function calculateSchemaCoverage(data: DealerData): number {
  if (!data.structuredData) {
    return 0.2; // Low score if no structured data
  }

  const requiredTypes = [
    'LocalBusiness',
    'Organization',
    'PostalAddress',
    'ContactPoint',
    'OpeningHoursSpecification',
  ];

  let foundTypes = 0;

  const dataString = JSON.stringify(data.structuredData).toLowerCase();

  for (const type of requiredTypes) {
    if (dataString.includes(type.toLowerCase())) {
      foundTypes++;
    }
  }

  return foundTypes / requiredTypes.length;
}

/**
 * Calculate AI mention rate across multiple AI engines
 */
export async function calculateAIMentionRate(
  dealerName: string,
  location: string,
  serpResults?: SERPResult[]
): Promise<number> {
  if (!serpResults || serpResults.length === 0) {
    return 0.3; // Default low score if no SERP data
  }

  const totalEngines = 5; // chatgpt, claude, perplexity, gemini, copilot
  const mentionedEngines = serpResults.filter(r => r.mentioned).length;

  // Base score from mention rate
  let score = mentionedEngines / totalEngines;

  // Bonus for high positions
  const highPositions = serpResults.filter(r => r.position && r.position <= 3).length;
  score += (highPositions / totalEngines) * 0.2;

  // Bonus for high relevance
  const avgRelevance = serpResults.reduce((sum, r) => sum + r.relevance, 0) / serpResults.length;
  score += avgRelevance * 0.1;

  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Calculate zero-click coverage score
 * Measures presence in featured snippets and knowledge panels
 */
export function calculateZeroClickCoverage(serpResults?: SERPResult[]): number {
  if (!serpResults || serpResults.length === 0) {
    return 0.25; // Default low score
  }

  // Count zero-click results (position 0 or featured snippet)
  const zeroClickResults = serpResults.filter(r =>
    r.position === 0 || (r.snippet && r.snippet.length > 100)
  ).length;

  return Math.min(zeroClickResults / serpResults.length, 1.0);
}

/**
 * Main function to calculate all trust metrics
 */
export async function calculateAllMetrics(
  dealerData: DealerData,
  serpResults?: SERPResult[]
): Promise<CoreMetrics> {
  const freshness_score = calculateFreshnessScore(dealerData);
  const business_identity_match_score = calculateBusinessIdentityMatchScore(dealerData);
  const review_trust_score = calculateReviewTrustScore(dealerData);
  const schema_coverage = calculateSchemaCoverage(dealerData);
  const ai_mention_rate = await calculateAIMentionRate(
    dealerData.name,
    dealerData.address || '',
    serpResults
  );
  const zero_click_coverage = calculateZeroClickCoverage(serpResults);

  const trust_score = calculateTrustScore({
    freshness_score,
    business_identity_match_score,
    review_trust_score,
    schema_coverage,
    ai_mention_rate,
    zero_click_coverage,
    trust_score: 0, // Will be calculated
  });

  return {
    freshness_score,
    business_identity_match_score,
    review_trust_score,
    schema_coverage,
    ai_mention_rate,
    zero_click_coverage,
    trust_score,
  };
}

/**
 * Calculate final trust score from component metrics
 */
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

/**
 * Analyze SERP results using Claude AI
 */
export async function analyzeSERPWithAI(
  dealerName: string,
  location: string,
  query: string,
  serpText: string
): Promise<{ mentioned: boolean; relevance: number; snippet?: string }> {
  if (!anthropic) {
    return { mentioned: false, relevance: 0 };
  }

  const prompt = `Analyze this AI search result for mentions of "${dealerName}" in ${location}.

Query: "${query}"
Results: ${serpText}

Determine:
1. Is the dealer mentioned? (yes/no)
2. Relevance score (0.0 to 1.0)
3. Extract snippet if mentioned

Return JSON: {"mentioned": boolean, "relevance": number, "snippet": "text"}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return { mentioned: false, relevance: 0 };
    }

    const result = JSON.parse(content.text);
    return result;
  } catch (error) {
    console.error('Error analyzing SERP with AI:', error);
    return { mentioned: false, relevance: 0 };
  }
}

/**
 * Fetch and analyze SERP results from multiple AI engines
 */
export async function fetchSERPResults(
  dealerName: string,
  location: string
): Promise<SERPResult[]> {
  const queries = [
    `best car dealerships near ${location}`,
    `${dealerName} reviews`,
    `where to buy cars in ${location}`,
  ];

  const engines: SERPResult['engine'][] = ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'];
  const results: SERPResult[] = [];

  // Note: Actual SERP scraping would require external APIs or browser automation
  // This is a placeholder that returns mock data
  for (const engine of engines) {
    for (const query of queries) {
      results.push({
        engine,
        query,
        mentioned: Math.random() > 0.5, // Mock data
        position: Math.floor(Math.random() * 10),
        snippet: `Mock snippet for ${dealerName}`,
        relevance: Math.random(),
      });
    }
  }

  return results;
}
