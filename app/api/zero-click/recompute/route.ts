/**
 * Zero-Click Recompute API
 * Processes daily Zero-Click Rate calculations
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock data - replace with actual database integration
async function getPrisma() {
  // Return mock data for production build
  return {
    zeroClickDaily: {
      upsert: async (params: any) => {
        console.log('Mock: Saving zero-click metrics', params);
        return { ...params.create, id: 'mock-id' };
      }
    },
    ctrBaseline: {
      findMany: async () => []
    }
  };
}

async function fetchGscDaily(tenantId: string, date: string) {
  // Mock GSC data
  return [
    { impressions: 10000, clicks: 1500, device: 'mobile', cohort: 'brand_pos_1_3' }
  ];
}

async function fetchGbpDaily(tenantId: string, date: string) {
  // Mock GBP data
  return {
    views: 6000,
    calls: 120,
    directions: 90,
    messages: 25,
    bookings: 10
  };
}

async function fetchAIPresenceRate(tenantId: string, start: Date, end: Date) {
  // Mock AI presence rate
  return 0.62;
}

function chooseBaselineCtr(baselines: Record<string, number>) {
  const values = Object.values(baselines);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0.06;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function calcZCR(clicks: number, impressions: number) {
  if (impressions <= 0) return { ctrActual: 0, zcr: 0 };
  const ctrActual = clicks / impressions;
  return { ctrActual, zcr: clamp(1 - ctrActual) };
}

function calcAIRI(aiPresenceRate: number, ctrBaseline: number, ctrActual: number) {
  return (aiPresenceRate || 0) * Math.max(0, (ctrBaseline || 0) - (ctrActual || 0));
}

function calcZCCO(gbpActions: number, gbpImpressions: number) {
  return gbpImpressions <= 0 ? 0 : clamp(gbpActions / gbpImpressions);
}

function adjustedZeroClick(zcr: number, zcco: number) {
  return clamp(zcr - zcco);
}

export async function POST(req: Request) {
  try {
    const { tenantId, date } = await req.json();
    const day = date ? new Date(date) : new Date();
    const dateISO = day.toISOString().slice(0, 10);

    // 1) Pull data
    const gsc = await fetchGscDaily(tenantId, dateISO);
    const gbp = await fetchGbpDaily(tenantId, dateISO);

    // 2) Aggregate GSC
    const impressions = gsc.reduce((s, r) => s + r.impressions, 0);
    const clicks = gsc.reduce((s, r) => s + r.clicks, 0);
    const { ctrActual, zcr } = calcZCR(clicks, impressions);

    // 3) Baseline lookup (blend cohorts)
    const prisma = await getPrisma();
    const baselines = await prisma.ctrBaseline.findMany({ where: { tenantId } });
    const ctrBaseline = chooseBaselineCtr(
      Object.fromEntries(baselines.map(b => [`${b.device}:${b.cohort}`, b.ctr]))
    );

    // 4) AI Presence
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const aiPresenceRate = await fetchAIPresenceRate(tenantId, start, end);
    const airi = calcAIRI(aiPresenceRate, ctrBaseline, ctrActual);

    // 5) GBP offsets
    const gbpImpressions = gbp.views || 0;
    const gbpActions = (gbp.calls || 0) + (gbp.directions || 0) + (gbp.messages || 0) + (gbp.bookings || 0);
    const zcco = calcZCCO(gbpActions, gbpImpressions);

    // 6) Final
    const adj = adjustedZeroClick(zcr, zcco);

    const saved = await prisma.zeroClickDaily.upsert({
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

    return NextResponse.json({ ok: true, saved });
  } catch (error) {
    console.error('Zero-Click recompute error:', error);
    return NextResponse.json({ error: 'Failed to recompute' }, { status: 500 });
  }
}
