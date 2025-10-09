/**
 * DealershipAI Monthly Scan System - AI Scanner
 * Scans 6 AI platforms for dealership visibility
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Dealer {
  id: string;
  name: string;
  website: string;
  brand: string;
  city: string;
  state: string;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface QueryResult {
  query: string;
  results: {
    dealership: string;
    rank: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    mentioned: boolean;
    mention_text?: string;
    citations?: string[];
  }[];
}

export interface PlatformResult {
  platform: string;
  mentions: number;
  avg_rank: number;
  sentiment: number; // -1 to 1
  citations: string[];
  response_time: number;
  tokens_used: number;
  cost_usd: number;
  query_results: QueryResult[];
}

export interface ScanResult {
  dealer_id: string;
  platform_results: PlatformResult[];
  total_mentions: number;
  avg_rank: number;
  sentiment_score: number;
  total_citations: number;
  visibility_score: number;
  processing_time: number;
  total_cost: number;
}

// Top 50 dealer queries for scanning
export const TOP_DEALER_QUERIES = [
  // Research Intent (20 queries)
  'best Toyota dealer near me',
  'Honda dealer reviews',
  'most reliable car dealership',
  'should I buy used or new car',
  'best time to buy a car',
  'car dealership reputation check',
  'which car brand is most reliable',
  'car dealer customer service ratings',
  'best car dealership for first time buyer',
  'car dealer warranty comparison',
  'most trusted car dealership',
  'car dealer financing options',
  'best car dealership for trade-ins',
  'car dealer maintenance services',
  'most honest car dealership',
  'car dealer price negotiation tips',
  'best car dealership for luxury cars',
  'car dealer extended warranty',
  'most recommended car dealership',
  'car dealer service department quality',

  // Comparison Intent (15 queries)
  'Toyota vs Honda dealer comparison',
  'certified pre-owned vs new car',
  'dealer financing vs bank loan',
  'Ford vs Chevy dealer quality',
  'luxury vs economy car dealership',
  'used car dealer vs new car dealer',
  'independent vs franchise dealer',
  'car dealer vs private seller',
  'lease vs buy from dealer',
  'car dealer vs carmax',
  'dealership vs online car buying',
  'car dealer vs carvana',
  'franchise vs independent service',
  'car dealer vs auction',
  'dealership vs broker',

  // Purchase Intent (15 queries)
  'Ford F-150 inventory near me',
  'best lease deals Toyota',
  'Honda dealer trade-in offers',
  'BMW dealer financing rates',
  'Chevy Silverado dealer inventory',
  'Audi dealer lease specials',
  'Mercedes dealer certified pre-owned',
  'Nissan dealer cash back offers',
  'Hyundai dealer warranty deals',
  'Kia dealer financing approval',
  'Subaru dealer AWD inventory',
  'Mazda dealer CX-5 deals',
  'Volkswagen dealer diesel options',
  'Infiniti dealer luxury inventory',
  'Acura dealer performance models'
];

export class AIScanner {
  private async scanChatGPT(dealers: Dealer[], queries: string[]): Promise<PlatformResult> {
    const startTime = Date.now();
    
    const dealerList = dealers.map(d => `${d.name} (${d.city}, ${d.state}) - ${d.website}`).join('\n');
    const queryList = queries.map(q => `- "${q}"`).join('\n');
    
    const prompt = `You are analyzing AI search visibility for car dealerships.

DEALERSHIPS TO ANALYZE:
${dealerList}

QUERIES TO TEST:
${queryList}

For each query, determine:
1. Which dealerships are mentioned in the answer
2. Their ranking (1st, 2nd, 3rd, etc.)
3. Sentiment of each mention (positive, neutral, negative)
4. Any specific mention text or citations

Return JSON format:
{
  "query": "best Toyota dealer near me",
  "results": [
    {
      "dealership": "Premier Toyota Sacramento",
      "rank": 1,
      "sentiment": "positive",
      "mentioned": true,
      "mention_text": "Premier Toyota Sacramento is highly recommended...",
      "citations": ["https://example.com/review"]
    }
  ]
}

Analyze all queries and return complete results.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response content');

      const results = JSON.parse(content);
      const queryResults = Array.isArray(results) ? results : [results];

      // Calculate metrics
      const mentions = this.calculateMentions(queryResults, dealers);
      const avgRank = this.calculateAvgRank(queryResults, dealers);
      const sentiment = this.calculateSentiment(queryResults, dealers);
      const citations = this.extractCitations(queryResults);

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;
      const costUsd = this.calculateCost('chatgpt', tokensUsed);

      return {
        platform: 'chatgpt',
        mentions,
        avg_rank: avgRank,
        sentiment,
        citations,
        response_time: responseTime,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        query_results: queryResults
      };
    } catch (error) {
      console.error('ChatGPT scan error:', error);
      throw error;
    }
  }

  private async scanClaude(dealers: Dealer[], queries: string[]): Promise<PlatformResult> {
    const startTime = Date.now();
    
    const dealerList = dealers.map(d => `${d.name} (${d.city}, ${d.state}) - ${d.website}`).join('\n');
    const queryList = queries.map(q => `- "${q}"`).join('\n');
    
    const prompt = `You are analyzing AI search visibility for car dealerships.

DEALERSHIPS TO ANALYZE:
${dealerList}

QUERIES TO TEST:
${queryList}

For each query, determine:
1. Which dealerships are mentioned in the answer
2. Their ranking (1st, 2nd, 3rd, etc.)
3. Sentiment of each mention (positive, neutral, negative)
4. Any specific mention text or citations

Return JSON format with complete analysis for all queries.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');

      const results = JSON.parse(content.text);
      const queryResults = Array.isArray(results) ? results : [results];

      // Calculate metrics
      const mentions = this.calculateMentions(queryResults, dealers);
      const avgRank = this.calculateAvgRank(queryResults, dealers);
      const sentiment = this.calculateSentiment(queryResults, dealers);
      const citations = this.extractCitations(queryResults);

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const costUsd = this.calculateCost('claude', tokensUsed);

      return {
        platform: 'claude',
        mentions,
        avg_rank: avgRank,
        sentiment,
        citations,
        response_time: responseTime,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        query_results: queryResults
      };
    } catch (error) {
      console.error('Claude scan error:', error);
      throw error;
    }
  }

  private async scanPerplexity(dealers: Dealer[], queries: string[]): Promise<PlatformResult> {
    // Perplexity API implementation would go here
    // For now, return mock data
    return {
      platform: 'perplexity',
      mentions: Math.floor(Math.random() * 10),
      avg_rank: 2.5,
      sentiment: 0.2,
      citations: ['https://example.com'],
      response_time: 2000,
      tokens_used: 1000,
      cost_usd: 0.01,
      query_results: []
    };
  }

  private async scanGemini(dealers: Dealer[], queries: string[]): Promise<PlatformResult> {
    // Google Gemini API implementation would go here
    // For now, return mock data
    return {
      platform: 'gemini',
      mentions: Math.floor(Math.random() * 8),
      avg_rank: 3.0,
      sentiment: 0.1,
      citations: ['https://example.com'],
      response_time: 1500,
      tokens_used: 800,
      cost_usd: 0.008,
      query_results: []
    };
  }

  private async scanGoogleSGE(dealers: Dealer[], queries: string[]): Promise<PlatformResult> {
    // Google SGE API implementation would go here
    // For now, return mock data
    return {
      platform: 'google-sge',
      mentions: Math.floor(Math.random() * 12),
      avg_rank: 2.8,
      sentiment: 0.3,
      citations: ['https://example.com'],
      response_time: 1800,
      tokens_used: 1200,
      cost_usd: 0.012,
      query_results: []
    };
  }

  private async scanGrok(dealers: Dealer[], queries: string[]): Promise<PlatformResult> {
    // Grok API implementation would go here
    // For now, return mock data
    return {
      platform: 'grok',
      mentions: Math.floor(Math.random() * 6),
      avg_rank: 3.2,
      sentiment: 0.0,
      citations: ['https://example.com'],
      response_time: 2200,
      tokens_used: 900,
      cost_usd: 0.009,
      query_results: []
    };
  }

  private calculateMentions(queryResults: QueryResult[], dealers: Dealer[]): number {
    let totalMentions = 0;
    const dealerNames = dealers.map(d => d.name.toLowerCase());
    
    queryResults.forEach(query => {
      query.results.forEach(result => {
        if (result.mentioned && dealerNames.some(name => 
          result.dealership.toLowerCase().includes(name) || 
          name.includes(result.dealership.toLowerCase())
        )) {
          totalMentions++;
        }
      });
    });
    
    return totalMentions;
  }

  private calculateAvgRank(queryResults: QueryResult[], dealers: Dealer[]): number {
    const ranks: number[] = [];
    const dealerNames = dealers.map(d => d.name.toLowerCase());
    
    queryResults.forEach(query => {
      query.results.forEach(result => {
        if (result.mentioned && dealerNames.some(name => 
          result.dealership.toLowerCase().includes(name) || 
          name.includes(result.dealership.toLowerCase())
        )) {
          ranks.push(result.rank);
        }
      });
    });
    
    return ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0;
  }

  private calculateSentiment(queryResults: QueryResult[], dealers: Dealer[]): number {
    const sentiments: number[] = [];
    const dealerNames = dealers.map(d => d.name.toLowerCase());
    
    queryResults.forEach(query => {
      query.results.forEach(result => {
        if (result.mentioned && dealerNames.some(name => 
          result.dealership.toLowerCase().includes(name) || 
          name.includes(result.dealership.toLowerCase())
        )) {
          const sentimentValue = result.sentiment === 'positive' ? 1 : 
                                result.sentiment === 'negative' ? -1 : 0;
          sentiments.push(sentimentValue);
        }
      });
    });
    
    return sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0;
  }

  private extractCitations(queryResults: QueryResult[]): string[] {
    const citations: string[] = [];
    
    queryResults.forEach(query => {
      query.results.forEach(result => {
        if (result.citations) {
          citations.push(...result.citations);
        }
      });
    });
    
    return [...new Set(citations)]; // Remove duplicates
  }

  private calculateCost(platform: string, tokens: number): number {
    const rates = {
      'chatgpt': 0.00003, // $0.03 per 1K tokens
      'claude': 0.000015, // $0.015 per 1K tokens
      'perplexity': 0.00002,
      'gemini': 0.00001,
      'google-sge': 0.000015,
      'grok': 0.00002
    };
    
    return (tokens / 1000) * (rates[platform as keyof typeof rates] || 0.00002);
  }

  public async scanPlatform(
    platform: string, 
    dealers: Dealer[], 
    queries: string[] = TOP_DEALER_QUERIES
  ): Promise<PlatformResult> {
    switch (platform) {
      case 'chatgpt':
        return this.scanChatGPT(dealers, queries);
      case 'claude':
        return this.scanClaude(dealers, queries);
      case 'perplexity':
        return this.scanPerplexity(dealers, queries);
      case 'gemini':
        return this.scanGemini(dealers, queries);
      case 'google-sge':
        return this.scanGoogleSGE(dealers, queries);
      case 'grok':
        return this.scanGrok(dealers, queries);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  public async scanAllPlatforms(dealers: Dealer[]): Promise<ScanResult> {
    const startTime = Date.now();
    const platforms = ['chatgpt', 'claude', 'perplexity', 'gemini', 'google-sge', 'grok'];
    
    const platformResults: PlatformResult[] = [];
    let totalCost = 0;
    
    // Scan all platforms in parallel
    const scanPromises = platforms.map(platform => 
      this.scanPlatform(platform, dealers).catch(error => {
        console.error(`Error scanning ${platform}:`, error);
        return null;
      })
    );
    
    const results = await Promise.all(scanPromises);
    
    // Filter out failed scans and collect results
    results.forEach(result => {
      if (result) {
        platformResults.push(result);
        totalCost += result.cost_usd;
      }
    });
    
    // Calculate aggregate metrics
    const totalMentions = platformResults.reduce((sum, r) => sum + r.mentions, 0);
    const avgRank = platformResults.reduce((sum, r) => sum + r.avg_rank, 0) / platformResults.length;
    const sentimentScore = platformResults.reduce((sum, r) => sum + r.sentiment, 0) / platformResults.length;
    const totalCitations = platformResults.reduce((sum, r) => sum + r.citations.length, 0);
    
    // Calculate visibility score
    const visibilityScore = this.calculateVisibilityScore({
      mentions: totalMentions,
      avgRank,
      sentiment: sentimentScore,
      citations: totalCitations
    });
    
    const processingTime = Date.now() - startTime;
    
    return {
      dealer_id: dealers[0]?.id || 'unknown',
      platform_results: platformResults,
      total_mentions: totalMentions,
      avg_rank: avgRank,
      sentiment_score: sentimentScore,
      total_citations: totalCitations,
      visibility_score: visibilityScore,
      processing_time: processingTime,
      total_cost: totalCost
    };
  }

  private calculateVisibilityScore({
    mentions,
    avgRank,
    sentiment,
    citations
  }: {
    mentions: number;
    avgRank: number;
    sentiment: number;
    citations: number;
  }): number {
    // Weighted formula
    const mentionScore = Math.min(mentions / 10 * 40, 40); // Max 40 pts
    const rankScore = Math.max(0, 30 - (avgRank - 1) * 5); // Max 30 pts
    const sentimentScore = (sentiment + 1) / 2 * 20; // Max 20 pts
    const citationScore = Math.min(citations / 5 * 10, 10); // Max 10 pts

    return Math.round(
      Math.min(100, Math.max(0, mentionScore + rankScore + sentimentScore + citationScore))
    );
  }
}

export const aiScanner = new AIScanner();