/**
 * Trust Decay Tax Calculator
 * DealershipAI - Quantifying Cost of Inaction
 * 
 * This module implements the Trust Decay Tax formula that quantifies
 * the unnecessary increase in ad spend required to maintain the same
 * lead volume when digital trust decays.
 */

export interface TrustDecayMetrics {
  currentTrustScore: number;
  targetTrustScore: number;
  organicTrafficBaseline: number; // Monthly organic traffic
  conversionRateBaseline: number; // Current conversion rate
  blendedCAC: number; // Cost per lead via paid search
  totalOrganicLeads: number; // Monthly organic leads
}

export interface DecayTaxResult {
  decayTaxCost: number;
  organicTrafficLoss: number;
  conversionRateDrop: number;
  additionalLeadsNeeded: number;
  additionalAdSpend: number;
  timeHorizon: number; // months
  breakdown: {
    trafficLossCost: number;
    conversionLossCost: number;
    totalDecayTax: number;
  };
  recommendations: DecayTaxRecommendation[];
}

export interface DecayTaxRecommendation {
  action: string;
  impact: string;
  cost: number;
  savings: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeframe: string;
}

export class DecayTaxCalculator {
  private trustDecayBeta: number = 0.15; // 15% traffic loss per 5-point trust decay
  private conversionDecayBeta: number = 0.1; // 10% conversion drop per 5-point trust decay
  private timeHorizon: number = 6; // 6-month analysis period

  /**
   * Calculate the Trust Decay Tax
   */
  calculateDecayTax(metrics: TrustDecayMetrics): DecayTaxResult {
    const trustDecay = metrics.currentTrustScore - metrics.targetTrustScore;
    
    // Calculate organic traffic loss percentage
    const organicTrafficLoss = this.calculateOrganicTrafficLoss(trustDecay);
    
    // Calculate conversion rate drop percentage
    const conversionRateDrop = this.calculateConversionRateDrop(trustDecay);
    
    // Calculate traffic loss cost
    const trafficLossCost = this.calculateTrafficLossCost(
      metrics.organicTrafficBaseline,
      organicTrafficLoss,
      metrics.conversionRateBaseline,
      metrics.blendedCAC
    );
    
    // Calculate conversion loss cost
    const conversionLossCost = this.calculateConversionLossCost(
      metrics.totalOrganicLeads,
      conversionRateDrop,
      metrics.blendedCAC
    );
    
    // Calculate additional leads needed
    const additionalLeadsNeeded = this.calculateAdditionalLeadsNeeded(
      metrics.totalOrganicLeads,
      organicTrafficLoss,
      conversionRateDrop
    );
    
    // Calculate total decay tax cost
    const totalDecayTax = (trafficLossCost + conversionLossCost) * this.timeHorizon;
    
    return {
      decayTaxCost: totalDecayTax,
      organicTrafficLoss,
      conversionRateDrop,
      additionalLeadsNeeded,
      additionalAdSpend: totalDecayTax,
      timeHorizon: this.timeHorizon,
      breakdown: {
        trafficLossCost: trafficLossCost * this.timeHorizon,
        conversionLossCost: conversionLossCost * this.timeHorizon,
        totalDecayTax
      },
      recommendations: this.generateDecayTaxRecommendations(trustDecay, totalDecayTax)
    };
  }

  /**
   * Calculate organic traffic loss percentage
   */
  private calculateOrganicTrafficLoss(trustDecay: number): number {
    const decayPoints = Math.abs(trustDecay);
    const lossPercentage = (decayPoints / 5) * this.trustDecayBeta;
    return Math.min(0.5, lossPercentage); // Cap at 50% loss
  }

  /**
   * Calculate conversion rate drop percentage
   */
  private calculateConversionRateDrop(trustDecay: number): number {
    const decayPoints = Math.abs(trustDecay);
    const dropPercentage = (decayPoints / 5) * this.conversionDecayBeta;
    return Math.min(0.3, dropPercentage); // Cap at 30% drop
  }

  /**
   * Calculate traffic loss cost
   */
  private calculateTrafficLossCost(
    baselineTraffic: number,
    trafficLoss: number,
    conversionRate: number,
    cac: number
  ): number {
    const lostTraffic = baselineTraffic * trafficLoss;
    const lostLeads = lostTraffic * conversionRate;
    return lostLeads * cac;
  }

  /**
   * Calculate conversion loss cost
   */
  private calculateConversionLossCost(
    totalLeads: number,
    conversionDrop: number,
    cac: number
  ): number {
    const lostConversions = totalLeads * conversionDrop;
    return lostConversions * cac;
  }

  /**
   * Calculate additional leads needed
   */
  private calculateAdditionalLeadsNeeded(
    totalLeads: number,
    trafficLoss: number,
    conversionDrop: number
  ): number {
    const trafficLossLeads = totalLeads * trafficLoss;
    const conversionLossLeads = totalLeads * conversionDrop;
    return trafficLossLeads + conversionLossLeads;
  }

  /**
   * Generate decay tax recommendations
   */
  private generateDecayTaxRecommendations(
    trustDecay: number,
    totalDecayTax: number
  ): DecayTaxRecommendation[] {
    const recommendations: DecayTaxRecommendation[] = [];

    // Review response rate improvement
    if (trustDecay > 10) {
      recommendations.push({
        action: "Improve Review Response Rate",
        impact: "Increase from 60% to 85% response rate",
        cost: 5000,
        savings: totalDecayTax * 0.4,
        priority: 'critical',
        timeframe: '2-4 weeks'
      });
    }

    // E-E-A-T content improvements
    if (trustDecay > 15) {
      recommendations.push({
        action: "Enhance E-E-A-T Content",
        impact: "Add author bios, certifications, case studies",
        cost: 15000,
        savings: totalDecayTax * 0.3,
        priority: 'high',
        timeframe: '1-2 months'
      });
    }

    // Technical trust signals
    if (trustDecay > 5) {
      recommendations.push({
        action: "Implement Technical Trust Signals",
        impact: "Add SSL, privacy policy, security badges",
        cost: 3000,
        savings: totalDecayTax * 0.2,
        priority: 'high',
        timeframe: '1-2 weeks'
      });
    }

    // Schema markup improvements
    recommendations.push({
      action: "Enhance Schema Markup",
      impact: "Add comprehensive structured data",
      cost: 8000,
      savings: totalDecayTax * 0.1,
      priority: 'medium',
      timeframe: '3-4 weeks'
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate C-Suite presentation summary
   */
  generateCLevelSummary(result: DecayTaxResult, metrics: TrustDecayMetrics): string {
    const trustDecay = metrics.currentTrustScore - metrics.targetTrustScore;
    const additionalLeads = Math.round(result.additionalLeadsNeeded * this.timeHorizon);
    
    return `If we maintain the current ${metrics.currentTrustScore}% Trust Score, the resulting ${Math.round(result.organicTrafficLoss * 100)}% organic traffic decay will force us to buy ${additionalLeads} extra leads via paid channels. At a blended CAC of $${metrics.blendedCAC} per lead, this ${this.timeHorizon}-month inaction results in $${Math.round(result.decayTaxCost).toLocaleString()} in unnecessary ad spend just to maintain the status quo. This is the Decay Tax.`;
  }

  /**
   * Set custom decay betas
   */
  setDecayBetas(trafficBeta: number, conversionBeta: number): void {
    this.trustDecayBeta = trafficBeta;
    this.conversionDecayBeta = conversionBeta;
  }

  /**
   * Set analysis time horizon
   */
  setTimeHorizon(months: number): void {
    this.timeHorizon = months;
  }
}
