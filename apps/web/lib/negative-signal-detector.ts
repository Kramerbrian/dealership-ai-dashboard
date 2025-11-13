/**
 * Negative Signal Detector for AEO and GEO
 * Identifies trust contaminants and visibility blockers that harm DTRI scores
 */

export interface AEOContaminants {
  contentContaminants: {
    promotionalDensity: number;    // % of promotional language
    hyperboleCount: number;        // Count of superlative claims
    unverifiedClaims: number;      // Claims without citations
    queryMisalignment: number;     // Content doesn't answer the query
  };
  trustGaps: {
    citationVoids: number;         // Missing external verification
    schemaGaps: number;            // Missing structured data
    authorBiosMissing: number;     // No expert attribution
    expertiseClaims: number;       // Unsupported expertise claims
  };
  harmfulContent: {
    misleadingClaims: number;      // Contradicts industry consensus
    ymylViolations: number;        // Your Money Your Life violations
    safetyMisinformation: number;  // Incorrect safety information
    financialMisleading: number;   // Misleading financing claims
  };
  overallAEOPenalty: number;       // Calculated penalty score
}

export interface GEOContaminants {
  geoNegatives: {
    serviceAreaOverreach: number;  // Service area too large
    irrelevantTowns: number;       // Low-value geographic targets
    proximityDilution: number;     // Authority spread too thin
  };
  napInconsistencies: {
    nameVariations: number;        // Different business names
    addressMismatches: number;     // Inconsistent addresses
    phoneVariations: number;       // Different phone numbers
    consistencyScore: number;      // Overall NAP consistency
  };
  categoryMisalignment: {
    irrelevantCategories: number;  // Wrong GBP categories
    primaryMismatch: number;       // Category doesn't match core service
    trafficQuality: number;        // Bounce rate from wrong traffic
  };
  inventoryIssues: {
    outOfStockVDPs: number;        // VDPs for sold vehicles
    phantomInventory: number;      // Vehicles not on lot
    availabilityMismatch: number;  // Online vs. actual availability
  };
  overallGEOPenalty: number;       // Calculated penalty score
}

export interface NegativeSignalAnalysis {
  aeoContaminants: AEOContaminants;
  geoContaminants: GEOContaminants;
  totalPenaltyScore: number;
  criticalIssues: string[];
  recommendedFixes: string[];
  dtriImpact: {
    trustworthinessPenalty: number;
    experiencePenalty: number;
    expertisePenalty: number;
    authoritativenessPenalty: number;
  };
}

export class NegativeSignalDetector {
  private promotionalKeywords = [
    'best-in-class', 'unbeatable', 'amazing', 'incredible', 'fantastic',
    'outstanding', 'superior', 'premium', 'exclusive', 'revolutionary',
    'cutting-edge', 'state-of-the-art', 'world-class', 'top-rated',
    'number one', 'leading', 'premier', 'elite', 'luxury', 'premium'
  ];

  private hyperbolePatterns = [
    /\b(guaranteed|promise|assure|ensure|definitely|absolutely)\b/gi,
    /\b(never|always|all|every|complete|total|perfect)\b/gi,
    /\b(instant|immediate|fastest|quickest|easiest)\b/gi
  ];

  private ymylTopics = [
    'financing', 'credit', 'loan', 'payment', 'interest rate',
    'warranty', 'insurance', 'safety', 'recall', 'defect',
    'legal', 'liability', 'compliance', 'regulation'
  ];

  /**
   * Analyze content for AEO contaminants
   */
  analyzeAEOContaminants(content: string, metadata: any): AEOContaminants {
    const contentContaminants = this.detectContentContaminants(content);
    const trustGaps = this.detectTrustGaps(content, metadata);
    const harmfulContent = this.detectHarmfulContent(content);

    // Calculate overall AEO penalty
    const promotionalPenalty = contentContaminants.promotionalDensity * 0.3;
    const trustPenalty = (trustGaps.citationVoids + trustGaps.schemaGaps) * 0.4;
    const harmfulPenalty = (harmfulContent.misleadingClaims + harmfulContent.ymylViolations) * 0.5;

    const overallAEOPenalty = Math.min(100, promotionalPenalty + trustPenalty + harmfulPenalty);

    return {
      contentContaminants,
      trustGaps,
      harmfulContent,
      overallAEOPenalty: Math.round(overallAEOPenalty * 100) / 100
    };
  }

  /**
   * Analyze business profile for GEO contaminants
   */
  analyzeGEOContaminants(businessData: any, inventoryData: any): GEOContaminants {
    const geoNegatives = this.detectGeoNegatives(businessData);
    const napInconsistencies = this.detectNAPInconsistencies(businessData);
    const categoryMisalignment = this.detectCategoryMisalignment(businessData);
    const inventoryIssues = this.detectInventoryIssues(inventoryData);

    // Calculate overall GEO penalty
    const geoPenalty = geoNegatives.serviceAreaOverreach * 0.25;
    const napPenalty = (100 - napInconsistencies.consistencyScore) * 0.4;
    const categoryPenalty = categoryMisalignment.irrelevantCategories * 0.2;
    const inventoryPenalty = inventoryIssues.outOfStockVDPs * 0.15;

    const overallGEOPenalty = Math.min(100, geoPenalty + napPenalty + categoryPenalty + inventoryPenalty);

    return {
      geoNegatives,
      napInconsistencies,
      categoryMisalignment,
      inventoryIssues,
      overallGEOPenalty: Math.round(overallGEOPenalty * 100) / 100
    };
  }

  /**
   * Comprehensive negative signal analysis
   */
  analyzeNegativeSignals(content: string, businessData: any, inventoryData: any, metadata: any): NegativeSignalAnalysis {
    const aeoContaminants = this.analyzeAEOContaminants(content, metadata);
    const geoContaminants = this.analyzeGEOContaminants(businessData, inventoryData);

    // Calculate total penalty score
    const totalPenaltyScore = (aeoContaminants.overallAEOPenalty + geoContaminants.overallGEOPenalty) / 2;

    // Identify critical issues
    const criticalIssues = this.identifyCriticalIssues(aeoContaminants, geoContaminants);

    // Generate recommended fixes
    const recommendedFixes = this.generateRecommendedFixes(aeoContaminants, geoContaminants);

    // Calculate DTRI impact
    const dtriImpact = this.calculateDTRIImpact(aeoContaminants, geoContaminants);

    return {
      aeoContaminants,
      geoContaminants,
      totalPenaltyScore: Math.round(totalPenaltyScore * 100) / 100,
      criticalIssues,
      recommendedFixes,
      dtriImpact
    };
  }

  /**
   * Detect content contaminants that harm AEO
   */
  private detectContentContaminants(content: string) {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    // Count promotional language
    let promotionalCount = 0;
    this.promotionalKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      if (matches) promotionalCount += matches.length;
    });

    // Count hyperbole patterns
    let hyperboleCount = 0;
    this.hyperbolePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) hyperboleCount += matches.length;
    });

    // Detect unverified claims (simplified)
    const unverifiedClaims = this.detectUnverifiedClaims(content);

    // Calculate query misalignment (simplified)
    const queryMisalignment = this.calculateQueryMisalignment(content);

    return {
      promotionalDensity: Math.round((promotionalCount / totalWords) * 100 * 100) / 100,
      hyperboleCount,
      unverifiedClaims,
      queryMisalignment
    };
  }

  /**
   * Detect trust gaps in content
   */
  private detectTrustGaps(content: string, metadata: any) {
    // Check for missing citations
    const citationVoids = this.countMissingCitations(content);

    // Check for missing schema markup
    const schemaGaps = this.detectSchemaGaps(metadata);

    // Check for missing author bios
    const authorBiosMissing = this.detectMissingAuthorBios(metadata);

    // Check for unsupported expertise claims
    const expertiseClaims = this.detectUnsupportedExpertiseClaims(content);

    return {
      citationVoids,
      schemaGaps,
      authorBiosMissing,
      expertiseClaims
    };
  }

  /**
   * Detect harmful content
   */
  private detectHarmfulContent(content: string) {
    let misleadingClaims = 0;
    let ymylViolations = 0;
    let safetyMisinformation = 0;
    let financialMisleading = 0;

    // Check for YMYL violations
    this.ymylTopics.forEach(topic => {
      const regex = new RegExp(topic, 'gi');
      if (content.match(regex)) {
        ymylViolations++;
      }
    });

    // Check for safety misinformation (simplified)
    const safetyKeywords = ['safe', 'safety', 'secure', 'reliable'];
    safetyKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      if (content.match(regex) && !this.hasSafetyCitations(content)) {
        safetyMisinformation++;
      }
    });

    // Check for financial misleading claims
    const financialKeywords = ['guaranteed approval', 'no credit check', 'instant approval'];
    financialKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      if (content.match(regex)) {
        financialMisleading++;
      }
    });

    return {
      misleadingClaims,
      ymylViolations,
      safetyMisinformation,
      financialMisleading
    };
  }

  /**
   * Detect geo-negative signals
   */
  private detectGeoNegatives(businessData: any) {
    const serviceArea = businessData.serviceArea || [];
    const primaryLocation = businessData.primaryLocation || {};

    // Calculate service area overreach
    const serviceAreaOverreach = serviceArea.length > 10 ? 50 : 0;

    // Check for irrelevant towns (simplified)
    const irrelevantTowns = this.countIrrelevantTowns(serviceArea, primaryLocation);

    // Calculate proximity dilution
    const proximityDilution = this.calculateProximityDilution(serviceArea);

    return {
      serviceAreaOverreach,
      irrelevantTowns,
      proximityDilution
    };
  }

  /**
   * Detect NAP inconsistencies
   */
  private detectNAPInconsistencies(businessData: any) {
    const napData = businessData.napData || {};
    
    // Count name variations
    const nameVariations = this.countVariations(napData.names || []);
    
    // Count address mismatches
    const addressMismatches = this.countVariations(napData.addresses || []);
    
    // Count phone variations
    const phoneVariations = this.countVariations(napData.phones || []);

    // Calculate consistency score
    const consistencyScore = this.calculateNAPConsistency(nameVariations, addressMismatches, phoneVariations);

    return {
      nameVariations,
      addressMismatches,
      phoneVariations,
      consistencyScore
    };
  }

  /**
   * Detect category misalignment
   */
  private detectCategoryMisalignment(businessData: any) {
    const categories = businessData.categories || [];
    const primaryBusiness = businessData.primaryBusiness || '';

    // Count irrelevant categories
    const irrelevantCategories = this.countIrrelevantCategories(categories, primaryBusiness);

    // Check primary mismatch
    const primaryMismatch = this.checkPrimaryMismatch(categories, primaryBusiness);

    // Estimate traffic quality impact
    const trafficQuality = this.estimateTrafficQuality(irrelevantCategories);

    return {
      irrelevantCategories,
      primaryMismatch,
      trafficQuality
    };
  }

  /**
   * Detect inventory issues
   */
  private detectInventoryIssues(inventoryData: any) {
    const vdps = inventoryData.vdps || [];
    const actualInventory = inventoryData.actualInventory || [];

    // Count out-of-stock VDPs
    const outOfStockVDPs = this.countOutOfStockVDPs(vdps, actualInventory);

    // Count phantom inventory
    const phantomInventory = this.countPhantomInventory(vdps, actualInventory);

    // Calculate availability mismatch
    const availabilityMismatch = this.calculateAvailabilityMismatch(vdps, actualInventory);

    return {
      outOfStockVDPs,
      phantomInventory,
      availabilityMismatch
    };
  }

  /**
   * Identify critical issues requiring immediate attention
   */
  private identifyCriticalIssues(aeoContaminants: AEOContaminants, geoContaminants: GEOContaminants): string[] {
    const issues: string[] = [];

    if (aeoContaminants.overallAEOPenalty > 70) {
      issues.push('High AEO penalty - content contaminants blocking AI citations');
    }

    if (geoContaminants.overallGEOPenalty > 70) {
      issues.push('High GEO penalty - local visibility severely compromised');
    }

    if (aeoContaminants.harmfulContent.ymylViolations > 3) {
      issues.push('YMYL violations detected - immediate content review required');
    }

    if (geoContaminants.napInconsistencies.consistencyScore < 60) {
      issues.push('Critical NAP inconsistencies - trust signals severely damaged');
    }

    if (geoContaminants.inventoryIssues.outOfStockVDPs > 10) {
      issues.push('High out-of-stock VDP count - customer experience at risk');
    }

    return issues;
  }

  /**
   * Generate recommended fixes
   */
  private generateRecommendedFixes(aeoContaminants: AEOContaminants, geoContaminants: GEOContaminants): string[] {
    const fixes: string[] = [];

    if (aeoContaminants.contentContaminants.promotionalDensity > 5) {
      fixes.push('Reduce promotional language density by 50% - replace with factual, verifiable claims');
    }

    if (aeoContaminants.trustGaps.citationVoids > 3) {
      fixes.push('Add external citations and links to support all expertise claims');
    }

    if (geoContaminants.napInconsistencies.consistencyScore < 80) {
      fixes.push('Standardize NAP across all directories - prioritize top 10 local citations');
    }

    if (geoContaminants.categoryMisalignment.irrelevantCategories > 2) {
      fixes.push('Remove irrelevant GBP categories - focus on core business services');
    }

    if (geoContaminants.inventoryIssues.outOfStockVDPs > 5) {
      fixes.push('Implement real-time inventory sync - remove sold vehicle VDPs within 24 hours');
    }

    return fixes;
  }

  /**
   * Calculate DTRI impact of negative signals
   */
  private calculateDTRIImpact(aeoContaminants: AEOContaminants, geoContaminants: GEOContaminants) {
    const aeoPenalty = aeoContaminants.overallAEOPenalty / 100;
    const geoPenalty = geoContaminants.overallGEOPenalty / 100;

    return {
      trustworthinessPenalty: Math.round((aeoPenalty + geoPenalty) * 20), // Max 40 point penalty
      experiencePenalty: Math.round(geoPenalty * 15), // Max 15 point penalty
      expertisePenalty: Math.round(aeoPenalty * 25), // Max 25 point penalty
      authoritativenessPenalty: Math.round((aeoPenalty + geoPenalty) * 10) // Max 20 point penalty
    };
  }

  // Helper methods (simplified implementations)
  private detectUnverifiedClaims(content: string): number {
    // Simplified: count claims without citations
    const claimPatterns = [
      /\b(studies show|research indicates|experts say)\b/gi,
      /\b(proven|verified|tested|certified)\b/gi
    ];
    
    let unverifiedCount = 0;
    claimPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) unverifiedCount += matches.length;
    });
    
    return unverifiedCount;
  }

  private calculateQueryMisalignment(content: string): number {
    // Simplified: check if content answers common queries
    const queryIndicators = ['how to', 'what is', 'when should', 'why does'];
    let alignmentScore = 0;
    
    queryIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) {
        alignmentScore += 25;
      }
    });
    
    return Math.min(100, alignmentScore);
  }

  private countMissingCitations(content: string): number {
    // Simplified: count expertise claims without links
    const expertiseClaims = content.match(/\b(certified|expert|specialist|professional)\b/gi);
    const links = content.match(/https?:\/\/[^\s]+/g);
    
    return Math.max(0, (expertiseClaims?.length || 0) - (links?.length || 0));
  }

  private detectSchemaGaps(metadata: any): number {
    const requiredSchemas = ['LocalBusiness', 'Organization', 'FAQPage'];
    const presentSchemas = metadata.schemas || [];
    
    return Math.max(0, requiredSchemas.length - presentSchemas.length);
  }

  private detectMissingAuthorBios(metadata: any): number {
    const hasAuthorBios = metadata.authorBios || false;
    return hasAuthorBios ? 0 : 1;
  }

  private detectUnsupportedExpertiseClaims(content: string): number {
    const expertiseKeywords = ['certified', 'expert', 'specialist', 'professional'];
    let unsupportedCount = 0;
    
    expertiseKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      if (matches && !this.hasSupportingEvidence(content, keyword)) {
        unsupportedCount += matches.length;
      }
    });
    
    return unsupportedCount;
  }

  private hasSafetyCitations(content: string): boolean {
    return content.includes('NHTSA') || content.includes('IIHS') || content.includes('safety.gov');
  }

  private countIrrelevantTowns(serviceArea: string[], primaryLocation: any): number {
    // Simplified: count towns more than 50 miles from primary location
    return serviceArea.length > 5 ? serviceArea.length - 5 : 0;
  }

  private calculateProximityDilution(serviceArea: string[]): number {
    // Simplified: penalty for too many service areas
    return Math.max(0, serviceArea.length - 3) * 10;
  }

  private countVariations(items: string[]): number {
    const unique = new Set(items.map(item => item.toLowerCase().trim()));
    return Math.max(0, items.length - unique.size);
  }

  private calculateNAPConsistency(nameVariations: number, addressMismatches: number, phoneVariations: number): number {
    const totalVariations = nameVariations + addressMismatches + phoneVariations;
    return Math.max(0, 100 - (totalVariations * 10));
  }

  private countIrrelevantCategories(categories: string[], primaryBusiness: string): number {
    // Simplified: count categories that don't match primary business
    return categories.filter(cat => !cat.toLowerCase().includes(primaryBusiness.toLowerCase())).length;
  }

  private checkPrimaryMismatch(categories: string[], primaryBusiness: string): number {
    const primaryCategory = categories[0] || '';
    return primaryCategory.toLowerCase().includes(primaryBusiness.toLowerCase()) ? 0 : 1;
  }

  private estimateTrafficQuality(irrelevantCategories: number): number {
    return Math.max(0, 100 - (irrelevantCategories * 15));
  }

  private countOutOfStockVDPs(vdps: any[], actualInventory: any[]): number {
    return vdps.filter(vdp => !actualInventory.some(inv => inv.id === vdp.id)).length;
  }

  private countPhantomInventory(vdps: any[], actualInventory: any[]): number {
    return actualInventory.filter(inv => !vdps.some(vdp => vdp.id === inv.id)).length;
  }

  private calculateAvailabilityMismatch(vdps: any[], actualInventory: any[]): number {
    const totalVDPs = vdps.length;
    const availableVDPs = vdps.filter(vdp => actualInventory.some(inv => inv.id === vdp.id)).length;
    return Math.round(((totalVDPs - availableVDPs) / totalVDPs) * 100);
  }

  private hasSupportingEvidence(content: string, keyword: string): boolean {
    // Simplified: check for supporting evidence near expertise claims
    const keywordIndex = content.toLowerCase().indexOf(keyword);
    if (keywordIndex === -1) return false;
    
    const context = content.substring(Math.max(0, keywordIndex - 100), keywordIndex + 100);
    return context.includes('certification') || context.includes('license') || context.includes('credential');
  }
}

export default NegativeSignalDetector;
