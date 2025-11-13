/**
 * E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness) External Perception Calculator
 * Part of DTRI-MAXIMUS-MASTER-4.0 Engine
 * 
 * Measures external perception and trust signals
 * Owner: CMO
 * Weight: 0.50 in DTRI calculation
 */

export interface EEATComponent {
  trustworthiness: { w: number; inputMetrics: string[]; score?: number; metrics?: Record<string, number> };
  experience: { w: number; inputMetrics: string[]; score?: number; metrics?: Record<string, number> };
  expertise: { w: number; inputMetrics: string[]; score?: number; metrics?: Record<string, number> };
  authoritativeness: { w: number; inputMetrics: string[]; score?: number; metrics?: Record<string, number> };
}

export interface EEATData {
  trustworthiness: {
    score: number;
    metrics: {
      reviewVelocityIndex: number;
      napConsistencyScore: number;
      reviewSentimentScore: number;
      responseRate: number;
      reviewQualityScore: number;
    };
  };
  experience: {
    score: number;
    metrics: {
      vdpSpeedScoreLCP: number;
      reviewServiceSentimentTopic: number;
      customerJourneyOptimization: number;
      userExperienceScore: number;
      mobileExperienceScore: number;
    };
  };
  expertise: {
    score: number;
    metrics: {
      aeoCitationFrequency: number;
      authorBioDensity: number;
      contentDepthScore: number;
      technicalAccuracyScore: number;
      industryKnowledgeScore: number;
    };
  };
  authoritativeness: {
    score: number;
    metrics: {
      trustFlowRatio: number;
      slvLocalRank: number;
      backlinkQualityScore: number;
      domainAuthorityScore: number;
      localCitationScore: number;
    };
  };
}

export interface EEATAnalysis {
  overallScore: number;
  components: EEATComponent;
  financialImpact: {
    trustSignalValue: number;
    authorityLiftValue: number;
    expertiseContentValue: number;
    experienceOptimizationValue: number;
  };
  recommendations: string[];
  trustSignals: {
    type: string;
    status: 'strong' | 'moderate' | 'weak';
    actionRequired: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export class EEATCalculator {
  private static readonly COMPONENT_WEIGHTS = {
    trustworthiness: 0.40,
    experience: 0.25,
    expertise: 0.20,
    authoritativeness: 0.15
  };

  private static readonly TRUST_THRESHOLDS = {
    strong: 0.85,
    moderate: 0.70,
    weak: 0.50
  };

  /**
   * Calculate Trustworthiness Score
   * Weight: 0.40
   * Input Metrics: Review Velocity Index, NAP Consistency Score
   */
  static calculateTrustworthiness(data: EEATData['trustworthiness']): EEATComponent['trustworthiness'] {
    const { metrics } = data;
    
    // Weighted calculation of trustworthiness components
    const trustworthinessScore = (
      metrics.reviewVelocityIndex * 0.25 +
      metrics.napConsistencyScore * 0.25 +
      metrics.reviewSentimentScore * 0.20 +
      metrics.responseRate * 0.15 +
      metrics.reviewQualityScore * 0.15
    );

    // Calculate financial impact (trust signal value)
    const trustSignalValue = trustworthinessScore * 20000; // $20k per point improvement

    const recommendations = [];
    if (metrics.reviewVelocityIndex < 0.7) {
      recommendations.push("Implement systematic review generation and response program");
    }
    if (metrics.napConsistencyScore < 0.9) {
      recommendations.push("Audit and standardize NAP (Name, Address, Phone) across all platforms");
    }
    if (metrics.reviewSentimentScore < 0.8) {
      recommendations.push("Focus on service quality improvements to boost review sentiment");
    }
    if (metrics.responseRate < 0.85) {
      recommendations.push("Establish 24-hour review response protocol");
    }

    return {
      w: this.COMPONENT_WEIGHTS.trustworthiness,
      inputMetrics: ['Review_Velocity_Index', 'NAP_Consistency_Score'],
      score: trustworthinessScore,
      metrics: {
        reviewVelocityIndex: metrics.reviewVelocityIndex,
        napConsistencyScore: metrics.napConsistencyScore,
        reviewSentimentScore: metrics.reviewSentimentScore,
        responseRate: metrics.responseRate,
        reviewQualityScore: metrics.reviewQualityScore
      }
    };
  }

  /**
   * Calculate Experience Score
   * Weight: 0.25
   * Input Metrics: VDP Speed Score LCP, Review Service Sentiment Topic
   */
  static calculateExperience(data: EEATData['experience']): EEATComponent['experience'] {
    const { metrics } = data;
    
    // Normalize LCP score (lower is better)
    const lcpScore = Math.max(0, 100 - (metrics.vdpSpeedScoreLCP * 20)); // 5s = 0, 0s = 100
    
    const experienceScore = (
      lcpScore * 0.25 +
      metrics.reviewServiceSentimentTopic * 0.25 +
      metrics.customerJourneyOptimization * 0.20 +
      metrics.userExperienceScore * 0.15 +
      metrics.mobileExperienceScore * 0.15
    ) / 100;

    // Calculate financial impact (experience optimization value)
    const experienceOptimizationValue = experienceScore * 15000; // $15k per point improvement

    const recommendations = [];
    if (metrics.vdpSpeedScoreLCP > 3.0) {
      recommendations.push("Optimize VDP loading performance - target <2.5s LCP");
    }
    if (metrics.reviewServiceSentimentTopic < 0.75) {
      recommendations.push("Improve service experience based on review sentiment analysis");
    }
    if (metrics.customerJourneyOptimization < 0.8) {
      recommendations.push("Map and optimize customer journey touchpoints");
    }
    if (metrics.mobileExperienceScore < 0.85) {
      recommendations.push("Enhance mobile user experience and responsiveness");
    }

    return {
      w: this.COMPONENT_WEIGHTS.experience,
      inputMetrics: ['VDP_Speed_Score_LCP', 'Review_Service_Sentiment_Topic'],
      score: experienceScore,
      metrics: {
        vdpSpeedScoreLCP: metrics.vdpSpeedScoreLCP,
        reviewServiceSentimentTopic: metrics.reviewServiceSentimentTopic,
        customerJourneyOptimization: metrics.customerJourneyOptimization,
        userExperienceScore: metrics.userExperienceScore,
        mobileExperienceScore: metrics.mobileExperienceScore
      }
    };
  }

  /**
   * Calculate Expertise Score
   * Weight: 0.20
   * Input Metrics: AEO Citation Frequency, Author Bio Density
   */
  static calculateExpertise(data: EEATData['expertise']): EEATComponent['expertise'] {
    const { metrics } = data;
    
    const expertiseScore = (
      metrics.aeoCitationFrequency * 0.25 +
      metrics.authorBioDensity * 0.20 +
      metrics.contentDepthScore * 0.20 +
      metrics.technicalAccuracyScore * 0.20 +
      metrics.industryKnowledgeScore * 0.15
    );

    // Calculate financial impact (expertise content value)
    const expertiseContentValue = expertiseScore * 18000; // $18k per point improvement

    const recommendations = [];
    if (metrics.aeoCitationFrequency < 0.6) {
      recommendations.push("Create authoritative content to increase AI citation frequency");
    }
    if (metrics.authorBioDensity < 0.7) {
      recommendations.push("Add comprehensive author bios and credentials to all content");
    }
    if (metrics.contentDepthScore < 0.8) {
      recommendations.push("Develop in-depth, comprehensive content on automotive topics");
    }
    if (metrics.technicalAccuracyScore < 0.85) {
      recommendations.push("Implement technical accuracy review process for all content");
    }

    return {
      w: this.COMPONENT_WEIGHTS.expertise,
      inputMetrics: ['AEO_Citation_Frequency', 'Author_Bio_Density'],
      score: expertiseScore,
      metrics: {
        aeoCitationFrequency: metrics.aeoCitationFrequency,
        authorBioDensity: metrics.authorBioDensity,
        contentDepthScore: metrics.contentDepthScore,
        technicalAccuracyScore: metrics.technicalAccuracyScore,
        industryKnowledgeScore: metrics.industryKnowledgeScore
      }
    };
  }

  /**
   * Calculate Authoritativeness Score
   * Weight: 0.15
   * Input Metrics: Trust Flow Ratio, SLV Local Rank
   */
  static calculateAuthoritativeness(data: EEATData['authoritativeness']): EEATComponent['authoritativeness'] {
    const { metrics } = data;
    
    // Normalize local rank (lower is better)
    const localRankScore = Math.max(0, 100 - (metrics.slvLocalRank * 2)); // Rank 50 = 0, Rank 1 = 98
    
    const authoritativenessScore = (
      metrics.trustFlowRatio * 0.30 +
      localRankScore * 0.25 +
      metrics.backlinkQualityScore * 0.20 +
      metrics.domainAuthorityScore * 0.15 +
      metrics.localCitationScore * 0.10
    ) / 100;

    // Calculate financial impact (authority lift value)
    const authorityLiftValue = authoritativenessScore * 22000; // $22k per point improvement

    const recommendations = [];
    if (metrics.trustFlowRatio < 0.6) {
      recommendations.push("Build high-quality backlinks from authoritative automotive sites");
    }
    if (metrics.slvLocalRank > 10) {
      recommendations.push("Improve local SEO and Google My Business optimization");
    }
    if (metrics.backlinkQualityScore < 0.7) {
      recommendations.push("Focus on earning links from industry publications and directories");
    }
    if (metrics.domainAuthorityScore < 0.6) {
      recommendations.push("Develop comprehensive content strategy to build domain authority");
    }

    return {
      w: this.COMPONENT_WEIGHTS.authoritativeness,
      inputMetrics: ['Trust_Flow_Ratio', 'SLV_Local_Rank'],
      score: authoritativenessScore,
      metrics: {
        trustFlowRatio: metrics.trustFlowRatio,
        slvLocalRank: metrics.slvLocalRank,
        backlinkQualityScore: metrics.backlinkQualityScore,
        domainAuthorityScore: metrics.domainAuthorityScore,
        localCitationScore: metrics.localCitationScore
      }
    };
  }

  /**
   * Calculate overall E-E-A-T score and analysis
   */
  static calculateEEATComplete(data: EEATData): EEATAnalysis {
    // Calculate individual components
    const trustworthiness = this.calculateTrustworthiness(data.trustworthiness);
    const experience = this.calculateExperience(data.experience);
    const expertise = this.calculateExpertise(data.expertise);
    const authoritativeness = this.calculateAuthoritativeness(data.authoritativeness);

    const components: EEATComponent = {
      trustworthiness,
      experience,
      expertise,
      authoritativeness
    };

    // Calculate weighted overall score
    const overallScore = (
      trustworthiness.score! * trustworthiness.w +
      experience.score! * experience.w +
      expertise.score! * expertise.w +
      authoritativeness.score! * authoritativeness.w
    );

    // Calculate financial impact
    const financialImpact = {
      trustSignalValue: trustworthiness.score! * 20000,
      authorityLiftValue: authoritativeness.score! * 22000,
      expertiseContentValue: expertise.score! * 18000,
      experienceOptimizationValue: experience.score! * 15000
    };

    // Generate recommendations
    const recommendations = [
      ...this.generateTrustworthinessRecommendations(trustworthiness),
      ...this.generateExperienceRecommendations(experience),
      ...this.generateExpertiseRecommendations(expertise),
      ...this.generateAuthoritativenessRecommendations(authoritativeness)
    ];

    // Analyze trust signals
    const trustSignals = this.analyzeTrustSignals(components);

    return {
      overallScore,
      components,
      financialImpact,
      recommendations,
      trustSignals
    };
  }

  /**
   * Generate trustworthiness-specific recommendations
   */
  private static generateTrustworthinessRecommendations(trustworthiness: EEATComponent['trustworthiness']): string[] {
    const recommendations: string[] = [];
    const metrics = trustworthiness.metrics!;

    if (metrics.reviewVelocityIndex < 0.7) {
      recommendations.push("Implement systematic review generation program with follow-up automation");
    }
    if (metrics.napConsistencyScore < 0.9) {
      recommendations.push("Conduct comprehensive NAP audit and implement consistency monitoring");
    }
    if (metrics.reviewSentimentScore < 0.8) {
      recommendations.push("Develop service quality improvement plan based on review sentiment analysis");
    }

    return recommendations;
  }

  /**
   * Generate experience-specific recommendations
   */
  private static generateExperienceRecommendations(experience: EEATComponent['experience']): string[] {
    const recommendations: string[] = [];
    const metrics = experience.metrics!;

    if (metrics.vdpSpeedScoreLCP > 3.0) {
      recommendations.push("Optimize VDP performance with image compression and lazy loading");
    }
    if (metrics.customerJourneyOptimization < 0.8) {
      recommendations.push("Map customer journey and identify optimization opportunities");
    }
    if (metrics.mobileExperienceScore < 0.85) {
      recommendations.push("Implement mobile-first design improvements");
    }

    return recommendations;
  }

  /**
   * Generate expertise-specific recommendations
   */
  private static generateExpertiseRecommendations(expertise: EEATComponent['expertise']): string[] {
    const recommendations: string[] = [];
    const metrics = expertise.metrics!;

    if (metrics.aeoCitationFrequency < 0.6) {
      recommendations.push("Create authoritative content optimized for AI search engines");
    }
    if (metrics.authorBioDensity < 0.7) {
      recommendations.push("Add comprehensive author credentials and expertise indicators");
    }
    if (metrics.contentDepthScore < 0.8) {
      recommendations.push("Develop comprehensive, in-depth content on automotive topics");
    }

    return recommendations;
  }

  /**
   * Generate authoritativeness-specific recommendations
   */
  private static generateAuthoritativenessRecommendations(authoritativeness: EEATComponent['authoritativeness']): string[] {
    const recommendations: string[] = [];
    const metrics = authoritativeness.metrics!;

    if (metrics.trustFlowRatio < 0.6) {
      recommendations.push("Build high-quality backlinks from authoritative automotive industry sites");
    }
    if (metrics.slvLocalRank > 10) {
      recommendations.push("Improve local SEO and Google My Business optimization");
    }
    if (metrics.domainAuthorityScore < 0.6) {
      recommendations.push("Develop comprehensive content strategy to build domain authority");
    }

    return recommendations;
  }

  /**
   * Analyze trust signals for status and actions
   */
  private static analyzeTrustSignals(components: EEATComponent): EEATAnalysis['trustSignals'] {
    const trustSignals: EEATAnalysis['trustSignals'] = [];

    // Trustworthiness signals
    const trustScore = components.trustworthiness.score!;
    trustSignals.push({
      type: 'Review Trust Signals',
      status: trustScore >= this.TRUST_THRESHOLDS.strong ? 'strong' : 
              trustScore >= this.TRUST_THRESHOLDS.moderate ? 'moderate' : 'weak',
      actionRequired: trustScore < this.TRUST_THRESHOLDS.moderate ? 
        'Implement comprehensive review management system' : 'Maintain current review strategy',
      priority: trustScore < this.TRUST_THRESHOLDS.moderate ? 'high' : 'low'
    });

    // Experience signals
    const expScore = components.experience.score!;
    trustSignals.push({
      type: 'User Experience Signals',
      status: expScore >= this.TRUST_THRESHOLDS.strong ? 'strong' : 
              expScore >= this.TRUST_THRESHOLDS.moderate ? 'moderate' : 'weak',
      actionRequired: expScore < this.TRUST_THRESHOLDS.moderate ? 
        'Optimize user experience and page performance' : 'Continue UX monitoring',
      priority: expScore < this.TRUST_THRESHOLDS.moderate ? 'high' : 'medium'
    });

    // Expertise signals
    const expScore2 = components.expertise.score!;
    trustSignals.push({
      type: 'Content Authority Signals',
      status: expScore2 >= this.TRUST_THRESHOLDS.strong ? 'strong' : 
              expScore2 >= this.TRUST_THRESHOLDS.moderate ? 'moderate' : 'weak',
      actionRequired: expScore2 < this.TRUST_THRESHOLDS.moderate ? 
        'Develop authoritative, expert content' : 'Maintain content quality standards',
      priority: expScore2 < this.TRUST_THRESHOLDS.moderate ? 'high' : 'medium'
    });

    // Authoritativeness signals
    const authScore = components.authoritativeness.score!;
    trustSignals.push({
      type: 'Domain Authority Signals',
      status: authScore >= this.TRUST_THRESHOLDS.strong ? 'strong' : 
              authScore >= this.TRUST_THRESHOLDS.moderate ? 'moderate' : 'weak',
      actionRequired: authScore < this.TRUST_THRESHOLDS.moderate ? 
        'Build domain authority through quality backlinks' : 'Monitor authority metrics',
      priority: authScore < this.TRUST_THRESHOLDS.moderate ? 'medium' : 'low'
    });

    return trustSignals;
  }

  /**
   * Generate sample E-E-A-T data for testing
   */
  static generateSampleData(): EEATData {
    return {
      trustworthiness: {
        score: 0.82,
        metrics: {
          reviewVelocityIndex: 0.75,
          napConsistencyScore: 0.92,
          reviewSentimentScore: 0.85,
          responseRate: 0.88,
          reviewQualityScore: 0.80
        }
      },
      experience: {
        score: 0.78,
        metrics: {
          vdpSpeedScoreLCP: 2.8,
          reviewServiceSentimentTopic: 0.82,
          customerJourneyOptimization: 0.75,
          userExperienceScore: 0.80,
          mobileExperienceScore: 0.85
        }
      },
      expertise: {
        score: 0.75,
        metrics: {
          aeoCitationFrequency: 0.68,
          authorBioDensity: 0.72,
          contentDepthScore: 0.78,
          technicalAccuracyScore: 0.82,
          industryKnowledgeScore: 0.80
        }
      },
      authoritativeness: {
        score: 0.70,
        metrics: {
          trustFlowRatio: 0.65,
          slvLocalRank: 8,
          backlinkQualityScore: 0.68,
          domainAuthorityScore: 0.62,
          localCitationScore: 0.75
        }
      }
    };
  }
}

export default EEATCalculator;
