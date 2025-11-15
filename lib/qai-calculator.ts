/**
 * QAI (Quality Assurance Index) Internal Execution Calculator
 * Part of DTRI-MAXIMUS-MASTER-4.0 Engine
 * 
 * Measures internal operational excellence and execution quality
 * Owner: GM/COO
 * Weight: 0.50 in DTRI calculation
 */

export interface QAIComponent {
  id: string;
  weight: number;
  lagMeasureId: string;
  financialLink: string;
  score?: number;
  metrics?: Record<string, number>;
  recommendations?: string[];
}

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
      vdpLoadTime: number;
      vdpBounceRate: number;
      vdpConversionRate: number;
      mobileOptimization: number;
    };
  };
  proc: {
    score: number;
    metrics: {
      leadResponseTime: number;
      followUpConsistency: number;
      processEfficiency: number;
      customerSatisfaction: number;
    };
  };
  cert: {
    score: number;
    metrics: {
      technicianCertification: number;
      trainingCurrency: number;
      expertiseDemonstration: number;
      knowledgeRetention: number;
    };
  };
}

export interface QAIAnalysis {
  overallScore: number;
  components: QAIComponent[];
  financialImpact: {
    serviceCostReduction: number;
    salesConversionLift: number;
    trustDecayMitigation: number;
    expertiseContentAuthentication: number;
  };
  recommendations: string[];
  lagMeasures: {
    id: string;
    status: 'compliant' | 'warning' | 'critical';
    actionRequired: string;
    owner: string;
  }[];
}

export class QAICalculator {
  private static readonly COMPONENT_WEIGHTS = {
    'QAI-FTFR': 0.35, // First Time Fix Rate
    'QAI-VDPD': 0.30, // VDP Dominance
    'QAI-PROC': 0.20, // Process Excellence
    'QAI-CERT': 0.15  // Certification Compliance
  };

  private static readonly LAG_MEASURE_THRESHOLDS = {
    'LAG-CERT-COMPLIANCE': { warning: 0.90, critical: 0.80 },
    'LAG-VDP-DOMSIZE': { warning: 2.5, critical: 3.0 },
    'LAG-LEAD-RESP-TIME': { warning: 3, critical: 4 },
    'LAG-TRAINING-EXPIRY': { warning: 15, critical: 30 }
  };

  /**
   * Calculate QAI-FTFR (First Time Fix Rate) Score
   * Financial Link: Service Cost Reduction
   */
  static calculateFTFR(data: QAIData['ftfr']): QAIComponent {
    const { metrics } = data;
    
    // Weighted calculation of FTFR components
    const ftfrScore = (
      metrics.certificationCompliance * 0.30 +
      metrics.trainingCompletion * 0.25 +
      metrics.processAdherence * 0.25 +
      metrics.qualityAuditScore * 0.20
    );

    // Calculate financial impact (service cost reduction)
    const serviceCostReduction = ftfrScore * 15000; // $15k per point improvement

    const recommendations = [];
    if (metrics.certificationCompliance < 0.9) {
      recommendations.push("Implement mandatory certification tracking system");
    }
    if (metrics.trainingCompletion < 0.85) {
      recommendations.push("Schedule comprehensive training program for all technicians");
    }
    if (metrics.processAdherence < 0.8) {
      recommendations.push("Establish process compliance monitoring and feedback loops");
    }

    return {
      id: 'QAI-FTFR',
      weight: this.COMPONENT_WEIGHTS['QAI-FTFR'],
      lagMeasureId: 'LAG-CERT-COMPLIANCE',
      financialLink: 'Service_Cost_Reduction',
      score: ftfrScore,
      metrics: {
        certificationCompliance: metrics.certificationCompliance,
        trainingCompletion: metrics.trainingCompletion,
        processAdherence: metrics.processAdherence,
        qualityAuditScore: metrics.qualityAuditScore
      },
      recommendations
    };
  }

  /**
   * Calculate QAI-VDPD (VDP Dominance) Score
   * Financial Link: Sales Conversion CR Lift
   */
  static calculateVDPD(data: QAIData['vdpd']): QAIComponent {
    const { metrics } = data;
    
    // Normalize VDP metrics (lower is better for load time, bounce rate)
    const loadTimeScore = Math.max(0, 100 - (metrics.vdpLoadTime * 20)); // 5s = 0, 0s = 100
    const bounceRateScore = Math.max(0, 100 - (metrics.vdpBounceRate * 100)); // 1.0 = 0, 0.0 = 100
    
    const vdpdScore = (
      loadTimeScore * 0.30 +
      bounceRateScore * 0.25 +
      metrics.vdpConversionRate * 0.25 +
      metrics.mobileOptimization * 0.20
    ) / 100;

    // Calculate financial impact (sales conversion lift)
    const salesConversionLift = vdpdScore * 25000; // $25k per point improvement

    const recommendations = [];
    if (metrics.vdpLoadTime > 3.0) {
      recommendations.push("Optimize VDP load time - compress images and defer JavaScript");
    }
    if (metrics.vdpBounceRate > 0.4) {
      recommendations.push("Improve VDP content quality and user experience");
    }
    if (metrics.vdpConversionRate < 0.15) {
      recommendations.push("Enhance VDP conversion elements and call-to-actions");
    }
    if (metrics.mobileOptimization < 0.8) {
      recommendations.push("Implement mobile-first VDP optimization");
    }

    return {
      id: 'QAI-VDPD',
      weight: this.COMPONENT_WEIGHTS['QAI-VDPD'],
      lagMeasureId: 'LAG-VDP-DOMSIZE',
      financialLink: 'Sales_Conversion_CR_Lift',
      score: vdpdScore,
      metrics: {
        vdpLoadTime: metrics.vdpLoadTime,
        vdpBounceRate: metrics.vdpBounceRate,
        vdpConversionRate: metrics.vdpConversionRate,
        mobileOptimization: metrics.mobileOptimization
      },
      recommendations
    };
  }

  /**
   * Calculate QAI-PROC (Process Excellence) Score
   * Financial Link: Trust Decay Mitigation
   */
  static calculatePROC(data: QAIData['proc']): QAIComponent {
    const { metrics } = data;
    
    // Normalize response time (lower is better)
    const responseTimeScore = Math.max(0, 100 - (metrics.leadResponseTime * 20)); // 5min = 0, 0min = 100
    
    const procScore = (
      responseTimeScore * 0.30 +
      metrics.followUpConsistency * 0.25 +
      metrics.processEfficiency * 0.25 +
      metrics.customerSatisfaction * 0.20
    ) / 100;

    // Calculate financial impact (trust decay mitigation)
    const trustDecayMitigation = procScore * 18000; // $18k per point improvement

    const recommendations = [];
    if (metrics.leadResponseTime > 4) {
      recommendations.push("Implement automated lead response system with 2-minute SLA");
    }
    if (metrics.followUpConsistency < 0.8) {
      recommendations.push("Establish systematic follow-up process with CRM automation");
    }
    if (metrics.processEfficiency < 0.75) {
      recommendations.push("Streamline sales processes and eliminate bottlenecks");
    }
    if (metrics.customerSatisfaction < 0.85) {
      recommendations.push("Implement customer feedback loops and satisfaction monitoring");
    }

    return {
      id: 'QAI-PROC',
      weight: this.COMPONENT_WEIGHTS['QAI-PROC'],
      lagMeasureId: 'LAG-LEAD-RESP-TIME',
      financialLink: 'Trust_Decay_Mitigation',
      score: procScore,
      metrics: {
        leadResponseTime: metrics.leadResponseTime,
        followUpConsistency: metrics.followUpConsistency,
        processEfficiency: metrics.processEfficiency,
        customerSatisfaction: metrics.customerSatisfaction
      },
      recommendations
    };
  }

  /**
   * Calculate QAI-CERT (Certification Compliance) Score
   * Financial Link: Expertise Content Authentication
   */
  static calculateCERT(data: QAIData['cert']): QAIComponent {
    const { metrics } = data;
    
    const certScore = (
      metrics.technicianCertification * 0.30 +
      metrics.trainingCurrency * 0.25 +
      metrics.expertiseDemonstration * 0.25 +
      metrics.knowledgeRetention * 0.20
    );

    // Calculate financial impact (expertise content authentication)
    const expertiseContentAuthentication = certScore * 12000; // $12k per point improvement

    const recommendations = [];
    if (metrics.technicianCertification < 0.9) {
      recommendations.push("Ensure all technicians maintain current certifications");
    }
    if (metrics.trainingCurrency < 0.8) {
      recommendations.push("Implement regular training updates and recertification");
    }
    if (metrics.expertiseDemonstration < 0.75) {
      recommendations.push("Create systems for technicians to demonstrate expertise");
    }
    if (metrics.knowledgeRetention < 0.8) {
      recommendations.push("Implement knowledge retention testing and reinforcement");
    }

    return {
      id: 'QAI-CERT',
      weight: this.COMPONENT_WEIGHTS['QAI-CERT'],
      lagMeasureId: 'LAG-TRAINING-EXPIRY',
      financialLink: 'Expertise_Content_Authentication',
      score: certScore,
      metrics: {
        technicianCertification: metrics.technicianCertification,
        trainingCurrency: metrics.trainingCurrency,
        expertiseDemonstration: metrics.expertiseDemonstration,
        knowledgeRetention: metrics.knowledgeRetention
      },
      recommendations
    };
  }

  /**
   * Calculate overall QAI score and analysis
   */
  static calculateQAIComplete(data: QAIData): QAIAnalysis {
    // Calculate individual components
    const ftfr = this.calculateFTFR(data.ftfr);
    const vdpd = this.calculateVDPD(data.vdpd);
    const proc = this.calculatePROC(data.proc);
    const cert = this.calculateCERT(data.cert);

    const components = [ftfr, vdpd, proc, cert];

    // Calculate weighted overall score
    const overallScore = components.reduce((sum, comp) => {
      return sum + (comp.score || 0) * comp.weight;
    }, 0);

    // Calculate financial impact
    const financialImpact = {
      serviceCostReduction: ftfr.score! * 15000,
      salesConversionLift: vdpd.score! * 25000,
      trustDecayMitigation: proc.score! * 18000,
      expertiseContentAuthentication: cert.score! * 12000
    };

    // Generate recommendations
    const recommendations = [
      ...ftfr.recommendations || [],
      ...vdpd.recommendations || [],
      ...proc.recommendations || [],
      ...cert.recommendations || []
    ];

    // Check lag measures
    const lagMeasures = this.checkLagMeasures(components);

    return {
      overallScore,
      components,
      financialImpact,
      recommendations,
      lagMeasures
    };
  }

  /**
   * Check lag measures for compliance
   */
  private static checkLagMeasures(components: QAIComponent[]): QAIAnalysis['lagMeasures'] {
    const lagMeasures: QAIAnalysis['lagMeasures'] = [];

    components.forEach(comp => {
      const thresholds = this.LAG_MEASURE_((THRESHOLDS as any)[comp.lagMeasureId];
      if (!thresholds) return;

      let status: 'compliant' | 'warning' | 'critical' = 'compliant';
      let actionRequired = '';

      if (comp.id === 'QAI-FTFR') {
        const score = comp.score || 0;
        if (score < thresholds.critical) {
          status = 'critical';
          actionRequired = 'Restrict complex ROs immediately';
        } else if (score < thresholds.warning) {
          status = 'warning';
          actionRequired = 'Schedule additional training';
        }
      } else if (comp.id === 'QAI-VDPD') {
        const loadTime = comp.metrics?.vdpLoadTime || 0;
        if (loadTime > thresholds.critical) {
          status = 'critical';
          actionRequired = 'Force-compress image assets and defer JS';
        } else if (loadTime > thresholds.warning) {
          status = 'warning';
          actionRequired = 'Optimize VDP performance';
        }
      } else if (comp.id === 'QAI-PROC') {
        const responseTime = comp.metrics?.leadResponseTime || 0;
        if (responseTime > thresholds.critical) {
          status = 'critical';
          actionRequired = 'Implement automated lead response system';
        } else if (responseTime > thresholds.warning) {
          status = 'warning';
          actionRequired = 'Improve lead response processes';
        }
      } else if (comp.id === 'QAI-CERT') {
        const trainingCurrency = comp.metrics?.trainingCurrency || 0;
        const daysSinceTraining = (1 - trainingCurrency) * 365; // Convert to days
        if (daysSinceTraining > thresholds.critical) {
          status = 'critical';
          actionRequired = 'Schedule mandatory recertification training';
        } else if (daysSinceTraining > thresholds.warning) {
          status = 'warning';
          actionRequired = 'Plan upcoming training updates';
        }
      }

      lagMeasures.push({
        id: comp.lagMeasureId,
        status,
        actionRequired,
        owner: this.getActionOwner(comp.lagMeasureId)
      });
    });

    return lagMeasures;
  }

  /**
   * Get action owner for lag measure
   */
  private static getActionOwner(lagMeasureId: string): string {
    const owners: Record<string, string> = {
      'LAG-CERT-COMPLIANCE': 'Service_Director',
      'LAG-VDP-DOMSIZE': 'CTO/CMO',
      'LAG-LEAD-RESP-TIME': 'Sales_Manager',
      'LAG-TRAINING-EXPIRY': 'HR_Director'
    };
    return owners[lagMeasureId] || 'Unknown';
  }

  /**
   * Generate sample QAI data for testing
   */
  static generateSampleData(): QAIData {
    return {
      ftfr: {
        score: 0.85,
        metrics: {
          certificationCompliance: 0.92,
          trainingCompletion: 0.88,
          processAdherence: 0.82,
          qualityAuditScore: 0.78
        }
      },
      vdpd: {
        score: 0.78,
        metrics: {
          vdpLoadTime: 2.8,
          vdpBounceRate: 0.35,
          vdpConversionRate: 0.18,
          mobileOptimization: 0.85
        }
      },
      proc: {
        score: 0.82,
        metrics: {
          leadResponseTime: 3.2,
          followUpConsistency: 0.85,
          processEfficiency: 0.78,
          customerSatisfaction: 0.88
        }
      },
      cert: {
        score: 0.88,
        metrics: {
          technicianCertification: 0.92,
          trainingCurrency: 0.85,
          expertiseDemonstration: 0.82,
          knowledgeRetention: 0.90
        }
      }
    };
  }
}

export default QAICalculator;
