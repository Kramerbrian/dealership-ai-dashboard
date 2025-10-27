/**
 * GET /api/dealerships/[id]/competitors
 * Get competitive intelligence with tier-based limits
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { getDealership, getCompetitors, checkSessionLimit } from '@/lib/database/client';
import type { CompetitorResponse } from '@/lib/types';

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

    // Check session limits
    const sessionCheck = await checkSessionLimit(dealershipId, 'competitor_analysis');
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

    // Determine competitor limit based on tier
    const competitorLimit = dealership.tier === 'FREE' ? 3 : undefined;

    // Get competitors from database
    const competitors = await getCompetitors(dealershipId, competitorLimit);

    // If no competitors exist, generate synthetic data
    if (competitors.length === 0) {
      const syntheticCompetitors = generateSyntheticCompetitors(dealershipId, competitorLimit);
      
      const response: CompetitorResponse = {
        market_position: {
          your_rank: 3,
          total_competitors: 12,
          market_share: {
            ai_mentions: 23,
            reviews: 18,
            visibility: 31,
          },
        },
        competitors: syntheticCompetitors,
        gap_analysis: {
          radar_data: {
            ai_visibility: [82, 90], // [you, leader]
            reviews: [76, 85],
            citations: [85, 88],
            schema: [79, 92],
            content: [74, 86],
          },
          exploitable_weaknesses: [
            {
              competitor: 'Honda of Naples',
              weakness: 'Review Response Rate',
              their_score: 45,
              your_score: 82,
              opportunity: 'Capitalize on their poor customer service perception',
            },
            {
              competitor: 'Nissan of Fort Myers',
              weakness: 'Schema Markup',
              their_score: 62,
              your_score: 79,
              opportunity: 'Outrank them with better structured data',
            },
          ],
        },
      };

      return NextResponse.json(response);
    }

    // Calculate market position
    const yourRank = competitors.findIndex(c => c.name === dealership.name) + 1;
    const totalCompetitors = competitors.length;

    const response: CompetitorResponse = {
      market_position: {
        your_rank: yourRank,
        total_competitors: totalCompetitors,
        market_share: {
          ai_mentions: 23, // Would be calculated from real data
          reviews: 18,
          visibility: 31,
        },
      },
      competitors,
      gap_analysis: {
        radar_data: {
          ai_visibility: [82, 90],
          reviews: [76, 85],
          citations: [85, 88],
          schema: [79, 92],
          content: [74, 86],
        },
        exploitable_weaknesses: [
          {
            competitor: 'Honda of Naples',
            weakness: 'Review Response Rate',
            their_score: 45,
            your_score: 82,
            opportunity: 'Capitalize on their poor customer service perception',
          },
        ],
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSyntheticCompetitors(dealershipId: string, limit?: number): any[] {
  const competitors = [
    {
      id: 'comp-1',
      dealership_id: dealershipId,
      name: 'Honda of Naples',
      domain: 'hondaofnaples.com',
      city: 'Naples',
      rank: 1,
      qai_score: 88,
      score_change: 3,
      gap: -10,
      weaknesses: ['Review Response', 'Schema'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'comp-2',
      dealership_id: dealershipId,
      name: 'Nissan of Fort Myers',
      domain: 'nissanfortmyers.com',
      city: 'Fort Myers',
      rank: 2,
      qai_score: 84,
      score_change: -2,
      gap: -6,
      weaknesses: ['UGC Volume', 'Citations'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'comp-3',
      dealership_id: dealershipId,
      name: 'Terry Reid Hyundai',
      domain: 'terry-reid-hyundai.com',
      city: 'Naples',
      rank: 3,
      qai_score: 78,
      score_change: 12,
      gap: 0,
      weaknesses: [],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'comp-4',
      dealership_id: dealershipId,
      name: 'Toyota of Naples',
      domain: 'toyotanaples.com',
      city: 'Naples',
      rank: 4,
      qai_score: 72,
      score_change: 5,
      gap: 6,
      weaknesses: ['AI Visibility', 'Content Quality'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'comp-5',
      dealership_id: dealershipId,
      name: 'Ford of Naples',
      domain: 'fordnaples.com',
      city: 'Naples',
      rank: 5,
      qai_score: 68,
      score_change: -3,
      gap: 10,
      weaknesses: ['Review Quality', 'Schema', 'Citations'],
      updated_at: new Date().toISOString(),
    },
  ];

  return limit ? competitors.slice(0, limit) : competitors;
}
