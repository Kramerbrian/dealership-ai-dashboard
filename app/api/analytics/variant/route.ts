import { NextRequest, NextResponse } from 'next/server';
import { getVariantAnalytics } from '@/lib/analytics/variant-analytics';

/**
 * GET /api/analytics/variant
 * 
 * Returns CTR and Conversion data for a specific variant
 * 
 * Query params:
 * - variant: Variant name (required)
 * - range: Time range (default: '30d')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const variant = searchParams.get('variant');
    const range = searchParams.get('range') || '30d';

    if (!variant) {
      return NextResponse.json(
        { error: 'Variant parameter is required' },
        { status: 400 }
      );
    }

    const analytics = await getVariantAnalytics(variant, range);

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Variant analytics API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch variant analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

