import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get('dealerId');
  
  if (!dealerId) {
    return NextResponse.json({ error: 'dealerId required' }, { status: 400 });
  }
  
  const row = await prisma.secondaryMetrics.findFirst({ 
    where: { dealerId, key: 'rar_pressure' } as any 
  });
  
  return NextResponse.json({ pressure: row?.valueNum ?? 0 });
}


