import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

/**
 * Get Supabase client (lazy initialization to avoid build-time errors)
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

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

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { stats: null, reviewsByPlatform: [], inventory: null },
        { status: 200 }
      );
    }

    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId') || 'demo-tenant';

    // Get integration stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_integration_stats', { p_dealer_id: dealerId });

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
        stats: stats && stats.length > 0 ? stats[0] : null,
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

