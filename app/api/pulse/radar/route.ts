import { NextRequest, NextResponse } from 'next/server';
import { allow, rl_publicAPI } from '@/lib/ratelimit';
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'anon';
  const ok = await allow(rl_publicAPI, `radar:${ip}`);
  if (!ok.success) return NextResponse.json({ ok:false, rateLimited:true }, { status: 429 });
  const u = new URL(req.url); const marketId = u.searchParams.get('marketId')||'us_default'; const window = u.searchParams.get('window')||'7d';
  const alerts = [
    { type: 'OEM_MSRP_CHANGE', oem: 'Tesla', models: ['Model 3','Model Y'], deltaMsrpAbs: -5000, severity: 'P0' },
    { type: 'INCENTIVE_CHANGE', jurisdiction: 'CO', deltaRebateAbs: 2500, severity: 'P1' }
  ];
  return NextResponse.json({ ok:true, marketId, window, alerts, summary: { affectedDealers: 12, affectedModels: 7 } });
}
