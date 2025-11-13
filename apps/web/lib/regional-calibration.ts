// Regional calibration for US/CA/UK/AU
export type Region = 'US' | 'CA' | 'UK' | 'AU';

export interface RegionalFactors {
  marketSize: number;
  competitionLevel: number;
  searchBehavior: number;
  languageComplexity: number;
  regulatoryEnvironment: number;
  culturalFactors: number;
}

export interface RegionalCalibration {
  region: Region;
  factors: RegionalFactors;
  multipliers: {
    aiv: number;
    ati: number;
    crs: number;
    elasticity: number;
  };
  lastUpdated: Date;
}

export class RegionalCalibrationEngine {
  private calibrations: Map<Region, RegionalCalibration> = new Map();

  constructor() {
    this.initializeCalibrations();
  }

  // Initialize regional calibrations
  private initializeCalibrations() {
    // US Calibration (baseline)
    this.calibrations.set('US', {
      region: 'US',
      factors: {
        marketSize: 1.0,
        competitionLevel: 1.0,
        searchBehavior: 1.0,
        languageComplexity: 1.0,
        regulatoryEnvironment: 1.0,
        culturalFactors: 1.0
      },
      multipliers: {
        aiv: 1.0,
        ati: 1.0,
        crs: 1.0,
        elasticity: 1.0
      },
      lastUpdated: new Date()
    });

    // Canada Calibration
    this.calibrations.set('CA', {
      region: 'CA',
      factors: {
        marketSize: 0.1, // 10% of US market
        competitionLevel: 0.7, // Less competitive
        searchBehavior: 0.9, // Similar to US
        languageComplexity: 1.1, // Bilingual complexity
        regulatoryEnvironment: 1.2, // More regulated
        culturalFactors: 0.95 // Similar to US
      },
      multipliers: {
        aiv: 1.05, // Slightly higher due to less competition
        ati: 1.1, // Higher trust due to regulatory environment
        crs: 0.95, // Slightly lower due to language complexity
        elasticity: 0.8 // Lower elasticity due to smaller market
      },
      lastUpdated: new Date()
    });

    // UK Calibration
    this.calibrations.set('UK', {
      region: 'UK',
      factors: {
        marketSize: 0.2, // 20% of US market
        competitionLevel: 1.2, // More competitive
        searchBehavior: 0.8, // Different search patterns
        languageComplexity: 1.0, // English but different terminology
        regulatoryEnvironment: 1.3, // GDPR and other regulations
        culturalFactors: 0.9 // Different cultural preferences
      },
      multipliers: {
        aiv: 0.9, // Lower due to higher competition
        ati: 1.15, // Higher due to regulatory environment
        crs: 1.05, // Higher due to content quality expectations
        elasticity: 0.7 // Lower elasticity due to market size
      },
      lastUpdated: new Date()
    });

    // Australia Calibration
    this.calibrations.set('AU', {
      region: 'AU',
      factors: {
        marketSize: 0.08, // 8% of US market
        competitionLevel: 0.6, // Less competitive
        searchBehavior: 0.85, // Similar to UK
        languageComplexity: 0.95, // English with local slang
        regulatoryEnvironment: 1.1, // Moderate regulation
        culturalFactors: 0.85 // Different cultural preferences
      },
      multipliers: {
        aiv: 1.1, // Higher due to less competition
        ati: 1.05, // Slightly higher trust
        crs: 0.9, // Lower due to market size
        elasticity: 0.6 // Lower elasticity due to smaller market
      },
      lastUpdated: new Date()
    });
  }

  // Get regional calibration
  getCalibration(region: Region): RegionalCalibration | null {
    return this.calibrations.get(region) || null;
  }

  // Apply regional calibration to metrics
  applyCalibration(region: Region, metrics: {
    aiv: number;
    ati: number;
    crs: number;
    elasticity: number;
  }): { aiv: number; ati: number; crs: number; elasticity: number } {
    const calibration = this.getCalibration(region);
    
    if (!calibration) {
      return metrics; // Return unchanged if no calibration
    }

    return {
      aiv: metrics.aiv * calibration.multipliers.aiv,
      ati: metrics.ati * calibration.multipliers.ati,
      crs: metrics.crs * calibration.multipliers.crs,
      elasticity: metrics.elasticity * calibration.multipliers.elasticity
    };
  }

  // Detect region from domain or other signals
  detectRegion(domain: string, countryCode?: string): Region {
    // Check country code first
    if (countryCode) {
      switch (countryCode.toUpperCase()) {
        case 'US':
        case 'USA':
          return 'US';
        case 'CA':
        case 'CAN':
          return 'CA';
        case 'GB':
        case 'UK':
          return 'UK';
        case 'AU':
        case 'AUS':
          return 'AU';
      }
    }

    // Check domain patterns
    const domainLower = domain.toLowerCase();
    
    if (domainLower.includes('.ca')) {
      return 'CA';
    } else if (domainLower.includes('.co.uk') || domainLower.includes('.uk')) {
      return 'UK';
    } else if (domainLower.includes('.com.au') || domainLower.includes('.au')) {
      return 'AU';
    } else if (domainLower.includes('.com') || domainLower.includes('.us')) {
      return 'US';
    }

    // Default to US
    return 'US';
  }

  // Get regional recommendations
  getRegionalRecommendations(region: Region): string[] {
    const calibration = this.getCalibration(region);
    
    if (!calibration) {
      return [];
    }

    const recommendations: string[] = [];

    // Market size recommendations
    if (calibration.factors.marketSize < 0.5) {
      recommendations.push(`Focus on local market penetration - ${region} has a smaller market size`);
    }

    // Competition level recommendations
    if (calibration.factors.competitionLevel > 1.1) {
      recommendations.push(`High competition in ${region} - differentiate through unique value propositions`);
    } else if (calibration.factors.competitionLevel < 0.8) {
      recommendations.push(`Lower competition in ${region} - opportunity for market leadership`);
    }

    // Search behavior recommendations
    if (calibration.factors.searchBehavior < 0.9) {
      recommendations.push(`Adapt search strategy for ${region} - different search patterns than US`);
    }

    // Language complexity recommendations
    if (calibration.factors.languageComplexity > 1.1) {
      recommendations.push(`Consider language complexity in ${region} - may need localized content`);
    }

    // Regulatory environment recommendations
    if (calibration.factors.regulatoryEnvironment > 1.2) {
      recommendations.push(`Ensure compliance with ${region} regulations - higher regulatory requirements`);
    }

    // Cultural factors recommendations
    if (calibration.factors.culturalFactors < 0.9) {
      recommendations.push(`Adapt messaging for ${region} cultural preferences`);
    }

    return recommendations;
  }

  // Update regional calibration based on performance data
  updateCalibration(region: Region, performanceData: {
    actualAIV: number;
    predictedAIV: number;
    actualATI: number;
    predictedATI: number;
    actualCRS: number;
    predictedCRS: number;
    actualElasticity: number;
    predictedElasticity: number;
  }) {
    const calibration = this.getCalibration(region);
    
    if (!calibration) {
      return;
    }

    // Calculate adjustment factors
    const aivAdjustment = performanceData.actualAIV / performanceData.predictedAIV;
    const atiAdjustment = performanceData.actualATI / performanceData.predictedATI;
    const crsAdjustment = performanceData.actualCRS / performanceData.predictedCRS;
    const elasticityAdjustment = performanceData.actualElasticity / performanceData.predictedElasticity;

    // Apply smoothing factor to prevent wild swings
    const smoothingFactor = 0.1;
    
    calibration.multipliers.aiv = calibration.multipliers.aiv * (1 - smoothingFactor) + 
      (calibration.multipliers.aiv * aivAdjustment) * smoothingFactor;
    calibration.multipliers.ati = calibration.multipliers.ati * (1 - smoothingFactor) + 
      (calibration.multipliers.ati * atiAdjustment) * smoothingFactor;
    calibration.multipliers.crs = calibration.multipliers.crs * (1 - smoothingFactor) + 
      (calibration.multipliers.crs * crsAdjustment) * smoothingFactor;
    calibration.multipliers.elasticity = calibration.multipliers.elasticity * (1 - smoothingFactor) + 
      (calibration.multipliers.elasticity * elasticityAdjustment) * smoothingFactor;

    calibration.lastUpdated = new Date();
  }

  // Get all calibrations
  getAllCalibrations(): RegionalCalibration[] {
    return Array.from(this.calibrations.values());
  }

  // Export calibrations for backup/analysis
  exportCalibrations(): string {
    return JSON.stringify(Array.from(this.calibrations.entries()), null, 2);
  }

  // Import calibrations from backup
  importCalibrations(calibrationsJson: string): boolean {
    try {
      const calibrations = JSON.parse(calibrationsJson);
      this.calibrations.clear();
      
      for (const [region, calibration] of calibrations) {
        this.calibrations.set(region, calibration);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import calibrations:', error);
      return false;
    }
  }
}

// Export singleton instance
export const regionalCalibrationEngine = new RegionalCalibrationEngine();
