import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';;
import { auth } from '@clerk/nextjs/server';


export const runtime = 'nodejs';

/**
 * GET /api/integrations/stats
 * Get comprehensive integration statistics for a dealer
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId') || undefined || 'demo-tenant';

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get integration stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_integration_stats' as any, { p_dealer_id: dealerId });

    if (statsError) {
      console.error('[integrations/stats] Error fetching stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch integration stats' },
        { status: 500 }
      );
    }

    // Get review summary by platform
    const { data: reviewSummary, error: reviewError } = await supabase
      .from('review_aggregation_summary')
      .select('*')
      .eq('dealer_id', dealerId);

    if (reviewError) {
      console.error('[integrations/stats] Error fetching review summary:', reviewError);
    }

    // Get inventory summary
    const { data: inventorySummary, error: inventoryError } = await supabase
      .from('inventory_summary')
      .select('*')
      .eq('dealer_id', dealerId)
      .single();

    if (inventoryError) {
      console.error('[integrations/stats] Error fetching inventory summary:', inventoryError);
    }

    return NextResponse.json(
      {
        stats: stats && (stats as any).length > 0 ? stats[0] : null,
        reviewsByPlatform: reviewSummary || [],
        inventory: inventorySummary || null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('[integrations/stats] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
