/**
 * Competitive Benchmarking and Displacement Tracking Service
 * 
 * Monitors competitive landscape, tracks market share, and identifies
 * displacement risks for enhanced competitive intelligence.
 * 
 * @version 1.0.0
 * @author DealershipAI Team
 */

import { CompetitiveMetrics } from '../scoring/enhanced-dai-engine';

export interface Competitor {
  domain: string;
  name: string;
  location: string;
  marketSegment: 'luxury' | 'mainstream' | 'budget' | 'used' | 'service';
  size: 'small' | 'medium' | 'large' | 'enterprise';
  lastUpdated: Date;
}

export interface MarketPosition {
  dealer: {
    domain: string;
    marketShare: number;
    position: number;
    trend: 'up' | 'down' | 'stable';
  };
  competitors: Array<{
    domain: string;
    marketShare: number;
    position: number;
    trend: 'up' | 'down' | 'stable';
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  marketTotal: number;
  marketGrowth: number;
}

export interface DisplacementRisk {
  domain: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  factors: Array<{
    factor: string;
    impact: number; // 0-100
    description: string;
  }>;
  recommendations: string[];
  timeToDisplacement: number; // days
}

export interface ShareOfVoiceAnalysis {
  dealer: {
    totalMentions: number;
    shareOfVoice: number;
    trend: number; // percentage change
  };
  competitors: Array<{
    domain: string;
    totalMentions: number;
    shareOfVoice: number;
    trend: number;
    growthRate: number;
  }>;
  marketTrends: {
    totalMentions: number;
    marketGrowth: number;
    emergingTopics: string[];
    decliningTopics: string[];
  };
}

export interface CompetitiveIntelligence {
  marketPosition: MarketPosition;
  displacementRisks: DisplacementRisk[];
  shareOfVoice: ShareOfVoiceAnalysis;
  competitiveGap: number; // -100 to +100
  marketOpportunities: string[];
  threats: string[];
}

export class CompetitiveAnalyzer {
  private competitors: Competitor[] = [];
  private marketData: Map<string, any> = new Map();
  private historicalData: Map<string, any[]> = new Map();
  
  /**
   * Add competitor to tracking
   */
  addCompetitor(competitor: Competitor): void {
    this.competitors.push(competitor);
  }
  
  /**
   * Update market data for a domain
   */
  updateMarketData(domain: string, data: any): void {
    this.marketData.set(domain, {
      ...data,
      lastUpdated: new Date(),
    });
    
    // Store historical data
    if (!this.historicalData.has(domain)) {
      this.historicalData.set(domain, []);
    }
    
    const historical = this.historicalData.get(domain)!;
    historical.push({
      ...data,
      timestamp: new Date(),
    });
    
    // Keep only last 90 days
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    this.historicalData.set(domain, historical.filter(d => d.timestamp >= cutoffDate));
  }
  
  /**
   * Calculate competitive metrics
   */
  calculateCompetitiveMetrics(dealerDomain: string): CompetitiveMetrics {
    const dealerData = this.marketData.get(dealerDomain);
    const competitorDomains = this.competitors.map(c => c.domain);
    
    if (!dealerData) {
      return this.getDefaultMetrics();
    }
    
    const marketPosition = this.calculateMarketPosition(dealerDomain);
    const shareOfVoice = this.calculateShareOfVoice(dealerDomain);
    const displacementRisk = this.calculateDisplacementRisk(dealerDomain);
    
    return {
      marketShare: marketPosition.dealer.marketShare,
      competitiveGap: this.calculateCompetitiveGap(dealerDomain),
      displacementRisk: displacementRisk.riskScore,
      competitorCount: this.competitors.length,
      topCompetitorScore: this.getTopCompetitorScore(),
      averageCompetitorScore: this.getAverageCompetitorScore(),
      shareOfVoice: shareOfVoice.dealer.shareOfVoice,
      voiceTrend: shareOfVoice.dealer.trend,
    };
  }
  
  /**
   * Get comprehensive competitive intelligence
   */
  getCompetitiveIntelligence(dealerDomain: string): CompetitiveIntelligence {
    const marketPosition = this.calculateMarketPosition(dealerDomain);
    const displacementRisks = this.calculateAllDisplacementRisks(dealerDomain);
    const shareOfVoice = this.calculateShareOfVoice(dealerDomain);
    const competitiveGap = this.calculateCompetitiveGap(dealerDomain);
    
    return {
      marketPosition,
      displacementRisks,
      shareOfVoice,
      competitiveGap,
      marketOpportunities: this.identifyMarketOpportunities(dealerDomain),
      threats: this.identifyThreats(dealerDomain),
    };
  }
  
  /**
   * Calculate market position
   */
  private calculateMarketPosition(dealerDomain: string): MarketPosition {
    const dealerData = this.marketData.get(dealerDomain);
    const competitorData = this.competitors.map(comp => ({
      domain: comp.domain,
      data: this.marketData.get(comp.domain),
    })).filter(comp => comp.data);
    
    if (!dealerData) {
      return this.getDefaultMarketPosition(dealerDomain);
    }
    
    const totalMarket = dealerData.marketShare + competitorData.reduce((sum, comp) => sum + (comp.data?.marketShare || 0), 0);
    
    // Calculate positions
    const allDomains = [{ domain: dealerDomain, marketShare: dealerData.marketShare }, ...competitorData.map(c => ({ domain: c.domain, marketShare: c.data.marketShare }))];
    allDomains.sort((a, b) => b.marketShare - a.marketShare);
    
    const dealerPosition = allDomains.findIndex(d => d.domain === dealerDomain) + 1;
    const dealerTrend = this.calculateTrend(dealerDomain, 'marketShare');
    
    return {
      dealer: {
        domain: dealerDomain,
        marketShare: dealerData.marketShare,
        position: dealerPosition,
        trend: dealerTrend as any,
      },
      competitors: competitorData.map(comp => ({
        domain: comp.domain,
        marketShare: comp.data.marketShare as any,
        position: allDomains.findIndex(d => d.domain === comp.domain) + 1,
        trend: this.calculateTrend(comp.domain, 'marketShare') as any,
        threatLevel: this.calculateThreatLevel(comp.domain, dealerDomain),
      })),
      marketTotal: totalMarket,
      marketGrowth: this.calculateMarketGrowth(),
    };
  }
  
  /**
   * Calculate share of voice
   */
  private calculateShareOfVoice(dealerDomain: string): ShareOfVoiceAnalysis {
    const dealerData = this.marketData.get(dealerDomain);
    const competitorData = this.competitors.map(comp => ({
      domain: comp.domain,
      data: this.marketData.get(comp.domain),
    })).filter(comp => comp.data);
    
    if (!dealerData) {
      return this.getDefaultShareOfVoice(dealerDomain);
    }
    
    const totalMentions = dealerData.totalMentions + competitorData.reduce((sum, comp) => sum + (comp.data?.totalMentions || 0), 0);
    const dealerShareOfVoice = totalMentions > 0 ? (dealerData.totalMentions / totalMentions) * 100 : 0;
    const dealerTrend = this.calculateTrend(dealerDomain, 'totalMentions');
    
    return {
      dealer: {
        totalMentions: dealerData.totalMentions,
        shareOfVoice: dealerShareOfVoice,
        trend: dealerTrend,
      },
      competitors: competitorData.map(comp => ({
        domain: comp.domain,
        totalMentions: comp.data.totalMentions,
        shareOfVoice: totalMentions > 0 ? (comp.data.totalMentions / totalMentions) * 100 : 0,
        trend: this.calculateTrend(comp.domain, 'totalMentions'),
        growthRate: this.calculateGrowthRate(comp.domain, 'totalMentions'),
      })),
      marketTrends: {
        totalMentions,
        marketGrowth: this.calculateMarketGrowth(),
        emergingTopics: this.getEmergingTopics(),
        decliningTopics: this.getDecliningTopics(),
      },
    };
  }
  
  /**
   * Calculate displacement risk
   */
  private calculateDisplacementRisk(dealerDomain: string): DisplacementRisk {
    const dealerData = this.marketData.get(dealerDomain);
    const competitors = this.competitors.filter(comp => this.marketData.has(comp.domain));
    
    if (!dealerData) {
      return this.getDefaultDisplacementRisk(dealerDomain);
    }
    
    let riskScore = 0;
    const factors: Array<{ factor: string; impact: number; description: string }> = [];
    const recommendations: string[] = [];
    
    // Market share decline
    const marketShareTrend = this.calculateTrend(dealerDomain, 'marketShare');
    if (marketShareTrend < -5) {
      riskScore += 20;
      factors.push({
        factor: 'Market Share Decline',
        impact: 20,
        description: `Market share declining by ${Math.abs(marketShareTrend)}%`,
      });
      recommendations.push('Investigate causes of market share decline and implement corrective measures');
    }
    
    // Competitor growth
    const growingCompetitors = competitors.filter(comp => {
      const trend = this.calculateTrend(comp.domain, 'marketShare');
      return trend > 10;
    });
    
    if (growingCompetitors.length > 0) {
      riskScore += 15;
      factors.push({
        factor: 'Competitor Growth',
        impact: 15,
        description: `${growingCompetitors.length} competitors growing rapidly`,
      });
      recommendations.push('Monitor competitor strategies and differentiate your offerings');
    }
    
    // Citation displacement
    const citationTrend = this.calculateTrend(dealerDomain, 'citations');
    if (citationTrend < -10) {
      riskScore += 25;
      factors.push({
        factor: 'Citation Displacement',
        impact: 25,
        description: `Citations declining by ${Math.abs(citationTrend)}%`,
      });
      recommendations.push('Improve content quality and authority to maintain citations');
    }
    
    // Sentiment decline
    const sentimentTrend = this.calculateTrend(dealerDomain, 'sentiment');
    if (sentimentTrend < -15) {
      riskScore += 20;
      factors.push({
        factor: 'Sentiment Decline',
        impact: 20,
        description: `Sentiment declining by ${Math.abs(sentimentTrend)}%`,
      });
      recommendations.push('Address customer concerns and improve service quality');
    }
    
    // Technical issues
    const technicalScore = dealerData.technicalHealth || 100;
    if (technicalScore < 70) {
      riskScore += 15;
      factors.push({
        factor: 'Technical Issues',
        impact: 15,
        description: `Technical health score: ${technicalScore}`,
      });
      recommendations.push('Fix technical issues and improve site performance');
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    
    // Calculate time to displacement
    const timeToDisplacement = this.calculateTimeToDisplacement(riskScore, factors);
    
    return {
      domain: dealerDomain,
      riskLevel,
      riskScore: Math.min(100, riskScore),
      factors,
      recommendations,
      timeToDisplacement,
    };
  }
  
  /**
   * Calculate all displacement risks
   */
  private calculateAllDisplacementRisks(dealerDomain: string): DisplacementRisk[] {
    const risks = [this.calculateDisplacementRisk(dealerDomain)];
    
    // Add competitor risks for context
    this.competitors.forEach(comp => {
      if (this.marketData.has(comp.domain)) {
        risks.push(this.calculateDisplacementRisk(comp.domain));
      }
    });
    
    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }
  
  /**
   * Calculate competitive gap
   */
  private calculateCompetitiveGap(dealerDomain: string): number {
    const dealerData = this.marketData.get(dealerDomain);
    if (!dealerData) return 0;
    
    const competitorScores = this.competitors
      .map(comp => this.marketData.get(comp.domain))
      .filter(data => data)
      .map(data => data.overallScore || 0);
    
    if (competitorScores.length === 0) return 0;
    
    const averageCompetitorScore = competitorScores.reduce((sum, score) => sum + score, 0) / competitorScores.length;
    const dealerScore = dealerData.overallScore || 0;
    
    return Math.round(dealerScore - averageCompetitorScore);
  }
  
  /**
   * Calculate trend for a specific metric
   */
  private calculateTrend(domain: string, metric: string): number {
    const historical = this.historicalData.get(domain);
    if (!historical || historical.length < 2) return 0;
    
    const recent = historical.slice(-7); // Last 7 data points
    const older = historical.slice(-14, -7); // Previous 7 data points
    
    if (recent.length === 0 || older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, data) => sum + (data[metric] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, data) => sum + (data[metric] || 0), 0) / older.length;
    
    if (olderAvg === 0) return 0;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }
  
  /**
   * Calculate growth rate
   */
  private calculateGrowthRate(domain: string, metric: string): number {
    return this.calculateTrend(domain, metric);
  }
  
  /**
   * Calculate market growth
   */
  private calculateMarketGrowth(): number {
    // Simplified market growth calculation
    return Math.floor(Math.random() * 20) - 10; // -10% to +10%
  }
  
  /**
   * Calculate threat level
   */
  private calculateThreatLevel(competitorDomain: string, dealerDomain: string): 'low' | 'medium' | 'high' | 'critical' {
    const competitorData = this.marketData.get(competitorDomain);
    const dealerData = this.marketData.get(dealerDomain);
    
    if (!competitorData || !dealerData) return 'low';
    
    const scoreDifference = (competitorData.overallScore || 0) - (dealerData.overallScore || 0);
    
    if (scoreDifference > 20) return 'critical';
    if (scoreDifference > 10) return 'high';
    if (scoreDifference > 0) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate time to displacement
   */
  private calculateTimeToDisplacement(riskScore: number, factors: any[]): number {
    if (riskScore < 30) return 365; // Low risk = 1 year
    if (riskScore < 50) return 180; // Medium risk = 6 months
    if (riskScore < 70) return 90; // High risk = 3 months
    return 30; // Critical risk = 1 month
  }
  
  /**
   * Identify market opportunities
   */
  private identifyMarketOpportunities(dealerDomain: string): string[] {
    const opportunities: string[] = [];
    
    // Check for underserved segments
    const marketSegments = this.competitors.map(c => c.marketSegment);
    const uniqueSegments = [...new Set(marketSegments)];
    
    if (!uniqueSegments.includes('service')) {
      opportunities.push('Service department expansion opportunity');
    }
    
    if (!uniqueSegments.includes('used')) {
      opportunities.push('Used vehicle market entry opportunity');
    }
    
    // Check for geographic opportunities
    const locations = this.competitors.map(c => c.location);
    const uniqueLocations = [...new Set(locations)];
    
    if (uniqueLocations.length < 3) {
      opportunities.push('Geographic expansion opportunity');
    }
    
    // Check for technology gaps
    const techScores = this.competitors.map(comp => {
      const data = this.marketData.get(comp.domain);
      return data?.technicalHealth || 0;
    });
    
    const averageTechScore = techScores.reduce((sum, score) => sum + score, 0) / techScores.length;
    
    if (averageTechScore < 70) {
      opportunities.push('Technology leadership opportunity');
    }
    
    return opportunities;
  }
  
  /**
   * Identify threats
   */
  private identifyThreats(dealerDomain: string): string[] {
    const threats: string[] = [];
    
    const dealerData = this.marketData.get(dealerDomain);
    if (!dealerData) return threats;
    
    // Check for aggressive competitors
    const aggressiveCompetitors = this.competitors.filter(comp => {
      const data = this.marketData.get(comp.domain);
      return data && data.growthRate > 15;
    });
    
    if (aggressiveCompetitors.length > 0) {
      threats.push(`${aggressiveCompetitors.length} aggressive competitors growing rapidly`);
    }
    
    // Check for market share decline
    const marketShareTrend = this.calculateTrend(dealerDomain, 'marketShare');
    if (marketShareTrend < -10) {
      threats.push('Significant market share decline');
    }
    
    // Check for citation displacement
    const citationTrend = this.calculateTrend(dealerDomain, 'citations');
    if (citationTrend < -20) {
      threats.push('Citation displacement by competitors');
    }
    
    return threats;
  }
  
  /**
   * Get emerging topics
   */
  private getEmergingTopics(): string[] {
    return [
      'Electric vehicles',
      'Online car buying',
      'Contactless service',
      'AI-powered recommendations',
    ];
  }
  
  /**
   * Get declining topics
   */
  private getDecliningTopics(): string[] {
    return [
      'Traditional advertising',
      'Phone-based sales',
      'Paper-based processes',
    ];
  }
  
  /**
   * Get top competitor score
   */
  private getTopCompetitorScore(): number {
    const competitorScores = this.competitors
      .map(comp => this.marketData.get(comp.domain))
      .filter(data => data)
      .map(data => data.overallScore || 0);
    
    return competitorScores.length > 0 ? Math.max(...competitorScores) : 0;
  }
  
  /**
   * Get average competitor score
   */
  private getAverageCompetitorScore(): number {
    const competitorScores = this.competitors
      .map(comp => this.marketData.get(comp.domain))
      .filter(data => data)
      .map(data => data.overallScore || 0);
    
    return competitorScores.length > 0 ? 
      Math.round(competitorScores.reduce((sum, score) => sum + score, 0) / competitorScores.length) : 0;
  }
  
  /**
   * Get default metrics
   */
  private getDefaultMetrics(): CompetitiveMetrics {
    return {
      marketShare: 0,
      competitiveGap: 0,
      displacementRisk: 0,
      competitorCount: 0,
      topCompetitorScore: 0,
      averageCompetitorScore: 0,
      shareOfVoice: 0,
      voiceTrend: 0,
    };
  }
  
  /**
   * Get default market position
   */
  private getDefaultMarketPosition(dealerDomain: string): MarketPosition {
    return {
      dealer: {
        domain: dealerDomain,
        marketShare: 0,
        position: 1,
        trend: 'stable',
      },
      competitors: [],
      marketTotal: 0,
      marketGrowth: 0,
    };
  }
  
  /**
   * Get default share of voice
   */
  private getDefaultShareOfVoice(dealerDomain: string): ShareOfVoiceAnalysis {
    return {
      dealer: {
        totalMentions: 0,
        shareOfVoice: 0,
        trend: 0,
      },
      competitors: [],
      marketTrends: {
        totalMentions: 0,
        marketGrowth: 0,
        emergingTopics: [],
        decliningTopics: [],
      },
    };
  }
  
  /**
   * Get default displacement risk
   */
  private getDefaultDisplacementRisk(dealerDomain: string): DisplacementRisk {
    return {
      domain: dealerDomain,
      riskLevel: 'low',
      riskScore: 0,
      factors: [],
      recommendations: [],
      timeToDisplacement: 365,
    };
  }
  
  /**
   * Simulate competitive data for demo purposes
   */
  simulateCompetitiveData(dealerDomain: string): void {
    // Simulate dealer data
    this.updateMarketData(dealerDomain, {
      marketShare: 15 + Math.random() * 10,
      totalMentions: 100 + Math.floor(Math.random() * 200),
      citations: 50 + Math.floor(Math.random() * 100),
      sentiment: 70 + Math.random() * 20,
      technicalHealth: 80 + Math.random() * 15,
      overallScore: 75 + Math.random() * 20,
      growthRate: -5 + Math.random() * 20,
    });
    
    // Simulate competitor data
    const competitorDomains = [
      'competitor1.com',
      'competitor2.com',
      'competitor3.com',
      'competitor4.com',
    ];
    
    competitorDomains.forEach(domain => {
      this.updateMarketData(domain, {
        marketShare: 10 + Math.random() * 15,
        totalMentions: 80 + Math.floor(Math.random() * 150),
        citations: 40 + Math.floor(Math.random() * 80),
        sentiment: 65 + Math.random() * 25,
        technicalHealth: 75 + Math.random() * 20,
        overallScore: 70 + Math.random() * 25,
        growthRate: -10 + Math.random() * 30,
      });
    });
    
    // Add competitors
    competitorDomains.forEach((domain, index) => {
      this.addCompetitor({
        domain,
        name: `Competitor ${index + 1}`,
        location: `City ${index + 1}`,
        marketSegment: ['luxury', 'mainstream', 'budget', 'used'][index] as any,
        size: ['small', 'medium', 'large', 'enterprise'][index] as any,
        lastUpdated: new Date(),
      });
    });
  }
}

export default CompetitiveAnalyzer;
