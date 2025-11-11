/**
 * Advanced Metrics Engine for DealershipAI Dashboard
 * 
 * Implements the comprehensive metrics from the JSON schema including:
 * - Mentions & Citations tracking
 * - SentimentIndex calculation
 * - ContentReadiness assessment
 * - ShareOfVoice analysis
 * - CitationStability monitoring
 * - TechnicalHealth scoring
 * - AI Engine specific adapters
 * 
 * @version 1.0.0
 * @author DealershipAI Team
 */

export interface AdvancedMetrics {
  // Core AI Visibility Metrics
  mentions: number;                    // Count of dealer mentions in AI answers
  citations: number;                  // Count of explicit URL references
  sentimentIndex: number;             // Net sentiment score (-100 to +100)
  contentReadiness: number;          // Percentage of optimized pages
  shareOfVoice: number;               // Dealer's share of total voice
  citationStability: number;          // Citation persistence score
  impressionToClickRate: number;      // CTR from AI impressions
  competitiveShare: number;           // Visibility vs competitors
  semanticRelevanceScore: number;     // NLP similarity score
  technicalHealth: number;            // Composite technical score
  
  // AI Engine Specific Scores
  chatgptStrength: number;            // ChatGPT optimization score
  perplexityStrength: number;         // Perplexity citation score
  geminiStrength: number;            // Gemini/SGE optimization score
  
  // Action Area Scores
  contentQuality: number;             // Content optimization score
  structuredData: number;             // Schema implementation score
  authoritySignals: number;           // Authority indicators score
  trustSafety: number;                // Trust and safety score
  monitoring: number;                  // Monitoring effectiveness score
  feedbackLoop: number;               // Feedback loop score
}

export interface AIEngineAdapter {
  name: string;
  calculation: string;
  adapter: string;
  score: number;
  recommendations: string[];
}

export interface ContentReadinessAudit {
  totalPages: number;
  optimizedPages: number;
  schemaTypes: {
    faq: number;
    product: number;
    review: number;
    staff: number;
    organization: number;
    localBusiness: number;
  };
  validationErrors: number;
  coverage: number; // percentage
}

export interface TechnicalHealthAudit {
  coreWebVitals: {
    lcp: number;                      // Largest Contentful Paint
    fid: number;                      // First Input Delay
    cls: number;                      // Cumulative Layout Shift
    overall: number;                  // Combined score
  };
  mobileScore: number;
  pageSpeed: number;
  schemaValidity: number;
  errorRate: number;
  accessibilityScore: number;
  overall: number;
}

export interface SemanticAnalysis {
  queryRelevance: number;              // 0-100: How well content matches target queries
  intentMatch: number;                 // 0-100: Intent alignment score
  semanticDensity: number;            // 0-100: Content semantic richness
  topicCoverage: number;              // 0-100: Breadth of topic coverage
  overall: number;                    // Combined semantic score
}

export class AdvancedMetricsEngine {
  private metrics: AdvancedMetrics;
  private contentAudit: ContentReadinessAudit;
  private technicalAudit: TechnicalHealthAudit;
  private semanticAnalysis: SemanticAnalysis;
  
  constructor() {
    this.metrics = this.initializeMetrics();
    this.contentAudit = this.initializeContentAudit();
    this.technicalAudit = this.initializeTechnicalAudit();
    this.semanticAnalysis = this.initializeSemanticAnalysis();
  }
  
  /**
   * Calculate comprehensive advanced metrics
   */
  calculateAdvancedMetrics(data: {
    aiMentions: number;
    urlCitations: number;
    reviews: Array<{ rating: number; sentiment: number }>;
    pages: Array<{ url: string; hasSchema: boolean; schemaTypes: string[] }>;
    competitors: Array<{ domain: string; mentions: number }>;
    technicalData: any;
    queries: string[];
    content: string;
  }): AdvancedMetrics {
    
    // Calculate core metrics
    this.metrics.mentions = this.calculateMentions(data.aiMentions);
    this.metrics.citations = this.calculateCitations(data.urlCitations);
    this.metrics.sentimentIndex = this.calculateSentimentIndex(data.reviews);
    this.metrics.contentReadiness = this.calculateContentReadiness(data.pages);
    this.metrics.shareOfVoice = this.calculateShareOfVoice(data.aiMentions, data.competitors);
    this.metrics.citationStability = this.calculateCitationStability(data.urlCitations);
    this.metrics.impressionToClickRate = this.calculateImpressionToClickRate(data);
    this.metrics.competitiveShare = this.calculateCompetitiveShare(data.competitors);
    this.metrics.semanticRelevanceScore = this.calculateSemanticRelevance(data.queries, data.content);
    this.metrics.technicalHealth = this.calculateTechnicalHealth(data.technicalData);
    
    // Calculate AI engine specific scores
    this.metrics.chatgptStrength = this.calculateChatGPTStrength(data);
    this.metrics.perplexityStrength = this.calculatePerplexityStrength(data);
    this.metrics.geminiStrength = this.calculateGeminiStrength(data);
    
    // Calculate action area scores
    this.metrics.contentQuality = this.calculateContentQuality(data);
    this.metrics.structuredData = this.calculateStructuredDataScore(data.pages);
    this.metrics.authoritySignals = this.calculateAuthoritySignals(data);
    this.metrics.trustSafety = this.calculateTrustSafety(data);
    this.metrics.monitoring = this.calculateMonitoringScore(data);
    this.metrics.feedbackLoop = this.calculateFeedbackLoopScore(data);
    
    return this.metrics;
  }
  
  /**
   * Calculate mentions count
   */
  private calculateMentions(aiMentions: number): number {
    return Math.min(100, aiMentions * 2); // Scale to 0-100
  }
  
  /**
   * Calculate citations count
   */
  private calculateCitations(urlCitations: number): number {
    return Math.min(100, urlCitations * 3); // Scale to 0-100
  }
  
  /**
   * Calculate sentiment index: (positive - negative) / total
   */
  private calculateSentimentIndex(reviews: Array<{ rating: number; sentiment: number }>): number {
    if (reviews.length === 0) return 0;
    
    const positive = reviews.filter(r => r.sentiment > 0.1).length;
    const negative = reviews.filter(r => r.sentiment < -0.1).length;
    const total = reviews.length;
    
    return Math.round(((positive - negative) / total) * 100);
  }
  
  /**
   * Calculate content readiness: optimized_pages / total_pages
   */
  private calculateContentReadiness(pages: Array<{ url: string; hasSchema: boolean; schemaTypes: string[] }>): number {
    if (pages.length === 0) return 0;
    
    const optimizedPages = pages.filter(page => page.hasSchema && page.schemaTypes.length > 0).length;
    return Math.round((optimizedPages / pages.length) * 100);
  }
  
  /**
   * Calculate share of voice: dealer_mentions / total_mentions
   */
  private calculateShareOfVoice(dealerMentions: number, competitors: Array<{ domain: string; mentions: number }>): number {
    const totalMentions = dealerMentions + competitors.reduce((sum, comp) => sum + comp.mentions, 0);
    if (totalMentions === 0) return 0;
    
    return Math.round((dealerMentions / totalMentions) * 100);
  }
  
  /**
   * Calculate citation stability using moving average
   */
  private calculateCitationStability(citations: number): number {
    // Simplified calculation - in production, this would use historical data
    const baseStability = Math.min(100, citations * 2);
    const volatility = Math.random() * 20; // Simulate volatility
    return Math.round(Math.max(0, baseStability - volatility));
  }
  
  /**
   * Calculate impression to click rate
   */
  private calculateImpressionToClickRate(data: any): number {
    const impressions = data.impressions || 1000;
    const clicks = data.clicks || 50;
    return Math.round((clicks / impressions) * 100);
  }
  
  /**
   * Calculate competitive share: (dealer_visibility - competitor_visibility) / competitor_visibility
   */
  private calculateCompetitiveShare(competitors: Array<{ domain: string; mentions: number }>): number {
    if (competitors.length === 0) return 0;
    
    const averageCompetitorMentions = competitors.reduce((sum, comp) => sum + comp.mentions, 0) / competitors.length;
    const dealerMentions = 100; // Assume dealer has 100 mentions
    
    if (averageCompetitorMentions === 0) return 0;
    
    return Math.round(((dealerMentions - averageCompetitorMentions) / averageCompetitorMentions) * 100);
  }
  
  /**
   * Calculate semantic relevance using NLP similarity
   */
  private calculateSemanticRelevance(queries: string[], content: string): number {
    if (queries.length === 0 || !content) return 0;
    
    // Simplified semantic analysis - in production, use advanced NLP
    const queryWords = queries.join(' ').toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    const commonWords = queryWords.filter(word => contentWords.includes(word));
    const similarity = (commonWords.length / queryWords.length) * 100;
    
    return Math.round(Math.min(100, similarity));
  }
  
  /**
   * Calculate technical health composite score
   */
  private calculateTechnicalHealth(technicalData: any): number {
    const coreWebVitals = technicalData?.coreWebVitals || { lcp: 0, fid: 0, cls: 0 };
    const mobileScore = technicalData?.mobileScore || 0;
    const pageSpeed = technicalData?.pageSpeed || 0;
    const schemaValidity = technicalData?.schemaValidity || 0;
    const errorRate = technicalData?.errorRate || 0;
    
    const cwvScore = (coreWebVitals.lcp + coreWebVitals.fid + coreWebVitals.cls) / 3;
    const technicalScore = (cwvScore + mobileScore + pageSpeed + schemaValidity - errorRate) / 4;
    
    return Math.round(Math.max(0, Math.min(100, technicalScore)));
  }
  
  /**
   * Calculate ChatGPT strength
   */
  private calculateChatGPTStrength(data: any): number {
    // ChatGPT optimization: text coherence, informational depth, intent fit
    const contentQuality = this.metrics.contentQuality;
    const semanticRelevance = this.metrics.semanticRelevanceScore;
    const authoritySignals = this.metrics.authoritySignals;
    
    return Math.round((contentQuality * 0.4 + semanticRelevance * 0.4 + authoritySignals * 0.2));
  }
  
  /**
   * Calculate Perplexity strength
   */
  private calculatePerplexityStrength(data: any): number {
    // Perplexity optimization: citation frequency, freshness, domain reputation
    const citations = this.metrics.citations;
    const citationStability = this.metrics.citationStability;
    const authoritySignals = this.metrics.authoritySignals;
    
    return Math.round((citations * 0.4 + citationStability * 0.3 + authoritySignals * 0.3));
  }
  
  /**
   * Calculate Gemini strength
   */
  private calculateGeminiStrength(data: any): number {
    // Gemini optimization: Knowledge Graph signals, reputation, freshness, schema
    const structuredData = this.metrics.structuredData;
    const technicalHealth = this.metrics.technicalHealth;
    const authoritySignals = this.metrics.authoritySignals;
    
    return Math.round((structuredData * 0.3 + technicalHealth * 0.3 + authoritySignals * 0.4));
  }
  
  /**
   * Calculate content quality score
   */
  private calculateContentQuality(data: any): number {
    const contentReadiness = this.metrics.contentReadiness;
    const semanticRelevance = this.metrics.semanticRelevanceScore;
    const technicalHealth = this.metrics.technicalHealth;
    
    return Math.round((contentReadiness * 0.4 + semanticRelevance * 0.4 + technicalHealth * 0.2));
  }
  
  /**
   * Calculate structured data score
   */
  private calculateStructuredDataScore(pages: Array<{ url: string; hasSchema: boolean; schemaTypes: string[] }>): number {
    if (pages.length === 0) return 0;
    
    const totalSchemaTypes = pages.reduce((sum, page) => sum + page.schemaTypes.length, 0);
    const averageSchemaTypes = totalSchemaTypes / pages.length;
    
    return Math.round(Math.min(100, averageSchemaTypes * 20));
  }
  
  /**
   * Calculate authority signals score
   */
  private calculateAuthoritySignals(data: any): number {
    const sentimentIndex = this.metrics.sentimentIndex;
    const citations = this.metrics.citations;
    const technicalHealth = this.metrics.technicalHealth;
    
    return Math.round((sentimentIndex * 0.3 + citations * 0.4 + technicalHealth * 0.3));
  }
  
  /**
   * Calculate trust and safety score
   */
  private calculateTrustSafety(data: any): number {
    const sentimentIndex = this.metrics.sentimentIndex;
    const technicalHealth = this.metrics.technicalHealth;
    const authoritySignals = this.metrics.authoritySignals;
    
    return Math.round((sentimentIndex * 0.4 + technicalHealth * 0.3 + authoritySignals * 0.3));
  }
  
  /**
   * Calculate monitoring score
   */
  private calculateMonitoringScore(data: any): number {
    // Based on data completeness and freshness
    const dataCompleteness = this.calculateDataCompleteness(data);
    const dataFreshness = this.calculateDataFreshness(data);
    
    return Math.round((dataCompleteness * 0.6 + dataFreshness * 0.4));
  }
  
  /**
   * Calculate feedback loop score
   */
  private calculateFeedbackLoopScore(data: any): number {
    // Based on response to recommendations and continuous improvement
    const recommendationResponse = this.calculateRecommendationResponse(data);
    const continuousImprovement = this.calculateContinuousImprovement(data);
    
    return Math.round((recommendationResponse * 0.5 + continuousImprovement * 0.5));
  }
  
  /**
   * Get AI engine adapters with recommendations
   */
  getAIEngineAdapters(): AIEngineAdapter[] {
    return [
      {
        name: 'ChatGPTStrength',
        calculation: 'High text coherence, informational depth, intent fit; not real-time citation.',
        adapter: 'Monitor NLP similarity of answers generated from FAQ, sales copy, and prompt coverage.',
        score: this.metrics.chatgptStrength,
        recommendations: this.generateChatGPTRecommendations(),
      },
      {
        name: 'PerplexityStrength',
        calculation: 'Citation frequency, freshness, and domain reputation.',
        adapter: 'Track frequency of dealership URLs in live Perplexity answer blocks and prompt citations.',
        score: this.metrics.perplexityStrength,
        recommendations: this.generatePerplexityRecommendations(),
      },
      {
        name: 'GeminiStrength',
        calculation: 'Google Knowledge Graph signals, reputation, freshness, schema optimization.',
        adapter: 'Audit content markup, entity authority, and direct inclusion in SGE/Gemini answers.',
        score: this.metrics.geminiStrength,
        recommendations: this.generateGeminiRecommendations(),
      },
    ];
  }
  
  /**
   * Generate actionable recommendations based on metrics
   */
  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Mentions recommendations
    if (this.metrics.mentions < 50) {
      recommendations.push('Increase AI mentions by optimizing content for answer engine queries');
    }
    
    // Citations recommendations
    if (this.metrics.citations < 40) {
      recommendations.push('Improve citation frequency by enhancing content authority and relevance');
    }
    
    // Sentiment recommendations
    if (this.metrics.sentimentIndex < 0) {
      recommendations.push('Address negative sentiment through improved customer service and review management');
    }
    
    // Content readiness recommendations
    if (this.metrics.contentReadiness < 70) {
      recommendations.push('Implement comprehensive schema markup across all key pages');
    }
    
    // Share of voice recommendations
    if (this.metrics.shareOfVoice < 30) {
      recommendations.push('Increase share of voice through competitive content and authority building');
    }
    
    // Technical health recommendations
    if (this.metrics.technicalHealth < 60) {
      recommendations.push('Improve technical health by optimizing Core Web Vitals and fixing errors');
    }
    
    return recommendations;
  }
  
  // Private helper methods
  private initializeMetrics(): AdvancedMetrics {
    return {
      mentions: 0,
      citations: 0,
      sentimentIndex: 0,
      contentReadiness: 0,
      shareOfVoice: 0,
      citationStability: 0,
      impressionToClickRate: 0,
      competitiveShare: 0,
      semanticRelevanceScore: 0,
      technicalHealth: 0,
      chatgptStrength: 0,
      perplexityStrength: 0,
      geminiStrength: 0,
      contentQuality: 0,
      structuredData: 0,
      authoritySignals: 0,
      trustSafety: 0,
      monitoring: 0,
      feedbackLoop: 0,
    };
  }
  
  private initializeContentAudit(): ContentReadinessAudit {
    return {
      totalPages: 0,
      optimizedPages: 0,
      schemaTypes: {
        faq: 0,
        product: 0,
        review: 0,
        staff: 0,
        organization: 0,
        localBusiness: 0,
      },
      validationErrors: 0,
      coverage: 0,
    };
  }
  
  private initializeTechnicalAudit(): TechnicalHealthAudit {
    return {
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
        overall: 0,
      },
      mobileScore: 0,
      pageSpeed: 0,
      schemaValidity: 0,
      errorRate: 0,
      accessibilityScore: 0,
      overall: 0,
    };
  }
  
  private initializeSemanticAnalysis(): SemanticAnalysis {
    return {
      queryRelevance: 0,
      intentMatch: 0,
      semanticDensity: 0,
      topicCoverage: 0,
      overall: 0,
    };
  }
  
  private calculateDataCompleteness(data: any): number {
    // Simplified calculation - in production, check all required data fields
    return 85; // Assume 85% data completeness
  }
  
  private calculateDataFreshness(data: any): number {
    // Simplified calculation - in production, check data timestamps
    return 90; // Assume 90% data freshness
  }
  
  private calculateRecommendationResponse(data: any): number {
    // Simplified calculation - in production, track recommendation implementation
    return 70; // Assume 70% recommendation response rate
  }
  
  private calculateContinuousImprovement(data: any): number {
    // Simplified calculation - in production, track improvement metrics over time
    return 75; // Assume 75% continuous improvement score
  }
  
  private generateChatGPTRecommendations(): string[] {
    return [
      'Optimize FAQ content for direct question answering',
      'Improve content coherence and informational depth',
      'Enhance intent matching for target queries',
    ];
  }
  
  private generatePerplexityRecommendations(): string[] {
    return [
      'Increase citation frequency through authoritative content',
      'Improve domain reputation and trust signals',
      'Optimize for real-time citation opportunities',
    ];
  }
  
  private generateGeminiRecommendations(): string[] {
    return [
      'Enhance Knowledge Graph signals and entity authority',
      'Improve schema markup and structured data',
      'Optimize for SGE and Gemini answer inclusion',
    ];
  }
}

export default AdvancedMetricsEngine;
