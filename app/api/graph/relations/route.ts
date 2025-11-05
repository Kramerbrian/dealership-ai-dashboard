import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  
  try {
    const edges = await prisma.relation.findMany({ where: { tenantId } });
    return NextResponse.json({ edges });
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, aId, bId, kind, weight } = body;
    
    if (!tenantId || !aId || !bId || !kind) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const r = await prisma.relation.upsert({
      where: { 
        id: `${tenantId}-${aId}-${bId}-${kind}` 
      },
      update: { weight },
      create: { tenantId, aId, bId, kind, weight }
    }).catch(async ()=>{
      return prisma.relation.create({ data: { tenantId, aId, bId, kind, weight } });
    });
    
    return NextResponse.json({ ok: true, id: r.id });
  } catch (error) {
    console.error('Error creating relation:', error);
    return NextResponse.json({ error: 'Failed to create relation' }, { status: 500 });
  }
}
