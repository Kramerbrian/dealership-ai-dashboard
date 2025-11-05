/**
 * Viral Growth Engine
 * Powers referral loops, sharing mechanics, and social proof
 */

export interface ReferralData {
  userId: string;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  rewardsEarned: number;
}

export interface ShareEvent {
  type: 'audit_report' | 'dashboard' | 'achievement';
  userId: string;
  shareUrl: string;
  platform?: 'twitter' | 'linkedin' | 'email' | 'copy';
  metadata?: Record<string, any>;
}

export class ViralGrowthEngine {
  private referralCodes: Map<string, ReferralData> = new Map();
  private shareEvents: ShareEvent[] = [];

  /**
   * Generate unique referral code for user
   */
  generateReferralCode(userId: string): string {
    const code = `REF${userId.slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    
    this.referralCodes.set(code, {
      userId,
      referralCode: code,
      createdAt: new Date(),
      rewardsEarned: 0,
    });

    return code;
  }

  /**
   * Track share event
   */
  trackShare(event: ShareEvent): void {
    this.shareEvents.push({
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
      },
    });

    // Fire GA event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: event.platform || 'copy',
        content_type: event.type,
        item_id: event.shareUrl,
      });
    }
  }

  /**
   * Calculate viral coefficient
   */
  calculateViralCoefficient(userId: string): number {
    const userShares = this.shareEvents.filter(e => e.userId === userId);
    const conversions = userShares.filter(e => 
      e.metadata?.converted === true
    ).length;

    return conversions / Math.max(1, userShares.length);
  }

  /**
   * Get referral stats
   */
  getReferralStats(userId: string): {
    code: string;
    totalReferrals: number;
    activeReferrals: number;
    rewardsEarned: number;
  } {
    const code = Array.from(this.referralCodes.values())
      .find(r => r.userId === userId)?.referralCode || '';

    const referrals = Array.from(this.referralCodes.values())
      .filter(r => r.referredBy === userId);

    return {
      code,
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(r => 
        new Date(r.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      rewardsEarned: referrals.reduce((sum, r) => sum + r.rewardsEarned, 0),
    };
  }

  /**
   * Process referral signup
   */
  processReferral(code: string, newUserId: string): boolean {
    const referral = this.referralCodes.get(code);
    if (!referral) return false;

    // Update referral data
    this.referralCodes.set(code, {
      ...referral,
      rewardsEarned: referral.rewardsEarned + 1,
    });

    // Create new referral record for new user
    const newCode = this.generateReferralCode(newUserId);
    this.referralCodes.set(newCode, {
      userId: newUserId,
      referralCode: newCode,
      referredBy: referral.userId,
      createdAt: new Date(),
      rewardsEarned: 0,
    });

    return true;
  }
}

export const viralGrowthEngine = new ViralGrowthEngine();

/**
 * React hook for referral system
 */
export function useReferral(userId?: string) {
  const [stats, setStats] = React.useState<{
    code: string;
    totalReferrals: number;
    activeReferrals: number;
    rewardsEarned: number;
  } | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    const referralStats = viralGrowthEngine.getReferralStats(userId);
    setStats(referralStats);
  }, [userId]);

  const generateCode = React.useCallback(() => {
    if (!userId) return '';
    return viralGrowthEngine.generateReferralCode(userId);
  }, [userId]);

  const shareReport = React.useCallback((shareUrl: string, platform?: string) => {
    if (!userId) return;
    viralGrowthEngine.trackShare({
      type: 'audit_report',
      userId,
      shareUrl,
      platform: platform as any,
    });
  }, [userId]);

  return {
    stats,
    generateCode,
    shareReport,
  };
}

