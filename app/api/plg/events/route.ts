import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/plg/events
 *
 * Retrieves recent PLG funnel events for the dashboard feed.
 * Supports filtering by user, event type, and date range.
 *
 * Query Parameters:
 * - userId: Filter by specific user (optional)
 * - eventType: Filter by event type (optional)
 * - limit: Number of events to return (default: 50, max: 200)
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const filterUserId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      200
    );
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (filterUserId) {
      query = query.eq('user_id', filterUserId);
    }

    if (eventType) {
      query = query.eq('type', eventType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Execute query
    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    // Get event type counts
    const { data: eventCounts } = await supabase
      .from('events')
      .select('type')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const eventTypeCounts: Record<string, number> = {};
    eventCounts?.forEach(event => {
      eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
    });

    return NextResponse.json(
      {
        events,
        total: events?.length || 0,
        eventTypeCounts,
        filters: {
          userId: filterUserId,
          eventType,
          limit,
          startDate,
          endDate,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );

  } catch (error) {
    console.error('PLG events error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch PLG events',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plg/events
 *
 * Manually tracks a PLG event.
 * Useful for custom event tracking from the frontend.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventType, eventData, source = 'manual' } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'eventType is required' },
        { status: 400 }
      );
    }

    // Track event using Supabase function
    const { error } = await supabase.rpc('track_plg_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_source: source,
      p_event_data: eventData || {},
    });

    if (error) {
      throw new Error(`Failed to track event: ${error.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          userId,
          eventType,
          source,
          eventData,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('PLG events POST error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to track PLG event',
      },
      { status: 500 }
    );
  }
}
