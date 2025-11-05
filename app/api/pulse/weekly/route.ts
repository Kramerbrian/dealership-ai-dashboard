import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    const start = new Date();
    start.setUTCHours(0,0,0,0);
    // naive week bucket
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    
    for (const t of tenants) {
      // Note: Prisma unique constraint uses @@unique([tenantId, period])
      // We need to find existing record first or use a different approach
      const existing = await prisma.pulseMetric.findFirst({
        where: { tenantId: t.id, period: start }
      });
      
      if (existing) {
        await prisma.pulseMetric.update({
          where: { id: existing.id },
          data: { 
            aiVis: { increment: 0 }, 
            zeroClick: { increment: 0 } 
          }
        });
      } else {
        await prisma.pulseMetric.create({
          data: { 
            tenantId: t.id, 
            period: start, 
            aiVis: 60, 
            zeroClick: 55, 
            review: 70, 
            gbp: 80 
          }
        });
      }
    }
    
    return NextResponse.json({ ok: true, tenants: tenants.length });
  } catch (error) {
    console.error('Error updating pulse metrics:', error);
    return NextResponse.json({ error: 'Failed to update pulse metrics' }, { status: 500 });
  }
}
