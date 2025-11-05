import { NextResponse } from 'next/server';
import { winProbability } from '@/lib/winprob';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const qp = (k:string)=>Number(u.searchParams.get(k)??0);
  const score = winProbability({ 
    aiVisibility: qp('ai'), 
    reviewTrust: qp('rt'), 
    schemaCoverage: qp('sc'), 
    gbpHealth: qp('gbp'), 
    zeroClick: qp('zc') 
  });
  return NextResponse.json({ winProb: score });
}
