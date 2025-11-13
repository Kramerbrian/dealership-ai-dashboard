/**
 * POST /api/trust/scan/full
 * Full trust scan - returns all core metrics + E-E-A-T + citations + conflicts
 * Queue: trust_scan
 * Timeout: 25 seconds
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';
import {
  calculateFreshnessScore,
  calculateBusinessIdentityMatchScore,
  calculateReviewTrustScore,
  calculateSchemaCoverage,
  calculateAIMentionRate,
  calculateZeroClickCoverage,
  calculateTrustScore,
  DEFAULT_TRUST_WEIGHTS,
  type CoreMetrics,
} from '@/lib/trust/core-metrics';
import { tokenResolver } from '@/lib/personalization/tokens';
import { applyBindings } from '@/lib/personalization/bindings';

const ScanFullSchema = z.object({
  dealer_url: z.string().url('Valid dealer URL is required'),
  email: z.string().email().optional(),
  geo: z.string().optional(),
  referral_code: z.string().optional(),
});

export const POST = createAuthRoute(async (req: NextRequest, { userId, tenantId }) => {
  try {
    const body = await req.json();
    const validated = ScanFullSchema.parse(body);
    const { dealer_url, email, geo, referral_code } = validated;

    // Resolve personalization tokens
    const tokens = await tokenResolver.resolve({
      query: { dealer_id: dealer_url, geo_tier: geo },
      jwt: { dealer_id: dealer_url, group_id: tenantId },
      userId,
      dealerId: dealer_url,
    });

    // Apply bindings
    const bindings = applyBindings(tokens);
    const weights = bindings.weights || DEFAULT_TRUST_WEIGHTS;

    // TODO: Queue full scan job instead of running synchronously
    // For now, simulate full scan
    const coreMetrics: CoreMetrics = {
      freshness_score: 87,
      business_identity_match_score: 92,
      review_trust_score: 88,
      schema_coverage: 85,
      ai_mention_rate: 73,
      zero_click_coverage: 68,
      trust_score: calculateTrustScore(
        {
          freshness_score: 87,
          business_identity_match_score: 92,
          review_trust_score: 88,
          schema_coverage: 85,
          ai_mention_rate: 73,
          zero_click_coverage: 68,
        },
        weights,
        tokens.identity.geo_tier
      ),
    };

    // E-E-A-T score (placeholder - would calculate from real signals)
    const eeat_score = {
      experience: 82,
      expertise: 85,
      authoritativeness: 78,
      trustworthiness: 90,
      overall: 84,
    };

    // Citations (placeholder)
    const citations = [
      { platform: 'Google Business Profile', verified: true },
      { platform: 'Yelp', verified: true },
      { platform: 'BBB', verified: false },
    ];

    // Conflicts (placeholder - would scan Reddit, forums, social)
    const conflicts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      source: string;
    }> = [];

    // Competitors (placeholder)
    const competitors: Array<{
      dealer_id: string;
      trust_score: number;
      gap: number;
    }> = [];

    // Trend 30d (placeholder)
    const trend_30d = {
      trust_score: +2.3,
      freshness_score: +1.5,
      review_trust_score: +3.2,
    };

    const report_id = `full_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      ok: true,
      ...coreMetrics,
      eeat_score,
      citations,
      conflicts,
      competitors,
      trend_30d,
      report_id,
      dealer_url,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Trust scan full error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Full trust scan failed' },
      { status: 500 }
    );
  }
}, {
  schema: ScanFullSchema,
});

