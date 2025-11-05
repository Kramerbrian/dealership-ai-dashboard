import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { tenantId, competitor, surfaces } = await req.json();
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
    }
    
    const action = await prisma.action.create({ 
      data: { 
        tenantId, 
        kind: 'mystery_360', 
        status: 'queued', 
        meta: { competitor, surfaces } 
      } 
    });
    
    return NextResponse.json({ ok: true, actionId: action.id });
  } catch (error) {
    console.error('Error creating mystery shop:', error);
    return NextResponse.json({ error: 'Failed to create mystery shop' }, { status: 500 });
  }
}
