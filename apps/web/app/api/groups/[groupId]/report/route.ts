import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export const runtime = 'nodejs';

/**
 * GET /api/groups/[groupId]/report
 * Get comprehensive aggregate report for a dealer group
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId } = params;
    const supabase = getSupabase();

    // Verify user owns this group
    const { data: group, error: groupError } = await supabase
      .from('dealer_groups')
      .select('*')
      .eq('id', groupId)
      .eq('owner_id', userId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Dealer group not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get aggregate report
    const { data: report, error: reportError } = await supabase
      .rpc('get_group_aggregate_report', { p_group_id: groupId });

    if (reportError) {
      console.error('[groups/report] Error fetching aggregate report:', reportError);
      return NextResponse.json(
        { error: 'Failed to fetch aggregate report' },
        { status: 500 }
      );
    }

    // Get location rankings
    const { data: rankings, error: rankingsError } = await supabase
      .from('location_group_rankings')
      .select('*')
      .eq('dealer_group_id', groupId)
      .order('overall_rank', { ascending: true });

    if (rankingsError) {
      console.error('[groups/report] Error fetching rankings:', rankingsError);
    }

    // Get consistency analysis
    const { data: consistency, error: consistencyError } = await supabase
      .from('location_consistency_analysis')
      .select('*')
      .eq('dealer_group_id', groupId)
      .order('consistency_score', { ascending: false });

    if (consistencyError) {
      console.error('[groups/report] Error fetching consistency:', consistencyError);
    }

    return NextResponse.json(
      {
        group: {
          id: group.id,
          name: group.group_name,
          slug: group.group_slug,
          planTier: group.plan_tier,
          maxLocations: group.max_locations,
        },
        summary: report && report.length > 0 ? report[0] : null,
        rankings: rankings || [],
        consistency: consistency || [],
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('[groups/report] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
