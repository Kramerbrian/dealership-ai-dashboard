import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/_utils/withAuth';
import { traced } from '@/lib/api-wrap';

/**
 * GET /api/ga4/summary?domain=...
 * Returns GA4 summary data for pulse adapter
 */
export const GET = withAuth(
  traced(async ({ req, tenantId }) => {
    try {
      const url = new URL(req.url);
      const domain = url.searchParams.get('domain');

      // Fetch real GA4 data from Google Analytics API
      const { ga4Service } = await import('@/lib/services/ga4');
      const summary = await ga4Service.getSummary(domain || '', 30);

      return NextResponse.json({
        ok: true,
        domain: domain || null,
        ...summary,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch GA4 summary' },
        { status: 500 }
      );
    }
  }, 'ga4.summary')
);

