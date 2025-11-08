import { NextRequest, NextResponse } from 'next/server';
import { traced } from '@/lib/api-wrap';
import { visibilityToPulses } from '@/lib/adapters/visibility';

export const GET = traced(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || undefined;

    // Get visibility pulses
    const visibilityPulses = await visibilityToPulses(domain);

    // Combine with other pulse sources (schema, reviews, etc.)
    const allPulses = [
      ...visibilityPulses,
      // Add other pulse sources here
    ];

    // Sort by impact (highest first)
    allPulses.sort((a, b) => b.impactMonthlyUSD - a.impactMonthlyUSD);

    return NextResponse.json({
      ok: true,
      snapshot: {
        timestamp: new Date().toISOString(),
        domain: domain || 'all',
        pulses: allPulses,
        total: allPulses.length,
        totalImpact: allPulses.reduce((sum, p) => sum + p.impactMonthlyUSD, 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pulse snapshot' },
      { status: 500 }
    );
  }
}, 'pulse.snapshot');

