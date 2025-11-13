import { NextRequest, NextResponse } from 'next/server';
import { requireRoleAndTenant } from '@/lib/auth/roles';

export const runtime = 'nodejs';

// Proxies to backend probe harness to run Perplexity + Rich Results verification
export async function POST(req: NextRequest) {
  try {
    const { tenant } = requireRoleAndTenant(req, ['admin','manager']);
    const body = await req.json();
    const domain = body?.domain as string;
    if (!domain) return NextResponse.json({ ok:false, error:'domain required' }, { status:400 });

    const url = `${process.env.BACKEND_BASE_URL || ''}/api/probe/run`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ tenant, domain })
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      return NextResponse.json({ ok:false, error:`backend error: ${txt}` }, { status:502 });
    }

    const data = await upstream.json();
    return NextResponse.json({ ok:true, result: data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status:500 });
  }
}
