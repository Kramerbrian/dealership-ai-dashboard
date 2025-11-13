/**
 * Unified Revenue Opportunity Calculator
 * DealershipAI - Advanced Financial Modeling Engine
 * 
 * This module implements the comprehensive opportunity calculator that bundles
 * all positive external signals into a single, high-ROI investment proposition.
 * It quantifies AEO/SLV value and integrates with the AROI system.
 */

export interface AEOOpportunity {
  currentCitationFreq: number;
  targetCitationFreq: number;
  brandValuePerMention: number;
  trustMultiplier: number;
  monthlyMentions: number;
}

export interface SLVOpportunity {
  currentRank: number;
  targetRank: number;
  slvMultiplier: number;
  avgGP: number;
  monthlyLeads: number;
  trustMultiplier: number;
}

export interface OpportunityResult {
  totalOpportunity: number;
  aeoValue: number;
  slvValue: number;
  trustAdjustedValue: number;
  breakdown: {
    aeoBreakdown: AEOBreakdown;
    slvBreakdown: SLVBreakdown;
  };
  recommendations: OpportunityRecommendation[];
  cLevelSummary: string;
}

export interface AEOBreakdown {
  citationImprovement: number;
  brandExposureValue: number;
  highIntentTrafficValue: number;
  totalAEOValue: number;
}

export interface SLVBreakdown {
  rankImprovement: number;
  visibilityGain: number;
  additionalLeads: number;
  additionalRevenue: number;
  totalSLVValue: number;
}

export interface OpportunityRecommendation {
  category: 'AEO' | 'SLV' | 'Trust';
  action: string;
  investment: number;
  projectedReturn: number;
  roi: number;
  timeframe: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export class OpportunityCalculator {
  private trustSensitivityMultiplier: number = 1.0;
  private brandValuePerMention: number = 500; // $500 per positive brand mention
  private highIntentTrafficMultiplier: number = 2.5; // High-intent traffic worth 2.5x regular traffic

  /**
   * Calculate unified revenue opportunity
   */
  calculateOpportunity(
    aeoOpportunity: AEOOpportunity,
    slvOpportunity: SLVOpportunity
  ): OpportunityResult {
    // Calculate AEO value
    const aeoValue = this.calculateAEOValue(aeoOpportunity);
    
    // Calculate SLV value
    const slvValue = this.calculateSLVValue(slvOpportunity);
    
    // Apply trust sensitivity multiplier
    const trustAdjustedValue = (aeoValue + slvValue) * this.trustSensitivityMultiplier;
    
    return {
      totalOpportunity: trustAdjustedValue,
      aeoValue,
      slvValue,
      trustAdjustedValue,
      breakdown: {
        aeoBreakdown: this.calculateAEOBreakdown(aeoOpportunity),
        slvBreakdown: this.calculateSLVBreakdown(slvOpportunity)
      },
      recommendations: this.generateOpportunityRecommendations(aeoOpportunity, slvOpportunity),
      cLevelSummary: this.generateCLevelSummary(aeoValue, slvValue, aeoOpportunity, slvOpportunity)
    };
  }

  /**
   * Calculate AEO (Answer Engine Optimization) value
   */
  private calculateAEOValue(aeo: AEOOpportunity): number {
    const citationImprovement = aeo.targetCitationFreq - aeo.currentCitationFreq;
    const additionalMentions = citationImprovement * aeo.monthlyMentions;
    
    // Brand exposure value
    const brandExposureValue = additionalMentions * aeo.brandValuePerMention;
    
    // High-intent traffic value (citations drive qualified traffic)
    const highIntentTrafficValue = additionalMentions * aeo.brandValuePerMention * this.highIntentTrafficMultiplier;
    
    return brandExposureValue + highIntentTrafficValue;
  }

  /**
   * Calculate SLV (Search and Local Visibility) value
   */
  private calculateSLVValue(slv: SLVOpportunity): number {
    const rankImprovement = slv.currentRank - slv.targetRank;
    const visibilityGain = rankImprovement * 0.15; // 15% gain per rank improvement
    
    const additionalLeads = slv.monthlyLeads * visibilityGain;
    const additionalRevenue = additionalLeads * slv.avgGP;
    
    return additionalRevenue * slv.slvMultiplier;
  }

  /**
   * Calculate detailed AEO breakdown
   */
  private calculateAEOBreakdown(aeo: AEOOpportunity): AEOBreakdown {
    const citationImprovement = aeo.targetCitationFreq - aeo.currentCitationFreq;
    const additionalMentions = citationImprovement * aeo.monthlyMentions;
    
    const brandExposureValue = additionalMentions * aeo.brandValuePerMention;
    const highIntentTrafficValue = additionalMentions * aeo.brandValuePerMention * this.highIntentTrafficMultiplier;
    
    return {
      citationImprovement,
      brandExposureValue,
      highIntentTrafficValue,
      totalAEOValue: brandExposureValue + highIntentTrafficValue
    };
  }

  /**
   * Calculate detailed SLV breakdown
   */
  private calculateSLVBreakdown(slv: SLVOpportunity): SLVBreakdown {
    const rankImprovement = slv.currentRank - slv.targetRank;
    const visibilityGain = rankImprovement * 0.15;
    const additionalLeads = slv.monthlyLeads * visibilityGain;
    const additionalRevenue = additionalLeads * slv.avgGP;
    
    return {
      rankImprovement,
      visibilityGain,
      additionalLeads,
      additionalRevenue,
      totalSLVValue: additionalRevenue * slv.slvMultiplier
    };
  }

  /**
   * Generate opportunity recommendations
   */
  private generateOpportunityRecommendations(
    aeo: AEOOpportunity,
    slv: SLVOpportunity
  ): OpportunityRecommendation[] {
    const recommendations: OpportunityRecommendation[] = [];

    // AEO recommendations
    if (aeo.targetCitationFreq > aeo.currentCitationFreq) {
      recommendations.push({
        category: 'AEO',
        action: 'Optimize for AI Citation Frequency',
        investment: 15000,
        projectedReturn: this.calculateAEOValue(aeo),
        roi: this.calculateAEOValue(aeo) / 15000,
        timeframe: '2-3 months',
        priority: 'high',
        description: 'Implement comprehensive schema markup, FAQ pages, and E-E-A-T content to increase AI engine citations'
      });
    }

    // SLV recommendations
    if (slv.targetRank < slv.currentRank) {
      recommendations.push({
        category: 'SLV',
        action: 'Improve Local Search Ranking',
        investment: 12000,
        projectedReturn: this.calculateSLVValue(slv),
        roi: this.calculateSLVValue(slv) / 12000,
        timeframe: '1-2 months',
        priority: 'high',
        description: 'Optimize GBP profile, local citations, and geo-targeted content to improve local pack ranking'
      });
    }

    // Trust recommendations
    recommendations.push({
      category: 'Trust',
      action: 'Enhance Trust Signals',
      investment: 8000,
      projectedReturn: (this.calculateAEOValue(aeo) + this.calculateSLVValue(slv)) * 0.2,
      roi: ((this.calculateAEOValue(aeo) + this.calculateSLVValue(slv)) * 0.2) / 8000,
      timeframe: '1 month',
      priority: 'medium',
      description: 'Implement trust badges, security certificates, and transparency features to boost trust multiplier'
    });

    return recommendations.sort((a, b) => b.roi - a.roi);
  }

  /**
   * Generate C-Level summary
   */
  private generateCLevelSummary(
    aeoValue: number,
    slvValue: number,
    aeo: AEOOpportunity,
    slv: SLVOpportunity
  ): string {
    const aeoCitations = Math.round(aeo.targetCitationFreq - aeo.currentCitationFreq);
    const slvRankImprovement = slv.currentRank - slv.targetRank;
    
    return `Securing ${aeoCitations} new AI citations has the equivalent value of a $${Math.round(aeoValue).toLocaleString()} top-of-funnel ad campaign, but with near-zero media cost. Moving from Rank ${slv.currentRank} to Rank ${slv.targetRank} in the Local Pack unlocks $${Math.round(slvValue).toLocaleString()} in annualized, hyper-local sales leads.`;
  }

  /**
   * Calculate intervention group opportunities
   */
  calculateInterventionGroupOpportunities(
    aeoOpportunity: AEOOpportunity,
    slvOpportunity: SLVOpportunity
  ): { [key: string]: { value: number; takeaway: string } } {
    const aeoValue = this.calculateAEOValue(aeoOpportunity);
    const slvValue = this.calculateSLVValue(slvOpportunity);
    
    return {
      'AEO Citation Freq ↑': {
        value: aeoValue,
        takeaway: `Securing ${Math.round(aeoOpportunity.targetCitationFreq - aeoOpportunity.currentCitationFreq)} new AI citations has the equivalent value of a $${Math.round(aeoValue).toLocaleString()} top-of-funnel ad campaign, but with near-zero media cost.`
      },
      'SLV Multiplier ↑': {
        value: slvValue,
        takeaway: `Moving from Rank ${slvOpportunity.currentRank} to Rank ${slvOpportunity.targetRank} in the Local Pack unlocks $${Math.round(slvValue).toLocaleString()} in annualized, hyper-local sales leads.`
      }
    };
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
   * Set high-intent traffic multiplier
   */
  setHighIntentTrafficMultiplier(multiplier: number): void {
    this.highIntentTrafficMultiplier = multiplier;
  }
}
