import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getFlags, setFlag } from '@/lib/flags';
import { traced } from '@/lib/api-wrap';

export const GET = traced(async () => {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ ok:false, error: gate.reason }, { status: gate.reason==='unauthenticated'?401:403 });
  const flags = await getFlags();
  return NextResponse.json({ ok:true, flags });
}, 'admin.flags.get');

export const POST = traced(async (req: NextRequest) => {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ ok:false, error: gate.reason }, { status: gate.reason==='unauthenticated'?401:403 });
  const body = await req.json();
  if (!body?.key || typeof body?.value !== 'object') return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 });
  await setFlag(body.key, body.value);
  const flags = await getFlags();
  return NextResponse.json({ ok:true, flags });
}, 'admin.flags.post');

