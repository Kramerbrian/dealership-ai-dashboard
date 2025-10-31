/**
 * QAI (Quantum Authority Index) Calculator
 * Calculates AI visibility and authority metrics
 */

export interface QAIData {
  ftfr: {
    score: number;
    metrics: {
      certificationCompliance: number;
      trainingCompletion: number;
      processAdherence: number;
      qualityAuditScore: number;
    };
  };
  vdpd: {
    score: number;
    metrics: {
      conversionRate: number;
      bounceRate: number;
      timeOnSite: number;
      pageViews: number;
    };
  };
  proc: {
    score: number;
    metrics: {
      reviewResponseTime: number;
      reviewQuality: number;
      customerServiceScore: number;
      trustSignals: number;
    };
  };
  cert: {
    score: number;
    metrics: {
      expertiseContent: number;
      authoritySignals: number;
      contentQuality: number;
      credibilityFactors: number;
    };
  };
}

export interface QAIResult {
  overallScore: number;
  breakdown: {
    ftfr: number;
    vdpd: number;
    proc: number;
    cert: number;
  };
  grade: string;
  recommendations: string[];
}

export class QAICalculator {
  static calculateQAIComplete(data: any): QAIResult {
    // Convert legacy data format to new format
    const ftfrScore = this.calculateFTFRScore(data.ftfr);
    const vdpdScore = this.calculateVDPDScore(data.vdpd);
    const procScore = this.calculatePROCScore(data.proc);
    const certScore = this.calculateCERTScore(data.cert);

    const overallScore = (ftfrScore * 0.25) + (vdpdScore * 0.25) + (procScore * 0.25) + (certScore * 0.25);

    return {
      overallScore,
      breakdown: {
        ftfr: ftfrScore,
        vdpd: vdpdScore,
        proc: procScore,
        cert: certScore
      },
      grade: this.getGrade(overallScore),
      recommendations: this.generateRecommendations(overallScore, {
        ftfr: ftfrScore,
        vdpd: vdpdScore,
        proc: procScore,
        cert: certScore
      })
    };
  }

  private static calculateFTFRScore(data: any): number {
    const responseTimeScore = Math.max(0, 100 - (data.responseTime * 20));
    const uptimeScore = data.uptime;
    const errorRateScore = Math.max(0, 100 - (data.errorRate * 10));
    const satisfactionScore = data.customerSatisfaction;

    return (responseTimeScore + uptimeScore + errorRateScore + satisfactionScore) / 4;
  }

  private static calculateVDPDScore(data: any): number {
    const conversionScore = Math.min(100, data.conversionRate * 5);
    const bounceScore = Math.max(0, 100 - (data.bounceRate * 2));
    const timeScore = Math.min(100, data.timeOnSite / 3);
    const pageViewScore = Math.min(100, data.pageViews * 15);

    return (conversionScore + bounceScore + timeScore + pageViewScore) / 4;
  }

  private static calculatePROCScore(data: any): number {
    const responseScore = Math.max(0, 100 - (data.reviewResponseTime * 2));
    const qualityScore = data.reviewQuality;
    const serviceScore = data.customerServiceScore;
    const trustScore = data.trustSignals;

    return (responseScore + qualityScore + serviceScore + trustScore) / 4;
  }

  private static calculateCERTScore(data: any): number {
    const expertiseScore = data.expertiseContent;
    const authorityScore = data.authoritySignals;
    const contentScore = data.contentQuality;
    const credibilityScore = data.credibilityFactors;

    return (expertiseScore + authorityScore + contentScore + credibilityScore) / 4;
  }

  private static getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  }

  private static generateRecommendations(overallScore: number, breakdown: any): string[] {
    const recommendations: string[] = [];

    if (breakdown.ftfr < 70) {
      recommendations.push('Improve website response time and uptime');
    }
    if (breakdown.vdpd < 70) {
      recommendations.push('Optimize conversion rates and user engagement');
    }
    if (breakdown.proc < 70) {
      recommendations.push('Enhance customer service and review management');
    }
    if (breakdown.cert < 70) {
      recommendations.push('Strengthen content quality and authority signals');
    }

    if (overallScore < 60) {
      recommendations.push('Consider comprehensive AI visibility audit');
    }

    return recommendations;
  }
}