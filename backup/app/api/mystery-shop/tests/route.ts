/**
 * Mystery Shop Tests API Route
 * Enterprise feature for mystery shop management
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { TierManager } from '@/lib/tier-manager';
import { MysteryShopEngine } from '@/lib/mystery-shop';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to mystery shop feature
    const hasAccess = await TierManager.hasFeatureAccess(userId, 'mystery_shop');
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Mystery shop requires Enterprise tier',
        upgradeRequired: 'ENTERPRISE'
      }, { status: 403 });
    }

    // Get dealership ID from query params
    const { searchParams } = new URL(req.url);
    const dealershipId = searchParams.get('dealershipId');
    
    if (!dealershipId) {
      return NextResponse.json({
        error: 'Dealership ID is required'
      }, { status: 400 });
    }

    // Get mystery shop tests
    const tests = await MysteryShopEngine.getDealershipTests(dealershipId);

    return NextResponse.json({
      success: true,
      data: tests,
      meta: {
        dealershipId,
        totalTests: tests.length,
        completedTests: tests.filter(t => t.status === 'completed').length,
        scheduledTests: tests.filter(t => t.status === 'scheduled').length
      }
    });

  } catch (error) {
    console.error('Mystery shop tests API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mystery shop tests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check feature access
    const hasAccess = await TierManager.hasFeatureAccess(userId, 'mystery_shop');
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Mystery shop requires Enterprise tier',
        upgradeRequired: 'ENTERPRISE'
      }, { status: 403 });
    }

    const body = await req.json();
    const { dealershipId, testType, focusAreas, scheduledDate } = body;

    if (!dealershipId || !testType) {
      return NextResponse.json({
        error: 'Dealership ID and test type are required'
      }, { status: 400 });
    }

    // Check session limit
    const sessionInfo = await TierManager.checkSessionLimit(userId);
    if (!sessionInfo.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Session limit reached'
      }, { status: 429 });
    }

    // Increment session count
    await TierManager.incrementSession(userId);

    // Schedule mystery shop test
    const test = await MysteryShopEngine.scheduleTest(
      dealershipId,
      testType,
      focusAreas || [],
      scheduledDate ? new Date(scheduledDate) : undefined
    );

    return NextResponse.json({
      success: true,
      data: test,
      meta: {
        dealershipId,
        testType,
        focusAreas,
        scheduledAt: test.scheduledAt,
        tier: await TierManager.getUserTier(userId),
        sessionsRemaining: sessionInfo.remaining - 1
      }
    });

  } catch (error) {
    console.error('Mystery shop schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule mystery shop test' },
      { status: 500 }
    );
  }
}
