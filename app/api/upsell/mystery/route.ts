import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { track } from '@/lib/telemetry';

export async function POST(req: Request) {
  try {
    const { tenantId, competitorName, tier } = await req.json();

    if (!tenantId || !competitorName) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, competitorName' },
        { status: 400 }
      );
    }

    const action = await prisma.action.create({
      data: {
        tenantId,
        kind: 'mystery_shop',
        status: 'queued',
        impact: 0,
        meta: {
          competitorName,
          tier: tier || 'lite',
        },
      },
    });

    await track('upsell_mystery_shop', {
      tenantId,
      competitorName,
      tier,
      actionId: action.id,
    });

    return NextResponse.json({ ok: true, actionId: action.id });
  } catch (error) {
    console.error('[Upsell Mystery] Error:', error);
    return NextResponse.json(
      { error: 'Failed to queue mystery shop' },
      { status: 500 }
    );
  }
}

