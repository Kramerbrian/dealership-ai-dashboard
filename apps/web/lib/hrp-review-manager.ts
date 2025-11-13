/**
 * HRP-Based Review Response Manager
 * Balances AI accuracy with fresh engagement signals for optimal E-E-A-T and GEO performance
 */

export interface HRPConfig {
  lowRisk: number;      // < 0.50 - Continue normally
  mediumRisk: number;   // 0.50-0.75 - Flag but allow manual
  highRisk: number;     // ≥ 0.75 - Suppress auto, force review
}

export interface ReviewResponse {
  id: string;
  dealershipId: string;
  reviewId: string;
  reviewText: string;
  reviewRating: number;
  hrpScore: number;
  responseType: 'auto' | 'manual' | 'assisted' | 'blocked';
  responseText?: string;
  timestamp: Date;
  freshnessScore: number;
  eeatImpact: {
    trustworthiness: number;
    experience: number;
    expertise: number;
    authoritativeness: number;
  };
}

export interface HRPAction {
  action: 'continue' | 'flag' | 'suppress' | 'block';
  message: string;
  requiresHumanReview: boolean;
  allowsManualResponse: boolean;
  schemaRevalidation: boolean;
}

export class HRPReviewManager {
  private config: HRPConfig = {
    lowRisk: 0.50,
    mediumRisk: 0.75,
    highRisk: 0.75
  };

  private extensionConflictResolver: string = `
    // Extension Conflict Resolver for clean console
    (function() {
      'use strict';
      const originalError = console.error;
      console.error = function(...args) {
        const message = String(args[0] || '');
        if (message.includes('Could not establish connection') ||
            message.includes('Receiving end does not exist') ||
            message.includes('Extension context invalidated')) {
          return; // Suppress extension errors
        }
        originalError.apply(console, args);
      };
    })();
  `;

  /**
   * Calculate HRP (Hallucination Risk Probability) for review response
   */
  calculateHRP(reviewText: string, responseText: string, context: any): number {
    let hrpScore = 0;

    // Price-related content (high risk)
    if (this.containsPriceContent(responseText)) {
      hrpScore += 0.4;
    }

    // Warranty/legal content (high risk)
    if (this.containsWarrantyContent(responseText)) {
      hrpScore += 0.3;
    }

    // Technical specifications (medium risk)
    if (this.containsTechnicalSpecs(responseText)) {
      hrpScore += 0.2;
    }

    // Promotional language (medium risk)
    if (this.containsPromotionalLanguage(responseText)) {
      hrpScore += 0.15;
    }

    // Factual claims without citations (medium risk)
    if (this.containsUnverifiedClaims(responseText)) {
      hrpScore += 0.25;
    }

    // YMYL (Your Money Your Life) topics (high risk)
    if (this.containsYMYLContent(responseText)) {
      hrpScore += 0.35;
    }

    // Context-based adjustments
    if (context.isNegativeReview && this.containsDefensiveLanguage(responseText)) {
      hrpScore += 0.1; // Defensive responses need more scrutiny
    }

    if (context.isHighValueCustomer && this.containsPromises(responseText)) {
      hrpScore += 0.2; // Promises to high-value customers are risky
    }

    return Math.min(1.0, hrpScore);
  }

  /**
   * Determine action based on HRP score
   */
  determineAction(hrpScore: number): HRPAction {
    if (hrpScore < this.config.lowRisk) {
      return {
        action: 'continue',
        message: 'Low HRP - Continue auto-responses normally',
        requiresHumanReview: false,
        allowsManualResponse: true,
        schemaRevalidation: false
      };
    } else if (hrpScore < this.config.mediumRisk) {
      return {
        action: 'flag',
        message: 'Medium HRP - Flag for review, allow manual responses',
        requiresHumanReview: true,
        allowsManualResponse: true,
        schemaRevalidation: false
      };
    } else {
      return {
        action: 'suppress',
        message: 'High HRP - Suppress auto-responses, force human review',
        requiresHumanReview: true,
        allowsManualResponse: true,
        schemaRevalidation: true
      };
    }
  }

  /**
   * Process review response with HRP-based decision making
   */
  async processReviewResponse(reviewData: any): Promise<ReviewResponse> {
    // Calculate HRP score
    const hrpScore = this.calculateHRP(
      reviewData.reviewText,
      reviewData.proposedResponse,
      reviewData.context
    );

    // Determine action
    const action = this.determineAction(hrpScore);

    // Calculate freshness score (higher is better for SEO)
    const freshnessScore = this.calculateFreshnessScore(reviewData, action);

    // Calculate E-E-A-T impact
    const eeatImpact = this.calculateEEATImpact(reviewData, action, hrpScore);

    // Determine response type
    let responseType: 'auto' | 'manual' | 'assisted' | 'blocked' = 'auto';
    if (action.action === 'suppress') {
      responseType = 'blocked';
    } else if (action.requiresHumanReview) {
      responseType = 'assisted';
    }

    return {
      id: `response_${Date.now()}`,
      dealershipId: reviewData.dealershipId,
      reviewId: reviewData.reviewId,
      reviewText: reviewData.reviewText,
      reviewRating: reviewData.rating,
      hrpScore,
      responseType,
      responseText: action.action !== 'suppress' ? reviewData.proposedResponse : undefined,
      timestamp: new Date(),
      freshnessScore,
      eeatImpact
    };
  }

  /**
   * Calculate freshness score for SEO/GEO optimization
   */
  private calculateFreshnessScore(reviewData: any, action: HRPAction): number {
    let freshnessScore = 100; // Start with perfect freshness

    // Reduce freshness for blocked responses
    if (action.action === 'suppress') {
      freshnessScore -= 30;
    }

    // Reduce freshness for delayed responses
    const hoursSinceReview = (Date.now() - new Date(reviewData.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSinceReview > 4) {
      freshnessScore -= Math.min(20, hoursSinceReview * 2);
    }

    // Boost freshness for quick, accurate responses
    if (action.action === 'continue' && hoursSinceReview < 2) {
      freshnessScore += 10;
    }

    return Math.max(0, Math.min(100, freshnessScore));
  }

  /**
   * Calculate E-E-A-T impact of response strategy
   */
  private calculateEEATImpact(reviewData: any, action: HRPAction, hrpScore: number) {
    const baseImpact = {
      trustworthiness: 0,
      experience: 0,
      expertise: 0,
      authoritativeness: 0
    };

    // Trustworthiness impact
    if (action.action === 'continue') {
      baseImpact.trustworthiness = 5; // Quick response builds trust
    } else if (action.action === 'flag') {
      baseImpact.trustworthiness = 3; // Moderate trust building
    } else {
      baseImpact.trustworthiness = -2; // Delayed response reduces trust
    }

    // Experience impact (based on response quality)
    if (hrpScore < 0.3) {
      baseImpact.experience = 8; // High-quality response
    } else if (hrpScore < 0.6) {
      baseImpact.experience = 4; // Medium-quality response
    } else {
      baseImpact.experience = -5; // Low-quality response
    }

    // Expertise impact (based on content accuracy)
    if (action.schemaRevalidation) {
      baseImpact.expertise = 6; // Validated content shows expertise
    } else if (hrpScore < 0.4) {
      baseImpact.expertise = 4; // Accurate content
    } else {
      baseImpact.expertise = -3; // Inaccurate content
    }

    // Authoritativeness impact (based on consistency)
    if (action.action === 'continue' && hrpScore < 0.3) {
      baseImpact.authoritativeness = 5; // Consistent, accurate responses
    } else if (action.requiresHumanReview) {
      baseImpact.authoritativeness = 2; // Human oversight shows authority
    } else {
      baseImpact.authoritativeness = -1; // Inconsistent responses
    }

    return baseImpact;
  }

  /**
   * Generate optimized response text based on HRP and context
   */
  generateOptimizedResponse(reviewData: any, hrpScore: number): string {
    const isNegative = reviewData.rating <= 3;
    const isHighValue = reviewData.customerValue === 'high';

    if (hrpScore < 0.3) {
      // Low risk - can use full AI-generated response
      return reviewData.proposedResponse;
    } else if (hrpScore < 0.6) {
      // Medium risk - use template with minimal AI content
      return this.generateTemplateResponse(reviewData, isNegative, isHighValue);
    } else {
      // High risk - use safe template only
      return this.generateSafeResponse(reviewData, isNegative, isHighValue);
    }
  }

  /**
   * Generate template-based response for medium risk
   */
  private generateTemplateResponse(reviewData: any, isNegative: boolean, isHighValue: boolean): string {
    const templates = {
      negative: [
        "Thank you for your feedback. We take all reviews seriously and would like to discuss your experience further. Please contact us directly.",
        "We appreciate you taking the time to share your experience. Our team would like to address your concerns personally.",
        "Thank you for your review. We value your feedback and would like to make this right. Please reach out to us."
      ],
      positive: [
        "Thank you for your wonderful review! We're thrilled you had a great experience with us.",
        "We appreciate your kind words and are so glad we could provide excellent service.",
        "Thank you for taking the time to share your positive experience. We look forward to serving you again."
      ]
    };

    const templateArray = isNegative ? templates.negative : templates.positive;
    return templateArray[Math.floor(Math.random() * templateArray.length)];
  }

  /**
   * Generate safe response for high risk scenarios
   */
  private generateSafeResponse(reviewData: any, isNegative: boolean, isHighValue: boolean): string {
    if (isNegative) {
      return "Thank you for your feedback. Please contact us directly so we can address your concerns personally.";
    } else {
      return "Thank you for your review! We appreciate your business.";
    }
  }

  // Content detection methods
  private containsPriceContent(text: string): boolean {
    const pricePatterns = [
      /\$\d+/g,
      /price|cost|fee|charge|payment|finance/i,
      /special|deal|discount|offer/i
    ];
    return pricePatterns.some(pattern => pattern.test(text));
  }

  private containsWarrantyContent(text: string): boolean {
    const warrantyPatterns = [
      /warranty|guarantee|coverage|protection/i,
      /terms|conditions|policy/i,
      /legal|liability|responsible/i
    ];
    return warrantyPatterns.some(pattern => pattern.test(text));
  }

  private containsTechnicalSpecs(text: string): boolean {
    const techPatterns = [
      /engine|transmission|brake|suspension/i,
      /mpg|horsepower|torque|cylinders/i,
      /specification|specs|features/i
    ];
    return techPatterns.some(pattern => pattern.test(text));
  }

  private containsPromotionalLanguage(text: string): boolean {
    const promoPatterns = [
      /best|greatest|amazing|incredible/i,
      /guaranteed|promise|assure/i,
      /limited time|act now|don't miss/i
    ];
    return promoPatterns.some(pattern => pattern.test(text));
  }

  private containsUnverifiedClaims(text: string): boolean {
    const claimPatterns = [
      /studies show|research indicates|experts say/i,
      /proven|verified|tested|certified/i,
      /according to|data shows|statistics/i
    ];
    return claimPatterns.some(pattern => pattern.test(text));
  }

  private containsYMYLContent(text: string): boolean {
    const ymylPatterns = [
      /financing|credit|loan|interest/i,
      /insurance|coverage|claim/i,
      /safety|recall|defect|injury/i
    ];
    return ymylPatterns.some(pattern => pattern.test(text));
  }

  private containsDefensiveLanguage(text: string): boolean {
    const defensivePatterns = [
      /not our fault|beyond our control/i,
      /misunderstanding|confusion/i,
      /policy|procedure|rules/i
    ];
    return defensivePatterns.some(pattern => pattern.test(text));
  }

  private containsPromises(text: string): boolean {
    const promisePatterns = [
      /will|shall|guarantee|promise/i,
      /ensure|assure|certain/i,
      /definitely|absolutely|surely/i
    ];
    return promisePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Get extension conflict resolver script
   */
  getExtensionConflictResolver(): string {
    return this.extensionConflictResolver;
  }

  /**
   * Update HRP configuration
   */
  updateConfig(newConfig: Partial<HRPConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): HRPConfig {
    return { ...this.config };
  }
}

export default HRPReviewManager;
