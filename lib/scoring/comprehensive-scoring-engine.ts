// Comprehensive Scoring Engine - DealershipAI
// Implements the advanced scoring formula with multiple metrics and penalties

export interface ComprehensiveScoreInputs {
  // Core Metrics (0-1 scale)
  ATI: number;        // Algorithmic Trust Index
  AIV: number;        // Algorithmic Visibility Index  
  VLI: number;        // Vehicle Listing Index
  OI: number;         // Online Inventory
  GBP: number;        // Google Business Profile
  RRS: number;        // Review Response Score
  WX: number;         // Website Experience
  IFR: number;        // Inventory Freshness Rate
  CIS: number;        // Clarity Intelligence Score
  
  // Penalties (0-1 scale, higher = more penalty)
  P_policy: number;   // Policy violations penalty
  P_parity: number;   // Bot parity penalty
  P_staleness: number; // Data staleness penalty
}

export interface ComprehensiveScoreResult {
  S: number;                    // Final comprehensive score (0-100)
  breakdown: {
    weightedSum: number;        // Sum of weighted metrics
    totalPenalties: number;     // Sum of penalties
    clampedScore: number;       // Score after clamping
  };
  metrics: {
    ATI: { value: number; weight: number; contribution: number };
    AIV: { value: number; weight: number; contribution: number };
    VLI: { value: number; weight: number; contribution: number };
    OI: { value: number; weight: number; contribution: number };
    GBP: { value: number; weight: number; contribution: number };
    RRS: { value: number; weight: number; contribution: number };
    WX: { value: number; weight: number; contribution: number };
    IFR: { value: number; weight: number; contribution: number };
    CIS: { value: number; weight: number; contribution: number };
  };
  penalties: {
    P_policy: { value: number; impact: number };
    P_parity: { value: number; impact: number };
    P_staleness: { value: number; impact: number };
  };
}

export class ComprehensiveScoringEngine {
  private weights = {
    ATI: 0.20,
    AIV: 0.20,
    VLI: 0.15,
    OI: 0.10,
    GBP: 0.10,
    RRS: 0.10,
    WX: 0.07,
    IFR: 0.05,
    CIS: 0.03
  };

  /**
   * Clamp value between 0 and 1
   */
  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  /**
   * Calculate comprehensive score using the provided formula
   * S = clamp01(weightedSum - penalties) * 100
   */
  calculateScore(inputs: ComprehensiveScoreInputs): ComprehensiveScoreResult {
    // Calculate weighted sum of positive metrics
    const weightedSum = 
      this.weights.ATI * inputs.ATI +
      this.weights.AIV * inputs.AIV +
      this.weights.VLI * inputs.VLI +
      this.weights.OI * inputs.OI +
      this.weights.GBP * inputs.GBP +
      this.weights.RRS * inputs.RRS +
      this.weights.WX * inputs.WX +
      this.weights.IFR * inputs.IFR +
      this.weights.CIS * inputs.CIS;

    // Calculate total penalties
    const totalPenalties = inputs.P_policy + inputs.P_parity + inputs.P_staleness;

    // Apply formula: S = clamp01(weightedSum - penalties) * 100
    const clampedScore = this.clamp01(weightedSum - totalPenalties);
    const finalScore = clampedScore * 100;

    // Calculate individual metric contributions
    const metrics = {
      ATI: {
        value: inputs.ATI,
        weight: this.weights.ATI,
        contribution: this.weights.ATI * inputs.ATI
      },
      AIV: {
        value: inputs.AIV,
        weight: this.weights.AIV,
        contribution: this.weights.AIV * inputs.AIV
      },
      VLI: {
        value: inputs.VLI,
        weight: this.weights.VLI,
        contribution: this.weights.VLI * inputs.VLI
      },
      OI: {
        value: inputs.OI,
        weight: this.weights.OI,
        contribution: this.weights.OI * inputs.OI
      },
      GBP: {
        value: inputs.GBP,
        weight: this.weights.GBP,
        contribution: this.weights.GBP * inputs.GBP
      },
      RRS: {
        value: inputs.RRS,
        weight: this.weights.RRS,
        contribution: this.weights.RRS * inputs.RRS
      },
      WX: {
        value: inputs.WX,
        weight: this.weights.WX,
        contribution: this.weights.WX * inputs.WX
      },
      IFR: {
        value: inputs.IFR,
        weight: this.weights.IFR,
        contribution: this.weights.IFR * inputs.IFR
      },
      CIS: {
        value: inputs.CIS,
        weight: this.weights.CIS,
        contribution: this.weights.CIS * inputs.CIS
      }
    };

    // Calculate penalty impacts
    const penalties = {
      P_policy: {
        value: inputs.P_policy,
        impact: inputs.P_policy
      },
      P_parity: {
        value: inputs.P_parity,
        impact: inputs.P_parity
      },
      P_staleness: {
        value: inputs.P_staleness,
        impact: inputs.P_staleness
      }
    };

    return {
      S: finalScore,
      breakdown: {
        weightedSum,
        totalPenalties,
        clampedScore
      },
      metrics,
      penalties
    };
  }

  /**
   * Calculate score with validation and error handling
   */
  calculateScoreSafe(inputs: Partial<ComprehensiveScoreInputs>): ComprehensiveScoreResult {
    // Default values for missing inputs
    const safeInputs: ComprehensiveScoreInputs = {
      ATI: inputs.ATI ?? 0,
      AIV: inputs.AIV ?? 0,
      VLI: inputs.VLI ?? 0,
      OI: inputs.OI ?? 0,
      GBP: inputs.GBP ?? 0,
      RRS: inputs.RRS ?? 0,
      WX: inputs.WX ?? 0,
      IFR: inputs.IFR ?? 0,
      CIS: inputs.CIS ?? 0,
      P_policy: inputs.P_policy ?? 0,
      P_parity: inputs.P_parity ?? 0,
      P_staleness: inputs.P_staleness ?? 0
    };

    // Validate inputs are within expected range
    Object.entries(safeInputs).forEach(([key, value]) => {
      if (value < 0 || value > 1) {
        console.warn(`Warning: ${key} value ${value} is outside expected range [0,1]`);
      }
    });

    return this.calculateScore(safeInputs);
  }

  /**
   * Get score interpretation and recommendations
   */
  getScoreInterpretation(score: number): {
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    description: string;
    recommendations: string[];
  } {
    if (score >= 90) {
      return {
        level: 'excellent',
        description: 'Outstanding performance across all metrics',
        recommendations: [
          'Maintain current optimization strategies',
          'Focus on advanced features and competitive advantages',
          'Consider expanding to new markets'
        ]
      };
    } else if (score >= 80) {
      return {
        level: 'good',
        description: 'Strong performance with room for improvement',
        recommendations: [
          'Address any remaining penalty issues',
          'Optimize lower-performing metrics',
          'Implement advanced features'
        ]
      };
    } else if (score >= 70) {
      return {
        level: 'fair',
        description: 'Average performance with significant improvement opportunities',
        recommendations: [
          'Prioritize high-impact metric improvements',
          'Address penalty issues immediately',
          'Focus on core optimization strategies'
        ]
      };
    } else if (score >= 60) {
      return {
        level: 'poor',
        description: 'Below-average performance requiring immediate attention',
        recommendations: [
          'Emergency optimization of critical metrics',
          'Address all penalty issues',
          'Implement basic optimization strategies'
        ]
      };
    } else {
      return {
        level: 'critical',
        description: 'Critical performance issues requiring urgent intervention',
        recommendations: [
          'Immediate emergency optimization',
          'Address all penalty issues as priority',
          'Consider professional consultation'
        ]
      };
    }
  }

  /**
   * Calculate what-if scenarios for optimization
   */
  calculateWhatIf(
    currentInputs: ComprehensiveScoreInputs,
    changes: Partial<ComprehensiveScoreInputs>
  ): {
    currentScore: number;
    projectedScore: number;
    improvement: number;
    impact: Record<string, number>;
  } {
    const currentResult = this.calculateScore(currentInputs);
    const projectedInputs = { ...currentInputs, ...changes };
    const projectedResult = this.calculateScore(projectedInputs);

    const impact: Record<string, number> = {};
    Object.keys(changes).forEach(key => {
      const currentValue = currentInputs[key as keyof ComprehensiveScoreInputs];
      const newValue = changes[key as keyof ComprehensiveScoreInputs]!;
      impact[key] = newValue - currentValue;
    });

    return {
      currentScore: currentResult.S,
      projectedScore: projectedResult.S,
      improvement: projectedResult.S - currentResult.S,
      impact
    };
  }
}

// Export singleton instance
export const comprehensiveScoringEngine = new ComprehensiveScoringEngine();

// Export types for use in other modules
// Types already exported above
