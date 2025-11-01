import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request){
  const { userId } = await getAuth(req as any);
  if(!userId) return NextResponse.json({error:'unauthorized'}, {status:401});
  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get('dealerId')!;
  const month = searchParams.get('month');

  const where:any = { dealerId };
  if(month) where.month = new Date(month);

  const row = await prisma.raRMonthly.findFirst({ where, orderBy: { month: 'desc' } });
  return NextResponse.json(row ?? {});
}

