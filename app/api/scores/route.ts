import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDealershipScores } from '@/lib/scoring-engine';

export const runtime = 'nodejs';

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
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Create mock dealer data
    const dealer = {
      id: dealerId || 'demo-dealer',
      name: 'Sample Dealership',
      domain: domain || 'example.com',
      city: 'Demo City',
      state: 'TX',
      tenant_id: 'demo-tenant'
    };

    // Calculate scores using your scoring engine
    const scores = await getDealershipScores(dealer.domain);

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
        summary: scores,
        metadata: {
          calculated_at: new Date().toISOString(),
          engine_version: '1.0.0',
          confidence: 0.9,
          cached: false
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
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dealers } = body;

    if (!Array.isArray(dealers)) {
      return NextResponse.json(
        { error: 'dealers array is required' },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const dealer of dealers) {
      const scores = await getDealershipScores(dealer.domain);
      results.push({
        dealerId: dealer.id,
        scores,
        summary: scores
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        total_processed: results.length,
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