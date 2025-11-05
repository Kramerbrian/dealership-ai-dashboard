/**
 * POST /api/attribution/calculate
 * 
 * Calculate revenue attribution for a dealership
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";
import { RevenueAttributionEngine } from "@/lib/attribution/revenue-calculator";
import { z } from "zod";

const attributionSchema = z.object({
  dealershipId: z.string(),
  periodDays: z.number().optional().default(30),
});

export const POST = createApiRoute(
  {
    endpoint: '/api/attribution/calculate',
    requireAuth: true,
    validateBody: attributionSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { dealershipId, periodDays } = body;

      const result = await RevenueAttributionEngine.calculateAttribution(
        dealershipId,
        periodDays
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Attribution calculation error:', error);
      return NextResponse.json(
        { error: 'Failed to calculate attribution' },
        { status: 500 }
      );
    }
  }
);
