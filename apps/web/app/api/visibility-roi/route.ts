/**
 * Visibility ROI API
 * Returns revenue impact per visibility gain metric
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ROIMetric {
  metric: string;
  visibilityGain: number;
  revenueImpact: number;
  color: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
    }

    // TODO: Calculate from historical conversion data
    // For now, return mock data based on industry benchmarks
    
    const metrics: ROIMetric[] = [
      {
        metric: 'AI Overview',
        visibilityGain: 15,
        revenueImpact: 1250,
        color: '#3b82f6'
      },
      {
        metric: 'Maps',
        visibilityGain: 12,
        revenueImpact: 980,
        color: '#10b981'
      },
      {
        metric: 'ChatGPT',
        visibilityGain: 8,
        revenueImpact: 620,
        color: '#8b5cf6'
      },
      {
        metric: 'Gemini',
        visibilityGain: 6,
        revenueImpact: 480,
        color: '#f59e0b'
      }
    ];

    const avgROI = metrics.reduce((sum, m) => sum + m.revenueImpact, 0) / metrics.length;

    return NextResponse.json({
      metrics,
      avgROI
    });
  } catch (error: any) {
    console.error('Visibility ROI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

