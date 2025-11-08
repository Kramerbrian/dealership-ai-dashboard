import { NextRequest, NextResponse } from 'next/server';
import { getSbAdmin } from '@/lib/supabase';
import { allow, rl_telemetry } from '@/lib/ratelimit';
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'anon';
  const rl = await allow(rl_telemetry, `telemetry:${ip}`);
  if (!rl.success) return NextResponse.json({ ok:false, rateLimited:true }, { status: 429 });
  const body = await req.json().catch(()=>({}));
  try {
    const sbAdmin = getSbAdmin();
    if (!sbAdmin) {
      return NextResponse.json({ ok:false, error: 'Supabase not configured. Set SUPABASE_SERVICE_KEY in .env.local' }, { status: 500 });
    }
    // Convert timestamp to ISO string if provided, otherwise use server default
    const ts = body.ts 
      ? (typeof body.ts === 'number' 
          ? new Date(body.ts).toISOString() 
          : body.ts)
      : undefined; // Let database default handle it
    
    const { error } = await sbAdmin.from('telemetry_events').insert({
      type: body.type || 'unknown', 
      payload: body.payload ?? null, 
      ts: ts, // Will use default now() if undefined
      ip
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e:any) { return NextResponse.json({ ok:false, error: e.message }, { status: 500 }); }
}
export async function GET() {
  try {
    const sbAdmin = getSbAdmin();
    if (!sbAdmin) {
      return NextResponse.json({ events: [], error: 'Supabase not configured. Set SUPABASE_SERVICE_KEY in .env.local' });
    }
    const { data, error } = await sbAdmin.from('telemetry_events').select('*').order('ts', { ascending: false }).limit(200);
    if (error) throw error;
    return NextResponse.json({ events: data || [] });
  } catch (e:any) { return NextResponse.json({ events: [], error: e.message }, { status: 500 }); }
}

