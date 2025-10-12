/**
 * DealershipAI v2.0 - Tier Management API
 * Handles tier information, session limits, and upgrade recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { TierManager } from '@/lib/tier-manager';
import { GeoPoolManager } from '@/lib/redis';
import { SecurityLogger } from '@/lib/security-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const plan = searchParams.get('plan') || 'FREE';

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    // Get tier information
    const tierInfo = TierManager.getTierInfo(plan as any);
    
    // Get session usage
    const sessionsUsed = await GeoPoolManager.getSessionCount(userId);
    const sessionsRemaining = Math.max(0, tierInfo.sessionLimit - sessionsUsed);
    
    // Get monthly cost
    const monthlyCost = await GeoPoolManager.getMonthlyCost(userId);
    
    // Get upgrade recommendation
    const upgradeRecommendation = TierManager.getUpgradeRecommendation(plan as any, sessionsUsed);
    
    // Get feature matrix
    const featureMatrix = TierManager.getFeatureMatrix();

    // Log tier check
    await SecurityLogger.logEvent({
      eventType: 'tier.checked',
      actorId: userId,
      payload: {
        plan,
        sessionsUsed,
        sessionsRemaining,
        monthlyCost
      }
    });

    return NextResponse.json({
      tier: tierInfo,
      usage: {
        sessionsUsed,
        sessionsRemaining,
        monthlyCost: Math.round(monthlyCost * 100) / 100
      },
      upgradeRecommendation,
      featureMatrix,
      allTiers: TierManager.getAllTiers()
    });

  } catch (error) {
    console.error('Tier API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, targetPlan, monthlyRevenue } = body;

    if (!userId || !plan || !targetPlan) {
      return NextResponse.json(
        { error: 'UserId, plan, and targetPlan are required' },
        { status: 400 }
      );
    }

    // Calculate ROI for upgrade
    const roi = TierManager.calculateROI(plan as any, targetPlan as any, monthlyRevenue || 0);
    
    // Get tier information
    const currentTier = TierManager.getTierInfo(plan as any);
    const targetTier = TierManager.getTierInfo(targetPlan as any);

    // Log upgrade analysis
    await SecurityLogger.logEvent({
      eventType: 'tier.upgrade_analyzed',
      actorId: userId,
      payload: {
        currentPlan: plan,
        targetPlan,
        roi,
        monthlyRevenue
      }
    });

    return NextResponse.json({
      currentTier,
      targetTier,
      roi,
      recommendation: {
        shouldUpgrade: roi.roi > 0,
        paybackPeriod: roi.paybackPeriod,
        additionalCost: roi.additionalCost,
        additionalRevenue: roi.additionalRevenue
      }
    });

  } catch (error) {
    console.error('Tier upgrade analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
