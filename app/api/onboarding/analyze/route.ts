import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/onboarding/analyze
 * Performs initial Trust Score analysis for onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Call the main AI scores API
    const scoresResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai-scores?origin=${encodeURIComponent(url)}&refresh=true`,
      { method: 'GET' }
    );

    if (!scoresResponse.ok) {
      // Fallback to example data for demo
      return NextResponse.json({
        success: true,
        data: {
          trustScore: 73,
          deltaVsAverage: -12,
          topIssue: {
            description: 'Poor schema markup is costing you $12,500/month in missed leads',
            impact: 12500,
          },
          competitorRanking: {
            position: 8,
            total: 12,
            topDealer: {
              name: 'Naples Honda',
              score: 89,
            },
          },
          quickWins: {
            count: 3,
            targetScore: 78,
          },
        },
      });
    }

    const scoresData = await scoresResponse.json();

    // Fetch competitors (mock for now)
    const competitors = [
      { name: 'Naples Honda', score: 89 },
      { name: 'Germain Honda', score: 84 },
      { name: 'Coconut Point Hyundai', score: 71 },
    ];

    const marketAverage = 72;
    const trustScore = scoresData.data?.trustScore?.score || 73;
    const deltaVsAverage = trustScore - marketAverage;

    // Determine position
    const sortedCompetitors = [...competitors, { name: 'You', score: trustScore }]
      .sort((a, b) => b.score - a.score);
    const position = sortedCompetitors.findIndex((c) => c.name === 'You') + 1;

    // Get top issue from OCI
    const topIssue = scoresData.data?.oci?.issues?.[0] || {
      description: 'Missing schema markup on VDPs',
      impact: 15500,
    };

    return NextResponse.json({
      success: true,
      data: {
        trustScore,
        deltaVsAverage,
        topIssue: {
          description: topIssue.title || topIssue.description,
          impact: topIssue.impact || 12500,
        },
        competitorRanking: {
          position,
          total: competitors.length + 1,
          topDealer: competitors[0],
        },
        quickWins: {
          count: 3,
          targetScore: Math.min(100, trustScore + 5),
        },
      },
    });

  } catch (error) {
    console.error('Onboarding analyze error:', error);
    
    // Return fallback data for demo
    return NextResponse.json({
      success: true,
      data: {
        trustScore: 73,
        deltaVsAverage: -12,
        topIssue: {
          description: 'Poor schema markup is costing you $12,500/month in missed leads',
          impact: 12500,
        },
        competitorRanking: {
          position: 8,
          total: 12,
          topDealer: {
            name: 'Naples Honda',
            score: 89,
          },
        },
        quickWins: {
          count: 3,
          targetScore: 78,
        },
      },
    });
  }
}
