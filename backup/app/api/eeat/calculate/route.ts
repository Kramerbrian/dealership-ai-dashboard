/**
 * E-E-A-T Calculation API Route
 * Pro+ feature for E-E-A-T analysis
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { TierManager } from '@/lib/tier-manager';
import { EEATScoringEngine } from '@/lib/eeat-scoring';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to E-E-A-T feature
    const hasAccess = await TierManager.hasFeatureAccess(userId, 'eeat_scoring');
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'E-E-A-T analysis requires Pro+ tier',
        upgradeRequired: 'PRO'
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

    // Get dealership data (mock for now)
    const dealershipData = {
      id: dealershipId,
      name: 'Demo Dealership',
      domain: 'demo-dealership.com',
      yearsInBusiness: 15,
      location: 'Naples, FL',
      industry: 'Automotive'
    };

    // Calculate E-E-A-T score
    const eeatScore = await EEATScoringEngine.calculateEEAT(
      dealershipData.domain,
      dealershipData
    );

    return NextResponse.json({
      success: true,
      data: eeatScore,
      meta: {
        dealershipId,
        calculatedAt: new Date().toISOString(),
        tier: await TierManager.getUserTier(userId),
        sessionsRemaining: sessionInfo.remaining - 1
      }
    });

  } catch (error) {
    console.error('E-E-A-T calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate E-E-A-T score' },
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
    const hasAccess = await TierManager.hasFeatureAccess(userId, 'eeat_scoring');
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'E-E-A-T analysis requires Pro+ tier',
        upgradeRequired: 'PRO'
      }, { status: 403 });
    }

    const body = await req.json();
    const { dealershipId, focusAreas } = body;

    if (!dealershipId) {
      return NextResponse.json({
        error: 'Dealership ID is required'
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

    // Calculate E-E-A-T score with focus areas
    const dealershipData = {
      id: dealershipId,
      name: 'Demo Dealership',
      domain: 'demo-dealership.com',
      yearsInBusiness: 15,
      location: 'Naples, FL',
      industry: 'Automotive',
      focusAreas: focusAreas || []
    };

    const eeatScore = await EEATScoringEngine.calculateEEAT(
      dealershipData.domain,
      dealershipData
    );

    return NextResponse.json({
      success: true,
      data: eeatScore,
      meta: {
        dealershipId,
        focusAreas,
        calculatedAt: new Date().toISOString(),
        tier: await TierManager.getUserTier(userId),
        sessionsRemaining: sessionInfo.remaining - 1
      }
    });

  } catch (error) {
    console.error('E-E-A-T calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate E-E-A-T score' },
      { status: 500 }
    );
  }
}
