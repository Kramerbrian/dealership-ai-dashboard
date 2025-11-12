import { NextRequest, NextResponse } from 'next/server';
import { traced } from '@/lib/api-wrap';
import { withAuth } from '@/app/api/_utils/withAuth';
import { visibilityToPulses } from '@/lib/adapters/visibility';
import { schemaToPulses } from '@/lib/adapters/schema';
import { reviewsToPulses } from '@/lib/adapters/reviews';
import { ga4ToPulses } from '@/lib/adapters/ga4';
import { getIntegration } from '@/lib/integrations/store';

export const GET = withAuth(
  traced(async ({ req, tenantId }) => {
    try {
      const url = new URL(req.url);
      const domain = url.searchParams.get('domain') || undefined;

      // Get integration data for reviews (placeId)
      const reviewsIntegration = await getIntegration(tenantId, 'reviews');
      const placeId = reviewsIntegration?.metadata?.place_id;

      // Aggregate pulses from all adapters in parallel
      const [visibilityPulses, schemaPulses, reviewsPulses, ga4Pulses] =
        await Promise.all([
          visibilityToPulses(domain),
          schemaToPulses(domain),
          reviewsToPulses({ placeId, domain }),
          ga4ToPulses(domain),
        ]);

      // Combine all pulses
      const allPulses = [
        ...visibilityPulses,
        ...schemaPulses,
        ...reviewsPulses,
        ...ga4Pulses,
      ];

      // Sort by impact score (impact / effort * confidence)
      allPulses.sort(
        (a, b) =>
          (b.impactMonthlyUSD / b.etaSeconds) * b.confidenceScore -
          (a.impactMonthlyUSD / a.etaSeconds) * a.confidenceScore
      );

      return NextResponse.json({
        ok: true,
        snapshot: {
          timestamp: new Date().toISOString(),
          domain: domain || 'all',
          tenantId,
          pulses: allPulses,
          total: allPulses.length,
          totalImpact: allPulses.reduce(
            (sum, p) => sum + p.impactMonthlyUSD,
            0
          ),
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch pulse snapshot' },
        { status: 500 }
      );
    }
  }, 'pulse.snapshot')
);

