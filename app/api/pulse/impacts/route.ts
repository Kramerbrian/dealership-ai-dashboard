import { NextRequest, NextResponse } from 'next/server';
import { allow, rl_publicAPI } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'anon';
  const ok = await allow(rl_publicAPI, `impacts:${ip}`);
  
  if (!ok.success) {
    return NextResponse.json(
      { ok: false, rateLimited: true },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  // { marketId, oem?, model?, dealers?[] }
  
  // TODO: wire to your pulse compute job — this returns demo shape
  const impacts = (body?.dealers || ['demo']).map((dealer: string) => ({
    dealerId: dealer,
    modelId: (body?.model || 'model3').toLowerCase(),
    baseline: { msrp: 35000, otd: 32990 },
    appraisalAdj: -3500,
    priceAction: { recommendedOtd: 29490, actionLabel: 'REPRICE_INVENTORY' },
    forecast: {
      leadLiftPct: 0.08,
      volumeLiftUnits: 5.2,
      grossImpactUsd: -6400
    },
    confidence: 0.9
  }));

  return NextResponse.json({
    ok: true,
    runId: `run_${Date.now()}`,
    impacts
  });
}
