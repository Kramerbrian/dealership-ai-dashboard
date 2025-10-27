/**
 * Enhanced Dashboard API Route
 * Provides tier-based dashboard data with session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TierManager } from '@/lib/tier-manager';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user tier and session information
    const userTier = await TierManager.getUserTier(userId);
    const sessionInfo = await TierManager.checkSessionLimit(userId);

    // Check if user has remaining sessions
    if (!sessionInfo.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Session limit reached',
        tier: userTier,
        sessionsUsed: sessionInfo.limit,
        sessionsLimit: sessionInfo.limit,
        upgradeRequired: true
      });
    }

    // Increment session count
    const sessionIncremented = await TierManager.incrementSession(userId);
    if (!sessionIncremented) {
      return NextResponse.json({
        success: false,
        error: 'Failed to increment session',
        tier: userTier,
        sessionsUsed: sessionInfo.limit,
        sessionsLimit: sessionInfo.limit
      });
    }

    // Get dealership data (mock for now)
    const dealershipData = {
      id: 'demo-dealership',
      name: 'Demo Dealership',
      domain: 'demo-dealership.com',
      location: 'Naples, FL',
      aiVisibilityScore: 78.5,
      lastUpdated: new Date().toISOString()
    };

    // Get tier-specific features
    const features = await getTierFeatures(userTier);

    return NextResponse.json({
      success: true,
      data: {
        dealershipId: dealershipData.id,
        dealershipName: dealershipData.name,
        userTier,
        sessionsUsed: sessionInfo.limit - sessionInfo.remaining + 1,
        sessionsLimit: sessionInfo.limit,
        features,
        dealership: dealershipData,
        tierInfo: TierManager.getTierInfo(userTier)
      }
    });

  } catch (error) {
    console.error('Enhanced dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

/**
 * Get features available for a tier
 */
async function getTierFeatures(tier: string) {
  const features = {
    FREE: {
      basicScores: true,
      overview: true,
      eeatScoring: false,
      mysteryShop: false,
      apiAccess: false,
      whiteLabel: false
    },
    PRO: {
      basicScores: true,
      overview: true,
      eeatScoring: true,
      mysteryShop: false,
      apiAccess: false,
      whiteLabel: false
    },
    ENTERPRISE: {
      basicScores: true,
      overview: true,
      eeatScoring: true,
      mysteryShop: true,
      apiAccess: true,
      whiteLabel: true
    }
  };

  return features[tier as keyof typeof features] || features.FREE;
}
