import { NextRequest, NextResponse } from 'next/server';
import { syncDealerMetrics } from '@/lib/sync-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Get all active dealers
  const { data: dealers } = await supabase
    .from('dealer_access')
    .select('dealer_id')
    .eq('active', true);
  
  const uniqueDealers = [...new Set(dealers?.map(d => d.dealer_id) || [])];
  
  if (uniqueDealers.length === 0) {
    return NextResponse.json({
      success: true,
      synced: 0,
      failed: 0,
      total: 0,
      message: 'No active dealers found'
    });
  }
  
  // Sync metrics for each dealer
  const results = await Promise.allSettled(
    uniqueDealers.map(dealerId => syncDealerMetrics(dealerId))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  // Log failed syncs
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to sync dealer ${uniqueDealers[index]}:`, result.reason);
    }
  });
  
  return NextResponse.json({
    success: true,
    synced: successful,
    failed,
    total: uniqueDealers.length,
    dealers: uniqueDealers,
    timestamp: new Date().toISOString()
  });
}
