/**
 * Gemini AI Crawler
 *
 * Crawls Google Gemini AI to check dealer visibility in AI-generated responses
 * Part of Real AIV (AI Visibility Index) Scoring System
 */

// Optional import - install @google/generative-ai if using Gemini crawler
let GoogleGenerativeAI: any;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  // Package not installed - Gemini features will be disabled
  GoogleGenerativeAI = null;
}

export interface GeminiVisibilityResult {
  dealerName: string;
  query: string;
  response: string;
  mentioned: boolean;
  mentionCount: number;
  contextSnippets: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  position?: number; // Position in response (1-indexed)
  competitorsMentioned: string[];
  timestamp: Date;
}

export interface GeminiVisibilityScore {
  overallScore: number; // 0-100
  mentionRate: number; // Percentage of queries where mentioned
  averagePosition: number; // Average position when mentioned
  sentimentScore: number; // Positive sentiment rate
  totalQueries: number;
  successfulQueries: number;
  results: GeminiVisibilityResult[];
}

export class GeminiCrawler {
  private genAI: any;
  private model: any;
  private readonly DEFAULT_MODEL = 'gemini-pro';
  private isEnabled: boolean = false;

  constructor(apiKey?: string) {
    if (!GoogleGenerativeAI) {
      console.warn('[GeminiCrawler] @google/generative-ai package not installed, running in mock mode');
      return;
    }

    const key = apiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!key) {
      console.warn('[GeminiCrawler] No API key provided, running in mock mode');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(key);
      this.model = this.genAI.getGenerativeModel({ model: this.DEFAULT_MODEL });
      this.isEnabled = true;
      console.log('[GeminiCrawler] Initialized successfully');
    } catch (error) {
      console.error('[GeminiCrawler] Initialization error:', error);
      // Don't throw - allow mock mode
    }
  }

  /**
   * Check dealer visibility across multiple query types
   */
  async checkVisibility(
    dealerName: string,
    location: string,
    options?: {
      customQueries?: string[];
      includeCompetitors?: boolean;
      competitors?: string[];
    }
  ): Promise<GeminiVisibilityScore> {
    if (!this.model) {
      console.warn('[GeminiCrawler] Running in mock mode');
      return this.getMockVisibilityScore(dealerName, location);
    }

    const queries = options?.customQueries || this.generateQueries(dealerName, location);
    const results: GeminiVisibilityResult[] = [];
    let successfulQueries = 0;

    for (const query of queries) {
      try {
        const result = await this.checkSingleQuery(query, dealerName, options?.competitors);
        results.push(result);
        if (result.mentioned) successfulQueries++;

        // Rate limiting: Wait 1 second between requests
        await this.delay(1000);
      } catch (error) {
        console.error(`[GeminiCrawler] Error for query "${query}":`, error);
        // Continue with other queries
      }
    }

    return this.calculateVisibilityScore(results, dealerName);
  }

  /**
   * Check a single query
   */
  private async checkSingleQuery(
    query: string,
    dealerName: string,
    competitors?: string[]
  ): Promise<GeminiVisibilityResult> {
    try {
      const result = await this.model.generateContent(query);
      const response = result.response.text();

      // Check if dealer is mentioned
      const mentioned = this.isMentioned(response, dealerName);
      const mentionCount = this.countMentions(response, dealerName);
      const position = this.findPosition(response, dealerName);
      const contextSnippets = this.extractContextSnippets(response, dealerName);
      const sentiment = this.analyzeSentiment(response, dealerName);
      const competitorsMentioned = this.findCompetitors(response, competitors || []);

      return {
        dealerName,
        query,
        response,
        mentioned,
        mentionCount,
        contextSnippets,
        sentiment,
        position,
        competitorsMentioned,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[GeminiCrawler] Query error:', error);
      throw error;
    }
  }

  /**
   * Generate standard queries for dealer visibility testing
   */
  private generateQueries(dealerName: string, location: string): string[] {
    const dealerType = this.inferDealerType(dealerName);

    return [
      // Direct dealer queries
      `Tell me about ${dealerName} in ${location}`,
      `What are the reviews for ${dealerName}?`,
      `Is ${dealerName} a good dealership?`,

      // Service queries
      `Where can I service my car in ${location}?`,
      `Best place for ${dealerType} service in ${location}`,
      `${dealerType} maintenance near ${location}`,

      // Buying queries
      `Best ${dealerType} dealership in ${location}`,
      `Where to buy a ${dealerType} in ${location}`,
      `Recommended car dealers in ${location}`,

      // Comparison queries
      `Compare car dealerships in ${location}`,
      `Top rated dealerships near ${location}`,

      // Specific needs
      `${dealerType} dealership with good customer service in ${location}`,
      `Where can I get the best deal on a car in ${location}?`
    ];
  }

  /**
   * Calculate overall visibility score
   */
  private calculateVisibilityScore(
    results: GeminiVisibilityResult[],
    dealerName: string
  ): GeminiVisibilityScore {
    const totalQueries = results.length;
    const mentionedResults = results.filter(r => r.mentioned);
    const successfulQueries = mentionedResults.length;

    // Mention rate (0-100)
    const mentionRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;

    // Average position when mentioned
    const positions = mentionedResults.filter(r => r.position).map(r => r.position!);
    const averagePosition = positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : 0;

    // Sentiment score (% positive)
    const positiveMentions = mentionedResults.filter(r => r.sentiment === 'positive').length;
    const sentimentScore = successfulQueries > 0
      ? (positiveMentions / successfulQueries) * 100
      : 0;

    // Overall score calculation
    // Weighted: 50% mention rate, 30% sentiment, 20% position
    const positionScore = averagePosition > 0 ? Math.max(0, 100 - (averagePosition - 1) * 10) : 0;
    const overallScore = (
      mentionRate * 0.5 +
      sentimentScore * 0.3 +
      positionScore * 0.2
    );

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      mentionRate: Math.round(mentionRate * 10) / 10,
      averagePosition: Math.round(averagePosition * 10) / 10,
      sentimentScore: Math.round(sentimentScore * 10) / 10,
      totalQueries,
      successfulQueries,
      results
    };
  }

  // Helper methods

  private isMentioned(text: string, dealerName: string): boolean {
    const normalizedText = text.toLowerCase();
    const normalizedDealer = dealerName.toLowerCase();

    // Check full name
    if (normalizedText.includes(normalizedDealer)) {
      return true;
    }

    // Check brand name only (e.g., "Toyota" from "Germain Toyota")
    const words = normalizedDealer.split(' ');
    for (const word of words) {
      if (word.length > 3 && normalizedText.includes(word)) {
        return true;
      }
    }

    return false;
  }

  private countMentions(text: string, dealerName: string): number {
    const normalizedText = text.toLowerCase();
    const normalizedDealer = dealerName.toLowerCase();

    const regex = new RegExp(normalizedDealer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);

    return matches ? matches.length : 0;
  }

  private findPosition(text: string, dealerName: string): number | undefined {
    const sentences = text.split(/[.!?]+/);

    for (let i = 0; i < sentences.length; i++) {
      if (this.isMentioned(sentences[i], dealerName)) {
        return i + 1;
      }
    }

    return undefined;
  }

  private extractContextSnippets(text: string, dealerName: string, contextLength: number = 100): string[] {
    const snippets: string[] = [];
    const normalizedText = text.toLowerCase();
    const normalizedDealer = dealerName.toLowerCase();

    let index = normalizedText.indexOf(normalizedDealer);

    while (index !== -1) {
      const start = Math.max(0, index - contextLength);
      const end = Math.min(text.length, index + normalizedDealer.length + contextLength);
      const snippet = text.substring(start, end).trim();

      snippets.push(snippet);

      index = normalizedText.indexOf(normalizedDealer, index + 1);
    }

    return snippets;
  }

  private analyzeSentiment(text: string, dealerName: string): 'positive' | 'neutral' | 'negative' {
    const snippets = this.extractContextSnippets(text, dealerName, 200);

    if (snippets.length === 0) {
      return 'neutral';
    }

    const combinedSnippet = snippets.join(' ').toLowerCase();

    // Positive indicators
    const positiveWords = ['best', 'great', 'excellent', 'recommend', 'top', 'good', 'quality', 'reliable', 'trusted'];
    const positiveCount = positiveWords.filter(word => combinedSnippet.includes(word)).length;

    // Negative indicators
    const negativeWords = ['bad', 'poor', 'avoid', 'worst', 'terrible', 'complaint', 'issue', 'problem'];
    const negativeCount = negativeWords.filter(word => combinedSnippet.includes(word)).length;

    if (positiveCount > negativeCount) {
      return 'positive';
    } else if (negativeCount > positiveCount) {
      return 'negative';
    }

    return 'neutral';
  }

  private findCompetitors(text: string, competitors: string[]): string[] {
    return competitors.filter(competitor =>
      this.isMentioned(text, competitor)
    );
  }

  private inferDealerType(dealerName: string): string {
    const name = dealerName.toLowerCase();

    if (name.includes('toyota')) return 'Toyota';
    if (name.includes('honda')) return 'Honda';
    if (name.includes('ford')) return 'Ford';
    if (name.includes('chevrolet') || name.includes('chevy')) return 'Chevrolet';
    if (name.includes('bmw')) return 'BMW';
    if (name.includes('mercedes')) return 'Mercedes-Benz';
    if (name.includes('nissan')) return 'Nissan';
    if (name.includes('hyundai')) return 'Hyundai';

    return 'car'; // Generic fallback
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mock visibility score for testing without API key
   */
  private getMockVisibilityScore(dealerName: string, location: string): GeminiVisibilityScore {
    const queries = this.generateQueries(dealerName, location);
    const mockResults: GeminiVisibilityResult[] = queries.map((query, idx) => ({
      dealerName,
      query,
      response: `Mock response for query: ${query}. ${idx % 2 === 0 ? `${dealerName} is a great dealership in ${location}.` : 'Generic information about dealerships.'}`,
      mentioned: idx % 2 === 0,
      mentionCount: idx % 2 === 0 ? 1 : 0,
      contextSnippets: idx % 2 === 0 ? [`${dealerName} is a great dealership in ${location}.`] : [],
      sentiment: idx % 2 === 0 ? 'positive' : 'neutral',
      position: idx % 2 === 0 ? Math.floor(idx / 2) + 1 : undefined,
      competitorsMentioned: [],
      timestamp: new Date()
    }));

    return this.calculateVisibilityScore(mockResults, dealerName);
  }
}

export default GeminiCrawler;
