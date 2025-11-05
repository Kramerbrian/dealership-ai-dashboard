import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface HistoricalPoint {
  date: string;
  scores: Record<string, number>;
}

/**
 * Calculate linear trend using simple regression
 */
function calculateTrend(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  if (points.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
  const ssRes = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  return { slope, intercept, r2 };
}

/**
 * Generate forecast for next month (30 days)
 */
function generateForecast(
  currentValue: number,
  trend: { slope: number; intercept: number },
  days: number = 30
): number {
  // Assume daily data points, so day 30 = index 30
  return Math.max(0, Math.min(100, trend.slope * days + trend.intercept));
}

/**
 * Simulate historical data for demo purposes
 * In production, fetch from database
 */
function simulateHistoricalData(domain: string, days: number = 90): HistoricalPoint[] {
  const baseScore = 70 + (domain.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 25);
  const points: HistoricalPoint[] = [];

  // Generate trending data with some noise
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const trendFactor = (days - i) * 0.1; // Slight upward trend
    const noise = (Math.random() - 0.5) * 3;

    const aiv = Math.max(0, Math.min(100, baseScore + trendFactor + noise));
    const ati = Math.max(0, Math.min(100, baseScore - 5 + trendFactor + noise));
    const cvi = Math.max(0, Math.min(100, baseScore + 5 + trendFactor + noise));
    const ori = Math.max(0, Math.min(100, baseScore - 10 + trendFactor + noise));
    const gri = Math.max(0, Math.min(100, baseScore + 2 + trendFactor + noise));
    const dpi = Math.round(
      0.25 * aiv + 0.20 * ati + 0.25 * cvi + 0.20 * ori + 0.10 * gri
    );

    points.push({
      date: date.toISOString().split("T")[0],
      scores: { AIV: Math.round(aiv), ATI: Math.round(ati), CVI: Math.round(cvi), ORI: Math.round(ori), GRI: Math.round(gri), DPI: dpi },
    });
  }

  return points;
}

/**
 * GET /api/forecast/kpi?domain=example.com
 * 
 * Returns forecast projections for next month's KPIs based on historical trajectory
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "domain parameter is required" }, { status: 400 });
    }

    // Fetch or simulate historical data (last 90 days)
    const historical = simulateHistoricalData(domain, 90);

    if (historical.length < 7) {
      return NextResponse.json({
        error: "Insufficient historical data",
        recommendation: "Need at least 7 days of data",
      });
    }

    const current = historical[historical.length - 1];
    const metrics = ["AIV", "ATI", "CVI", "ORI", "GRI", "DPI"];
    const forecasts: Record<string, any> = {};

    // Calculate forecast for each metric
    for (const metric of metrics) {
      const points = historical.map((h, idx) => ({
        x: idx,
        y: h.scores[metric] || 0,
      }));

      const trend = calculateTrend(points);
      const projected = generateForecast(current.scores[metric] || 0, trend, 30);

      const change = projected - (current.scores[metric] || 0);
      const changePercent = current.scores[metric] > 0 
        ? ((change / current.scores[metric]) * 100).toFixed(1)
        : "0.0";

      forecasts[metric] = {
        current: current.scores[metric] || 0,
        projected: Math.round(projected),
        change: Math.round(change * 10) / 10,
        changePercent: `${change >= 0 ? "+" : ""}${changePercent}%`,
        trend: trend.slope > 0.1 ? "up" : trend.slope < -0.1 ? "down" : "stable",
        confidence: Math.round(trend.r2 * 100),
        trendRate: Math.abs(trend.slope).toFixed(2),
      };
    }

    // Calculate revenue impact (assume $500 per AIV point improvement)
    const aivChange = forecasts.AIV.change;
    const estimatedRevenueImpact = aivChange * 500;

    return NextResponse.json(
      {
        domain,
        current,
        forecasts,
        summary: {
          avgCurrent: Math.round(
            metrics.reduce((sum, m) => sum + (current.scores[m] || 0), 0) / metrics.length
          ),
          avgProjected: Math.round(
            metrics.reduce((sum, m) => sum + forecasts[m].projected, 0) / metrics.length
          ),
          estimatedRevenueImpact,
          projectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        historical: historical.slice(-30), // Last 30 days for visualization
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Forecast API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate forecast" },
      { status: 500 }
    );
  }
}

