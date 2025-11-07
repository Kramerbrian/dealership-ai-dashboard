import { NextRequest, NextResponse } from 'next/server';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';
import { createOrUpdateTile } from '@/lib/pulse/tile-generator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pulse/new-tile
 * 
 * Create or update a pulse tile from metric data
 */
export async function POST(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      metricKey,
      currentValue,
      previousValue,
      threshold,
      source,
      volatility,
      change,
      impact,
      urgency,
      insight
    } = body;

    if (!metricKey || currentValue === undefined || previousValue === undefined) {
      return NextResponse.json(
        { error: 'metricKey, currentValue, and previousValue are required' },
        { status: 400 }
      );
    }

    const metric = {
      key: metricKey,
      currentValue: Number(currentValue),
      previousValue: Number(previousValue),
      threshold: Number(threshold || 0),
      source: (source || 'custom') as 'ga4' | 'gsc' | 'gbp' | 'crm' | 'reviews' | 'vauto' | 'custom',
      volatility: Number(volatility || 0.5),
      lastUpdated: new Date()
    };

    const tile = await createOrUpdateTile(isolation.tenantId, metric);

    if (!tile) {
      return NextResponse.json({
        success: false,
        message: 'Signal strength too low - tile not created'
      });
    }

    return NextResponse.json({
      success: true,
      tile
    });
  } catch (error: any) {
    console.error('New tile error:', error);
    return NextResponse.json(
      { error: 'Failed to create tile' },
      { status: 500 }
    );
  }
}

