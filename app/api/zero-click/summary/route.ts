/**
 * Zero-Click Summary API
 * Returns Zero-Click series data for charts
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock data - replace with actual database integration
async function getPrisma() {
  return {
    zeroClickDaily: {
      findMany: async () => {
        // Return mock data
        return [
          {
            id: '1',
            tenantId: 'demo',
            date: new Date(),
            impressions: 10000,
            clicks: 1500,
            ctrActual: 0.15,
            ctrBaseline: 0.18,
            zcr: 0.85,
            aiPresenceRate: 0.75,
            airi: 0.22,
            gbpImpressions: 6000,
            gbpActions: 235,
            zcco: 0.42,
            adjustedZeroClick: 0.43
          }
        ];
      }
    }
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const days = Number(searchParams.get('days') || 30);
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
    }

    const since = new Date(Date.now() - days * 864e5);

    const prisma = await getPrisma();
    const series = await prisma.zeroClickDaily.findMany({
      where: { 
        tenantId, 
        date: { gte: since } 
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ series });
  } catch (error) {
    console.error('Zero-Click summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
