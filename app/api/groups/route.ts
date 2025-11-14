import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

/**
 * GET /api/groups
 * Get all dealer groups for the authenticated user
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

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get user's dealer groups

    const { data: groups, error: groupsError } = await supabase
      .from('dealer_groups')
      .select('*')
      .eq('owner_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (groupsError) {
      console.error('[groups] Error fetching dealer groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch dealer groups' },
        { status: 500 }
      );
    }

    // Get metrics for each group
    const groupsWithMetrics = await Promise.all(
      (groups || []).map(async (group: any) => {
        const supabaseClient = getSupabase();
        if (!supabaseClient) {
          return { ...(group as any), metrics: null };
        }
        const { data: metrics } = await supabaseClient
          .from('dealer_group_metrics')
          .select('*')
          .eq('group_id', (group as any).id)
          .single();

        return {
          ...(group as any),
          metrics: metrics || null,
        };
      })
    );

    return NextResponse.json(
      { groups: groupsWithMetrics },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('[groups] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new dealer group
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { groupName, groupSlug, planTier = 'free', maxLocations = 1 } = body;

    if (!groupName || !groupSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: groupName, groupSlug' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Check if slug is already taken
    const { data: existing } = await supabase
      .from('dealer_groups')
      .select('id')
      .eq('group_slug', groupSlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Group slug already taken' },
        { status: 409 }
      );
    }

    // Create group
    const { data: group, error: createError } = await supabase
      .from('dealer_groups')
      .insert({
        group_name: groupName,
        group_slug: groupSlug,
        owner_id: userId,
        plan_tier: planTier,
        max_locations: maxLocations,
      } as any)
      .select()
      .single();

    if (createError) {
      console.error('[groups] Error creating group:', createError);
      return NextResponse.json(
        { error: createError.message || 'Failed to create group' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { group },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[groups] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
