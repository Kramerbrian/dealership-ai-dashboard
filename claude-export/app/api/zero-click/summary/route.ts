import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const days = Number(searchParams.get('days') || 30);
    const since = new Date(Date.now() - days * 86400000);

    const series = await prisma.zeroClickDaily.findMany({
      where: {
        tenantId,
        date: { gte: since }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({
      series: series.map(item => ({
        date: item.date.toISOString(),
        impressions: item.impressions,
        clicks: item.clicks,
        ctrActual: item.ctrActual,
        ctrBaseline: item.ctrBaseline,
        zcr: item.zcr,
        aiPresenceRate: item.aiPresenceRate,
        airi: item.airi,
        gbpImpressions: item.gbpImpressions,
        gbpActions: item.gbpActions,
        zcco: item.zcco,
        adjustedZeroClick: item.adjustedZeroClick
      }))
    });
  } catch (error) {
    console.error('Zero-click summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zero-click summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
