/**
 * Extended AI Visibility Metrics System
 * 
 * Comprehensive AI visibility tracking across multiple sources:
 * - ChatGPT, Claude, Perplexity, Gemini, Copilot
 * - Voice assistants (Siri, Alexa, Google Assistant)
 * - AI-powered search engines
 * - Social media AI features
 * - E-commerce AI recommendations
 */

import { supabaseAdmin } from './supabase';

export interface AIVisibilitySource {
  id: string;
  name: string;
  type: 'text_ai' | 'voice_ai' | 'search_ai' | 'social_ai' | 'ecommerce_ai';
  platform: string;
  description: string;
  weight: number; // Importance weight for overall score
  is_active: boolean;
  api_endpoint?: string;
  last_updated: string;
}

export interface AIVisibilityMetric {
  source_id: string;
  dealer_id: string;
  query: string;
  position: number;
  visibility_score: number;
  mention_type: 'direct' | 'indirect' | 'citation' | 'recommendation';
  sentiment: 'positive' | 'neutral' | 'negative';
  context: string;
  confidence: number;
  timestamp: string;
}

export interface AIVisibilitySummary {
  dealer_id: string;
  overall_score: number;
  source_scores: Record<string, number>;
  query_coverage: number;
  top_queries: Array<{
    query: string;
    frequency: number;
    avg_position: number;
    visibility_score: number;
  }>;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trend_direction: 'up' | 'down' | 'stable';
  trend_magnitude: number;
  last_updated: string;
}

export interface AIQueryInsight {
  query: string;
  category: 'brand' | 'service' | 'location' | 'product' | 'comparison' | 'general';
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  volume: number;
  competition_level: 'low' | 'medium' | 'high';
  opportunity_score: number;
  current_position: number;
  target_position: number;
  improvement_potential: number;
}

export class ExtendedAIVisibilityEngine {
  private supabase: any;
  private sources: Map<string, AIVisibilitySource> = new Map();

  constructor() {
    this.supabase = supabaseAdmin;
    this.initializeSources();
  }

  /**
   * Initialize AI visibility sources
   */
  private initializeSources(): void {
    const sources: AIVisibilitySource[] = [
      // Text AI Platforms
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        type: 'text_ai',
        platform: 'OpenAI',
        description: 'OpenAI ChatGPT conversational AI',
        weight: 0.25,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'claude',
        name: 'Claude',
        type: 'text_ai',
        platform: 'Anthropic',
        description: 'Anthropic Claude AI assistant',
        weight: 0.20,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'perplexity',
        name: 'Perplexity',
        type: 'text_ai',
        platform: 'Perplexity AI',
        description: 'Perplexity AI search engine',
        weight: 0.15,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'gemini',
        name: 'Gemini',
        type: 'text_ai',
        platform: 'Google',
        description: 'Google Gemini AI model',
        weight: 0.20,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'copilot',
        name: 'Copilot',
        type: 'text_ai',
        platform: 'Microsoft',
        description: 'Microsoft Copilot AI assistant',
        weight: 0.10,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      
      // Voice AI Platforms
      {
        id: 'siri',
        name: 'Siri',
        type: 'voice_ai',
        platform: 'Apple',
        description: 'Apple Siri voice assistant',
        weight: 0.15,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'alexa',
        name: 'Alexa',
        type: 'voice_ai',
        platform: 'Amazon',
        description: 'Amazon Alexa voice assistant',
        weight: 0.10,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'google_assistant',
        name: 'Google Assistant',
        type: 'voice_ai',
        platform: 'Google',
        description: 'Google Assistant voice AI',
        weight: 0.15,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      
      // Search AI Platforms
      {
        id: 'google_ai_search',
        name: 'Google AI Search',
        type: 'search_ai',
        platform: 'Google',
        description: 'Google AI-powered search features',
        weight: 0.30,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'bing_ai',
        name: 'Bing AI',
        type: 'search_ai',
        platform: 'Microsoft',
        description: 'Microsoft Bing AI search',
        weight: 0.15,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      
      // Social AI Platforms
      {
        id: 'meta_ai',
        name: 'Meta AI',
        type: 'social_ai',
        platform: 'Meta',
        description: 'Meta AI features in social platforms',
        weight: 0.10,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'tiktok_ai',
        name: 'TikTok AI',
        type: 'social_ai',
        platform: 'TikTok',
        description: 'TikTok AI recommendation system',
        weight: 0.08,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
      
      // E-commerce AI Platforms
      {
        id: 'amazon_ai',
        name: 'Amazon AI',
        type: 'ecommerce_ai',
        platform: 'Amazon',
        description: 'Amazon AI recommendation engine',
        weight: 0.12,
        is_active: true,
        last_updated: new Date().toISOString(),
      },
    ];

    sources.forEach(source => {
      this.sources.set(source.id, source);
    });
  }

  /**
   * Calculate comprehensive AI visibility score
   */
  async calculateAIVisibilityScore(dealerId: string): Promise<AIVisibilitySummary> {
    try {
      // Get metrics for all active sources
      const metrics = await this.getAIVisibilityMetrics(dealerId);
      
      // Calculate source-specific scores
      const sourceScores: Record<string, number> = {};
      const queryCoverage = new Set<string>();
      const topQueries: Array<{
        query: string;
        frequency: number;
        avg_position: number;
        visibility_score: number;
      }> = [];
      
      const sentimentBreakdown = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };

      // Process metrics by source
      for (const [sourceId, sourceMetrics] of Object.entries(metrics)) {
        if (sourceMetrics.length === 0) {
          sourceScores[sourceId] = 0;
          continue;
        }

        // Calculate source score
        const avgPosition = sourceMetrics.reduce((sum, m) => sum + m.position, 0) / sourceMetrics.length;
        const avgVisibility = sourceMetrics.reduce((sum, m) => sum + m.visibility_score, 0) / sourceMetrics.length;
        const avgConfidence = sourceMetrics.reduce((sum, m) => sum + m.confidence, 0) / sourceMetrics.length;
        
        // Weight by position (lower position = higher score)
        const positionScore = Math.max(0, 100 - (avgPosition - 1) * 10);
        sourceScores[sourceId] = (positionScore * 0.4 + avgVisibility * 0.4 + avgConfidence * 0.2);

        // Collect queries and sentiment
        sourceMetrics.forEach(metric => {
          queryCoverage.add(metric.query);
          
          // Update sentiment breakdown
          sentimentBreakdown[metric.sentiment]++;
          
          // Add to top queries
          const existingQuery = topQueries.find(q => q.query === metric.query);
          if (existingQuery) {
            existingQuery.frequency++;
            existingQuery.avg_position = (existingQuery.avg_position + metric.position) / 2;
            existingQuery.visibility_score = (existingQuery.visibility_score + metric.visibility_score) / 2;
          } else {
            topQueries.push({
              query: metric.query,
              frequency: 1,
              avg_position: metric.position,
              visibility_score: metric.visibility_score,
            });
          }
        });
      }

      // Calculate overall weighted score
      let overallScore = 0;
      let totalWeight = 0;

      for (const [sourceId, score] of Object.entries(sourceScores)) {
        const source = this.sources.get(sourceId);
        if (source && source.is_active) {
          overallScore += score * source.weight;
          totalWeight += source.weight;
        }
      }

      overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;

      // Sort top queries by frequency and visibility
      topQueries.sort((a, b) => (b.frequency * b.visibility_score) - (a.frequency * a.visibility_score));

      // Calculate trend
      const trend = await this.calculateTrend(dealerId, overallScore);

      return {
        dealer_id: dealerId,
        overall_score: Math.round(overallScore),
        source_scores: sourceScores,
        query_coverage: queryCoverage.size,
        top_queries: topQueries.slice(0, 10),
        sentiment_breakdown,
        trend_direction: trend.direction,
        trend_magnitude: trend.magnitude,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error calculating AI visibility score:', error);
      return this.getDefaultAIVisibilitySummary(dealerId);
    }
  }

  /**
   * Get AI visibility metrics for a dealer
   */
  private async getAIVisibilityMetrics(dealerId: string): Promise<Record<string, AIVisibilityMetric[]>> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('ai_visibility_metrics')
          .select('*')
          .eq('dealer_id', dealerId)
          .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Group by source
        const groupedMetrics: Record<string, AIVisibilityMetric[]> = {};
        data?.forEach((metric: AIVisibilityMetric) => {
          if (!groupedMetrics[metric.source_id]) {
            groupedMetrics[metric.source_id] = [];
          }
          groupedMetrics[metric.source_id].push(metric);
        });

        return groupedMetrics;
      }
    } catch (error) {
      console.error('Error fetching AI visibility metrics:', error);
    }

    // Return mock data for development
    return this.getMockAIVisibilityMetrics(dealerId);
  }

  /**
   * Calculate trend direction and magnitude
   */
  private async calculateTrend(dealerId: string, currentScore: number): Promise<{
    direction: 'up' | 'down' | 'stable';
    magnitude: number;
  }> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('ai_visibility_history')
          .select('overall_score')
          .eq('dealer_id', dealerId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length >= 2) {
          const previousScore = data[1].overall_score;
          const difference = currentScore - previousScore;
          const magnitude = Math.abs(difference);

          if (magnitude < 2) {
            return { direction: 'stable', magnitude: 0 };
          } else if (difference > 0) {
            return { direction: 'up', magnitude };
          } else {
            return { direction: 'down', magnitude };
          }
        }
      }
    } catch (error) {
      console.error('Error calculating trend:', error);
    }

    return { direction: 'stable', magnitude: 0 };
  }

  /**
   * Get query insights and opportunities
   */
  async getQueryInsights(dealerId: string): Promise<AIQueryInsight[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('ai_query_insights')
          .select('*')
          .eq('dealer_id', dealerId)
          .order('opportunity_score', { ascending: false });

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching query insights:', error);
    }

    return this.getMockQueryInsights();
  }

  /**
   * Store AI visibility metrics
   */
  async storeAIVisibilityMetrics(metrics: AIVisibilityMetric[]): Promise<void> {
    try {
      if (this.supabase) {
        await this.supabase
          .from('ai_visibility_metrics')
          .insert(metrics);
      }
    } catch (error) {
      console.error('Error storing AI visibility metrics:', error);
    }
  }

  /**
   * Store AI visibility summary
   */
  async storeAIVisibilitySummary(summary: AIVisibilitySummary): Promise<void> {
    try {
      if (this.supabase) {
        await this.supabase
          .from('ai_visibility_history')
          .insert({
            dealer_id: summary.dealer_id,
            overall_score: summary.overall_score,
            source_scores: summary.source_scores,
            query_coverage: summary.query_coverage,
            sentiment_breakdown: summary.sentiment_breakdown,
            trend_direction: summary.trend_direction,
            trend_magnitude: summary.trend_magnitude,
            created_at: summary.last_updated,
          });
      }
    } catch (error) {
      console.error('Error storing AI visibility summary:', error);
    }
  }

  /**
   * Get AI visibility sources
   */
  getAIVisibilitySources(): AIVisibilitySource[] {
    return Array.from(this.sources.values()).filter(source => source.is_active);
  }

  /**
   * Update source configuration
   */
  updateSource(sourceId: string, updates: Partial<AIVisibilitySource>): boolean {
    const source = this.sources.get(sourceId);
    if (!source) return false;

    const updatedSource = {
      ...source,
      ...updates,
      last_updated: new Date().toISOString(),
    };

    this.sources.set(sourceId, updatedSource);
    return true;
  }

  /**
   * Get mock AI visibility metrics
   */
  private getMockAIVisibilityMetrics(dealerId: string): Record<string, AIVisibilityMetric[]> {
    const mockMetrics: Record<string, AIVisibilityMetric[]> = {};

    // Mock ChatGPT metrics
    mockMetrics['chatgpt'] = [
      {
        source_id: 'chatgpt',
        dealer_id: dealerId,
        query: 'best car dealership near me',
        position: 3,
        visibility_score: 85,
        mention_type: 'direct',
        sentiment: 'positive',
        context: 'Recommended as a top-rated dealership with excellent customer service',
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      },
      {
        source_id: 'chatgpt',
        dealer_id: dealerId,
        query: 'Toyota dealership reviews',
        position: 5,
        visibility_score: 72,
        mention_type: 'citation',
        sentiment: 'neutral',
        context: 'Mentioned in list of local Toyota dealerships',
        confidence: 0.8,
        timestamp: new Date().toISOString(),
      },
    ];

    // Mock Claude metrics
    mockMetrics['claude'] = [
      {
        source_id: 'claude',
        dealer_id: dealerId,
        query: 'reliable car dealership',
        position: 2,
        visibility_score: 90,
        mention_type: 'recommendation',
        sentiment: 'positive',
        context: 'Highly recommended for reliability and customer satisfaction',
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      },
    ];

    // Mock Perplexity metrics
    mockMetrics['perplexity'] = [
      {
        source_id: 'perplexity',
        dealer_id: dealerId,
        query: 'car dealership financing options',
        position: 4,
        visibility_score: 78,
        mention_type: 'direct',
        sentiment: 'positive',
        context: 'Featured in financing options comparison',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
      },
    ];

    return mockMetrics;
  }

  /**
   * Get mock query insights
   */
  private getMockQueryInsights(): AIQueryInsight[] {
    return [
      {
        query: 'best car dealership near me',
        category: 'location',
        intent: 'transactional',
        volume: 15000,
        competition_level: 'high',
        opportunity_score: 85,
        current_position: 3,
        target_position: 1,
        improvement_potential: 15,
      },
      {
        query: 'Toyota dealership reviews',
        category: 'brand',
        intent: 'informational',
        volume: 8500,
        competition_level: 'medium',
        opportunity_score: 72,
        current_position: 5,
        target_position: 2,
        improvement_potential: 20,
      },
      {
        query: 'car dealership financing options',
        category: 'service',
        intent: 'commercial',
        volume: 12000,
        competition_level: 'high',
        opportunity_score: 68,
        current_position: 4,
        target_position: 2,
        improvement_potential: 18,
      },
    ];
  }

  /**
   * Get default AI visibility summary
   */
  private getDefaultAIVisibilitySummary(dealerId: string): AIVisibilitySummary {
    return {
      dealer_id: dealerId,
      overall_score: 50,
      source_scores: {},
      query_coverage: 0,
      top_queries: [],
      sentiment_breakdown: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      trend_direction: 'stable',
      trend_magnitude: 0,
      last_updated: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const extendedAIVisibilityEngine = new ExtendedAIVisibilityEngine();
