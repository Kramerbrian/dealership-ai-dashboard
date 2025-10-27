/**
 * Mystery Shop Schedule API Route
 * Schedule new mystery shop tests
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { TierManager } from '@/lib/tier-manager';
import { MysteryShopEngine } from '@/lib/mystery-shop';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { dealershipId, testType, focusAreas, scheduledDate } = body;

    if (!dealershipId || !testType) {
      return NextResponse.json({
        error: 'Dealership ID and test type are required'
      }, { status: 400 });
    }

    // Validate test type
    const validTestTypes = ['phone', 'email', 'website', 'visit'];
    if (!validTestTypes.includes(testType)) {
      return NextResponse.json({
        error: 'Invalid test type. Must be one of: phone, email, website, visit'
      }, { status: 400 });
    }

    // Check session limit
    const sessionInfo = await TierManager.checkSessionLimit(userId);
    if (!sessionInfo.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Session limit reached',
        upgradeRequired: true
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
