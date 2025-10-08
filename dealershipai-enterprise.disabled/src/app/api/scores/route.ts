import { NextRequest, NextResponse } from 'next/server';
import { ScoringEngine } from '@/core/scoring-engine';
import { Dealer } from '@/core/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dealerId = searchParams.get('dealerId');
  const domain = searchParams.get('domain');

  if (!dealerId && !domain) {
    return NextResponse.json(
      { error: 'dealerId or domain parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Create a mock dealer for demonstration
    // In production, this would fetch from your database
    const dealer: Dealer = {
      id: dealerId || 'demo-dealer',
      name: 'Terry Reid Hyundai',
      domain: domain || 'terryreidhyundai.com',
      city: 'Naples',
      state: 'FL',
      established_date: new Date('2008-01-15'),
      tier: 1
    };

    const scoringEngine = new ScoringEngine();
    const scores = await scoringEngine.calculateScores(dealer);
    const summary = scoringEngine.getScoreSummary(scores);

    return NextResponse.json({
      success: true,
      data: {
        dealer: {
          id: dealer.id,
          name: dealer.name,
          domain: dealer.domain,
          city: dealer.city,
          state: dealer.state
        },
        scores,
        summary,
        metadata: {
          calculated_at: new Date().toISOString(),
          engine_version: '1.0.0',
          confidence: (scores.seo.confidence + scores.eeat.confidence) / 2
        }
      }
    });

  } catch (error) {
    console.error('Scoring API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to calculate scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealers } = body;

    if (!Array.isArray(dealers)) {
      return NextResponse.json(
        { error: 'dealers array is required' },
        { status: 400 }
      );
    }

    const scoringEngine = new ScoringEngine();
    const results = await scoringEngine.calculateBatchScores(dealers);

    const responseData = Array.from(results.entries()).map(([dealerId, scores]) => ({
      dealerId,
      scores,
      summary: scoringEngine.getScoreSummary(scores)
    }));

    return NextResponse.json({
      success: true,
      data: {
        results: responseData,
        total_processed: results.size,
        metadata: {
          calculated_at: new Date().toISOString(),
          engine_version: '1.0.0'
        }
      }
    });

  } catch (error) {
    console.error('Batch scoring API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to calculate batch scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
