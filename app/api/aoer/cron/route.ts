import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[AOER] Cron job triggered - queuing all tenants for recompute');

    // Get all active tenants from the last 7 days
    const { data: tenants, error } = await supabase
      .from('aiv_raw_signals')
      .select('dealer_id')
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .not('dealer_id', 'is', null);

    if (error) {
      console.error('[AOER] Error fetching tenants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      );
    }

    const uniqueTenants = [...new Set(tenants?.map(t => t.dealer_id) || [])];
    
    // Queue each tenant for recomputation
    const results = [];
    for (const tenantId of uniqueTenants) {
      try {
        // Call the queue API to enqueue the tenant
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/aoer/queue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId,
            priority: 'low'
          }),
        });

        if (response.ok) {
          results.push({ tenantId, status: 'queued' });
        } else {
          results.push({ tenantId, status: 'failed', error: await response.text() });
        }
      } catch (error) {
        console.error(`[AOER] Error queuing tenant ${tenantId}:`, error);
        results.push({ tenantId, status: 'failed', error: error.message });
      }
    }

    console.log(`[AOER] Cron job completed - queued ${uniqueTenants.length} tenants`);

    return NextResponse.json({
      success: true,
      message: `Queued ${uniqueTenants.length} tenants for recompute`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AOER] Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
