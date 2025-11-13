/**
 * Competitive Intelligence Sharing Engine
 * Enables viral growth through competitive insights sharing
 */

export interface CompetitiveInsight {
  id: string;
  dealershipId: string;
  competitorName: string;
  insight: string;
  value: number;
  category: 'visibility' | 'pricing' | 'marketing' | 'operations';
  sharedAt: Date;
  shareCount: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface SharingMetrics {
  totalShares: number;
  viralCoefficient: number;
  engagementRate: number;
  reach: number;
  conversionRate: number;
}

export class CompetitiveIntelligenceSharingEngine {
  private insights: CompetitiveInsight[] = [];
  private sharingMetrics: SharingMetrics = {
    totalShares: 0,
    viralCoefficient: 0,
    engagementRate: 0,
    reach: 0,
    conversionRate: 0
  };

  /**
   * Generate shareable competitive insights
   */
  async generateShareableInsights(dealershipId: string): Promise<CompetitiveInsight[]> {
    const insights: CompetitiveInsight[] = [
      {
        id: `insight-${Date.now()}-1`,
        dealershipId,
        competitorName: 'Local Competitor A',
        insight: 'Competitor A increased their AI visibility by 23% this month through schema optimization',
        value: 85,
        category: 'visibility',
        sharedAt: new Date(),
        shareCount: 0,
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: `insight-${Date.now()}-2`,
        dealershipId,
        competitorName: 'Regional Leader B',
        insight: 'Leader B is dominating ChatGPT results with 89% visibility score',
        value: 92,
        category: 'marketing',
        sharedAt: new Date(),
        shareCount: 0,
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: `insight-${Date.now()}-3`,
        dealershipId,
        competitorName: 'Market Challenger C',
        insight: 'Challenger C reduced their QAI score by 15% due to poor review management',
        value: 67,
        category: 'operations',
        sharedAt: new Date(),
        shareCount: 0,
        engagement: { likes: 0, comments: 0, shares: 0 }
      }
    ];

    this.insights.push(...insights);
    return insights;
  }

  /**
   * Share insight across platforms
   */
  async shareInsight(insightId: string, platforms: string[]): Promise<{ success: boolean; shareUrls: string[] }> {
    const insight = this.insights.find(i => i.id === insightId);
    if (!insight) {
      return { success: false, shareUrls: [] };
    }

    const shareUrls: string[] = [];
    
    for (const platform of platforms) {
      const shareUrl = await this.generateShareUrl(insight, platform);
      shareUrls.push(shareUrl);
    }

    // Update metrics
    insight.shareCount += platforms.length;
    this.sharingMetrics.totalShares += platforms.length;
    this.updateViralMetrics();

    return { success: true, shareUrls };
  }

  /**
   * Track engagement on shared content
   */
  async trackEngagement(insightId: string, type: 'like' | 'comment' | 'share'): Promise<void> {
    const insight = this.insights.find(i => i.id === insightId);
    if (!insight) return;

    switch (type) {
      case 'like':
        insight.engagement.likes++;
        break;
      case 'comment':
        insight.engagement.comments++;
        break;
      case 'share':
        insight.engagement.shares++;
        break;
    }

    this.updateViralMetrics();
  }

  /**
   * Get viral growth metrics
   */
  getViralMetrics(): SharingMetrics {
    return this.sharingMetrics;
  }

  /**
   * Get top performing insights
   */
  getTopInsights(limit: number = 10): CompetitiveInsight[] {
    return this.insights
      .sort((a, b) => {
        const aScore = a.engagement.likes + a.engagement.comments + a.engagement.shares;
        const bScore = b.engagement.likes + b.engagement.comments + b.engagement.shares;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  private async generateShareUrl(insight: CompetitiveInsight, platform: string): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com';
    const encodedInsight = encodeURIComponent(JSON.stringify({
      id: insight.id,
      competitor: insight.competitorName,
      insight: insight.insight,
      value: insight.value
    }));

    switch (platform) {
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl}/insights/${insight.id}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(insight.insight)}&url=${baseUrl}/insights/${insight.id}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${baseUrl}/insights/${insight.id}`;
      case 'email':
        return `mailto:?subject=${encodeURIComponent('Competitive Intelligence Insight')}&body=${encodeURIComponent(insight.insight)}`;
      default:
        return `${baseUrl}/insights/${insight.id}`;
    }
  }

  private updateViralMetrics(): void {
    const totalEngagement = this.insights.reduce((sum, insight) => 
      sum + insight.engagement.likes + insight.engagement.comments + insight.engagement.shares, 0
    );
    
    this.sharingMetrics.engagementRate = totalEngagement / Math.max(this.sharingMetrics.totalShares, 1);
    this.sharingMetrics.viralCoefficient = this.sharingMetrics.totalShares / Math.max(this.insights.length, 1);
    this.sharingMetrics.reach = this.sharingMetrics.totalShares * 2.5; // Estimated reach multiplier
    this.sharingMetrics.conversionRate = 0.12; // 12% conversion rate from shares to signups
  }
}
