/**
 * What-If Simulator
 * 
 * Advanced scenario planning and simulation engine for dealerships:
 * - Revenue impact modeling
 * - Market scenario analysis
 * - Investment ROI calculations
 * - Risk assessment simulations
 * - Strategic decision support
 */

import { supabaseAdmin } from './supabase';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: 'revenue' | 'market' | 'investment' | 'risk' | 'strategic';
  parameters: Record<string, any>;
  assumptions: string[];
  timeframe: number; // months
  created_at: string;
}

export interface SimulationResult {
  scenario_id: string;
  baseline_metrics: Record<string, number>;
  projected_metrics: Record<string, number>;
  impact_analysis: {
    revenue_impact: number;
    cost_impact: number;
    roi: number;
    payback_period: number;
    risk_score: number;
  };
  sensitivity_analysis: Record<string, number>;
  confidence_level: number;
  key_insights: string[];
  recommendations: string[];
  created_at: string;
}

export interface ScenarioParameter {
  name: string;
  type: 'number' | 'percentage' | 'boolean' | 'select';
  value: any;
  min?: number;
  max?: number;
  options?: string[];
  description: string;
  impact_weight: number;
}

export class WhatIfSimulator {
  private supabase: any;

  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Create a new simulation scenario
   */
  async createScenario(
    dealerId: string,
    scenario: Omit<SimulationScenario, 'id' | 'created_at'>
  ): Promise<SimulationScenario> {
    const newScenario: SimulationScenario = {
      ...scenario,
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    try {
      if (this.supabase) {
        await this.supabase
          .from('simulation_scenarios')
          .insert({
            ...newScenario,
            dealer_id: dealerId,
          });
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
    }

    return newScenario;
  }

  /**
   * Run simulation for a scenario
   */
  async runSimulation(
    dealerId: string,
    scenario: SimulationScenario
  ): Promise<SimulationResult> {
    try {
      // Get baseline metrics
      const baselineMetrics = await this.getBaselineMetrics(dealerId);

      // Run simulation based on scenario type
      let projectedMetrics: Record<string, number>;
      let impactAnalysis: SimulationResult['impact_analysis'];

      switch (scenario.type) {
        case 'revenue':
          ({ projectedMetrics, impactAnalysis } = await this.simulateRevenueScenario(
            baselineMetrics,
            scenario.parameters
          ));
          break;
        case 'market':
          ({ projectedMetrics, impactAnalysis } = await this.simulateMarketScenario(
            baselineMetrics,
            scenario.parameters
          ));
          break;
        case 'investment':
          ({ projectedMetrics, impactAnalysis } = await this.simulateInvestmentScenario(
            baselineMetrics,
            scenario.parameters
          ));
          break;
        case 'risk':
          ({ projectedMetrics, impactAnalysis } = await this.simulateRiskScenario(
            baselineMetrics,
            scenario.parameters
          ));
          break;
        case 'strategic':
          ({ projectedMetrics, impactAnalysis } = await this.simulateStrategicScenario(
            baselineMetrics,
            scenario.parameters
          ));
          break;
        default:
          throw new Error(`Unknown scenario type: ${scenario.type}`);
      }

      // Perform sensitivity analysis
      const sensitivityAnalysis = await this.performSensitivityAnalysis(
        baselineMetrics,
        scenario.parameters
      );

      // Calculate confidence level
      const confidenceLevel = this.calculateConfidenceLevel(scenario, baselineMetrics);

      // Generate insights and recommendations
      const { keyInsights, recommendations } = await this.generateInsightsAndRecommendations(
        scenario,
        impactAnalysis,
        projectedMetrics
      );

      const result: SimulationResult = {
        scenario_id: scenario.id,
        baseline_metrics: baselineMetrics,
        projected_metrics: projectedMetrics,
        impact_analysis: impactAnalysis,
        sensitivity_analysis: sensitivityAnalysis,
        confidence_level: confidenceLevel,
        key_insights: keyInsights,
        recommendations: recommendations,
        created_at: new Date().toISOString(),
      };

      // Store result
      await this.storeSimulationResult(dealerId, result);

      return result;
    } catch (error) {
      console.error('Simulation error:', error);
      throw error;
    }
  }

  /**
   * Simulate revenue scenario
   */
  private async simulateRevenueScenario(
    baseline: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<{
    projectedMetrics: Record<string, number>;
    impactAnalysis: SimulationResult['impact_analysis'];
  }> {
    const projectedMetrics = { ...baseline };

    // Apply revenue parameters
    if (parameters.price_increase) {
      projectedMetrics.monthly_revenue *= (1 + parameters.price_increase / 100);
    }

    if (parameters.volume_increase) {
      projectedMetrics.monthly_revenue *= (1 + parameters.volume_increase / 100);
    }

    if (parameters.marketing_investment) {
      const marketingROI = 3.5; // Assume 3.5x ROI on marketing
      projectedMetrics.monthly_revenue += parameters.marketing_investment * marketingROI;
    }

    // Calculate impact
    const revenueImpact = projectedMetrics.monthly_revenue - baseline.monthly_revenue;
    const costImpact = parameters.marketing_investment || 0;
    const roi = costImpact > 0 ? (revenueImpact * 12) / costImpact : 0;
    const paybackPeriod = costImpact > 0 ? costImpact / (revenueImpact * 12) : 0;

    return {
      projectedMetrics,
      impactAnalysis: {
        revenue_impact: revenueImpact,
        cost_impact: costImpact,
        roi: roi,
        payback_period: paybackPeriod,
        risk_score: 0.3,
      },
    };
  }

  /**
   * Simulate market scenario
   */
  private async simulateMarketScenario(
    baseline: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<{
    projectedMetrics: Record<string, number>;
    impactAnalysis: SimulationResult['impact_analysis'];
  }> {
    const projectedMetrics = { ...baseline };

    // Apply market parameters
    if (parameters.market_growth) {
      projectedMetrics.monthly_revenue *= (1 + parameters.market_growth / 100);
    }

    if (parameters.competition_level) {
      // Higher competition reduces revenue
      const competitionImpact = parameters.competition_level * 0.1;
      projectedMetrics.monthly_revenue *= (1 - competitionImpact);
    }

    if (parameters.market_share_change) {
      projectedMetrics.monthly_revenue *= (1 + parameters.market_share_change / 100);
    }

    const revenueImpact = projectedMetrics.monthly_revenue - baseline.monthly_revenue;

    return {
      projectedMetrics,
      impactAnalysis: {
        revenue_impact: revenueImpact,
        cost_impact: 0,
        roi: 0,
        payback_period: 0,
        risk_score: 0.5,
      },
    };
  }

  /**
   * Simulate investment scenario
   */
  private async simulateInvestmentScenario(
    baseline: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<{
    projectedMetrics: Record<string, number>;
    impactAnalysis: SimulationResult['impact_analysis'];
  }> {
    const projectedMetrics = { ...baseline };

    // Apply investment parameters
    const investmentAmount = parameters.investment_amount || 0;
    const expectedROI = parameters.expected_roi || 0.2;
    const timeToROI = parameters.time_to_roi || 12; // months

    // Calculate revenue impact over time
    const monthlyRevenueIncrease = (investmentAmount * expectedROI) / timeToROI;
    projectedMetrics.monthly_revenue += monthlyRevenueIncrease;

    // Calculate operational efficiency improvements
    if (parameters.operational_efficiency) {
      projectedMetrics.operating_costs *= (1 - parameters.operational_efficiency / 100);
    }

    const revenueImpact = projectedMetrics.monthly_revenue - baseline.monthly_revenue;
    const costImpact = investmentAmount;
    const roi = expectedROI;
    const paybackPeriod = timeToROI;

    return {
      projectedMetrics,
      impactAnalysis: {
        revenue_impact: revenueImpact,
        cost_impact: costImpact,
        roi: roi,
        payback_period: paybackPeriod,
        risk_score: 0.4,
      },
    };
  }

  /**
   * Simulate risk scenario
   */
  private async simulateRiskScenario(
    baseline: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<{
    projectedMetrics: Record<string, number>;
    impactAnalysis: SimulationResult['impact_analysis'];
  }> {
    const projectedMetrics = { ...baseline };

    // Apply risk parameters
    const riskProbability = parameters.risk_probability || 0.1;
    const riskImpact = parameters.risk_impact || 0.2;

    // Calculate expected impact
    const expectedRevenueLoss = baseline.monthly_revenue * riskProbability * riskImpact;
    projectedMetrics.monthly_revenue -= expectedRevenueLoss;

    const revenueImpact = projectedMetrics.monthly_revenue - baseline.monthly_revenue;
    const riskScore = riskProbability * riskImpact;

    return {
      projectedMetrics,
      impactAnalysis: {
        revenue_impact: revenueImpact,
        cost_impact: 0,
        roi: 0,
        payback_period: 0,
        risk_score: riskScore,
      },
    };
  }

  /**
   * Simulate strategic scenario
   */
  private async simulateStrategicScenario(
    baseline: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<{
    projectedMetrics: Record<string, number>;
    impactAnalysis: SimulationResult['impact_analysis'];
  }> {
    const projectedMetrics = { ...baseline };

    // Apply strategic parameters
    let totalImpact = 0;

    if (parameters.digital_transformation) {
      totalImpact += 0.15; // 15% revenue increase
    }

    if (parameters.customer_experience_improvement) {
      totalImpact += 0.1; // 10% revenue increase
    }

    if (parameters.operational_excellence) {
      totalImpact += 0.08; // 8% revenue increase
    }

    if (parameters.market_expansion) {
      totalImpact += 0.12; // 12% revenue increase
    }

    projectedMetrics.monthly_revenue *= (1 + totalImpact);

    const revenueImpact = projectedMetrics.monthly_revenue - baseline.monthly_revenue;
    const costImpact = parameters.implementation_cost || 0;

    return {
      projectedMetrics,
      impactAnalysis: {
        revenue_impact: revenueImpact,
        cost_impact: costImpact,
        roi: costImpact > 0 ? (revenueImpact * 12) / costImpact : 0,
        payback_period: costImpact > 0 ? costImpact / (revenueImpact * 12) : 0,
        risk_score: 0.3,
      },
    };
  }

  /**
   * Get baseline metrics for a dealer
   */
  private async getBaselineMetrics(dealerId: string): Promise<Record<string, number>> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('dealer_metrics')
          .select('*')
          .eq('dealer_id', dealerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          return {
            monthly_revenue: data.monthly_revenue || 500000,
            operating_costs: data.operating_costs || 350000,
            profit_margin: data.profit_margin || 0.3,
            customer_count: data.customer_count || 1000,
            market_share: data.market_share || 0.15,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching baseline metrics:', error);
    }

    // Default baseline metrics
    return {
      monthly_revenue: 500000,
      operating_costs: 350000,
      profit_margin: 0.3,
      customer_count: 1000,
      market_share: 0.15,
    };
  }

  /**
   * Perform sensitivity analysis
   */
  private async performSensitivityAnalysis(
    baseline: Record<string, number>,
    parameters: Record<string, any>
  ): Promise<Record<string, number>> {
    const sensitivity: Record<string, number> = {};

    // Test each parameter with ±10% variation
    Object.entries(parameters).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const variation = value * 0.1;
        const highValue = value + variation;
        const lowValue = value - variation;

        // Calculate impact of variation
        const highImpact = this.calculateParameterImpact(baseline, key, highValue);
        const lowImpact = this.calculateParameterImpact(baseline, key, lowValue);

        sensitivity[key] = Math.abs(highImpact - lowImpact) / baseline.monthly_revenue;
      }
    });

    return sensitivity;
  }

  /**
   * Calculate impact of a single parameter
   */
  private calculateParameterImpact(
    baseline: Record<string, number>,
    parameter: string,
    value: number
  ): number {
    // Simplified impact calculation
    switch (parameter) {
      case 'price_increase':
      case 'volume_increase':
      case 'market_growth':
        return baseline.monthly_revenue * (value / 100);
      case 'marketing_investment':
        return value * 3.5; // Assume 3.5x ROI
      default:
        return 0;
    }
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidenceLevel(
    scenario: SimulationScenario,
    baseline: Record<string, number>
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data quality
    if (baseline.monthly_revenue > 0) confidence += 0.2;
    if (scenario.assumptions.length > 0) confidence += 0.1;
    if (Object.keys(scenario.parameters).length > 2) confidence += 0.1;
    if (scenario.timeframe <= 12) confidence += 0.1; // Shorter timeframes are more predictable

    return Math.min(confidence, 0.95);
  }

  /**
   * Generate insights and recommendations
   */
  private async generateInsightsAndRecommendations(
    scenario: SimulationScenario,
    impactAnalysis: SimulationResult['impact_analysis'],
    projectedMetrics: Record<string, number>
  ): Promise<{
    keyInsights: string[];
    recommendations: string[];
  }> {
    const keyInsights: string[] = [];
    const recommendations: string[] = [];

    // Revenue impact insights
    if (impactAnalysis.revenue_impact > 0) {
      keyInsights.push(`Positive revenue impact of $${impactAnalysis.revenue_impact.toLocaleString()} per month`);
      if (impactAnalysis.roi > 2) {
        recommendations.push('High ROI scenario - consider implementation');
      }
    } else if (impactAnalysis.revenue_impact < 0) {
      keyInsights.push(`Negative revenue impact of $${Math.abs(impactAnalysis.revenue_impact).toLocaleString()} per month`);
      recommendations.push('Review scenario parameters and consider alternatives');
    }

    // ROI insights
    if (impactAnalysis.roi > 1) {
      keyInsights.push(`ROI of ${(impactAnalysis.roi * 100).toFixed(1)}% indicates positive return`);
    }

    // Payback period insights
    if (impactAnalysis.payback_period > 0 && impactAnalysis.payback_period < 24) {
      keyInsights.push(`Payback period of ${impactAnalysis.payback_period.toFixed(1)} months is acceptable`);
    } else if (impactAnalysis.payback_period > 24) {
      recommendations.push('Long payback period - consider phased implementation');
    }

    // Risk insights
    if (impactAnalysis.risk_score > 0.7) {
      keyInsights.push('High risk scenario - implement risk mitigation strategies');
      recommendations.push('Develop contingency plans and risk monitoring');
    }

    return { keyInsights, recommendations };
  }

  /**
   * Store simulation result
   */
  private async storeSimulationResult(
    dealerId: string,
    result: SimulationResult
  ): Promise<void> {
    try {
      if (this.supabase) {
        await this.supabase
          .from('simulation_results')
          .insert({
            ...result,
            dealer_id: dealerId,
          });
      }
    } catch (error) {
      console.error('Error storing simulation result:', error);
    }
  }

  /**
   * Get predefined scenario templates
   */
  getScenarioTemplates(): SimulationScenario[] {
    return [
      {
        id: 'template-revenue-growth',
        name: 'Revenue Growth Strategy',
        description: 'Simulate impact of price increases and volume growth',
        type: 'revenue',
        parameters: {
          price_increase: 5,
          volume_increase: 10,
          marketing_investment: 50000,
        },
        assumptions: ['Market demand remains stable', 'Competition response is minimal'],
        timeframe: 12,
        created_at: new Date().toISOString(),
      },
      {
        id: 'template-digital-transformation',
        name: 'Digital Transformation',
        description: 'Simulate impact of digital transformation initiatives',
        type: 'strategic',
        parameters: {
          digital_transformation: true,
          customer_experience_improvement: true,
          implementation_cost: 200000,
        },
        assumptions: ['Technology adoption rate is 80%', 'Staff training is completed'],
        timeframe: 18,
        created_at: new Date().toISOString(),
      },
      {
        id: 'template-market-expansion',
        name: 'Market Expansion',
        description: 'Simulate impact of entering new markets',
        type: 'market',
        parameters: {
          market_growth: 15,
          market_share_change: 5,
          competition_level: 0.7,
        },
        assumptions: ['New market has similar characteristics', 'Brand recognition transfers'],
        timeframe: 24,
        created_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get simulation history for a dealer
   */
  async getSimulationHistory(dealerId: string): Promise<SimulationResult[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('simulation_results')
          .select('*')
          .eq('dealer_id', dealerId)
          .order('created_at', { ascending: false })
          .limit(20);

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching simulation history:', error);
    }

    return [];
  }
}

// Export singleton instance
export const whatIfSimulator = new WhatIfSimulator();
