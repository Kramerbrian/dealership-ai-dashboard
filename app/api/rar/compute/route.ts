import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { computeMonthlyRaR } from '@/lib/rar/calc';

export async function POST(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  
  const { dealerId, month } = await req.json();
  if (!dealerId || !month) {
    return NextResponse.json({ error: 'dealerId and month are required' }, { status: 400 });
  }
  
  const res = await computeMonthlyRaR({ dealerId, month });
  return NextResponse.json(res);
}
