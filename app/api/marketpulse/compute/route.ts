import { NextRequest, NextResponse } from 'next/server';
import { createEnhancedApiRoute } from '@/lib/api-enhanced-wrapper';
import { z } from 'zod';

export const runtime = 'nodejs';

const computeSchema = z.object({
  dealerId: z.string().optional(),
  pvr: z.number().optional(),
  adExpense: z.number().optional(),
});

/**
 * GET /api/marketpulse/compute
 * Compute market pulse KPIs for onboarding
 */
export const GET = createEnhancedApiRoute(
  {
    endpoint: '/api/marketpulse/compute',
    requireAuth: false,
    rateLimit: { windowSeconds: 60, maxRequests: 30 },
    performanceMonitoring: true,
  },
  async (req) => {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || 'demo';
    const pvr = parseFloat(searchParams.get('pvr') || '0');
    const adExpense = parseFloat(searchParams.get('adExpense') || '0');

    // Mock KPI computation
    const vai = 78.5 + Math.random() * 10; // AI Visibility Index
    const piqr = 82.3 + Math.random() * 8; // Perplexity Inclusion Quality Rate
    const hrp = 0.15 + Math.random() * 0.1; // Hallucination Risk Probability
    const qai = 75.2 + Math.random() * 12; // Query Answerability Index

    // Calculate revenue at risk
    const monthlyRevenue = pvr * 12;
    const revenueAtRisk = monthlyRevenue * (1 - vai / 100) * 0.3;

    return {
      dealerId,
      timestamp: new Date().toISOString(),
      kpis: {
        vai: Math.round(vai * 10) / 10,
        piqr: Math.round(piqr * 10) / 10,
        hrp: Math.round(hrp * 100) / 100,
        qai: Math.round(qai * 10) / 10,
      },
      financial: {
        monthlyRevenue,
        revenueAtRisk: Math.round(revenueAtRisk),
        adExpense,
        roi: adExpense > 0 ? Math.round((revenueAtRisk / adExpense) * 100) : 0,
      },
      trends: {
        vai: Math.random() > 0.5 ? 'up' : 'down',
        piqr: Math.random() > 0.5 ? 'up' : 'down',
        qai: Math.random() > 0.5 ? 'up' : 'down',
      },
      recommendations: [
        {
          priority: 'high',
          action: 'Add missing schema types',
          impact: '+12% VAI',
          effort: 'Low',
        },
        {
          priority: 'medium',
          action: 'Respond to recent reviews',
          impact: '+8% PIQR',
          effort: 'Medium',
        },
        {
          priority: 'low',
          action: 'Optimize FAQ content',
          impact: '+5% QAI',
          effort: 'Low',
        },
      ],
    };
  }
);

/**
 * POST /api/marketpulse/compute
 * Compute with full dealer context
 */
export const POST = createEnhancedApiRoute(
  {
    endpoint: '/api/marketpulse/compute',
    requestSchema: computeSchema,
    requireAuth: false,
    rateLimit: { windowSeconds: 60, maxRequests: 20 },
    performanceMonitoring: true,
  },
  async (req, auth, validatedBody) => {
    const { dealerId, pvr, adExpense } = validatedBody!;

    // Use GET logic with POST body
    const url = new URL(req.url);
    url.searchParams.set('dealerId', dealerId || 'demo');
    if (pvr) url.searchParams.set('pvr', pvr.toString());
    if (adExpense) url.searchParams.set('adExpense', adExpense.toString());

    const getReq = new NextRequest(url.toString());
    return GET(getReq, {} as any);
  }
);

