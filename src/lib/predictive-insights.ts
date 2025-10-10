/**
 * Predictive Insights Engine
 * 
 * Advanced predictive analytics for dealership performance forecasting:
 * - Revenue predictions
 * - Market trend analysis
 * - Customer behavior forecasting
 * - Competitive positioning
 * - Risk assessment
 */

import { supabaseAdmin } from './supabase';

export interface PredictiveInsight {
  id: string;
  type: 'revenue' | 'market' | 'customer' | 'competitive' | 'risk';
  title: string;
  description: string;
  confidence: number;
  timeframe: 'short' | 'medium' | 'long';
  impact: 'high' | 'medium' | 'low';
  probability: number;
  data_points: number;
  created_at: string;
}

export interface RevenueForecast {
  current_month: number;
  next_month: number;
  next_quarter: number;
  next_year: number;
  growth_rate: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  factors: {
    seasonal: number;
    market: number;
    competitive: number;
    internal: number;
  };
}

export interface MarketTrend {
  trend_direction: 'up' | 'down' | 'stable';
  magnitude: number;
  duration: number;
  drivers: string[];
  opportunities: string[];
  threats: string[];
}

export interface CustomerBehaviorPrediction {
  segment: string;
  behavior_type: 'purchase' | 'service' | 'retention' | 'churn';
  probability: number;
  timeframe: number;
  influencing_factors: string[];
  recommended_actions: string[];
}

export class PredictiveInsightsEngine {
  private supabase: any;

  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Generate comprehensive predictive insights
   */
  async generateInsights(
    dealerId: string,
    timeframe: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<PredictiveInsight[]> {
    try {
      const insights: PredictiveInsight[] = [];

      // Revenue predictions
      const revenueInsights = await this.generateRevenueInsights(dealerId, timeframe);
      insights.push(...revenueInsights);

      // Market trend analysis
      const marketInsights = await this.generateMarketInsights(dealerId, timeframe);
      insights.push(...marketInsights);

      // Customer behavior predictions
      const customerInsights = await this.generateCustomerInsights(dealerId, timeframe);
      insights.push(...customerInsights);

      // Competitive analysis
      const competitiveInsights = await this.generateCompetitiveInsights(dealerId, timeframe);
      insights.push(...competitiveInsights);

      // Risk assessment
      const riskInsights = await this.generateRiskInsights(dealerId, timeframe);
      insights.push(...riskInsights);

      // Sort by impact and confidence
      return insights.sort((a, b) => {
        const impactWeight = { high: 3, medium: 2, low: 1 };
        const aScore = impactWeight[a.impact] * a.confidence;
        const bScore = impactWeight[b.impact] * b.confidence;
        return bScore - aScore;
      });
    } catch (error) {
      console.error('Predictive insights generation error:', error);
      return [];
    }
  }

  /**
   * Generate revenue forecasting insights
   */
  private async generateRevenueInsights(
    dealerId: string,
    timeframe: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Get historical revenue data
      const historicalData = await this.getHistoricalRevenueData(dealerId);
      
      // Calculate forecast
      const forecast = this.calculateRevenueForecast(historicalData);

      // Generate insights based on forecast
      if (forecast.growth_rate > 0.15) {
        insights.push({
          id: `revenue-growth-${Date.now()}`,
          type: 'revenue',
          title: 'Strong Revenue Growth Predicted',
          description: `Revenue is forecasted to grow by ${(forecast.growth_rate * 100).toFixed(1)}% over the next ${timeframe === 'short' ? 'month' : timeframe === 'medium' ? 'quarter' : 'year'}. This represents a significant opportunity for expansion.`,
          confidence: 0.85,
          timeframe: timeframe as any,
          impact: 'high',
          probability: 0.8,
          data_points: historicalData.length,
          created_at: new Date().toISOString(),
        });
      } else if (forecast.growth_rate < -0.05) {
        insights.push({
          id: `revenue-decline-${Date.now()}`,
          type: 'revenue',
          title: 'Revenue Decline Risk Detected',
          description: `Revenue is forecasted to decline by ${Math.abs(forecast.growth_rate * 100).toFixed(1)}%. Immediate action is recommended to reverse this trend.`,
          confidence: 0.75,
          timeframe: timeframe as any,
          impact: 'high',
          probability: 0.7,
          data_points: historicalData.length,
          created_at: new Date().toISOString(),
        });
      }

      // Seasonal insights
      if (forecast.factors.seasonal > 0.1) {
        insights.push({
          id: `seasonal-opportunity-${Date.now()}`,
          type: 'revenue',
          title: 'Seasonal Revenue Opportunity',
          description: `Seasonal factors indicate a ${(forecast.factors.seasonal * 100).toFixed(1)}% potential revenue boost. Consider seasonal marketing campaigns.`,
          confidence: 0.8,
          timeframe: timeframe as any,
          impact: 'medium',
          probability: 0.85,
          data_points: historicalData.length,
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('Revenue insights error:', error);
    }

    return insights;
  }

  /**
   * Generate market trend insights
   */
  private async generateMarketInsights(
    dealerId: string,
    timeframe: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Analyze market trends
      const marketTrend = await this.analyzeMarketTrends(dealerId);

      if (marketTrend.trend_direction === 'up') {
        insights.push({
          id: `market-growth-${Date.now()}`,
          type: 'market',
          title: 'Market Growth Opportunity',
          description: `Market trends show ${marketTrend.magnitude}% growth potential. Key drivers: ${marketTrend.drivers.join(', ')}.`,
          confidence: 0.75,
          timeframe: timeframe as any,
          impact: 'high',
          probability: 0.7,
          data_points: 50,
          created_at: new Date().toISOString(),
        });
      } else if (marketTrend.trend_direction === 'down') {
        insights.push({
          id: `market-decline-${Date.now()}`,
          type: 'market',
          title: 'Market Decline Risk',
          description: `Market trends indicate potential ${marketTrend.magnitude}% decline. Threats: ${marketTrend.threats.join(', ')}.`,
          confidence: 0.7,
          timeframe: timeframe as any,
          impact: 'high',
          probability: 0.6,
          data_points: 50,
          created_at: new Date().toISOString(),
        });
      }

      // Opportunity insights
      if (marketTrend.opportunities.length > 0) {
        insights.push({
          id: `market-opportunity-${Date.now()}`,
          type: 'market',
          title: 'Emerging Market Opportunities',
          description: `New opportunities identified: ${marketTrend.opportunities.join(', ')}. Consider strategic positioning.`,
          confidence: 0.65,
          timeframe: timeframe as any,
          impact: 'medium',
          probability: 0.6,
          data_points: 30,
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('Market insights error:', error);
    }

    return insights;
  }

  /**
   * Generate customer behavior insights
   */
  private async generateCustomerInsights(
    dealerId: string,
    timeframe: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Analyze customer behavior patterns
      const behaviorPredictions = await this.analyzeCustomerBehavior(dealerId);

      behaviorPredictions.forEach((prediction, index) => {
        if (prediction.probability > 0.7) {
          insights.push({
            id: `customer-${prediction.behavior_type}-${Date.now()}-${index}`,
            type: 'customer',
            title: `${prediction.behavior_type.charAt(0).toUpperCase() + prediction.behavior_type.slice(1)} Behavior Predicted`,
            description: `${(prediction.probability * 100).toFixed(1)}% probability of ${prediction.behavior_type} behavior in ${prediction.timeframe} days. Key factors: ${prediction.influencing_factors.join(', ')}.`,
            confidence: prediction.probability,
            timeframe: timeframe as any,
            impact: prediction.behavior_type === 'churn' ? 'high' : 'medium',
            probability: prediction.probability,
            data_points: 100,
            created_at: new Date().toISOString(),
          });
        }
      });

    } catch (error) {
      console.error('Customer insights error:', error);
    }

    return insights;
  }

  /**
   * Generate competitive insights
   */
  private async generateCompetitiveInsights(
    dealerId: string,
    timeframe: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Analyze competitive landscape
      const competitiveAnalysis = await this.analyzeCompetitiveLandscape(dealerId);

      if (competitiveAnalysis.market_share_trend > 0.05) {
        insights.push({
          id: `competitive-gain-${Date.now()}`,
          type: 'competitive',
          title: 'Market Share Growth Opportunity',
          description: `Potential to gain ${(competitiveAnalysis.market_share_trend * 100).toFixed(1)}% market share. Competitive advantages identified.`,
          confidence: 0.7,
          timeframe: timeframe as any,
          impact: 'high',
          probability: 0.65,
          data_points: 25,
          created_at: new Date().toISOString(),
        });
      }

      if (competitiveAnalysis.threat_level > 0.7) {
        insights.push({
          id: `competitive-threat-${Date.now()}`,
          type: 'competitive',
          title: 'High Competitive Threat',
          description: `Competitive threat level is ${(competitiveAnalysis.threat_level * 100).toFixed(1)}%. Immediate strategic response recommended.`,
          confidence: 0.8,
          timeframe: timeframe as any,
          impact: 'high',
          probability: 0.75,
          data_points: 25,
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('Competitive insights error:', error);
    }

    return insights;
  }

  /**
   * Generate risk assessment insights
   */
  private async generateRiskInsights(
    dealerId: string,
    timeframe: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Assess various risk factors
      const riskAssessment = await this.assessRisks(dealerId);

      Object.entries(riskAssessment).forEach(([riskType, riskLevel]) => {
        if (riskLevel > 0.7) {
          insights.push({
            id: `risk-${riskType}-${Date.now()}`,
            type: 'risk',
            title: `High ${riskType.charAt(0).toUpperCase() + riskType.slice(1)} Risk`,
            description: `${riskType} risk level is ${(riskLevel * 100).toFixed(1)}%. Mitigation strategies recommended.`,
            confidence: 0.75,
            timeframe: timeframe as any,
            impact: 'high',
            probability: riskLevel,
            data_points: 20,
            created_at: new Date().toISOString(),
          });
        }
      });

    } catch (error) {
      console.error('Risk insights error:', error);
    }

    return insights;
  }

  /**
   * Get historical revenue data
   */
  private async getHistoricalRevenueData(dealerId: string): Promise<number[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('revenue_history')
          .select('revenue')
          .eq('dealer_id', dealerId)
          .order('month', { ascending: false })
          .limit(12);

        return data?.map((row: any) => row.revenue) || [];
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }

    // Mock data for development
    return [45000, 42000, 48000, 51000, 47000, 52000, 49000, 55000, 53000, 58000, 56000, 60000];
  }

  /**
   * Calculate revenue forecast using simple linear regression
   */
  private calculateRevenueForecast(historicalData: number[]): RevenueForecast {
    if (historicalData.length < 2) {
      return {
        current_month: 50000,
        next_month: 50000,
        next_quarter: 150000,
        next_year: 600000,
        growth_rate: 0,
        confidence_interval: { lower: 45000, upper: 55000 },
        factors: { seasonal: 0, market: 0, competitive: 0, internal: 0 },
      };
    }

    // Simple trend calculation
    const recent = historicalData.slice(0, 3);
    const older = historicalData.slice(3, 6);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const growthRate = (recentAvg - olderAvg) / olderAvg;

    const currentMonth = recent[0];
    const nextMonth = currentMonth * (1 + growthRate);
    const nextQuarter = currentMonth * (1 + growthRate) * 3;
    const nextYear = currentMonth * (1 + growthRate) * 12;

    return {
      current_month: currentMonth,
      next_month: nextMonth,
      next_quarter: nextQuarter,
      next_year: nextYear,
      growth_rate: growthRate,
      confidence_interval: {
        lower: nextMonth * 0.9,
        upper: nextMonth * 1.1,
      },
      factors: {
        seasonal: 0.1,
        market: 0.05,
        competitive: 0.02,
        internal: 0.03,
      },
    };
  }

  /**
   * Analyze market trends
   */
  private async analyzeMarketTrends(dealerId: string): Promise<MarketTrend> {
    // Mock market analysis
    return {
      trend_direction: 'up',
      magnitude: 8.5,
      duration: 6,
      drivers: ['Economic recovery', 'Increased demand', 'Supply chain improvements'],
      opportunities: ['EV market expansion', 'Digital transformation', 'Service growth'],
      threats: ['Rising interest rates', 'Supply constraints', 'Competition'],
    };
  }

  /**
   * Analyze customer behavior
   */
  private async analyzeCustomerBehavior(dealerId: string): Promise<CustomerBehaviorPrediction[]> {
    // Mock customer behavior analysis
    return [
      {
        segment: 'Loyal Customers',
        behavior_type: 'purchase',
        probability: 0.75,
        timeframe: 30,
        influencing_factors: ['Seasonal promotions', 'New inventory', 'Service history'],
        recommended_actions: ['Send targeted offers', 'Schedule follow-up calls'],
      },
      {
        segment: 'At-Risk Customers',
        behavior_type: 'churn',
        probability: 0.65,
        timeframe: 60,
        influencing_factors: ['Poor service experience', 'Competitor offers', 'Price sensitivity'],
        recommended_actions: ['Implement retention program', 'Offer loyalty incentives'],
      },
    ];
  }

  /**
   * Analyze competitive landscape
   */
  private async analyzeCompetitiveLandscape(dealerId: string): Promise<{
    market_share_trend: number;
    threat_level: number;
    competitive_advantages: string[];
  }> {
    // Mock competitive analysis
    return {
      market_share_trend: 0.08,
      threat_level: 0.6,
      competitive_advantages: ['Superior customer service', 'Competitive pricing', 'Strong online presence'],
    };
  }

  /**
   * Assess various risks
   */
  private async assessRisks(dealerId: string): Promise<{
    market: number;
    operational: number;
    financial: number;
    competitive: number;
    regulatory: number;
  }> {
    // Mock risk assessment
    return {
      market: 0.4,
      operational: 0.3,
      financial: 0.5,
      competitive: 0.7,
      regulatory: 0.2,
    };
  }

  /**
   * Store insights in database
   */
  async storeInsights(dealerId: string, insights: PredictiveInsight[]): Promise<void> {
    try {
      if (this.supabase) {
        const insightsWithDealerId = insights.map(insight => ({
          ...insight,
          dealer_id: dealerId,
        }));

        await this.supabase
          .from('predictive_insights')
          .insert(insightsWithDealerId);
      }
    } catch (error) {
      console.error('Error storing insights:', error);
    }
  }

  /**
   * Get insights for a specific dealer
   */
  async getInsightsForDealer(dealerId: string): Promise<PredictiveInsight[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('predictive_insights')
          .select('*')
          .eq('dealer_id', dealerId)
          .order('created_at', { ascending: false })
          .limit(50);

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }

    return [];
  }
}

// Export singleton instance
export const predictiveInsightsEngine = new PredictiveInsightsEngine();
