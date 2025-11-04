import { NextRequest, NextResponse } from 'next/server';

interface CompetitorData {
  name: string;
  vai: number;
  geo: number;
  aeo: number;
  seo: number;
  anonymized: boolean;
}

interface ComparisonResponse {
  prospect: {
    vai: number;
    geo: number;
    aeo: number;
    seo: number;
  };
  competitors: CompetitorData[];
  position: string;
  message: string;
}

/**
 * Get competitive comparison for demo/prospect
 * 
 * This endpoint provides anonymized competitor data for demo purposes.
 * In production, this would fetch real competitor data from the database.
 */
export async function POST(req: NextRequest) {
  try {
    const { domain, dealerId } = await req.json();

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'Domain or dealerId is required' },
        { status: 400 }
      );
    }

    // For demo/prospect: Generate realistic comparison data
    // In production, fetch from database using dealerId or domain
    const prospectVAI = 75 + Math.random() * 15; // 75-90 range
    const prospectGEO = prospectVAI - 10 + (Math.random() - 0.5) * 10;
    const prospectAEO = prospectVAI - 5 + (Math.random() - 0.5) * 10;
    const prospectSEO = prospectVAI + (Math.random() - 0.5) * 8;

    // Generate 5 competitors with varying scores
    const competitors: CompetitorData[] = Array.from({ length: 5 }, (_, i) => {
      const baseScore = prospectVAI - 15 + i * 8 + (Math.random() - 0.5) * 10;
      const vai = Math.max(40, Math.min(95, baseScore));
      
      return {
        name: `Competitor ${i + 1}`,
        vai: Math.round(vai * 10) / 10,
        geo: Math.round((vai - 10 + (Math.random() - 0.5) * 10) * 10) / 10,
        aeo: Math.round((vai - 5 + (Math.random() - 0.5) * 10) * 10) / 10,
        seo: Math.round((vai + (Math.random() - 0.5) * 8) * 10) / 10,
        anonymized: true
      };
    });

    // Sort competitors by VAI (highest first)
    competitors.sort((a, b) => b.vai - a.vai);

    // Calculate position
    const allScores = [...competitors.map(c => c.vai), prospectVAI].sort((a, b) => b - a);
    const position = allScores.indexOf(prospectVAI) + 1;
    const totalCompetitors = competitors.length + 1;
    const beatingCount = totalCompetitors - position;

    const prospect = {
      vai: Math.round(prospectVAI * 10) / 10,
      geo: Math.round(prospectGEO * 10) / 10,
      aeo: Math.round(prospectAEO * 10) / 10,
      seo: Math.round(prospectSEO * 10) / 10
    };

    const response: ComparisonResponse = {
      prospect,
      competitors,
      position: `${position} of ${totalCompetitors}`,
      message: `You're beating ${beatingCount} of ${competitors.length} competitors`
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('Competitor comparison API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch competitor comparison',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET for easier testing
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const domain = searchParams.get('domain');
  const dealerId = searchParams.get('dealerId');

  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      body: JSON.stringify({ domain, dealerId })
    })
  );
}

