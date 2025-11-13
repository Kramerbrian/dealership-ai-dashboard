// Competitive Intelligence War Room
// Real-time competitive analysis and rankings

interface Competitor {
  id: string;
  name: string;
  domain: string;
  aiScore: number;
  rank: number;
  marketShare: number;
  gap: number; // Points behind/ahead of user
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: 'score_change' | 'new_competitor' | 'market_shift' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  actionable: boolean;
  actionUrl?: string;
}

interface MarketPosition {
  totalCompetitors: number;
  userRank: number;
  marketLeader: string;
  marketGap: number;
  opportunityScore: number;
}

interface CompetitiveInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  actionable: boolean;
  estimatedROI: number;
}

export class CompetitiveWarRoom {
  private redis: any;
  private prisma: any;

  constructor(redis: any, prisma: any) {
    this.redis = redis;
    this.prisma = prisma;
  }

  // Get real-time competitive rankings
  async getCompetitiveRankings(dealershipId: string, market: string): Promise<{
    competitors: Competitor[];
    marketPosition: MarketPosition;
    insights: CompetitiveInsight[];
  }> {
    try {
      // Check cache first
      const cacheKey = `competitive:${dealershipId}:${market}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get user's dealership
      const userDealership = await this.prisma.dealership.findUnique({
        where: { id: dealershipId },
        include: {
          scores: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!userDealership) {
        throw new Error('Dealership not found');
      }

      // Get competitors in the same market
      const competitors = await this.getMarketCompetitors(market, dealershipId);
      
      // Calculate rankings
      const rankings = await this.calculateRankings(competitors, userDealership);
      
      // Generate insights
      const insights = await this.generateInsights(rankings, userDealership);
      
      // Get market position
      const marketPosition = this.calculateMarketPosition(rankings, userDealership);

      const result = {
        competitors: rankings,
        marketPosition,
        insights
      };

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(result));

      return result;

    } catch (error) {
      console.error('Competitive rankings error:', error);
      throw error;
    }
  }

  // Get market competitors
  private async getMarketCompetitors(market: string, excludeId: string): Promise<any[]> {
    // In production, this would query a database of known competitors
    // For now, we'll simulate with mock data
    const mockCompetitors = [
      {
        id: 'comp-1',
        name: 'Premier Auto Group',
        domain: 'premierauto.com',
        city: market,
        scores: [{ overallScore: 87 }]
      },
      {
        id: 'comp-2', 
        name: 'Elite Motors',
        domain: 'elitemotors.com',
        city: market,
        scores: [{ overallScore: 82 }]
      },
      {
        id: 'comp-3',
        name: 'Metro Car Center',
        domain: 'metrocar.com', 
        city: market,
        scores: [{ overallScore: 78 }]
      },
      {
        id: 'comp-4',
        name: 'City Auto Mall',
        domain: 'cityautomall.com',
        city: market,
        scores: [{ overallScore: 75 }]
      }
    ];

    return mockCompetitors;
  }

  // Calculate competitive rankings
  private async calculateRankings(competitors: any[], userDealership: any): Promise<Competitor[]> {
    const userScore = userDealership.scores[0]?.overallScore || 0;
    
    const rankings = competitors.map((comp, index) => {
      const score = comp.scores[0]?.overallScore || Math.floor(Math.random() * 30) + 60;
      const gap = score - userScore;
      
      return {
        id: comp.id,
        name: comp.name,
        domain: comp.domain,
        aiScore: score,
        rank: index + 1,
        marketShare: Math.floor(Math.random() * 20) + 10,
        gap,
        strengths: this.generateStrengths(score),
        weaknesses: this.generateWeaknesses(score),
        lastUpdated: new Date(),
        alerts: this.generateAlerts(comp, gap)
      };
    });

    // Sort by score descending
    return rankings.sort((a, b) => b.aiScore - a.aiScore);
  }

  // Generate competitive insights
  private async generateInsights(rankings: Competitor[], userDealership: any): Promise<CompetitiveInsight[]> {
    const insights: CompetitiveInsight[] = [];
    const userScore = userDealership.scores[0]?.overallScore || 0;

    // Find biggest competitor gap
    const biggestGap = rankings.find(c => c.gap > 0);
    if (biggestGap) {
      insights.push({
        id: 'gap-analysis',
        title: `You're ${biggestGap.gap} points behind ${biggestGap.name}`,
        description: `${biggestGap.name} is dominating the market with a ${biggestGap.aiScore} AI score. Focus on their weaknesses to close the gap.`,
        impact: 'high',
        confidence: 0.9,
        source: 'AI Analysis',
        actionable: true,
        estimatedROI: biggestGap.gap * 2.5
      });
    }

    // Market opportunity
    const avgScore = rankings.reduce((sum, c) => sum + c.aiScore, 0) / rankings.length;
    if (userScore > avgScore) {
      insights.push({
        id: 'market-opportunity',
        title: 'Market Leadership Opportunity',
        description: `You're above the market average. Focus on maintaining your lead and expanding your advantage.`,
        impact: 'medium',
        confidence: 0.8,
        source: 'Market Analysis',
        actionable: true,
        estimatedROI: 15
      });
    }

    // Quick wins
    const lowestCompetitor = rankings[rankings.length - 1];
    if (lowestCompetitor && userScore < lowestCompetitor.aiScore) {
      insights.push({
        id: 'quick-win',
        title: `Beat ${lowestCompetitor.name} in 30 days`,
        description: `You're only ${Math.abs(lowestCompetitor.gap)} points behind. Focus on their main weakness: ${lowestCompetitor.weaknesses[0]}.`,
        impact: 'high',
        confidence: 0.85,
        source: 'Gap Analysis',
        actionable: true,
        estimatedROI: 25
      });
    }

    return insights;
  }

  // Calculate market position
  private calculateMarketPosition(rankings: Competitor[], userDealership: any): MarketPosition {
    const userScore = userDealership.scores[0]?.overallScore || 0;
    const userRank = rankings.findIndex(c => c.gap <= 0) + 1 || rankings.length + 1;
    const marketLeader = rankings[0]?.name || 'Unknown';
    const marketGap = rankings[0]?.gap || 0;
    
    return {
      totalCompetitors: rankings.length,
      userRank,
      marketLeader,
      marketGap,
      opportunityScore: Math.max(0, 100 - userRank * 10)
    };
  }

  // Generate competitor strengths
  private generateStrengths(score: number): string[] {
    const strengths = [];
    if (score >= 80) strengths.push('Excellent AI visibility');
    if (score >= 70) strengths.push('Strong local presence');
    if (score >= 60) strengths.push('Good review management');
    if (score >= 50) strengths.push('Basic optimization');
    return strengths;
  }

  // Generate competitor weaknesses
  private generateWeaknesses(score: number): string[] {
    const weaknesses = [];
    if (score < 60) weaknesses.push('Poor AI visibility');
    if (score < 70) weaknesses.push('Weak local SEO');
    if (score < 80) weaknesses.push('Limited structured data');
    if (score < 90) weaknesses.push('Inconsistent branding');
    return weaknesses;
  }

  // Generate competitive alerts
  private generateAlerts(competitor: any, gap: number): Alert[] {
    const alerts: Alert[] = [];
    
    if (gap > 20) {
      alerts.push({
        id: `alert-${competitor.id}-gap`,
        type: 'score_change',
        severity: 'critical',
        message: `${competitor.name} is ${gap} points ahead - major competitive threat`,
        timestamp: new Date(),
        actionable: true,
        actionUrl: '/dashboard/competitive'
      });
    }

    if (Math.random() > 0.7) {
      alerts.push({
        id: `alert-${competitor.id}-opportunity`,
        type: 'opportunity',
        severity: 'medium',
        message: `New opportunity detected: ${competitor.name} has a weakness in ${competitor.weaknesses?.[0] || 'AI optimization'}`,
        timestamp: new Date(),
        actionable: true
      });
    }

    return alerts;
  }

  // Set up competitive monitoring
  async setupMonitoring(dealershipId: string, competitors: string[]): Promise<void> {
    try {
      // Store competitor list
      await this.redis.setex(
        `monitoring:${dealershipId}`,
        86400 * 30, // 30 days
        JSON.stringify(competitors)
      );

      // Schedule regular analysis
      await this.scheduleCompetitiveAnalysis(dealershipId);

    } catch (error) {
      console.error('Setup monitoring error:', error);
      throw error;
    }
  }

  // Schedule competitive analysis
  private async scheduleCompetitiveAnalysis(dealershipId: string): Promise<void> {
    // In production, this would use a job queue like Bull or Agenda
    // For now, we'll just log the scheduling
    console.log(`Scheduled competitive analysis for dealership ${dealershipId}`);
  }

  // Get competitive alerts
  async getAlerts(dealershipId: string): Promise<Alert[]> {
    try {
      const cacheKey = `alerts:${dealershipId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Generate fresh alerts
      const rankings = await this.getCompetitiveRankings(dealershipId, 'default');
      const allAlerts = rankings.competitors.flatMap(c => c.alerts);

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(allAlerts));

      return allAlerts;

    } catch (error) {
      console.error('Get alerts error:', error);
      return [];
    }
  }

  // Mark alert as read
  async markAlertAsRead(dealershipId: string, alertId: string): Promise<void> {
    try {
      const cacheKey = `alerts:${dealershipId}`;
      const alerts = await this.getAlerts(dealershipId);
      const updatedAlerts = alerts.filter(a => a.id !== alertId);
      
      await this.redis.setex(cacheKey, 3600, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Mark alert as read error:', error);
    }
  }
}
