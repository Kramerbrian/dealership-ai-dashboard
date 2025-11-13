import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
 * GET /api/integrations/providers
 * Get all available integration providers
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      // Return empty array if Supabase not configured (graceful degradation)
      return NextResponse.json(
        { providers: [] },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    const url = new URL(req.url);
    const category = url.searchParams.get('category');

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
