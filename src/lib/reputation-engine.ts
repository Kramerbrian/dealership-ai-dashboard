/**
 * Reputation Engine
 * 
 * Advanced reputation scoring system for dealerships based on:
 * - Review sentiment analysis
 * - Social media mentions
 * - News coverage
 * - Customer feedback
 * - Industry recognition
 */

import { supabaseAdmin } from './supabase';

export interface ReputationMetrics {
  overall_score: number;
  review_sentiment: number;
  social_mentions: number;
  news_sentiment: number;
  customer_satisfaction: number;
  industry_recognition: number;
  trend_direction: 'up' | 'down' | 'stable';
  confidence_level: number;
}

export interface ReputationData {
  reviews: {
    google: number;
    yelp: number;
    facebook: number;
    dealer_rating: number;
    total_count: number;
    sentiment_score: number;
  };
  social_media: {
    mentions: number;
    sentiment: number;
    engagement_rate: number;
    reach: number;
  };
  news_coverage: {
    articles_count: number;
    sentiment_score: number;
    reach: number;
    recency_score: number;
  };
  customer_feedback: {
    nps_score: number;
    csat_score: number;
    response_rate: number;
    resolution_time: number;
  };
  industry_awards: {
    count: number;
    recency: number;
    prestige_score: number;
  };
}

export class ReputationEngine {
  private supabase: any;

  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Calculate comprehensive reputation score
   */
  async calculateReputationScore(
    dealerId: string,
    data?: ReputationData
  ): Promise<ReputationMetrics> {
    try {
      // Get data if not provided
      if (!data) {
        data = await this.gatherReputationData(dealerId);
      }

      // Calculate individual component scores
      const reviewScore = this.calculateReviewScore(data.reviews);
      const socialScore = this.calculateSocialScore(data.social_media);
      const newsScore = this.calculateNewsScore(data.news_coverage);
      const feedbackScore = this.calculateFeedbackScore(data.customer_feedback);
      const awardsScore = this.calculateAwardsScore(data.industry_awards);

      // Weighted overall score
      const overallScore = this.calculateWeightedScore({
        reviews: reviewScore,
        social: socialScore,
        news: newsScore,
        feedback: feedbackScore,
        awards: awardsScore,
      });

      // Determine trend direction
      const trendDirection = await this.calculateTrendDirection(dealerId, overallScore);

      // Calculate confidence level
      const confidenceLevel = this.calculateConfidenceLevel(data);

      return {
        overall_score: Math.round(overallScore),
        review_sentiment: Math.round(reviewScore),
        social_mentions: Math.round(socialScore),
        news_sentiment: Math.round(newsScore),
        customer_satisfaction: Math.round(feedbackScore),
        industry_recognition: Math.round(awardsScore),
        trend_direction: trendDirection,
        confidence_level: confidenceLevel,
      };
    } catch (error) {
      console.error('Reputation score calculation error:', error);
      return this.getDefaultReputationMetrics();
    }
  }

  /**
   * Gather reputation data from various sources
   */
  private async gatherReputationData(dealerId: string): Promise<ReputationData> {
    try {
      // Mock data for development - replace with actual API calls
      return {
        reviews: {
          google: 4.2,
          yelp: 4.0,
          facebook: 4.3,
          dealer_rating: 4.1,
          total_count: 1247,
          sentiment_score: 0.78,
        },
        social_media: {
          mentions: 89,
          sentiment: 0.72,
          engagement_rate: 0.045,
          reach: 12500,
        },
        news_coverage: {
          articles_count: 12,
          sentiment_score: 0.65,
          reach: 45000,
          recency_score: 0.8,
        },
        customer_feedback: {
          nps_score: 67,
          csat_score: 4.2,
          response_rate: 0.78,
          resolution_time: 2.3,
        },
        industry_awards: {
          count: 3,
          recency: 0.9,
          prestige_score: 0.75,
        },
      };
    } catch (error) {
      console.error('Data gathering error:', error);
      return this.getDefaultReputationData();
    }
  }

  /**
   * Calculate review sentiment score
   */
  private calculateReviewScore(reviews: ReputationData['reviews']): number {
    const weights = {
      google: 0.4,
      yelp: 0.3,
      facebook: 0.2,
      dealer_rating: 0.1,
    };

    const weightedScore = 
      reviews.google * weights.google +
      reviews.yelp * weights.yelp +
      reviews.facebook * weights.facebook +
      reviews.dealer_rating * weights.dealer_rating;

    // Normalize to 0-100 scale
    return (weightedScore / 5) * 100;
  }

  /**
   * Calculate social media score
   */
  private calculateSocialScore(social: ReputationData['social_media']): number {
    const sentimentWeight = 0.4;
    const engagementWeight = 0.3;
    const reachWeight = 0.3;

    // Normalize reach (assuming max reach of 100k)
    const normalizedReach = Math.min(social.reach / 100000, 1);

    return (
      social.sentiment * sentimentWeight * 100 +
      social.engagement_rate * engagementWeight * 100 +
      normalizedReach * reachWeight * 100
    );
  }

  /**
   * Calculate news coverage score
   */
  private calculateNewsScore(news: ReputationData['news_coverage']): number {
    const sentimentWeight = 0.5;
    const reachWeight = 0.3;
    const recencyWeight = 0.2;

    // Normalize reach (assuming max reach of 1M)
    const normalizedReach = Math.min(news.reach / 1000000, 1);

    return (
      news.sentiment_score * sentimentWeight * 100 +
      normalizedReach * reachWeight * 100 +
      news.recency_score * recencyWeight * 100
    );
  }

  /**
   * Calculate customer feedback score
   */
  private calculateFeedbackScore(feedback: ReputationData['customer_feedback']): number {
    const npsWeight = 0.4;
    const csatWeight = 0.3;
    const responseWeight = 0.2;
    const resolutionWeight = 0.1;

    // Normalize NPS (-100 to 100 -> 0 to 100)
    const normalizedNPS = (feedback.nps_score + 100) / 2;

    // Normalize resolution time (assuming max 7 days)
    const normalizedResolution = Math.max(0, 1 - feedback.resolution_time / 7);

    return (
      normalizedNPS * npsWeight +
      (feedback.csat_score / 5) * csatWeight * 100 +
      feedback.response_rate * responseWeight * 100 +
      normalizedResolution * resolutionWeight * 100
    );
  }

  /**
   * Calculate industry awards score
   */
  private calculateAwardsScore(awards: ReputationData['industry_awards']): number {
    const countWeight = 0.4;
    const recencyWeight = 0.3;
    const prestigeWeight = 0.3;

    // Normalize count (assuming max 10 awards)
    const normalizedCount = Math.min(awards.count / 10, 1);

    return (
      normalizedCount * countWeight * 100 +
      awards.recency * recencyWeight * 100 +
      awards.prestige_score * prestigeWeight * 100
    );
  }

  /**
   * Calculate weighted overall score
   */
  private calculateWeightedScore(scores: {
    reviews: number;
    social: number;
    news: number;
    feedback: number;
    awards: number;
  }): number {
    const weights = {
      reviews: 0.35,
      social: 0.25,
      news: 0.15,
      feedback: 0.20,
      awards: 0.05,
    };

    return (
      scores.reviews * weights.reviews +
      scores.social * weights.social +
      scores.news * weights.news +
      scores.feedback * weights.feedback +
      scores.awards * weights.awards
    );
  }

  /**
   * Calculate trend direction
   */
  private async calculateTrendDirection(
    dealerId: string,
    currentScore: number
  ): Promise<'up' | 'down' | 'stable'> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('reputation_history')
          .select('score')
          .eq('dealer_id', dealerId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length >= 2) {
          const previousScore = data[1].score;
          const difference = currentScore - previousScore;

          if (difference > 5) return 'up';
          if (difference < -5) return 'down';
          return 'stable';
        }
      }

      // Default to stable if no historical data
      return 'stable';
    } catch (error) {
      console.error('Trend calculation error:', error);
      return 'stable';
    }
  }

  /**
   * Calculate confidence level based on data quality
   */
  private calculateConfidenceLevel(data: ReputationData): number {
    let confidence = 0;
    let factors = 0;

    // Review data quality
    if (data.reviews.total_count > 100) {
      confidence += 0.3;
      factors++;
    }

    // Social media data quality
    if (data.social_media.mentions > 50) {
      confidence += 0.2;
      factors++;
    }

    // News coverage quality
    if (data.news_coverage.articles_count > 5) {
      confidence += 0.2;
      factors++;
    }

    // Customer feedback quality
    if (data.customer_feedback.response_rate > 0.5) {
      confidence += 0.2;
      factors++;
    }

    // Industry awards quality
    if (data.industry_awards.count > 0) {
      confidence += 0.1;
      factors++;
    }

    return factors > 0 ? confidence / factors : 0.5;
  }

  /**
   * Get default reputation metrics
   */
  private getDefaultReputationMetrics(): ReputationMetrics {
    return {
      overall_score: 50,
      review_sentiment: 50,
      social_mentions: 50,
      news_sentiment: 50,
      customer_satisfaction: 50,
      industry_recognition: 50,
      trend_direction: 'stable',
      confidence_level: 0.5,
    };
  }

  /**
   * Get default reputation data
   */
  private getDefaultReputationData(): ReputationData {
    return {
      reviews: {
        google: 3.5,
        yelp: 3.5,
        facebook: 3.5,
        dealer_rating: 3.5,
        total_count: 0,
        sentiment_score: 0.5,
      },
      social_media: {
        mentions: 0,
        sentiment: 0.5,
        engagement_rate: 0.02,
        reach: 0,
      },
      news_coverage: {
        articles_count: 0,
        sentiment_score: 0.5,
        reach: 0,
        recency_score: 0.5,
      },
      customer_feedback: {
        nps_score: 0,
        csat_score: 3.0,
        response_rate: 0.3,
        resolution_time: 5.0,
      },
      industry_awards: {
        count: 0,
        recency: 0.5,
        prestige_score: 0.5,
      },
    };
  }

  /**
   * Store reputation metrics in database
   */
  async storeReputationMetrics(
    dealerId: string,
    metrics: ReputationMetrics
  ): Promise<void> {
    try {
      if (this.supabase) {
        await this.supabase
          .from('reputation_history')
          .insert({
            dealer_id: dealerId,
            overall_score: metrics.overall_score,
            review_sentiment: metrics.review_sentiment,
            social_mentions: metrics.social_mentions,
            news_sentiment: metrics.news_sentiment,
            customer_satisfaction: metrics.customer_satisfaction,
            industry_recognition: metrics.industry_recognition,
            trend_direction: metrics.trend_direction,
            confidence_level: metrics.confidence_level,
            created_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error storing reputation metrics:', error);
    }
  }

  /**
   * Get reputation insights and recommendations
   */
  async getReputationInsights(
    dealerId: string,
    metrics: ReputationMetrics
  ): Promise<{
    insights: string[];
    recommendations: string[];
    priority_actions: string[];
  }> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const priorityActions: string[] = [];

    // Analyze overall score
    if (metrics.overall_score < 40) {
      insights.push('Reputation score is critically low and requires immediate attention');
      priorityActions.push('Implement emergency reputation recovery plan');
    } else if (metrics.overall_score < 60) {
      insights.push('Reputation score is below industry average');
      recommendations.push('Focus on improving customer experience and review management');
    } else if (metrics.overall_score > 80) {
      insights.push('Excellent reputation score - maintain current strategies');
    }

    // Analyze trend direction
    if (metrics.trend_direction === 'down') {
      insights.push('Reputation is declining - investigate recent issues');
      priorityActions.push('Conduct reputation audit and identify root causes');
    } else if (metrics.trend_direction === 'up') {
      insights.push('Reputation is improving - continue current initiatives');
    }

    // Analyze individual components
    if (metrics.review_sentiment < 60) {
      recommendations.push('Improve review response rate and customer service');
    }

    if (metrics.social_mentions < 40) {
      recommendations.push('Increase social media engagement and content strategy');
    }

    if (metrics.customer_satisfaction < 50) {
      priorityActions.push('Implement customer satisfaction improvement program');
    }

    return {
      insights,
      recommendations,
      priority_actions: priorityActions,
    };
  }
}

// Export singleton instance
export const reputationEngine = new ReputationEngine();
