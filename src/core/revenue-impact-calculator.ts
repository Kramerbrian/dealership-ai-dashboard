/**
 * DealershipAI Revenue Impact Calculator
 * 
 * This system calculates revenue impact based on industry benchmarks
 * and real dealership performance data.
 */

export interface RevenueImpactData {
  monthly_revenue_at_risk: number;
  annual_revenue_at_risk: number;
  elasticity_per_point: number;
  confidence_score: number;
  benchmark_comparison: {
    industry_average: number;
    top_performers: number;
    percentile_rank: number;
    market_size: number;
  };
  breakdown: {
    organic_search_impact: number;
    ai_search_impact: number;
    local_search_impact: number;
    social_media_impact: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    estimated_impact: number;
    effort_required: string;
  }[];
}

export interface IndustryBenchmarks {
  automotive: {
    average_monthly_revenue: number;
    average_visibility_score: number;
    elasticity_per_point: number;
    market_growth_rate: number;
  };
  luxury: {
    average_monthly_revenue: number;
    average_visibility_score: number;
    elasticity_per_point: number;
    market_growth_rate: number;
  };
  economy: {
    average_monthly_revenue: number;
    average_visibility_score: number;
    elasticity_per_point: number;
    market_growth_rate: number;
  };
}

export class RevenueImpactCalculator {
  private benchmarks: IndustryBenchmarks = {
    automotive: {
      average_monthly_revenue: 2500000,
      average_visibility_score: 65,
      elasticity_per_point: 1500,
      market_growth_rate: 0.03
    },
    luxury: {
      average_monthly_revenue: 5000000,
      average_visibility_score: 70,
      elasticity_per_point: 2500,
      market_growth_rate: 0.05
    },
    economy: {
      average_monthly_revenue: 1500000,
      average_visibility_score: 60,
      elasticity_per_point: 1000,
      market_growth_rate: 0.02
    }
  };

  /**
   * Calculate comprehensive revenue impact
   */
  async calculateRevenueImpact(
    dealerData: { brand: string; city: string; state: string; monthlyRevenue?: number },
    visibilityScores: { overall: number; seo_visibility: number; aeo_visibility: number; geo_visibility: number; social_visibility: number }
  ): Promise<RevenueImpactData> {
    try {
      const benchmark = this.getBenchmarkForBrand(dealerData.brand);
      const marketSize = await this.getMarketSize(dealerData.city, dealerData.state);
      
      // Calculate base revenue at risk
      const visibilityGap = benchmark.average_visibility_score - visibilityScores.overall;
      const monthly_revenue_at_risk = Math.max(0, visibilityGap * benchmark.elasticity_per_point);
      const annual_revenue_at_risk = monthly_revenue_at_risk * 12;

      // Calculate confidence score based on data quality
      const confidence_score = await this.calculateConfidenceScore(visibilityScores);

      // Calculate percentile rank
      const percentile_rank = this.calculatePercentileRank(visibilityScores.overall, benchmark);

      // Calculate breakdown by channel
      const breakdown = this.calculateChannelBreakdown(visibilityScores, benchmark);

      // Generate recommendations
      const recommendations = this.generateRecommendations(visibilityScores, benchmark);

      return {
        monthly_revenue_at_risk,
        annual_revenue_at_risk,
        elasticity_per_point: benchmark.elasticity_per_point,
        confidence_score,
        benchmark_comparison: {
          industry_average: benchmark.average_monthly_revenue,
          top_performers: benchmark.average_monthly_revenue * 1.5,
          percentile_rank,
          market_size: marketSize
        },
        breakdown,
        recommendations
      };
    } catch (error) {
      console.error('Revenue impact calculation failed:', error);
      return this.getDefaultRevenueImpact();
    }
  }

  /**
   * Calculate revenue impact for specific improvements
   */
  async calculateImprovementImpact(
    currentScores: { overall: number; seo_visibility: number; aeo_visibility: number; geo_visibility: number; social_visibility: number },
    targetScores: { overall: number; seo_visibility: number; aeo_visibility: number; geo_visibility: number; social_visibility: number },
    brand: string
  ): Promise<{
    revenue_impact: number;
    roi_estimate: number;
    payback_period_months: number;
    implementation_cost: number;
  }> {
    try {
      const benchmark = this.getBenchmarkForBrand(brand);
      
      const overallImprovement = targetScores.overall - currentScores.overall;
      const revenue_impact = overallImprovement * benchmark.elasticity_per_point;

      // Estimate implementation costs based on improvements needed
      const implementation_cost = this.estimateImplementationCost(currentScores, targetScores);
      
      // Calculate ROI and payback period
      const annual_revenue_impact = revenue_impact * 12;
      const roi_estimate = implementation_cost > 0 ? (annual_revenue_impact / implementation_cost) * 100 : 0;
      const payback_period_months = implementation_cost > 0 ? (implementation_cost / revenue_impact) : 0;

      return {
        revenue_impact,
        roi_estimate,
        payback_period_months,
        implementation_cost
      };
    } catch (error) {
      console.error('Improvement impact calculation failed:', error);
      return {
        revenue_impact: 0,
        roi_estimate: 0,
        payback_period_months: 0,
        implementation_cost: 0
      };
    }
  }

  /**
   * Get industry benchmarks for specific brand
   */
  private getBenchmarkForBrand(brand: string): IndustryBenchmarks['automotive'] {
    const luxuryBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover'];
    const economyBrands = ['Kia', 'Hyundai', 'Nissan', 'Mitsubishi', 'Subaru'];
    
    if (luxuryBrands.includes(brand)) {
      return this.benchmarks.luxury;
    } else if (economyBrands.includes(brand)) {
      return this.benchmarks.economy;
    } else {
      return this.benchmarks.automotive;
    }
  }

  /**
   * Get market size for specific location
   */
  private async getMarketSize(city: string, state: string): Promise<number> {
    // This would typically call a real API for market data
    // For now, return estimated market size based on location
    const marketSizes: { [key: string]: number } = {
      'New York': 50000000,
      'Los Angeles': 40000000,
      'Chicago': 30000000,
      'Houston': 25000000,
      'Phoenix': 20000000,
      'Philadelphia': 20000000,
      'San Antonio': 18000000,
      'San Diego': 18000000,
      'Dallas': 18000000,
      'San Jose': 15000000
    };

    return marketSizes[city] || 10000000; // Default market size
  }

  /**
   * Calculate confidence score based on data quality
   */
  private async calculateConfidenceScore(visibilityScores: any): Promise<number> {
    // Calculate confidence based on data completeness and consistency
    const scores = Object.values(visibilityScores).filter(score => typeof score === 'number') as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower variance = higher confidence
    const confidence = Math.max(0.5, Math.min(0.95, 1 - (standardDeviation / 50)));
    return confidence;
  }

  /**
   * Calculate percentile rank
   */
  private calculatePercentileRank(score: number, benchmark: any): number {
    if (score >= 90) return 95;
    if (score >= 85) return 90;
    if (score >= 80) return 80;
    if (score >= 75) return 70;
    if (score >= 70) return 60;
    if (score >= 65) return 50;
    if (score >= 60) return 40;
    if (score >= 55) return 30;
    if (score >= 50) return 20;
    return 10;
  }

  /**
   * Calculate breakdown by channel
   */
  private calculateChannelBreakdown(visibilityScores: any, benchmark: any): any {
    const totalGap = benchmark.average_visibility_score - visibilityScores.overall;
    
    return {
      organic_search_impact: Math.max(0, (benchmark.average_visibility_score - visibilityScores.seo_visibility) * benchmark.elasticity_per_point * 0.4),
      ai_search_impact: Math.max(0, (benchmark.average_visibility_score - visibilityScores.aeo_visibility) * benchmark.elasticity_per_point * 0.3),
      local_search_impact: Math.max(0, (benchmark.average_visibility_score - visibilityScores.geo_visibility) * benchmark.elasticity_per_point * 0.2),
      social_media_impact: Math.max(0, (benchmark.average_visibility_score - visibilityScores.social_visibility) * benchmark.elasticity_per_point * 0.1)
    };
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(visibilityScores: any, benchmark: any): any[] {
    const recommendations = [];

    // SEO recommendations
    if (visibilityScores.seo_visibility < benchmark.average_visibility_score) {
      recommendations.push({
        priority: 'high' as const,
        action: 'Improve SEO visibility through content optimization and technical improvements',
        estimated_impact: (benchmark.average_visibility_score - visibilityScores.seo_visibility) * benchmark.elasticity_per_point * 0.4,
        effort_required: 'Medium (2-4 weeks)'
      });
    }

    // AEO recommendations
    if (visibilityScores.aeo_visibility < benchmark.average_visibility_score) {
      recommendations.push({
        priority: 'high' as const,
        action: 'Optimize for AI search engines through structured data and answer-focused content',
        estimated_impact: (benchmark.average_visibility_score - visibilityScores.aeo_visibility) * benchmark.elasticity_per_point * 0.3,
        effort_required: 'High (4-8 weeks)'
      });
    }

    // GEO recommendations
    if (visibilityScores.geo_visibility < benchmark.average_visibility_score) {
      recommendations.push({
        priority: 'medium' as const,
        action: 'Enhance local search presence through Google My Business optimization',
        estimated_impact: (benchmark.average_visibility_score - visibilityScores.geo_visibility) * benchmark.elasticity_per_point * 0.2,
        effort_required: 'Low (1-2 weeks)'
      });
    }

    // Social recommendations
    if (visibilityScores.social_visibility < benchmark.average_visibility_score) {
      recommendations.push({
        priority: 'low' as const,
        action: 'Improve social media presence and engagement',
        estimated_impact: (benchmark.average_visibility_score - visibilityScores.social_visibility) * benchmark.elasticity_per_point * 0.1,
        effort_required: 'Medium (2-4 weeks)'
      });
    }

    return recommendations;
  }

  /**
   * Estimate implementation costs
   */
  private estimateImplementationCost(currentScores: any, targetScores: any): number {
    let totalCost = 0;

    // SEO improvements
    const seoImprovement = targetScores.seo_visibility - currentScores.seo_visibility;
    if (seoImprovement > 0) {
      totalCost += seoImprovement * 500; // $500 per point improvement
    }

    // AEO improvements
    const aeoImprovement = targetScores.aeo_visibility - currentScores.aeo_visibility;
    if (aeoImprovement > 0) {
      totalCost += aeoImprovement * 750; // $750 per point improvement
    }

    // GEO improvements
    const geoImprovement = targetScores.geo_visibility - currentScores.geo_visibility;
    if (geoImprovement > 0) {
      totalCost += geoImprovement * 300; // $300 per point improvement
    }

    // Social improvements
    const socialImprovement = targetScores.social_visibility - currentScores.social_visibility;
    if (socialImprovement > 0) {
      totalCost += socialImprovement * 400; // $400 per point improvement
    }

    return totalCost;
  }

  /**
   * Get default revenue impact for error cases
   */
  private getDefaultRevenueImpact(): RevenueImpactData {
    return {
      monthly_revenue_at_risk: 0,
      annual_revenue_at_risk: 0,
      elasticity_per_point: 1500,
      confidence_score: 0,
      benchmark_comparison: {
        industry_average: 2500000,
        top_performers: 3750000,
        percentile_rank: 0,
        market_size: 10000000
      },
      breakdown: {
        organic_search_impact: 0,
        ai_search_impact: 0,
        local_search_impact: 0,
        social_media_impact: 0
      },
      recommendations: []
    };
  }

  /**
   * Get industry benchmarks
   */
  getIndustryBenchmarks(): IndustryBenchmarks {
    return this.benchmarks;
  }

  /**
   * Update industry benchmarks
   */
  updateIndustryBenchmarks(newBenchmarks: Partial<IndustryBenchmarks>): void {
    this.benchmarks = { ...this.benchmarks, ...newBenchmarks };
  }
}
