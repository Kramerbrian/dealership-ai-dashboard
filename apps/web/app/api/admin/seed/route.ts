import { NextRequest, NextResponse } from 'next/server';
import { getSbAdmin } from '@/lib/supabase';
import { createAdminRoute } from '@/lib/api/enhanced-route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Inserts a small, realistic set of telemetry + pulse demo rows
export const GET = createAdminRoute(async (req: NextRequest) => {

  // Check for Supabase configuration
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Supabase env missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel environment variables',
      note: 'This endpoint requires Supabase configuration'
    }, { status: 500 });
  }

  try {
    let sbAdmin;
    try {
      sbAdmin = getSbAdmin();
    } catch (e) {
      // Fallback: create client directly if getSbAdmin doesn't exist
      const { createClient } = await import('@supabase/supabase-js');
      sbAdmin = createClient(supabaseUrl, supabaseKey);
    }
    
    if (!sbAdmin) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Supabase not configured. Check environment variables' 
      }, { status: 500 });
    }

    // 1) Seed telemetry funnel (last 48h)
    const now = Date.now();
    const rows: any[] = [];
    const types = ['page_view','scan_started','scan_completed','unlock_success','upgrade_click'];
    for (let i = 0; i < 140; i++) {
      const type = types[Math.floor(Math.random()*types.length)];
      const ts = new Date(now - Math.floor(Math.random()*48)*3600*1000 - Math.floor(Math.random()*3600*1000));
      rows.push({ type, payload: { demo: true }, ts: ts.toISOString(), ip });
    }
    let { error: tErr } = await sbAdmin.from('telemetry_events').insert(rows);
    if (tErr) throw tErr;

    // 2) Seed pulse demo alerts
    const pulse = [
      { market_id:'us_fl_southwest', event_type:'OEM_MSRP_CHANGE', oem:'Tesla', models:['Model 3','Model Y'], delta_msrp_abs:-5000, severity:'P0' },
      { market_id:'us_fl_southwest', event_type:'INCENTIVE_CHANGE', oem:'Hyundai', models:['IONIQ 5'], delta_rebate_abs:2500, severity:'P1' }
    ];
    // Table may not exist — ignore error if missing
    try {
      await sbAdmin.from('pulse_events').insert(pulse);
    } catch {}

    return NextResponse.json({ ok: true, telemetrySeeded: rows.length, pulseSeeded: pulse.length });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
