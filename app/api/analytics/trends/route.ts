import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || undefined;
    const dealerId = searchParams.get('dealerId') || undefined;
    const days = parseInt(searchParams.get('days') || undefined || '30');

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'domain or dealerId required' },
        { status: 400 }
      );
    }

    // Get dealer
    let dealer;
    if (dealerId) {
      dealer = await db.dealer.findUnique({ where: { id: dealerId } });
    } else if (domain) {
      dealer = await db.dealer.findUnique({ where: { domain } });
    }

    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealership not found' },
        { status: 404 }
      );
    }

    // Get historical scores
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const scores = await db.score.findMany({
      where: {
        dealerId: dealer.id,
        analyzedAt: {
          gte: since,
        },
      },
      orderBy: {
        analyzedAt: 'asc',
      },
    });

    // Get pulse trends if available
    const pulseTrends = await db.pulseTrend.findMany({
      where: {
        dealerId: dealer.id,
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Format historical data
    const historical = scores.map((score) => ({
      date: score.analyzedAt.toISOString().split('T')[0],
      overall: score.qaiScore,
      aiVisibility: score.aiVisibility,
      zeroClickShield: score.zeroClickShield,
      ugcHealth: score.ugcHealth,
      geoTrust: score.geoTrust,
      sgpIntegrity: score.sgpIntegrity,
    }));

    // Calculate trends
    const trends = {
      overall: calculateTrend(scores.map((s) => s.qaiScore)),
      aiVisibility: calculateTrend(scores.map((s) => s.aiVisibility)),
      zeroClickShield: calculateTrend(scores.map((s) => s.zeroClickShield)),
      ugcHealth: calculateTrend(scores.map((s) => s.ugcHealth)),
      geoTrust: calculateTrend(scores.map((s) => s.geoTrust)),
      sgpIntegrity: calculateTrend(scores.map((s) => s.sgpIntegrity)),
    };

    // Generate predictions using advanced forecasting models
    const scoreValues = scores.map((s) => s.qaiScore);
    
    // Use hybrid forecasting (ARIMA + LSTM + Linear)
    const { hybridForecast } = await import('@/lib/forecasting/advanced-models');
    const forecast = hybridForecast(scoreValues, 30);
    
    const predictions = {
      next7Days: forecast.predictions[6] || generatePrediction(scoreValues, 7),
      next30Days: forecast.predictions[29] || generatePrediction(scoreValues, 30),
      confidence: forecast.confidence,
      method: forecast.method,
      allPredictions: forecast.predictions.slice(0, 30), // Full 30-day forecast
      metadata: forecast.metadata,
    };

    // Get pulse score trends
    const pulseTrendData = pulseTrends.map((pt) => ({
      metric: pt.metric,
      current: pt.current,
      trend: pt.trend,
      velocity: pt.velocity,
      forecast: pt.forecast,
    }));

    return NextResponse.json({
      historical,
      trends,
      predictions,
      pulseTrends: pulseTrendData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Analytics trends error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateTrend(values: number[]): { direction: string; velocity: number; change: number } {
  if (values.length < 2) {
    return { direction: 'stable', velocity: 0, change: 0 };
  }

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const velocity = change / values.length; // Average change per data point

  return {
    direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
    velocity: Math.round(velocity * 100) / 100,
    change: Math.round(change * 100) / 100,
  };
}

function generatePrediction(values: number[], days: number): number {
  if (values.length < 2) {
    return values[0] || 75;
  }

  // Simple linear regression
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const futureX = n + days;
  const prediction = slope * futureX + intercept;

  return Math.max(0, Math.min(100, Math.round(prediction * 100) / 100));
}

function calculateConfidence(dataPoints: number): number {
  // More data points = higher confidence
  if (dataPoints >= 30) return 0.92;
  if (dataPoints >= 14) return 0.85;
  if (dataPoints >= 7) return 0.75;
  return 0.65;
}

