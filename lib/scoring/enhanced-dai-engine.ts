/**
 * Enhanced DealershipAI (dAI) Algorithm Engine
 * 
 * Implements advanced QAI (Quality of Answers Index) and PIQR (Page Information Quality Rank)
 * algorithms for real-time dealership visibility tracking and optimization.
 * 
 * @version 3.0.0
 * @author DealershipAI Team
 */

import { SCORING_WEIGHTS, THRESHOLDS } from '../constants/scoringWeights';

// Enhanced interfaces for advanced metrics
export interface QAIMetrics {
  // QAI Core Components
  answerRelevance: number;        // 0-100: Semantic overlap with user queries
  structuredDataPresence: number; // 0-100: Schema markup coverage
  contentClarity: number;         // 0-100: Header structure, formatting
  citationSignals: number;        // 0-100: External source references
  queryCoverage: number;          // 0-100: Breadth of answered queries
  answerFreshness: number;        // 0-100: Content recency and updates
  
  // QAI Sub-components
  faqSchemaScore: number;          // FAQ schema implementation
  productSchemaScore: number;     // Product schema implementation
  reviewSchemaScore: number;      // Review schema implementation
  organizationSchemaScore: number; // Organization schema implementation
  staffSchemaScore: number;       // Staff/author schema implementation
}

export interface PIQRMetrics {
  // PIQR Core Components
  authorshipSignals: number;       // 0-100: Expert bios, credentials, attribution
  technicalHealth: number;        // 0-100: Core Web Vitals, mobile optimization
  sentimentTrust: number;          // 0-100: Review sentiment, NPS, reputation
  contentDepth: number;            // 0-100: Comprehensive content coverage
  citationStability: number;       // 0-100: Citation retention vs competitors
  contentSafety: number;          // 0-100: Privacy compliance, transparency
  
  // PIQR Sub-components
  coreWebVitals: {
    lcp: number;                   // Largest Contentful Paint
    fid: number;                   // First Input Delay
    cls: number;                   // Cumulative Layout Shift
    overall: number;               // Combined CWV score
  };
  mobileOptimization: number;     // Mobile-friendliness score
  accessibilityScore: number;      // WCAG compliance
  pageSpeedScore: number;         // Overall page speed
}

export interface CitationMetrics {
  // AI Engine Citations
  chatgptMentions: number;         // Citations in ChatGPT responses
  perplexityMentions: number;     // Citations in Perplexity answers
  geminiMentions: number;         // Citations in Gemini responses
  googleAIMentions: number;       // Citations in Google AI Overviews
  
  // SERP Features
  featuredSnippets: number;        // Featured snippet appearances
  peopleAlsoAsk: number;          // PAA appearances
  knowledgePanels: number;         // Knowledge panel appearances
  
  // Citation Quality
  citationStability: number;       // 0-100: Citation retention rate
  citationPosition: number;        // 0-100: Average position in AI responses
  citationContext: number;         // 0-100: Relevance of citation context
}

export interface SentimentMetrics {
  // Review Sentiment
  netSentiment: number;            // -100 to +100: Overall sentiment
  sentimentTrend: number;          // -100 to +100: 30-day trend
  reviewVelocity: number;         // Reviews per day
  reviewQuality: number;           // 0-100: Review depth and authenticity
  
  // Social Signals
  socialMentions: number;          // Social media mentions
  socialSentiment: number;         // Social media sentiment
  brandMentions: number;           // Brand mention frequency
  
  // Trust Signals
  npsScore: number;               // Net Promoter Score
  trustIndicators: number;        // 0-100: Trust signal strength
  authoritySignals: number;        // 0-100: Authority indicators
}

export interface CompetitiveMetrics {
  // Market Position
  marketShare: number;             // 0-100: Market share percentage
  competitiveGap: number;         // -100 to +100: Gap vs competitors
  displacementRisk: number;       // 0-100: Risk of citation displacement
  
  // Benchmarking
  competitorCount: number;         // Number of tracked competitors
  topCompetitorScore: number;      // Highest competitor score
  averageCompetitorScore: number; // Average competitor score
  
  // Share of Voice
  shareOfVoice: number;            // 0-100: Share of total mentions
  voiceTrend: number;             // -100 to +100: Voice trend
}

export interface TechnicalHealthMetrics {
  // Core Web Vitals
  coreWebVitals: PIQRMetrics['coreWebVitals'];
  
  // Technical Issues
  errorRate: number;               // 0-100: Error rate percentage
  uptime: number;                  // 0-100: Uptime percentage
  mobileScore: number;             // 0-100: Mobile optimization
  accessibilityScore: number;      // 0-100: Accessibility compliance
  
  // Schema Validation
  schemaErrors: number;            // Number of schema errors
  schemaCoverage: number;           // 0-100: Schema coverage percentage
  structuredDataHealth: number;    // 0-100: Overall structured data health
}

export interface EnhancedDAIMetrics {
  // Core Enhanced Metrics
  qai: QAIMetrics;                // Quality of Answers Index
  piqr: PIQRMetrics;              // Page Information Quality Rank
  citations: CitationMetrics;      // Citation tracking
  sentiment: SentimentMetrics;     // Sentiment analysis
  competitive: CompetitiveMetrics; // Competitive analysis
  technical: TechnicalHealthMetrics; // Technical health
  
  // Legacy Metrics (enhanced)
  ati: number;                     // Algorithmic Trust Index (enhanced)
  aiv: number;                     // AI Visibility Index (enhanced)
  vli: number;                     // Vehicle Listing Integrity
  oi: number;                      // Offer Integrity
  gbp: number;                      // Google Business Profile
  rrs: number;                     // Review & Reputation Score
  wx: number;                      // Web Experience
  ifr: number;                      // Inventory Freshness
  cis: number;                      // Clarity Intelligence Score
  
  // New Advanced Metrics
  vai: number;                     // Visibility Authority Index
  hrp: number;                     // High-Risk Penalty
  oci: number;                     // Organic Citation Index
  authorityVelocity: number;        // Authority signal accumulation rate
  
  // Context
  tenantId: string;
  timestamp: Date;
  domain: string;
  marketRegion: string;
  dataQuality: number;             // 0-100: Data quality score
}

export interface EnhancedScoringWeights {
  // QAI Weights
  qai: {
    answerRelevance: 0.25;
    structuredDataPresence: 0.20;
    contentClarity: 0.15;
    citationSignals: 0.15;
    queryCoverage: 0.15;
    answerFreshness: 0.10;
  };
  
  // PIQR Weights
  piqr: {
    authorshipSignals: 0.20;
    technicalHealth: 0.25;
    sentimentTrust: 0.20;
    contentDepth: 0.15;
    citationStability: 0.10;
    contentSafety: 0.10;
  };
  
  // Citation Weights
  citations: {
    chatgptMentions: 0.20;
    perplexityMentions: 0.20;
    geminiMentions: 0.15;
    googleAIMentions: 0.25;
    featuredSnippets: 0.10;
    peopleAlsoAsk: 0.10;
  };
  
  // Sentiment Weights
  sentiment: {
    netSentiment: 0.30;
    sentimentTrend: 0.20;
    reviewVelocity: 0.15;
    reviewQuality: 0.15;
    socialSignals: 0.10;
    trustIndicators: 0.10;
  };
  
  // Competitive Weights
  competitive: {
    marketShare: 0.30;
    competitiveGap: 0.25;
    displacementRisk: 0.20;
    shareOfVoice: 0.25;
  };
  
  // Technical Weights
  technical: {
    coreWebVitals: 0.30;
    errorRate: 0.20;
    uptime: 0.20;
    mobileScore: 0.15;
    accessibilityScore: 0.15;
  };
}

// Default enhanced weights
const DEFAULT_ENHANCED_WEIGHTS: EnhancedScoringWeights = {
  qai: {
    answerRelevance: 0.25,
    structuredDataPresence: 0.20,
    contentClarity: 0.15,
    citationSignals: 0.15,
    queryCoverage: 0.15,
    answerFreshness: 0.10,
  },
  piqr: {
    authorshipSignals: 0.20,
    technicalHealth: 0.25,
    sentimentTrust: 0.20,
    contentDepth: 0.15,
    citationStability: 0.10,
    contentSafety: 0.10,
  },
  citations: {
    chatgptMentions: 0.20,
    perplexityMentions: 0.20,
    geminiMentions: 0.15,
    googleAIMentions: 0.25,
    featuredSnippets: 0.10,
    peopleAlsoAsk: 0.10,
  },
  sentiment: {
    netSentiment: 0.30,
    sentimentTrend: 0.20,
    reviewVelocity: 0.15,
    reviewQuality: 0.15,
    socialSignals: 0.10,
    trustIndicators: 0.10,
  },
  competitive: {
    marketShare: 0.30,
    competitiveGap: 0.25,
    displacementRisk: 0.20,
    shareOfVoice: 0.25,
  },
  technical: {
    coreWebVitals: 0.30,
    errorRate: 0.20,
    uptime: 0.20,
    mobileScore: 0.15,
    accessibilityScore: 0.15,
  },
};

export class EnhancedDAIEngine {
  private weights: EnhancedScoringWeights;
  
  constructor(weights: EnhancedScoringWeights = DEFAULT_ENHANCED_WEIGHTS) {
    this.weights = weights;
  }
  
  /**
   * Calculate QAI (Quality of Answers Index)
   */
  calculateQAI(metrics: QAIMetrics): number {
    const qai = 
      (metrics.answerRelevance * this.weights.qai.answerRelevance) +
      (metrics.structuredDataPresence * this.weights.qai.structuredDataPresence) +
      (metrics.contentClarity * this.weights.qai.contentClarity) +
      (metrics.citationSignals * this.weights.qai.citationSignals) +
      (metrics.queryCoverage * this.weights.qai.queryCoverage) +
      (metrics.answerFreshness * this.weights.qai.answerFreshness);
    
    return Math.round(Math.max(0, Math.min(100, qai)));
  }
  
  /**
   * Calculate PIQR (Page Information Quality Rank)
   */
  calculatePIQR(metrics: PIQRMetrics): number {
    const piqr = 
      (metrics.authorshipSignals * this.weights.piqr.authorshipSignals) +
      (metrics.technicalHealth * this.weights.piqr.technicalHealth) +
      (metrics.sentimentTrust * this.weights.piqr.sentimentTrust) +
      (metrics.contentDepth * this.weights.piqr.contentDepth) +
      (metrics.citationStability * this.weights.piqr.citationStability) +
      (metrics.contentSafety * this.weights.piqr.contentSafety);
    
    return Math.round(Math.max(0, Math.min(100, piqr)));
  }
  
  /**
   * Calculate Citation Score
   */
  calculateCitationScore(metrics: CitationMetrics): number {
    const citationScore = 
      (metrics.chatgptMentions * this.weights.citations.chatgptMentions) +
      (metrics.perplexityMentions * this.weights.citations.perplexityMentions) +
      (metrics.geminiMentions * this.weights.citations.geminiMentions) +
      (metrics.googleAIMentions * this.weights.citations.googleAIMentions) +
      (metrics.featuredSnippets * this.weights.citations.featuredSnippets) +
      (metrics.peopleAlsoAsk * this.weights.citations.peopleAlsoAsk);
    
    return Math.round(Math.max(0, Math.min(100, citationScore)));
  }
  
  /**
   * Calculate Sentiment Score
   */
  calculateSentimentScore(metrics: SentimentMetrics): number {
    const sentimentScore = 
      (metrics.netSentiment * this.weights.sentiment.netSentiment) +
      (metrics.sentimentTrend * this.weights.sentiment.sentimentTrend) +
      (metrics.reviewVelocity * this.weights.sentiment.reviewVelocity) +
      (metrics.reviewQuality * this.weights.sentiment.reviewQuality) +
      (metrics.socialMentions * this.weights.sentiment.socialSignals) +
      (metrics.trustIndicators * this.weights.sentiment.trustIndicators);
    
    return Math.round(Math.max(0, Math.min(100, sentimentScore)));
  }
  
  /**
   * Calculate Competitive Score
   */
  calculateCompetitiveScore(metrics: CompetitiveMetrics): number {
    const competitiveScore = 
      (metrics.marketShare * this.weights.competitive.marketShare) +
      (metrics.competitiveGap * this.weights.competitive.competitiveGap) +
      ((100 - metrics.displacementRisk) * this.weights.competitive.displacementRisk) +
      (metrics.shareOfVoice * this.weights.competitive.shareOfVoice);
    
    return Math.round(Math.max(0, Math.min(100, competitiveScore)));
  }
  
  /**
   * Calculate Technical Health Score
   */
  calculateTechnicalHealthScore(metrics: TechnicalHealthMetrics): number {
    const technicalScore = 
      (metrics.coreWebVitals.overall * this.weights.technical.coreWebVitals) +
      ((100 - metrics.errorRate) * this.weights.technical.errorRate) +
      (metrics.uptime * this.weights.technical.uptime) +
      (metrics.mobileScore * this.weights.technical.mobileScore) +
      (metrics.accessibilityScore * this.weights.technical.accessibilityScore);
    
    return Math.round(Math.max(0, Math.min(100, technicalScore)));
  }
  
  /**
   * Calculate VAI (Visibility Authority Index) with PIQR penalty
   */
  calculateVAI(qai: number, piqr: number, citations: CitationMetrics): number {
    const baseVAI = (qai * 0.4) + (citations.citationStability * 0.3) + (citations.citationPosition * 0.3);
    const piqrPenalty = piqr < 70 ? (70 - piqr) * 0.1 : 0;
    return Math.round(Math.max(0, Math.min(100, baseVAI - piqrPenalty)));
  }
  
  /**
   * Calculate HRP (High-Risk Penalty)
   */
  calculateHRP(metrics: EnhancedDAIMetrics): number {
    let hrp = 0;
    
    // Technical issues penalty
    if (metrics.technical.errorRate > 5) hrp += 10;
    if (metrics.technical.uptime < 95) hrp += 15;
    if (metrics.technical.coreWebVitals.overall < 50) hrp += 20;
    
    // Sentiment issues penalty
    if (metrics.sentiment.netSentiment < -20) hrp += 15;
    if (metrics.sentiment.sentimentTrend < -10) hrp += 10;
    
    // Competitive issues penalty
    if (metrics.competitive.displacementRisk > 70) hrp += 20;
    if (metrics.competitive.competitiveGap < -30) hrp += 15;
    
    return Math.min(100, hrp);
  }
  
  /**
   * Calculate OCI (Organic Citation Index)
   */
  calculateOCI(metrics: CitationMetrics, competitive: CompetitiveMetrics): number {
    const citationValue = 
      (metrics.chatgptMentions * 50) +
      (metrics.perplexityMentions * 45) +
      (metrics.geminiMentions * 40) +
      (metrics.googleAIMentions * 60) +
      (metrics.featuredSnippets * 80) +
      (metrics.peopleAlsoAsk * 30);
    
    const competitiveMultiplier = 1 + (competitive.marketShare / 100);
    return Math.round(citationValue * competitiveMultiplier);
  }
  
  /**
   * Calculate Authority Velocity
   */
  calculateAuthorityVelocity(currentScore: number, previousScore: number): number {
    if (previousScore === 0) return 0;
    return ((currentScore - previousScore) / previousScore) * 100;
  }
  
  /**
   * Calculate overall enhanced dAI score
   */
  calculateEnhancedDAIScore(metrics: EnhancedDAIMetrics): {
    overallScore: number;
    breakdown: {
      qai: number;
      piqr: number;
      vai: number;
      hrp: number;
      oci: number;
      authorityVelocity: number;
    };
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    // Calculate individual scores
    const qaiScore = this.calculateQAI(metrics.qai);
    const piqrScore = this.calculatePIQR(metrics.piqr);
    const citationScore = this.calculateCitationScore(metrics.citations);
    const sentimentScore = this.calculateSentimentScore(metrics.sentiment);
    const competitiveScore = this.calculateCompetitiveScore(metrics.competitive);
    const technicalScore = this.calculateTechnicalHealthScore(metrics.technical);
    
    // Calculate advanced metrics
    const vai = this.calculateVAI(qaiScore, piqrScore, metrics.citations);
    const hrp = this.calculateHRP(metrics);
    const oci = this.calculateOCI(metrics.citations, metrics.competitive);
    
    // Calculate overall score with penalties
    const baseScore = (qaiScore * 0.25) + (piqrScore * 0.20) + (vai * 0.20) + 
                     (citationScore * 0.15) + (sentimentScore * 0.10) + 
                     (competitiveScore * 0.05) + (technicalScore * 0.05);
    
    const finalScore = Math.max(0, Math.min(100, baseScore - (hrp * 0.1)));
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (finalScore < 40) riskLevel = 'critical';
    else if (finalScore < 60) riskLevel = 'high';
    else if (finalScore < 80) riskLevel = 'medium';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, {
      qai: qaiScore,
      piqr: piqrScore,
      vai,
      hrp,
      oci,
      authorityVelocity: 0 // Would need historical data
    });
    
    return {
      overallScore: Math.round(finalScore),
      breakdown: {
        qai: qaiScore,
        piqr: piqrScore,
        vai,
        hrp,
        oci,
        authorityVelocity: 0
      },
      recommendations,
      riskLevel
    };
  }
  
  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(metrics: EnhancedDAIMetrics, scores: any): string[] {
    const recommendations: string[] = [];
    
    // QAI recommendations
    if (scores.qai < 70) {
      if (metrics.qai.structuredDataPresence < 60) {
        recommendations.push('Implement comprehensive schema markup (FAQ, Product, Review, Organization) to improve QAI score');
      }
      if (metrics.qai.answerRelevance < 60) {
        recommendations.push('Optimize content for direct question answering with clear headers and bullet points');
      }
      if (metrics.qai.answerFreshness < 50) {
        recommendations.push('Update content regularly, especially pricing, inventory, and special offers');
      }
    }
    
    // PIQR recommendations
    if (scores.piqr < 70) {
      if (metrics.piqr.technicalHealth < 60) {
        recommendations.push('Improve Core Web Vitals and mobile optimization to boost PIQR score');
      }
      if (metrics.piqr.authorshipSignals < 50) {
        recommendations.push('Add expert bios, staff credentials, and author attribution to build authority');
      }
      if (metrics.piqr.sentimentTrust < 60) {
        recommendations.push('Focus on customer satisfaction and review management to improve trust signals');
      }
    }
    
    // Citation recommendations
    if (scores.vai < 60) {
      recommendations.push('Increase AI engine citations by optimizing for featured snippets and AI Overviews');
      recommendations.push('Improve content quality and authority to maintain citation stability');
    }
    
    // Technical recommendations
    if (metrics.technical.coreWebVitals.overall < 50) {
      recommendations.push('Optimize page speed and Core Web Vitals for better technical health');
    }
    
    if (metrics.technical.errorRate > 5) {
      recommendations.push('Fix technical errors and improve site reliability');
    }
    
    // Sentiment recommendations
    if (metrics.sentiment.netSentiment < -10) {
      recommendations.push('Address negative sentiment through improved customer service and review management');
    }
    
    return recommendations;
  }
}

export default EnhancedDAIEngine;
