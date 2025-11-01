import { NextRequest, NextResponse } from 'next/server';
import { chiefClarityOfficer } from '@/lib/ai/chief-clarity-officer';

/**
 * Chief Clarity Officer Analysis API
 * Deep analysis of dealership AI visibility
 */
export async function POST(req: NextRequest) {
  try {
    const { domain, context } = await req.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Execute analysis
    const response = await chiefClarityOfficer.analyzeVisibility(domain, context);

    return NextResponse.json({
      analysis: response.output,
      model: response.model,
      confidence: response.confidence,
      cost: response.cost,
      latency: response.latency,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze visibility' },
      { status: 500 }
    );
  }
}

