/**
 * Actionable ROI Score (AROI) Calculator
 * DealershipAI - Advanced Financial Modeling Engine
 * 
 * This module implements the comprehensive AROI formula that quantifies
 * the financial impact of digital trust improvements and prioritizes
 * budget allocation based on Cost of Effort vs. Revenue Impact.
 */

export interface CostOfEffort {
  id: string;
  name: string;
  category: 'content' | 'technical' | 'marketing' | 'development';
  estimatedHours: number;
  hourlyRate: number;
  totalCost: number;
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface SLVMultiplier {
  currentRank: number;
  targetRank: number;
  multiplier: number;
  avgGP: number; // Average Gross Profit per lead
  monthlyLeads: number;
}

export interface FTFRMetrics {
  currentFTFR: number;
  targetFTFR: number;
  salesLinkage: number; // Conversion rate from FTFR to sales
  avgDealValue: number;
}

export interface AROIResult {
  aroiScore: number;
  totalInvestment: number;
  projectedReturn: number;
  paybackPeriod: number; // in months
  confidence: number;
  breakdown: {
    slvImpact: number;
    ftfrImpact: number;
    salesLinkageImpact: number;
  };
  recommendations: AROIRecommendation[];
}

export interface AROIRecommendation {
  id: string;
  name: string;
  category: string;
  aroiScore: number;
  investment: number;
  projectedReturn: number;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class AROICalculator {
  private trustSensitivityMultiplier: number = 1.0;
  private brandValuePerMention: number = 500; // $500 per positive brand mention
  private blendedCAC: number = 120; // $120 per lead via paid search

  /**
   * Calculate the main AROI score using the comprehensive formula
   */
  calculateAROI(
    costsOfEffort: CostOfEffort[],
    slvMultiplier: SLVMultiplier,
    ftfrMetrics: FTFRMetrics
  ): AROIResult {
    // Calculate total Cost of Effort (COE)
    const totalCOE = costsOfEffort.reduce((sum, coe) => sum + coe.totalCost, 0);

    // Calculate SLV impact
    const slvImpact = this.calculateSLVImpact(slvMultiplier);

    // Calculate FTFR impact
    const ftfrImpact = this.calculateFTFRImpact(ftfrMetrics);

    // Calculate FTFR-to-Sales linkage impact
    const salesLinkageImpact = this.calculateSalesLinkageImpact(ftfrMetrics);

    // Apply Trust Sensitivity Multiplier
    const trustAdjustedImpact = (slvImpact + ftfrImpact + salesLinkageImpact) * this.trustSensitivityMultiplier;

    // Calculate AROI Score
    const aroiScore = totalCOE > 0 ? trustAdjustedImpact / totalCOE : 0;

    // Calculate projected return
    const projectedReturn = trustAdjustedImpact;

    // Calculate payback period
    const paybackPeriod = totalCOE > 0 ? (totalCOE / projectedReturn) * 12 : 0;

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(costsOfEffort, slvMultiplier, ftfrMetrics);

    return {
      aroiScore,
      totalInvestment: totalCOE,
      projectedReturn,
      paybackPeriod,
      confidence,
      breakdown: {
        slvImpact,
        ftfrImpact,
        salesLinkageImpact
      },
      recommendations: this.generateRecommendations(costsOfEffort, aroiScore)
    };
  }

  /**
   * Calculate SLV (Search and Local Visibility) impact
   */
  private calculateSLVImpact(slv: SLVMultiplier): number {
    const rankImprovement = slv.currentRank - slv.targetRank;
    const visibilityGain = rankImprovement * 0.15; // 15% gain per rank improvement
    
    const additionalLeads = slv.monthlyLeads * visibilityGain;
    const additionalRevenue = additionalLeads * slv.avgGP;
    
    return additionalRevenue * slv.multiplier;
  }

  /**
   * Calculate FTFR (First-Time-to-First-Response) impact
   */
  private calculateFTFRImpact(ftfr: FTFRMetrics): number {
    const responseTimeImprovement = ftfr.currentFTFR - ftfr.targetFTFR;
    const conversionImprovement = responseTimeImprovement * 0.02; // 2% improvement per hour
    
    const additionalConversions = ftfr.salesLinkage * conversionImprovement;
    return additionalConversions * ftfr.avgDealValue;
  }

  /**
   * Calculate FTFR-to-Sales linkage impact
   */
  private calculateSalesLinkageImpact(ftfr: FTFRMetrics): number {
    const linkageImprovement = ftfr.salesLinkage * 0.1; // 10% improvement in linkage
    return linkageImprovement * ftfr.avgDealValue;
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(
    costs: CostOfEffort[],
    slv: SLVMultiplier,
    ftfr: FTFRMetrics
  ): number {
    let confidence = 0.5; // Base confidence

    // Cost estimation confidence
    const detailedCosts = costs.filter(c => c.complexity !== 'high').length;
    confidence += (detailedCosts / costs.length) * 0.2;

    // SLV data confidence
    if (slv.currentRank > 0 && slv.targetRank > 0) confidence += 0.15;

    // FTFR data confidence
    if (ftfr.currentFTFR > 0 && ftfr.targetFTFR > 0) confidence += 0.15;

    return Math.min(1.0, confidence);
  }

  /**
   * Generate prioritized recommendations
   */
  private generateRecommendations(
    costs: CostOfEffort[],
    overallAROI: number
  ): AROIRecommendation[] {
    return costs.map(cost => {
      const individualAROI = this.calculateIndividualAROI(cost);
      const priority = this.determinePriority(individualAROI, overallAROI);
      
      return {
        id: cost.id,
        name: cost.name,
        category: cost.category,
        aroiScore: individualAROI,
        investment: cost.totalCost,
        projectedReturn: cost.totalCost * individualAROI,
        priority,
        timeframe: this.estimateTimeframe(cost),
        riskLevel: this.assessRisk(cost)
      };
    }).sort((a, b) => b.aroiScore - a.aroiScore);
  }

  /**
   * Calculate individual AROI for a specific cost of effort
   */
  private calculateIndividualAROI(cost: CostOfEffort): number {
    // Base AROI calculation for individual items
    const baseROI = this.getBaseROIByCategory(cost.category);
    const complexityMultiplier = this.getComplexityMultiplier(cost.complexity);
    
    return baseROI * complexityMultiplier;
  }

  /**
   * Get base ROI by category
   */
  private getBaseROIByCategory(category: string): number {
    const baseROIs = {
      'content': 3.2,    // Content improvements typically yield 3.2x ROI
      'technical': 2.8,  // Technical improvements yield 2.8x ROI
      'marketing': 2.5,  // Marketing improvements yield 2.5x ROI
      'development': 2.0 // Development improvements yield 2.0x ROI
    };
    
    return baseROIs[category as keyof typeof baseROIs] || 2.0;
  }

  /**
   * Get complexity multiplier
   */
  private getComplexityMultiplier(complexity: string): number {
    const multipliers = {
      'low': 1.2,
      'medium': 1.0,
      'high': 0.8
    };
    
    return multipliers[complexity as keyof typeof multipliers] || 1.0;
  }

  /**
   * Determine priority level
   */
  private determinePriority(individualAROI: number, overallAROI: number): 'high' | 'medium' | 'low' {
    if (individualAROI > overallAROI * 1.2) return 'high';
    if (individualAROI > overallAROI * 0.8) return 'medium';
    return 'low';
  }

  /**
   * Estimate timeframe for implementation
   */
  private estimateTimeframe(cost: CostOfEffort): string {
    const weeks = Math.ceil(cost.estimatedHours / 40);
    
    if (weeks <= 2) return '1-2 weeks';
    if (weeks <= 4) return '3-4 weeks';
    if (weeks <= 8) return '1-2 months';
    return '2+ months';
  }

  /**
   * Assess risk level
   */
  private assessRisk(cost: CostOfEffort): 'low' | 'medium' | 'high' {
    if (cost.complexity === 'high' || cost.dependencies.length > 3) return 'high';
    if (cost.complexity === 'medium' || cost.dependencies.length > 1) return 'medium';
    return 'low';
  }

  /**
   * Set trust sensitivity multiplier
   */
  setTrustSensitivityMultiplier(multiplier: number): void {
    this.trustSensitivityMultiplier = multiplier;
  }

  /**
   * Set brand value per mention
   */
  setBrandValuePerMention(value: number): void {
    this.brandValuePerMention = value;
  }

  /**
   * Set blended CAC
   */
  setBlendedCAC(cac: number): void {
    this.blendedCAC = cac;
  }
}
