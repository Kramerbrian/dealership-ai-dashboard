import { NextRequest, NextResponse } from 'next/server';
import { trackSLO } from '@/lib/slo';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Mock audit response
    const auditResult = {
      domain,
      score: 87.3,
      status: 'completed',
      timestamp: new Date().toISOString(),
      metrics: {
        seo: 87.3,
        aeo: 73.8,
        geo: 65.2
      }
    };

    const duration = Date.now() - startTime;
    trackSLO('api.quick-audit', duration);
    
    const response = NextResponse.json(auditResult);
    response.headers.set('Server-Timing', `quick-audit;dur=${duration}`);
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackSLO('api.quick-audit', duration);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
