import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId required' },
        { status: 400 }
      );
    }

    // In production, compute deltas from Insight history
    // For now, return demo deltas
    const items = [
      {
        title: 'AI Mention Rate',
        delta: 6,
        action: {
          id: 'a_schema',
          label: 'Publish FAQ schema',
          kind: 'schema_fix',
        },
      },
      {
        title: 'GBP Health',
        delta: 5,
        action: {
          id: 'a_gbp',
          label: 'Sync holiday hours',
          kind: 'gbp_update',
        },
      },
      {
        title: 'Zero-Click Coverage',
        delta: -3,
        action: {
          id: 'a_zero',
          label: 'Add Service Q&A',
          kind: 'schema_fix',
        },
      },
    ];

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[Focus Today] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily focus' },
      { status: 500 }
    );
  }
}

