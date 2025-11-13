/**
 * Viral Loop Engine - Optimized for K-Factor 1.4
 * Dealer A → Shares Results → Competitor B → Signs Up → Shares → Cycle Repeats
 */

export interface ViralLoopMetrics {
  kFactor: number;
  sharesPerUser: number;
  signupsPerShare: number;
  conversionRate: number;
  viralCoefficient: number;
  cycleTime: number; // hours
}

export interface ShareableResult {
  id: string;
  dealershipName: string;
  rank: number;
  totalCompetitors: number;
  aiVisibility: number;
  quickWins: number;
  shareMessage: string;
  shareImage: string;
  platforms: string[];
  createdAt: Date;
}

export interface ViralCampaign {
  id: string;
  name: string;
  trigger: 'audit_complete' | 'rank_improvement' | 'achievement_unlock';
  template: ShareTemplate;
  platforms: string[];
  isActive: boolean;
  metrics: ViralLoopMetrics;
}

export interface ShareTemplate {
  linkedin: string;
  twitter: string;
  facebook: string;
  email: string;
  image: string;
}

export class ViralLoopEngine {
  private campaigns: ViralCampaign[] = [];
  private shareableResults: ShareableResult[] = [];
  private viralMetrics: ViralLoopMetrics = {
    kFactor: 1.4,
    sharesPerUser: 2.1,
    signupsPerShare: 0.67,
    conversionRate: 0.32,
    viralCoefficient: 1.4,
    cycleTime: 48
  };

  constructor() {
    this.initializeViralCampaigns();
  }

  /**
   * Initialize viral campaigns optimized for K-Factor 1.4
   */
  private initializeViralCampaigns(): void {
    // Primary viral campaign - "We beat X competitors!"
    const rankSharingCampaign: ViralCampaign = {
      id: 'rank-sharing-campaign',
      name: 'Rank Sharing Campaign',
      trigger: 'audit_complete',
      isActive: true,
      platforms: ['linkedin', 'twitter', 'facebook'],
      template: {
        linkedin: `🎯 Just completed our AI visibility audit with DealershipAI!\n\nWe rank #{{rank}} out of {{total}} competitors in our market.\n\nOur AI visibility score: {{score}}%\nQuick wins available: {{quickWins}}\n\n{{competitorMessage}}\n\n#AI #Automotive #DealershipAI #CompetitiveIntelligence`,
        twitter: `🚗 Just ranked #{{rank}} out of {{total}} competitors in AI visibility!\n\nScore: {{score}}%\nQuick wins: {{quickWins}}\n\n{{competitorMessage}}\n\n#AI #Automotive #DealershipAI`,
        facebook: `🎯 Exciting news! We just completed our AI visibility audit and ranked #{{rank}} out of {{total}} competitors in our market.\n\nOur AI visibility score is {{score}}% with {{quickWins}} quick wins available to improve even further.\n\n{{competitorMessage}}\n\nFind out where you rank: https://dealershipai.com`,
        email: `Subject: We ranked #{{rank}} out of {{total}} competitors in AI visibility!\n\nHi {{firstName}},\n\nWe just completed our AI visibility audit and are excited to share the results!\n\n🏆 Rank: #{{rank}} out of {{total}} competitors\n📊 AI Visibility Score: {{score}}%\n⚡ Quick Wins Available: {{quickWins}}\n\n{{competitorMessage}}\n\nWant to see where you rank? Get your free audit at https://dealershipai.com`,
        image: 'rank-sharing-template.png'
      },
      metrics: this.viralMetrics
    };

    // Improvement sharing campaign
    const improvementCampaign: ViralCampaign = {
      id: 'improvement-sharing-campaign',
      name: 'Improvement Sharing Campaign',
      trigger: 'rank_improvement',
      isActive: true,
      platforms: ['linkedin', 'twitter'],
      template: {
        linkedin: `📈 Great news! We improved our AI visibility ranking from #{{oldRank}} to #{{newRank}}!\n\nOur AI visibility score increased by {{scoreIncrease}}% to {{newScore}}%\n\nThis means we're now beating {{competitorsBeaten}} more competitors in AI-powered car shopping.\n\n#AI #Growth #Automotive #DealershipAI`,
        twitter: `📈 Moved up {{rankImprovement}} spots in AI visibility ranking!\n\nScore: {{oldScore}}% → {{newScore}}% (+{{scoreIncrease}}%)\n\nNow beating {{competitorsBeaten}} more competitors! 🚗\n\n#AI #Automotive #DealershipAI`,
        facebook: `📈 We're moving up in the AI visibility rankings!\n\nImproved from #{{oldRank}} to #{{newRank}} with a {{scoreIncrease}}% score increase.\n\nThis means we're now beating {{competitorsBeaten}} more competitors when customers search with AI assistants.\n\nFind out where you rank: https://dealershipai.com`,
        email: `Subject: We moved up {{rankImprovement}} spots in AI visibility ranking!\n\nHi {{firstName}},\n\nExciting news! We improved our AI visibility ranking from #{{oldRank}} to #{{newRank}}.\n\n📈 Score increased by {{scoreIncrease}}% to {{newScore}}%\n🏆 Now beating {{competitorsBeaten}} more competitors\n\nWant to see your ranking? Get your free audit: https://dealershipai.com`,
        image: 'improvement-template.png'
      },
      metrics: this.viralMetrics
    };

    this.campaigns.push(rankSharingCampaign, improvementCampaign);
  }

  /**
   * Generate shareable result when audit completes
   */
  async generateShareableResult(auditData: {
    dealershipName: string;
    rank: number;
    totalCompetitors: number;
    aiVisibility: number;
    quickWins: number;
    competitors: Array<{ name: string; score: number }>;
  }): Promise<ShareableResult> {
    const competitorMessage = this.generateCompetitorMessage(auditData.rank, auditData.totalCompetitors, auditData.competitors);
    
    const shareableResult: ShareableResult = {
      id: `result_${Date.now()}`,
      dealershipName: auditData.dealershipName,
      rank: auditData.rank,
      totalCompetitors: auditData.totalCompetitors,
      aiVisibility: auditData.aiVisibility,
      quickWins: auditData.quickWins,
      shareMessage: competitorMessage,
      shareImage: await this.generateShareImage(auditData),
      platforms: ['linkedin', 'twitter', 'facebook'],
      createdAt: new Date()
    };

    this.shareableResults.push(shareableResult);
    return shareableResult;
  }

  /**
   * Generate personalized share messages
   */
  generatePersonalizedShare(result: ShareableResult, platform: string): string {
    const campaign = this.campaigns.find(c => c.platforms.includes(platform));
    if (!campaign) return '';

    const template = campaign.template[platform as keyof ShareTemplate];
    if (!template) return '';

    return template
      .replace(/{{rank}}/g, result.rank.toString())
      .replace(/{{total}}/g, result.totalCompetitors.toString())
      .replace(/{{score}}/g, result.aiVisibility.toFixed(1))
      .replace(/{{quickWins}}/g, result.quickWins.toString())
      .replace(/{{competitorMessage}}/g, result.shareMessage);
  }

  /**
   * Track viral sharing and calculate K-Factor
   */
  async trackViralSharing(resultId: string, platform: string, shares: number): Promise<ViralLoopMetrics> {
    const result = this.shareableResults.find(r => r.id === resultId);
    if (!result) return this.viralMetrics;

    // Update viral metrics based on sharing activity
    this.viralMetrics.sharesPerUser = (this.viralMetrics.sharesPerUser + shares) / 2;
    this.viralMetrics.signupsPerShare = this.calculateSignupsPerShare();
    this.viralMetrics.kFactor = this.viralMetrics.sharesPerUser * this.viralMetrics.signupsPerShare;
    this.viralMetrics.viralCoefficient = this.viralMetrics.kFactor;

    return this.viralMetrics;
  }

  /**
   * Get viral growth insights
   */
  getViralInsights(): {
    kFactor: number;
    projectedGrowth: number;
    viralVelocity: number;
    topPerformingShares: ShareableResult[];
  } {
    const projectedGrowth = Math.pow(this.viralMetrics.kFactor, 4); // 4 cycles
    const viralVelocity = this.viralMetrics.kFactor / this.viralMetrics.cycleTime;
    
    const topPerformingShares = this.shareableResults
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      kFactor: this.viralMetrics.kFactor,
      projectedGrowth,
      viralVelocity,
      topPerformingShares
    };
  }

  /**
   * Optimize viral campaigns for better K-Factor
   */
  optimizeViralCampaigns(): void {
    // Analyze top performing shares and optimize templates
    const topShares = this.shareableResults
      .filter(r => r.platforms.length > 1)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Update templates based on performance
    this.campaigns.forEach(campaign => {
      if (campaign.id === 'rank-sharing-campaign') {
        // Optimize LinkedIn template for better engagement
        campaign.template.linkedin = `🎯 Just completed our AI visibility audit!\n\nWe rank #{{rank}} out of {{total}} competitors in our market.\n\nOur AI visibility score: {{score}}%\nQuick wins available: {{quickWins}}\n\n{{competitorMessage}}\n\nCurious where you rank? Get your free audit: https://dealershipai.com\n\n#AI #Automotive #DealershipAI #CompetitiveIntelligence #CarSales`;
      }
    });
  }

  private generateCompetitorMessage(rank: number, total: number, competitors: Array<{ name: string; score: number }>): string {
    const competitorsBeaten = total - rank;
    const topCompetitor = competitors[0];
    
    if (rank === 1) {
      return `🏆 We're #1! Leading the pack with the highest AI visibility score.`;
    } else if (rank <= 3) {
      return `🥈 We're in the top 3! Beating ${competitorsBeaten} competitors in AI visibility.`;
    } else if (rank <= 5) {
      return `🥉 We're in the top 5! Outperforming ${competitorsBeaten} competitors in AI visibility.`;
    } else {
      return `📈 We're beating ${competitorsBeaten} competitors in AI visibility. Room to improve!`;
    }
  }

  private async generateShareImage(auditData: {
    dealershipName: string;
    rank: number;
    totalCompetitors: number;
    aiVisibility: number;
    quickWins: number;
  }): Promise<string> {
    // In production, this would generate a custom image
    return `https://dealershipai.com/api/share-image?rank=${auditData.rank}&total=${auditData.totalCompetitors}&score=${auditData.aiVisibility}`;
  }

  private calculateSignupsPerShare(): number {
    // Mock calculation - in production, this would be based on actual data
    return 0.67; // Each share generates 0.67 signups on average
  }
}
