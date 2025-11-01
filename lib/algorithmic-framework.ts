// Complete Algorithmic Framework with all 5 pillars
export interface AlgorithmicPillars {
  seo: number;        // Search Engine Optimization (0-100)
  aeo: number;        // AI Engine Optimization (0-100)
  geo: number;        // Geographic Optimization (0-100)
  ugc: number;        // User-Generated Content (0-100)
  geoLocal: number;   // Geo-Local Optimization (0-100)
}

export interface AlgorithmicMetrics {
  aiv: number;        // Algorithmic Visibility Index (0-100)
  ati: number;        // Algorithmic Trust Index (0-100)
  crs: number;        // Content Reliability Score (0-100)
  iti: number;        // Inventory Truth Index (0-100)
  cis: number;        // Clarity Intelligence Score (0-1)
}

export interface AlgorithmicFramework {
  pillars: AlgorithmicPillars;
  metrics: AlgorithmicMetrics;
  modifiers: {
    temporalWeight: number;
    entityConfidence: number;
    crawlBudgetMult: number;
    inventoryTruthMult: number;
  };
  confidence: number;
  lastUpdated: Date;
}

export class AlgorithmicFrameworkEngine {
  private weights = {
    seo: 0.25,
    aeo: 0.30,
    geo: 0.20,
    ugc: 0.15,
    geoLocal: 0.10
  };

  // Calculate complete algorithmic framework
  async calculateFramework(pillarData: any, modifierData: any): Promise<AlgorithmicFramework> {
    // Calculate individual pillars
    const pillars = this.calculatePillars(pillarData);
    
    // Calculate composite metrics (now async due to RaR integration)
    const metrics = await this.calculateMetrics(pillars, pillarData);
    
    // Apply modifiers
    const modifiers = this.calculateModifiers(modifierData);
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(pillars, metrics);
    
    return {
      pillars,
      metrics,
      modifiers,
      confidence,
      lastUpdated: new Date()
    };
  }

  // Calculate individual pillars
  private calculatePillars(data: any): AlgorithmicPillars {
    return {
      seo: this.calculateSEOPillar(data.seo),
      aeo: this.calculateAEOPillar(data.aeo),
      geo: this.calculateGEOPillar(data.geo),
      ugc: this.calculateUGCPillar(data.ugc),
      geoLocal: this.calculateGeoLocalPillar(data.geoLocal)
    };
  }

  // SEO Pillar calculation
  private calculateSEOPillar(data: any): number {
    let score = 0;
    
    // Technical SEO (40%)
    if (data.technicalSeo) {
      score += (data.technicalSeo.pageSpeed || 0) * 0.15;
      score += (data.technicalSeo.mobileOptimization || 0) * 0.10;
      score += (data.technicalSeo.schemaMarkup || 0) * 0.15;
    }
    
    // Content SEO (35%)
    if (data.contentSeo) {
      score += (data.contentSeo.keywordOptimization || 0) * 0.20;
      score += (data.contentSeo.contentQuality || 0) * 0.15;
    }
    
    // Link Building (25%)
    if (data.linkBuilding) {
      score += (data.linkBuilding.domainAuthority || 0) * 0.15;
      score += (data.linkBuilding.backlinkQuality || 0) * 0.10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // AEO Pillar calculation
  private calculateAEOPillar(data: any): number {
    let score = 0;
    
    // AI Model Presence (50%)
    if (data.aiPresence) {
      score += (data.aiPresence.chatgptMentions || 0) * 0.20;
      score += (data.aiPresence.claudeMentions || 0) * 0.15;
      score += (data.aiPresence.perplexityMentions || 0) * 0.15;
    }
    
    // Answer Optimization (30%)
    if (data.answerOptimization) {
      score += (data.answerOptimization.featuredSnippets || 0) * 0.15;
      score += (data.answerOptimization.voiceSearchOptimization || 0) * 0.15;
    }
    
    // Entity Recognition (20%)
    if (data.entityRecognition) {
      score += (data.entityRecognition.knowledgeGraphPresence || 0) * 0.10;
      score += (data.entityRecognition.entityClarity || 0) * 0.10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // GEO Pillar calculation
  private calculateGEOPillar(data: any): number {
    let score = 0;
    
    // Local SEO (40%)
    if (data.localSeo) {
      score += (data.localSeo.googleMyBusiness || 0) * 0.20;
      score += (data.localSeo.localCitations || 0) * 0.20;
    }
    
    // Geographic Targeting (35%)
    if (data.geographicTargeting) {
      score += (data.geographicTargeting.locationAccuracy || 0) * 0.20;
      score += (data.geographicTargeting.serviceAreaDefinition || 0) * 0.15;
    }
    
    // Local Content (25%)
    if (data.localContent) {
      score += (data.localContent.localKeywords || 0) * 0.15;
      score += (data.localContent.communityEngagement || 0) * 0.10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // UGC Pillar calculation
  private calculateUGCPillar(data: any): number {
    let score = 0;
    
    // Review Management (50%)
    if (data.reviewManagement) {
      score += (data.reviewManagement.reviewVolume || 0) * 0.20;
      score += (data.reviewManagement.reviewQuality || 0) * 0.15;
      score += (data.reviewManagement.responseRate || 0) * 0.15;
    }
    
    // User Engagement (30%)
    if (data.userEngagement) {
      score += (data.userEngagement.socialMediaPresence || 0) * 0.15;
      score += (data.userEngagement.communityParticipation || 0) * 0.15;
    }
    
    // Content Authenticity (20%)
    if (data.contentAuthenticity) {
      score += (data.contentAuthenticity.authenticReviews || 0) * 0.10;
      score += (data.contentAuthenticity.userGeneratedContent || 0) * 0.10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Geo-Local Pillar calculation
  private calculateGeoLocalPillar(data: any): number {
    let score = 0;
    
    // Hyperlocal Optimization (50%)
    if (data.hyperlocalOptimization) {
      score += (data.hyperlocalOptimization.neighborhoodTargeting || 0) * 0.25;
      score += (data.hyperlocalOptimization.localEventsParticipation || 0) * 0.25;
    }
    
    // Local Authority (30%)
    if (data.localAuthority) {
      score += (data.localAuthority.localMediaMentions || 0) * 0.15;
      score += (data.localAuthority.communityLeadership || 0) * 0.15;
    }
    
    // Location-Based Features (20%)
    if (data.locationBasedFeatures) {
      score += (data.locationBasedFeatures.storeLocator || 0) * 0.10;
      score += (data.locationBasedFeatures.localInventoryDisplay || 0) * 0.10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate composite metrics
  private async calculateMetrics(pillars: AlgorithmicPillars, data: any): Promise<AlgorithmicMetrics> {
    // AIV - Algorithmic Visibility Index (base calculation)
    const baseAIV = (
      pillars.seo * this.weights.seo +
      pillars.aeo * this.weights.aeo +
      pillars.geo * this.weights.geo +
      pillars.ugc * this.weights.ugc +
      pillars.geoLocal * this.weights.geoLocal
    );

    // ATI - Algorithmic Trust Index (base calculation)
    const baseATI = this.calculateATI(data);

    // CRS - Content Reliability Score
    const crs = this.calculateCRS(data);

    // ITI - Inventory Truth Index
    const iti = this.calculateITI(data);

    // CIS - Clarity Intelligence Score
    const cis = this.calculateCIS(data);

    // Apply RaR pressure adjustments if dealerId is available
    let aiv = baseAIV;
    let ati = baseATI;
    
    if (data.dealerId) {
      try {
        const { getRaRPressure, applyRaRToAIV, applyRaRToATI } = await import('@/lib/scoring/rar-integration');
        const rarData = await getRaRPressure(data.dealerId);
        
        // Apply RaR pressure to AIV and ATI
        aiv = applyRaRToAIV(baseAIV, rarData.pressure);
        ati = applyRaRToATI(baseATI, rarData.pressure);
      } catch (error) {
        // If RaR integration fails, use base scores
        console.warn('RaR integration error, using base scores:', error);
      }
    }

    return {
      aiv: Math.round(aiv * 100) / 100,
      ati: Math.round(ati * 100) / 100,
      crs: Math.round(crs * 100) / 100,
      iti: Math.round(iti * 100) / 100,
      cis: Math.round(cis * 1000) / 1000
    };
  }

  // Calculate ATI based on trust signals
  private calculateATI(data: any): number {
    let score = 0;
    
    // Review Authenticity (30%)
    if (data.reviewAuthenticity) {
      score += (data.reviewAuthenticity.authenticReviewRate || 0) * 0.30;
    }
    
    // Entity Accuracy (25%)
    if (data.entityAccuracy) {
      score += (data.entityAccuracy.businessInfoAccuracy || 0) * 0.15;
      score += (data.entityAccuracy.contactInfoAccuracy || 0) * 0.10;
    }
    
    // Content Authority (25%)
    if (data.contentAuthority) {
      score += (data.contentAuthority.expertContent || 0) * 0.15;
      score += (data.contentAuthority.citationQuality || 0) * 0.10;
    }
    
    // Transparency (20%)
    if (data.transparency) {
      score += (data.transparency.pricingTransparency || 0) * 0.10;
      score += (data.transparency.policyClarity || 0) * 0.10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate CRS based on content reliability
  private calculateCRS(data: any): number {
    let score = 0;
    
    // Content Freshness (30%)
    if (data.contentFreshness) {
      score += (data.contentFreshness.updateFrequency || 0) * 0.30;
    }
    
    // Content Accuracy (30%)
    if (data.contentAccuracy) {
      score += (data.contentAccuracy.factualAccuracy || 0) * 0.20;
      score += (data.contentAccuracy.informationCompleteness || 0) * 0.10;
    }
    
    // Content Consistency (25%)
    if (data.contentConsistency) {
      score += (data.contentConsistency.brandConsistency || 0) * 0.15;
      score += (data.contentConsistency.messagingConsistency || 0) * 0.10;
    }
    
    // Content Quality (15%)
    if (data.contentQuality) {
      score += (data.contentQuality.writingQuality || 0) * 0.15;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate ITI based on inventory truth
  private calculateITI(data: any): number {
    let score = 0;
    
    // Listing Accuracy (25%)
    if (data.listingAccuracy) {
      score += (data.listingAccuracy.vehicleInfoAccuracy || 0) * 0.25;
    }
    
    // Photo Quality (20%)
    if (data.photoQuality) {
      score += (data.photoQuality.imageResolution || 0) * 0.10;
      score += (data.photoQuality.imageCompleteness || 0) * 0.10;
    }
    
    // Description Completeness (20%)
    if (data.descriptionCompleteness) {
      score += (data.descriptionCompleteness.detailLevel || 0) * 0.20;
    }
    
    // Price Consistency (20%)
    if (data.priceConsistency) {
      score += (data.priceConsistency.priceAccuracy || 0) * 0.20;
    }
    
    // Availability Accuracy (15%)
    if (data.availabilityAccuracy) {
      score += (data.availabilityAccuracy.stockAccuracy || 0) * 0.15;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate CIS based on clarity intelligence
  private calculateCIS(data: any): number {
    let score = 0;
    
    // Search Clarity (30%)
    if (data.searchClarity) {
      score += (data.searchClarity.metaOptimization || 0) * 0.15;
      score += (data.searchClarity.titleClarity || 0) * 0.15;
    }
    
    // Silo Integrity (25%)
    if (data.siloIntegrity) {
      score += (data.siloIntegrity.contentOrganization || 0) * 0.25;
    }
    
    // Authority Depth (25%)
    if (data.authorityDepth) {
      score += (data.authorityDepth.expertiseDemonstration || 0) * 0.15;
      score += (data.authorityDepth.citationDepth || 0) * 0.10;
    }
    
    // Schema Coverage (20%)
    if (data.schemaCoverage) {
      score += (data.schemaCoverage.markupCompleteness || 0) * 0.20;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  // Calculate modifiers
  private calculateModifiers(data: any): any {
    return {
      temporalWeight: data.temporalWeight || 1.0,
      entityConfidence: data.entityConfidence || 0.8,
      crawlBudgetMult: data.crawlBudgetMult || 1.0,
      inventoryTruthMult: data.inventoryTruthMult || 1.0
    };
  }

  // Calculate overall confidence
  private calculateConfidence(pillars: AlgorithmicPillars, metrics: AlgorithmicMetrics): number {
    // Calculate variance in pillar scores
    const pillarValues = Object.values(pillars);
    const pillarMean = pillarValues.reduce((a, b) => a + b, 0) / pillarValues.length;
    const pillarVariance = pillarValues.reduce((sum, val) => sum + Math.pow(val - pillarMean, 2), 0) / pillarValues.length;
    const pillarStdDev = Math.sqrt(pillarVariance);
    
    // Calculate consistency score (lower std dev = higher confidence)
    const consistency = Math.max(0, 1 - (pillarStdDev / 50));
    
    // Calculate strength score (higher overall scores = higher confidence)
    const strength = (metrics.aiv + metrics.ati + metrics.crs + metrics.iti) / 400;
    
    // Combine consistency and strength
    return Math.round((consistency * 0.6 + strength * 0.4) * 1000) / 1000;
  }

  // Get framework recommendations
  getRecommendations(framework: AlgorithmicFramework): string[] {
    const recommendations: string[] = [];
    
    // Pillar-based recommendations
    if (framework.pillars.seo < 70) {
      recommendations.push("Improve SEO pillar - focus on technical optimization and content quality");
    }
    
    if (framework.pillars.aeo < 70) {
      recommendations.push("Enhance AEO pillar - optimize for AI model presence and answer optimization");
    }
    
    if (framework.pillars.geo < 70) {
      recommendations.push("Strengthen GEO pillar - improve local SEO and geographic targeting");
    }
    
    if (framework.pillars.ugc < 70) {
      recommendations.push("Boost UGC pillar - increase review management and user engagement");
    }
    
    if (framework.pillars.geoLocal < 70) {
      recommendations.push("Develop Geo-Local pillar - enhance hyperlocal optimization and local authority");
    }
    
    // Metric-based recommendations
    if (framework.metrics.ati < 70) {
      recommendations.push("Build trust signals - improve review authenticity and entity accuracy");
    }
    
    if (framework.metrics.crs < 70) {
      recommendations.push("Enhance content reliability - focus on freshness and accuracy");
    }
    
    if (framework.metrics.iti < 70) {
      recommendations.push("Improve inventory truth - ensure listing accuracy and photo quality");
    }
    
    if (framework.metrics.cis < 0.7) {
      recommendations.push("Increase clarity intelligence - optimize search clarity and schema coverage");
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const algorithmicFrameworkEngine = new AlgorithmicFrameworkEngine();
