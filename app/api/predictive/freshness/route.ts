import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/predictive/freshness?dealerId=xxx
 * 
 * Predictive Freshness: Use time-series forecasting to predict when
 * content will fall below freshness threshold
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId query parameter is required' },
        { status: 400 }
      );
    }

    // Get historical freshness data
    const audits = await prisma.audit.findMany({
      where: {
        dealershipId: dealerId,
        scores: {
          path: ['type'],
          equals: 'freshness',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    if (audits.length < 10) {
      return NextResponse.json({
        dealerId,
        error: 'Insufficient historical data for forecasting',
        recommendation: 'Collect at least 10 data points',
      });
    }

    // Parse freshness scores
    const freshnessHistory = audits
      .map((a) => {
        try {
          const data = JSON.parse(a.scores || '{}');
          return {
            date: a.createdAt,
            freshnessScore: data.freshnessScore || 0,
            stalePages: data.stalePages || 0,
          };
        } catch {
          return null;
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .reverse();

    // Simple linear trend forecasting (in production, use Prophet/ARIMA)
    const trend = calculateTrend(freshnessHistory);
    const threshold = 70; // Freshness threshold
    const daysUntilThreshold = calculateDaysUntilThreshold(
      freshnessHistory[freshnessHistory.length - 1].freshnessScore,
      trend,
      threshold
    );

    // Predict next 30 days
    const forecast = generateForecast(
      freshnessHistory[freshnessHistory.length - 1],
      trend,
      30
    );

    return NextResponse.json({
      dealerId,
      current: {
        freshnessScore: freshnessHistory[freshnessHistory.length - 1].freshnessScore,
        stalePages: freshnessHistory[freshnessHistory.length - 1].stalePages,
        lastUpdated: freshnessHistory[freshnessHistory.length - 1].date,
      },
      forecast: {
        daysUntilThreshold,
        estimatedThresholdDate: new Date(
          Date.now() + daysUntilThreshold * 24 * 60 * 60 * 1000
        ).toISOString(),
        trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        trendRate: Math.abs(trend),
      },
      projection: forecast,
      recommendations: [
        {
          priority: daysUntilThreshold < 30 ? 'high' : daysUntilThreshold < 60 ? 'medium' : 'low',
          action: 'Schedule content updates',
          targetDate: new Date(
            Date.now() + Math.max(0, daysUntilThreshold - 14) * 24 * 60 * 60 * 1000
          ).toISOString(),
          pagesToUpdate: Math.ceil((freshnessHistory[freshnessHistory.length - 1].stalePages || 0) * 0.1),
        },
      ],
    });
  } catch (error: any) {
    console.error('Predictive freshness error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}

function calculateTrend(history: Array<{ freshnessScore: number }>): number {
  if (history.length < 2) return 0;

  const recent = history.slice(-10);
  const first = recent[0].freshnessScore;
  const last = recent[recent.length - 1].freshnessScore;

  return (last - first) / recent.length;
}

function calculateDaysUntilThreshold(
  currentScore: number,
  trend: number,
  threshold: number
): number {
  if (trend >= 0) {
    // Improving trend, won't hit threshold
    return Infinity;
  }

  const days = (currentScore - threshold) / Math.abs(trend);
  return Math.max(0, Math.ceil(days));
}

function generateForecast(
  current: { freshnessScore: number; stalePages: number },
  trend: number,
  days: number
): Array<{ date: string; freshnessScore: number; stalePages: number }> {
  const forecast = [];
  const startDate = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const projectedScore = Math.max(
      0,
      Math.min(100, current.freshnessScore + trend * i)
    );
    const projectedStale = Math.max(
      0,
      current.stalePages + Math.abs(trend) * i * 0.5
    );

    forecast.push({
      date: date.toISOString(),
      freshnessScore: Math.round(projectedScore * 10) / 10,
      stalePages: Math.round(projectedStale),
    });
  }

  return forecast;
}

