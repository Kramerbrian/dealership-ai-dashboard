/**
 * Usage Stats API
 *
 * Returns user's current tier, limits, usage, and feature access
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { subscriptionService } from '@/lib/services/subscription-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get comprehensive usage stats and limits
    // const limits = await subscriptionService.getUserLimits(userId);

    // Mock data for now
    const limits = {
      tier: 'TIER_1',
      maxDealerships: 5,
      maxAnalyses: 50,
      maxUsers: 3,
      features: {
        advanced_analytics: true,
        batch_processing: true,
        api_access: false,
        white_label: false
      },
      usage: {
        dealerships: 2,
        analyses: 15,
        users: 1
      }
    };

    return NextResponse.json({
      success: true,
      data: limits
    });

  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch usage stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
