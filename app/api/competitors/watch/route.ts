import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const comps = await prisma.competitor.findMany({ take: 50 });
    // stub: generate micro events when competitor score jumps or falls
    const events = comps.slice(0,10).map(c=>({ 
      competitor: c.name, 
      change: Math.round(Math.random()*6-3) 
    }));
    
    // persist as insights for feed (optional)
    if (comps.length > 0) {
      await Promise.all(events.map(e=> 
        prisma.insight.create({ 
          data: { 
            tenantId: comps[0].tenantId, 
            type: 'competitor_pulse', 
            score: 0, 
            delta: e.change, 
            evidence: e 
          } 
        })
      ));
    }
    
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    console.error('Error watching competitors:', error);
    return NextResponse.json({ error: 'Failed to watch competitors' }, { status: 500 });
  }
}
