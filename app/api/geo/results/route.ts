/**
 * GET /api/geo/results
 * 
 * Get GEO test results for a city
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";

export const GET = createApiRoute(
  {
    endpoint: '/api/geo/results',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const city = searchParams.get('city') || 'Naples';

      // In production, query actual database
      // For now, return mock data
      const results = [];
      const score = {
        dealership_id: 'current',
        period: '7d',
        prompts_tested: 16,
        named_count: 10,
        geo_score: 62,
        citation_mix: 5,
        answer_surface_mix: 75,
        time_to_update_days: 2,
      };

      return NextResponse.json({
        success: true,
        results,
        score,
      });
    } catch (error) {
      console.error('GEO results fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch GEO results' },
        { status: 500 }
      );
    }
  }
);

