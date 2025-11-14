/**
 * Authority Velocity Module
 * DealershipAI - AI Visibility Index & Algorithmic Trust Integration
 * 
 * This module calculates Authority Velocity as the 4-week slope of
 * AI Visibility Index × ATI (Algorithmic Trust) × Citation Share
 */

export interface AuthorityVelocityMetrics {
  aiVisibilityIndex: number;
  algorithmicTrust: number;
  citationShare: number;
  velocity: number; // 4-week slope
  direction: 'improving' | 'stable' | 'declining';
  confidence: number;
  trend: VelocityTrend;
  recommendations: VelocityRecommendation[];
}

export interface VelocityTrend {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  period: 'week' | 'month' | 'quarter';
}

export interface VelocityRecommendation {
  category: 'content' | 'technical' | 'trust' | 'citations';
  action: string;
  impact: number; // Expected velocity improvement
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AIVisibilityData {
  timestamp: Date;
  score: number;
  breakdown: {
    schemaCompleteness: number;
    contentQuality: number;
    technicalSignals: number;
    trustIndicators: number;
  };
}

export interface ATIData {
  timestamp: Date;
  score: number;
  breakdown: {
    consistency: number;
    accuracy: number;
    freshness: number;
    authority: number;
  };
}

export interface CitationData {
  timestamp: Date;
  share: number;
  breakdown: {
    directMentions: number;
    linkDepth: number;
    domainAuthority: number;
    freshness: number;
  };
}

export class AuthorityVelocityCalculator {
  private lookbackPeriods = {
    week: 7,
    month: 28,
    quarter: 84
  };

  /**
   * Calculate Authority Velocity from historical data
   */
  calculateAuthorityVelocity(
    aiVisibilityData: AIVisibilityData[],
    atiData: ATIData[],
    citationData: CitationData[]
  ): AuthorityVelocityMetrics {
    // Ensure we have enough data points
    const minDataPoints = 4;
    if (aiVisibilityData.length < minDataPoints || 
        atiData.length < minDataPoints || 
        citationData.length < minDataPoints) {
      return this.getDefaultMetrics();
    }

    // Calculate current composite score
    const currentAIV = this.getLatestScore(aiVisibilityData);
    const currentATI = this.getLatestScore(atiData);
    const currentCitation = this.getLatestScore(citationData.map(c => ({ timestamp: c.timestamp, score: c.share })));
    const currentVelocity = currentAIV * currentATI * currentCitation;

    // Calculate previous period score
    const previousAIV = this.getPreviousScore(aiVisibilityData);
    const previousATI = this.getPreviousScore(atiData);
    const previousCitation = this.getPreviousScore(citationData.map(c => ({ timestamp: c.timestamp, score: c.share })));
    const previousVelocity = previousAIV * previousATI * previousCitation;

    // Calculate trend
    const trend = this.calculateTrend(currentVelocity, previousVelocity);

    // Determine direction
    const direction = this.determineDirection(trend.changePercent);

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(aiVisibilityData, atiData, citationData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentAIV, currentATI, currentCitation, trend, direction
    );

    return {
      aiVisibilityIndex: currentAIV,
      algorithmicTrust: currentATI,
      citationShare: currentCitation,
      velocity: currentVelocity,
      direction,
      confidence,
      trend,
      recommendations
    };
  }

  /**
   * Calculate 4-week velocity slope using linear regression
   */
  calculateVelocitySlope(data: Array<{ timestamp: Date; score: number }>): number {
    if (data.length < 2) return 0;

    // Sort by timestamp
    const sortedData = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Convert to numeric values for regression
    const n = sortedData.length;
    const x = sortedData.map((_, i) => i);
    const y = sortedData.map(d => d.score);

    // Calculate linear regression slope
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return slope;
  }

  /**
   * Calculate AI Visibility Index from multiple factors
   */
  calculateAIVisibilityIndex(
    schemaCompleteness: number,
    contentQuality: number,
    technicalSignals: number,
    trustIndicators: number
  ): number {
    const weights = {
      schemaCompleteness: 0.3,
      contentQuality: 0.25,
      technicalSignals: 0.25,
      trustIndicators: 0.2
    };

    return (
      schemaCompleteness * weights.schemaCompleteness +
      contentQuality * weights.contentQuality +
      technicalSignals * weights.technicalSignals +
      trustIndicators * weights.trustIndicators
    );
  }

  /**
   * Calculate Algorithmic Trust Index from consistency metrics
   */
  calculateAlgorithmicTrust(
    consistency: number,
    accuracy: number,
    freshness: number,
    authority: number
  ): number {
    const weights = {
      consistency: 0.3,
      accuracy: 0.3,
      freshness: 0.2,
      authority: 0.2
    };

    return (
      consistency * weights.consistency +
      accuracy * weights.accuracy +
      freshness * weights.freshness +
      authority * weights.authority
    );
  }

  /**
   * Calculate Citation Share from multiple sources
   */
  calculateCitationShare(
    directMentions: number,
    linkDepth: number,
    domainAuthority: number,
    freshness: number
  ): number {
    const weights = {
      directMentions: 0.4,
      linkDepth: 0.3,
      domainAuthority: 0.2,
      freshness: 0.1
    };

    return (
      directMentions * weights.directMentions +
      linkDepth * weights.linkDepth +
      domainAuthority * weights.domainAuthority +
      freshness * weights.freshness
    );
  }

  /**
   * Get latest score from time series data
   */
  private getLatestScore(data: Array<{ timestamp: Date; score: number }>): number {
    if (data.length === 0) return 0;
    
    const latest = data.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
    
    return latest.score;
  }

  /**
   * Get previous period score
   */
  private getPreviousScore(data: Array<{ timestamp: Date; score: number }>): number {
    if (data.length < 2) return 0;
    
    const sorted = data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return sorted[1].score;
  }

  /**
   * Calculate trend metrics
   */
  private calculateTrend(current: number, previous: number): VelocityTrend {
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    return {
      current,
      previous,
      change,
      changePercent,
      period: 'month'
    };
  }

  /**
   * Determine velocity direction
   */
  private determineDirection(changePercent: number): 'improving' | 'stable' | 'declining' {
    if (changePercent > 5) return 'improving';
    if (changePercent < -5) return 'declining';
    return 'stable';
  }

  /**
   * Calculate confidence based on data quality
   */
  private calculateConfidence(
    aiVisibilityData: AIVisibilityData[],
    atiData: ATIData[],
    citationData: CitationData[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Data recency
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    const aiVisibilityAge = now.getTime() - this.getLatestTimestamp(aiVisibilityData).getTime();
    const atiAge = now.getTime() - this.getLatestTimestamp(atiData).getTime();
    const citationAge = now.getTime() - this.getLatestTimestamp(citationData).getTime();

    if (aiVisibilityAge < maxAge) confidence += 0.15;
    if (atiAge < maxAge) confidence += 0.15;
    if (citationAge < maxAge) confidence += 0.15;

    // Data consistency
    const aiVisibilityVariance = this.calculateVariance(aiVisibilityData.map(d => d.score));
    const atiVariance = this.calculateVariance(atiData.map(d => d.score));
    const citationVariance = this.calculateVariance(citationData.map(d => d.share));

    if (aiVisibilityVariance < 100) confidence += 0.05;
    if (atiVariance < 100) confidence += 0.05;
    if (citationVariance < 100) confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  /**
   * Generate velocity improvement recommendations
   */
  private generateRecommendations(
    aiVisibility: number,
    ati: number,
    citationShare: number,
    trend: VelocityTrend,
    direction: 'improving' | 'stable' | 'declining'
  ): VelocityRecommendation[] {
    const recommendations: VelocityRecommendation[] = [];

    // AI Visibility recommendations
    if (aiVisibility < 70) {
      recommendations.push({
        category: 'content',
        action: 'Enhance schema markup and content quality',
        impact: 15,
        effort: 'medium',
        timeframe: '2-4 weeks',
        priority: 'high'
      });
    }

    // ATI recommendations
    if (ati < 75) {
      recommendations.push({
        category: 'trust',
        action: 'Improve data consistency and accuracy',
        impact: 12,
        effort: 'high',
        timeframe: '4-6 weeks',
        priority: 'high'
      });
    }

    // Citation recommendations
    if (citationShare < 60) {
      recommendations.push({
        category: 'citations',
        action: 'Increase direct mentions and link depth',
        impact: 10,
        effort: 'medium',
        timeframe: '3-5 weeks',
        priority: 'medium'
      });
    }

    // Technical recommendations
    if (direction === 'declining') {
      recommendations.push({
        category: 'technical',
        action: 'Audit technical signals and fix issues',
        impact: 8,
        effort: 'low',
        timeframe: '1-2 weeks',
        priority: 'critical'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get latest timestamp from data array
   */
  private getLatestTimestamp(data: Array<{ timestamp: Date }>): Date {
    if (data.length === 0) return new Date(0);

    return data.reduce((latest, current) =>
      current.timestamp > latest ? current.timestamp : latest
    , new Date(0));
  }

  /**
   * Calculate variance of scores
   */
  private calculateVariance(scores: number[]): number {
    if (scores.length === 0) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return variance;
  }

  /**
   * Get default metrics when insufficient data
   */
  private getDefaultMetrics(): AuthorityVelocityMetrics {
    return {
      aiVisibilityIndex: 0,
      algorithmicTrust: 0,
      citationShare: 0,
      velocity: 0,
      direction: 'stable',
      confidence: 0,
      trend: {
        current: 0,
        previous: 0,
        change: 0,
        changePercent: 0,
        period: 'month'
      },
      recommendations: []
    };
  }
}
