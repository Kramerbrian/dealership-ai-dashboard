import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { tenantId, key, value } = await req.json();
    
    if (!tenantId || !key) {
      return NextResponse.json({ error: 'tenantId and key required' }, { status: 400 });
    }
    
    // Find existing memory first
    const existing = await prisma.memory.findFirst({
      where: { tenantId, key }
    });
    
    if (existing) {
      await prisma.memory.update({
        where: { id: existing.id },
        data: { value }
      });
    } else {
      await prisma.memory.create({
        data: { tenantId, key, value }
      });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error setting memory:', error);
    return NextResponse.json({ error: 'Failed to set memory' }, { status: 500 });
  }
}
