/**
 * ATI (Algorithmic Trust Index) Latest Signals API
 * Returns the most recent five-pillar trust measurement for a tenant
 * Part of DealershipAI Command Center
 *
 * Uses RLS enforcement via withTenant helper
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withTenant, getSupabaseAdmin } from '@/lib/db';

const ParamsSchema = z.object({
  tenantId: z.string().uuid(),
});

export async function GET(
  _request: Request,
  { params }: { params: unknown }
) {
  try {
    // Validate tenant ID
    const { tenantId } = ParamsSchema.parse(params);

    // Execute query with tenant-scoped RLS enforcement
    const result = await withTenant(tenantId, async () => {
      const supabase = getSupabaseAdmin();

      // Fetch latest ATI signals for tenant
      // RLS policy will automatically filter by tenant_id
      return supabase
        .from('ati_signals')
        .select('date_week, precision_pct, consistency_pct, recency_pct, authenticity_pct, alignment_pct, ati_pct')
        .eq('tenant_id', tenantId)
        .order('date_week', { ascending: false })
        .limit(1)
        .single();
    });

    const { data, error } = result;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (valid case)
      console.error('ATI fetch error:', error);
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: data ?? null, error: null },
      {
        headers: {
          'cache-control': 'no-store', // Always fetch fresh trust signals
        },
      }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { data: null, error: 'Invalid tenant ID format' },
        { status: 400 }
      );
    }

    console.error('ATI API error:', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
