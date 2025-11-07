import { NextRequest, NextResponse } from 'next/server';
import { processMetrics } from '@/lib/pulse/tile-generator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/pulse-harvest
 * 
 * Daily metric harvest + delta detection
 * Called by Vercel Cron or scheduled worker
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenantId; // Optional: process specific tenant

    // TODO: Collect metrics from all data sources
    // This is a placeholder - integrate with your actual data collectors
    const metrics = [
      // Example metrics - replace with real collectors
      {
        key: 'AIO_CTR',
        currentValue: 0.045,
        previousValue: 0.050,
        threshold: 0.040,
        source: 'ga4' as const,
        volatility: 0.6,
        lastUpdated: new Date()
      },
      {
        key: 'AIV_COMPOSITE',
        currentValue: 82,
        previousValue: 86,
        threshold: 80,
        source: 'custom' as const,
        volatility: 0.4,
        lastUpdated: new Date()
      }
    ];

    // Process metrics and generate tiles
    // If tenantId provided, process only that tenant
    // Otherwise, process all tenants (would need tenant list)
    if (tenantId) {
      const tiles = await processMetrics(tenantId, metrics);
      return NextResponse.json({
        success: true,
        tenantId,
        tilesCreated: tiles.length
      });
    }

    // TODO: Process all tenants
    return NextResponse.json({
      success: true,
      message: 'Harvest completed (single tenant mode)'
    });
  } catch (error: any) {
    console.error('Pulse harvest error:', error);
    return NextResponse.json(
      { error: 'Harvest failed' },
      { status: 500 }
    );
  }
}

