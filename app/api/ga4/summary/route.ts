import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/_utils/withAuth';
import { traced } from '@/lib/api-wrap';

/**
 * GET /api/ga4/summary?domain=...
 * Returns GA4 summary data for pulse adapter
 */
export const GET = withAuth(
  traced(async ({ req, tenantId }: any) => {
    try {
      const url = new URL(req.url);
      const domain = url.searchParams.get('domain') || undefined;

      // TODO: Fetch real GA4 data from Google Analytics API
      // For now, return synthetic data
      const synthetic = {
        sessions: Math.floor(Math.random() * 5000) + 1000, // 1000-6000
        aiAssistedSessions: Math.floor(Math.random() * 500) + 100, // 100-600
        bounceRatePct: Math.floor(Math.random() * 20) + 45, // 45-65%
        rangeDays: 30,
      };

      return NextResponse.json({
        ok: true,
        domain: domain || null,
        ...synthetic,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch GA4 summary' },
        { status: 500 }
      );
    }
  }, 'ga4.summary')
);

