import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/_utils/withAuth';
import { traced } from '@/lib/api-wrap';

/**
 * GET /api/reviews/summary?placeId=...&domain=...
 * Returns review summary data for pulse adapter
 */
export const GET = (withAuth as any)(
  traced(async ({ req, tenantId }: any) => {
    try {
      const url = new URL(req.url);
      const placeId = url.searchParams.get('placeId') || undefined;
      const domain = url.searchParams.get('domain') || undefined;

      // TODO: Fetch real review data from Google Places API or database
      // For now, return synthetic data
      const synthetic = {
        replyLatencyHours: Math.floor(Math.random() * 72) + 12, // 12-84 hours
        recentUnanswered: Math.floor(Math.random() * 10), // 0-10
        replyRatePct: Math.floor(Math.random() * 30) + 70, // 70-100%
        last30New: Math.floor(Math.random() * 60) + 20, // 20-80
        avgRating: 4.0 + Math.random() * 0.8, // 4.0-4.8
      };

      return NextResponse.json({
        ok: true,
        placeId: placeId || null,
        domain: domain || null,
        ...synthetic,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch review summary' },
        { status: 500 }
      );
    }
  }, 'reviews.summary')
);

