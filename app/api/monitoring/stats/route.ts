/**
 * GET /api/monitoring/stats
 * Get production performance statistics
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminRoute } from '@/lib/api/enhanced-route';
import { getPerformanceStats, getHealthStatus } from '@/lib/monitoring/production';

export const GET = createAdminRoute(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const timeWindow = parseInt(searchParams.get('window') || '60', 10);

    const stats = getPerformanceStats(timeWindow);
    const health = getHealthStatus();

    return NextResponse.json({
      ok: true,
      stats,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to get monitoring stats' },
      { status: 500 }
    );
  }
});

