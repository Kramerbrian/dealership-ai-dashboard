import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * GET /api/integrations/providers
 * Get all available integration providers
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;

    let query = supabase
      .from('integration_providers')
      .select('*')
      .in('status', ['active', 'beta'])
      .order('provider_name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: providers, error } = await query;

    if (error) {
      console.error('[integrations/providers] Error fetching providers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch integration providers' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { providers: providers || [] },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error: any) {
    console.error('[integrations/providers] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
