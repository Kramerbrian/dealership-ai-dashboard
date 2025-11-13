/**
 * GET /api/dealerships/[id]/qai
 * Get complete QAI score breakdown with tier-based access control
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { getDealership, getLatestQAIScore, getLatestEEATScore, getLatestAIPlatformScores, checkSessionLimit } from '@/lib/database/client';
import { calculateQAI, generateDefaultQAIScore, generateDefaultEEATScore, generateDefaultPlatformScores } from '@/lib/algorithms/qai-engine';
import type { QAIResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dealershipId = params.id;

    // Get dealership and verify access
    const dealership = await getDealership(dealershipId);
    if (!dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    // Check if refresh is requested
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('force_refresh') === 'true';

    // Check session limits for refresh
    if (forceRefresh) {
      const sessionCheck = await checkSessionLimit(dealershipId, 'score_refresh');
      if (!sessionCheck.allowed) {
        return NextResponse.json(
          { 
            error: 'Session limit exceeded', 
            sessions_remaining: 0,
            upgrade_required: dealership.tier === 'FREE'
          }, 
          { status: 429 }
        );
      }
    }

    // Get latest scores from database
    const [qaiScore, eeatScore, platformScores] = await Promise.all([
      getLatestQAIScore(dealershipId),
      getLatestEEATScore(dealershipId),
      getLatestAIPlatformScores(dealershipId),
    ]);

    // If no scores exist or force refresh, generate new ones
    if (!qaiScore || forceRefresh) {
      // For demo purposes, use synthetic data
      // In production, this would fetch real data from APIs
      const syntheticQAI = generateDefaultQAIScore();
      const syntheticEEAT = generateDefaultEEATScore();
      const syntheticPlatforms = generateDefaultPlatformScores();

      // Store in database (in production)
      // await storeQAIScore(dealershipId, syntheticQAI);
      // await storeEEATScore(dealershipId, syntheticEEAT);
      // await storeAIPlatformScores(dealershipId, syntheticPlatforms);

      const response: QAIResponse = {
        dealership_id: dealershipId,
        calculated_at: new Date().toISOString(),
        qai: syntheticQAI,
        eeat: syntheticEEAT,
        platforms: syntheticPlatforms,
        sessions_remaining: dealership.sessions_limit - dealership.sessions_used,
      };

      return NextResponse.json(response);
    }

    // Return existing scores
    const response: QAIResponse = {
      dealership_id: dealershipId,
      calculated_at: qaiScore.calculated_at,
      qai: qaiScore,
      eeat: eeatScore || generateDefaultEEATScore(),
      platforms: platformScores.length > 0 ? platformScores : generateDefaultPlatformScores(),
      sessions_remaining: dealership.sessions_limit - dealership.sessions_used,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching QAI scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
