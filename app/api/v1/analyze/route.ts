import { NextResponse } from 'next/server';

/**
 * Landing page analyzer endpoint
 * Returns synthetic analysis results for the domain
 * In production, this would call your actual analysis service
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter required' },
        { status: 400 }
      );
    }
    
    // Synthetic analysis results
    // TODO: Replace with actual analysis service
    const payload = {
      domain,
      oem: inferOEM(domain),
      issues: [
        {
          id: 'schema_missing',
          title: 'Missing Product schema on 43 VDPs',
          impact: 8200
        },
        {
          id: 'reviews_latency',
          title: '12 reviews unanswered >72h',
          impact: 3100
        },
        {
          id: 'visibility_drop',
          title: 'Gemini citations missing',
          impact: 2400
        }
      ],
      analyzedAt: new Date().toISOString()
    };
    
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

function inferOEM(domain: string): string {
  const lower = domain.toLowerCase();
  const oems = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Lexus', 'Audi'];
  for (const oem of oems) {
    if (lower.includes(oem.toLowerCase())) {
      return oem;
    }
  }
  return 'Toyota'; // Default
}

