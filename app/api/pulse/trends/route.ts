/**
 * GET /api/pulse/trends - Historical trends data
 * Returns trend analysis including velocity, acceleration, and forecasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateTrends, type TrendDataPoint } from '@/lib/pulse/trends';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dealerId = searchParams.get('dealerId') || undefined;
    const metric = searchParams.get('metric') || undefined || 'pulse_score';
    const days = parseInt(searchParams.get('days') || undefined || '30', 10);

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId parameter is required' },
        { status: 400 }
      );
    }

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'days parameter must be between 1 and 365' },
        { status: 400 }
      );
    }

    // In production, fetch real historical data from database
    // For now, generate demo historical data
    const historicalData = generateDemoHistoricalData(dealerId, days);

    // Calculate trends
    const trends = await calculateTrends(dealerId, historicalData);

    return NextResponse.json({
      success: true,
      data: trends,
      meta: {
        dealerId,
        metric,
        days,
        dataPoints: historicalData.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Trends endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate trends',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate demo historical data for testing
 * In production, replace with database query
 */
function generateDemoHistoricalData(dealerId: string, days: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();
  
  // Generate deterministic base values from dealerId
  const hash = dealerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseScore = 60 + (hash % 20);
  
  // Generate trend direction (up, down, or stable)
  const trendType = hash % 3;
  const trendSlope = trendType === 0 ? 0.2 : trendType === 1 ? -0.15 : 0.05;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Calculate score with trend and some randomness
    const trendEffect = trendSlope * (days - i);
    const randomNoise = (Math.sin(i * 0.5) + Math.cos(i * 0.3)) * 3;
    const pulseScore = Math.max(30, Math.min(95, baseScore + trendEffect + randomNoise));

    // Generate correlated signal values
    const signals = {
      aiv: Math.max(40, Math.min(100, pulseScore + (Math.sin(i * 0.4) * 10))),
      ati: Math.max(40, Math.min(100, pulseScore + (Math.cos(i * 0.3) * 8))),
      zero_click: Math.max(30, Math.min(100, pulseScore + (Math.sin(i * 0.6) * 12))),
      ugc_health: Math.max(50, Math.min(100, pulseScore + (Math.cos(i * 0.5) * 7))),
      geo_trust: Math.max(45, Math.min(100, pulseScore + (Math.sin(i * 0.7) * 9))),
    };

    data.push({
      timestamp: date,
      pulseScore: Math.round(pulseScore * 10) / 10,
      signals,
    });
  }

  return data;
}
