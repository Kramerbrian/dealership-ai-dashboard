/**
 * DealershipAI v2.0 - Scoring Engine
 * 5 core metrics with E-E-A-T for Pro+ tiers
 */

export interface ScoringData {
  domain: string;
  gmbData?: any;
  reviewData?: any;
  schemaData?: any;
  contentData?: any;
  citationData?: any;
}

export interface CoreScores {
  aiVisibility: number;    // 35% weight
  zeroClick: number;       // 20% weight
  ugcHealth: number;       // 20% weight
  geoTrust: number;        // 15% weight
  sgpIntegrity: number;    // 10% weight
  overall: number;         // Calculated weighted average
}

export interface EEATScores {
  expertise: number;           // 25% weight
  experience: number;          // 25% weight
  authoritativeness: number;   // 25% weight
  trustworthiness: number;     // 25% weight
  overall: number;            // Calculated average
}

export class ScoringEngine {
  private readonly weights = {
    aiVisibility: 0.35,
    zeroClick: 0.20,
    ugcHealth: 0.20,
    geoTrust: 0.15,
    sgpIntegrity: 0.10
  };

  private readonly eeatWeights = {
    expertise: 0.25,
    experience: 0.25,
    authoritativeness: 0.25,
    trustworthiness: 0.25
  };

  /**
   * Calculate core 5-metric scores
   */
  async calculateScores(data: ScoringData): Promise<CoreScores> {
    const scores = await Promise.all([
      this.calculateAIVisibility(data),
      this.calculateZeroClick(data),
      this.calculateUGCHealth(data),
      this.calculateGeoTrust(data),
      this.calculateSGPIntegrity(data)
    ]);

    const [aiVisibility, zeroClick, ugcHealth, geoTrust, sgpIntegrity] = scores;
      
      // Calculate weighted overall score
    const overall = 
        (aiVisibility * this.weights.aiVisibility) +
      (zeroClick * this.weights.zeroClick) +
        (ugcHealth * this.weights.ugcHealth) +
        (geoTrust * this.weights.geoTrust) +
        (sgpIntegrity * this.weights.sgpIntegrity);
      
      return {
      aiVisibility: Math.round(aiVisibility * 100) / 100,
      zeroClick: Math.round(zeroClick * 100) / 100,
      ugcHealth: Math.round(ugcHealth * 100) / 100,
      geoTrust: Math.round(geoTrust * 100) / 100,
      sgpIntegrity: Math.round(sgpIntegrity * 100) / 100,
      overall: Math.round(overall * 100) / 100
    };
  }

  /**
   * Calculate E-E-A-T scores (Pro+ only)
   */
  async calculateEEAT(data: ScoringData): Promise<EEATScores> {
    const scores = await Promise.all([
      this.calculateExpertise(data),
      this.calculateExperience(data),
      this.calculateAuthoritativeness(data),
      this.calculateTrustworthiness(data)
    ]);

    const [expertise, experience, authoritativeness, trustworthiness] = scores;

    // Calculate average overall score
    const overall = 
      (expertise * this.eeatWeights.expertise) +
      (experience * this.eeatWeights.experience) +
      (authoritativeness * this.eeatWeights.authoritativeness) +
      (trustworthiness * this.eeatWeights.trustworthiness);

    return {
      expertise: Math.round(expertise * 100) / 100,
      experience: Math.round(experience * 100) / 100,
      authoritativeness: Math.round(authoritativeness * 100) / 100,
      trustworthiness: Math.round(trustworthiness * 100) / 100,
      overall: Math.round(overall * 100) / 100
    };
  }

  /**
   * 1. AI Visibility (35% weight)
   * How often AIs recommend this dealership
   */
  private async calculateAIVisibility(data: ScoringData): Promise<number> {
    // Simulate AI platform analysis
    const platforms = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Bing Chat'];
    let totalScore = 0;
    
    for (const platform of platforms) {
      // Simulate platform-specific scoring
      const platformScore = this.simulatePlatformScore(data.domain, platform);
      totalScore += platformScore;
    }

    return Math.min(100, totalScore / platforms.length);
  }

  /**
   * 2. Zero-Click Shield (20% weight)
   * Featured snippet presence and quality
   */
  private async calculateZeroClick(data: ScoringData): Promise<number> {
    let score = 0;

    // Check for structured data that enables featured snippets
    if (data.schemaData?.faq) score += 30;
    if (data.schemaData?.howTo) score += 25;
    if (data.schemaData?.review) score += 20;
    if (data.schemaData?.organization) score += 15;
    if (data.schemaData?.localBusiness) score += 10;

    // Check content optimization for featured snippets
    if (data.contentData?.hasQuestions) score += 20;
    if (data.contentData?.hasLists) score += 15;
    if (data.contentData?.hasTables) score += 10;

    return Math.min(100, score);
  }

  /**
   * 3. UGC Health (20% weight)
   * Review quality and quantity
   */
  private async calculateUGCHealth(data: ScoringData): Promise<number> {
    if (!data.reviewData) return 0;

    let score = 0;
    const reviews = data.reviewData;

    // Review quantity (40% of UGC score)
    const reviewCount = reviews.totalCount || 0;
    if (reviewCount >= 100) score += 40;
    else if (reviewCount >= 50) score += 30;
    else if (reviewCount >= 20) score += 20;
    else if (reviewCount >= 10) score += 10;

    // Review quality (60% of UGC score)
    const avgRating = reviews.averageRating || 0;
    if (avgRating >= 4.5) score += 30;
    else if (avgRating >= 4.0) score += 20;
    else if (avgRating >= 3.5) score += 10;

    // Review recency
    const recentReviews = reviews.recentCount || 0;
    if (recentReviews >= 10) score += 20;
    else if (recentReviews >= 5) score += 15;
    else if (recentReviews >= 2) score += 10;

    // Response rate
    const responseRate = reviews.responseRate || 0;
    if (responseRate >= 0.8) score += 10;
    else if (responseRate >= 0.5) score += 5;

    return Math.min(100, score);
  }

  /**
   * 4. Geo Trust (15% weight)
   * Local SEO strength
   */
  private async calculateGeoTrust(data: ScoringData): Promise<number> {
    let score = 0;

    // Google My Business optimization
    if (data.gmbData?.isVerified) score += 25;
    if (data.gmbData?.hasPhotos) score += 15;
    if (data.gmbData?.hasHours) score += 10;
    if (data.gmbData?.hasDescription) score += 10;
    if (data.gmbData?.hasCategories) score += 10;

    // Local citations
    const citationCount = data.citationData?.count || 0;
    if (citationCount >= 50) score += 20;
    else if (citationCount >= 25) score += 15;
    else if (citationCount >= 10) score += 10;

    // NAP consistency
    if (data.citationData?.napConsistent) score += 10;

    return Math.min(100, score);
  }

  /**
   * 5. SGP Integrity (10% weight)
   * Structured data completeness
   */
  private async calculateSGPIntegrity(data: ScoringData): Promise<number> {
    if (!data.schemaData) return 0;

    let score = 0;
    const schema = data.schemaData;

    // Essential schemas
    if (schema.organization) score += 20;
    if (schema.localBusiness) score += 20;
    if (schema.autoDealer) score += 15;
    if (schema.review) score += 15;
    if (schema.faq) score += 10;
    if (schema.howTo) score += 10;
    if (schema.service) score += 10;

    return Math.min(100, score);
  }

  /**
   * E-E-A-T Calculations (Pro+ only)
   */

  private async calculateExpertise(data: ScoringData): Promise<number> {
    let score = 0;

    // Certifications and credentials
    if (data.contentData?.hasCertifications) score += 30;
    if (data.contentData?.hasStaffCredentials) score += 25;
    if (data.contentData?.hasIndustryAwards) score += 20;

    // Knowledge demonstration
    if (data.contentData?.hasEducationalContent) score += 15;
    if (data.contentData?.hasTechnicalSpecs) score += 10;

    return Math.min(100, score);
  }

  private async calculateExperience(data: ScoringData): Promise<number> {
    let score = 0;

    // Years in business
    const yearsInBusiness = data.contentData?.yearsInBusiness || 0;
    if (yearsInBusiness >= 20) score += 40;
    else if (yearsInBusiness >= 10) score += 30;
    else if (yearsInBusiness >= 5) score += 20;

    // Customer testimonials
    if (data.contentData?.hasTestimonials) score += 25;
    if (data.contentData?.hasCaseStudies) score += 20;
    if (data.contentData?.hasBeforeAfter) score += 15;

    return Math.min(100, score);
  }

  private async calculateAuthoritativeness(data: ScoringData): Promise<number> {
    let score = 0;

    // Industry recognition
    if (data.contentData?.hasAwards) score += 30;
    if (data.contentData?.hasMediaMentions) score += 25;
    if (data.contentData?.hasIndustryPartnerships) score += 20;

    // Content authority
    if (data.contentData?.hasGuestPosts) score += 15;
    if (data.contentData?.hasSpeakingEngagements) score += 10;

    return Math.min(100, score);
  }

  private async calculateTrustworthiness(data: ScoringData): Promise<number> {
    let score = 0;
    
    // Transparency
    if (data.contentData?.hasPricing) score += 20;
    if (data.contentData?.hasContactInfo) score += 15;
    if (data.contentData?.hasAboutPage) score += 15;

    // Security and compliance
    if (data.contentData?.hasPrivacyPolicy) score += 15;
    if (data.contentData?.hasTermsOfService) score += 10;
    if (data.contentData?.hasSSL) score += 10;

    // Social proof
    if (data.contentData?.hasSocialMedia) score += 15;

    return Math.min(100, score);
  }

  /**
   * Simulate platform-specific AI visibility scoring
   */
  private simulatePlatformScore(domain: string, platform: string): number {
    // Use domain hash for consistent but varied scoring
    const hash = this.hashString(domain + platform);
    const baseScore = (hash % 40) + 30; // 30-70 base range
    
    // Add some randomness for realistic variation
    const variation = (Math.random() - 0.5) * 20;
    
    return Math.max(0, Math.min(100, baseScore + variation));
  }

  /**
   * Simple hash function for consistent scoring
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}