import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  fetchGbpDaily,
  fetchGscDaily,
  fetchAIPresenceRate
} from '@/lib/zero-click/enhanced-fetchers';
import { chooseBaselineCtr } from '@/lib/zero-click/fetchers';
import {
  calcZCR,
  calcZCCO,
  calcAIRI,
  adjustedZeroClick
} from '@/lib/zero-click/math';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, date } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Parse date or use today
    const day = date ? new Date(date) : new Date();
    const dateISO = day.toISOString().slice(0, 10);

    // 1) Pull data from all sources
    const [gsc, gbp] = await Promise.all([
      fetchGscDaily(tenantId, dateISO),
      fetchGbpDaily(tenantId, dateISO)
    ]);

    // 2) Aggregate GSC data across all cohorts
    const impressions = gsc.reduce((s, r) => s + r.impressions, 0);
    const clicks = gsc.reduce((s, r) => s + r.clicks, 0);
    const { ctrActual, zcr } = calcZCR(clicks, impressions);

    // 3) Baseline lookup (blend cohorts)
    const baselines = await db.ctrBaseline.findMany({
      where: { tenantId }
    });

    const baselineMap: Record<string, number> = {};
    for (const b of baselines) {
      baselineMap[`${b.device}:${b.cohort}`] = b.ctr;
    }

    const ctrBaseline = chooseBaselineCtr(baselineMap);

    // 4) AI Presence Rate
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const aiPresenceRate = await fetchAIPresenceRate(tenantId, start, end);
    const airi = calcAIRI(aiPresenceRate, ctrBaseline, ctrActual);

    // 5) GBP offsets
    const gbpImpressions = gbp.views || 0;
    const gbpActions =
      (gbp.calls || 0) +
      (gbp.directions || 0) +
      (gbp.messages || 0) +
      (gbp.bookings || 0);
    const zcco = calcZCCO(gbpActions, gbpImpressions);

    // 6) Final adjusted zero-click
    const adj = adjustedZeroClick(zcr, zcco);

    // 7) Save to database (upsert by tenantId + date)
    const saved = await db.zeroClickDaily.upsert({
      where: {
        tenantId_date: {
          tenantId,
          date: new Date(dateISO)
        }
      },
      create: {
        tenantId,
        date: new Date(dateISO),
        impressions,
        clicks,
        ctrActual,
        ctrBaseline,
        zcr,
        aiPresenceRate,
        airi,
        gbpImpressions,
        gbpActions,
        zcco,
        adjustedZeroClick: adj
      },
      update: {
        impressions,
        clicks,
        ctrActual,
        ctrBaseline,
        zcr,
        aiPresenceRate,
        airi,
        gbpImpressions,
        gbpActions,
        zcco,
        adjustedZeroClick: adj
      }
    });

    // 8) Trigger training feedback (async, don't wait)
    try {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/model/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          date: dateISO,
          metrics: {
            aviDelta: 0, // Would calculate from previous period
            atiDelta: 0,
            inclusionDelta: 0
          }
        })
      }).catch(err => console.error('Training feedback error:', err));
    } catch (err) {
      // Don't fail if training feedback fails
      console.error('Training feedback trigger error:', err);
    }

    return NextResponse.json({
      ok: true,
      saved: {
        id: saved.id,
        date: saved.date.toISOString(),
        adjustedZeroClick: saved.adjustedZeroClick,
        zcr: saved.zcr,
        zcco: saved.zcco,
        airi: saved.airi
      }
    });
  } catch (error) {
    console.error('Zero-click recompute error:', error);
    return NextResponse.json(
      { error: 'Failed to recompute zero-click metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
