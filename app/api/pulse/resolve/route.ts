import { NextRequest, NextResponse } from 'next/server';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dynamic = 'force-dynamic';

/**
 * POST /api/pulse/resolve
 * 
 * Mark a pulse tile as resolved
 */
export async function POST(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tileId } = body;

    if (!tileId) {
      return NextResponse.json(
        { error: 'tileId is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('pulse_tiles')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', tileId)
      .eq('tenant_id', isolation.tenantId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Failed to resolve tile' },
        { status: 500 }
      );
    }

    // Log resolution
    await supabase
      .from('pulse_tile_history')
      .insert({
        tile_id: tileId,
        tenant_id: isolation.tenantId,
        event_type: 'resolved',
        metadata: {}
      });

    return NextResponse.json({
      success: true,
      tile: data
    });
  } catch (error: any) {
    console.error('Resolve tile error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve tile' },
      { status: 500 }
    );
  }
}

