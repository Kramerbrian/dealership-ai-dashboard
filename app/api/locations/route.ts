import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';

/**
 * GET /api/locations
 * Get all locations for the authenticated user's dealer group
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
    const groupId = url.searchParams.get('groupId');

    // Get user's dealer groups
    const { data: groups, error: groupsError } = await supabase
      .from('dealer_groups')
      .select('id, group_name, group_slug')
      .eq('owner_id', userId);

    if (groupsError) {
      console.error('[locations] Error fetching dealer groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch dealer groups' },
        { status: 500 }
      );
    }

    if (!groups || groups.length === 0) {
      return NextResponse.json(
        { locations: [], group: null },
        { status: 200 }
      );
    }

    // Use specified group or first group
    const selectedGroupId = groupId || groups[0].id;
    const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

    // Get locations for this group
    const { data: locations, error: locationsError } = await supabase
      .rpc('get_group_locations', { p_group_id: selectedGroupId });

    if (locationsError) {
      console.error('[locations] Error fetching locations:', locationsError);
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        locations: locations || [],
        group: selectedGroup,
        allGroups: groups,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('[locations] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/locations
 * Create a new dealership location
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
    const {
      groupId,
      dealershipName,
      domain,
      streetAddress,
      city,
      state,
      postalCode,
      phone,
      email,
      latitude,
      longitude,
    } = body;

    if (!groupId || !dealershipName || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: groupId, dealershipName, domain' },
        { status: 400 }
      );
    }

    // Verify user owns this group
    const { data: group, error: groupError } = await supabase
      .from('dealer_groups')
      .select('id, max_locations')
      .eq('id', groupId)
      .eq('owner_id', userId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Dealer group not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check location count limit
    const { count } = await supabase
      .from('dealership_locations')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_group_id', groupId)
      .eq('status', 'active');

    if (count && count >= group.max_locations) {
      return NextResponse.json(
        { error: `Maximum locations (${group.max_locations}) reached for this plan` },
        { status: 403 }
      );
    }

    // Generate dealer_id from domain
    const dealerId = domain.replace(/\./g, '-').toLowerCase();

    // Create location
    const { data: location, error: createError } = await supabase
      .from('dealership_locations')
      .insert({
        dealer_group_id: groupId,
        dealer_id: dealerId,
        dealership_name: dealershipName,
        domain,
        street_address: streetAddress,
        city,
        state,
        postal_code: postalCode,
        phone,
        email,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      })
      .select()
      .single();

    if (createError) {
      console.error('[locations] Error creating location:', createError);
      return NextResponse.json(
        { error: createError.message || 'Failed to create location' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { location },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[locations] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
