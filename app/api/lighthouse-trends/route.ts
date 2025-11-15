import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/lighthouse-trends
 * 
 * Returns 7-day rolling averages and trend data for Lighthouse metrics.
 * Used by dashboards to render performance charts.
 * 
 * Query params:
 * - days: Number of days to include (default: 7)
 * - metric: perf | acc | bp | seo | avg (default: avg)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || undefined || '7');
    const metric = url.searchParams.get('metric') || undefined || 'avg';

    // Read lighthouse history
    let logData: Array<{
      timestamp: string;
      perf: number;
      acc: number;
      bp: number;
      seo: number;
      avg: number;
      url: string;
    }> = [];

    try {
      const logFile = path.join(process.cwd(), 'data', 'lighthouse-history.json');
      if (fs.existsSync(logFile) && fs.statSync(logFile).size > 0) {
        const content = fs.readFileSync(logFile, 'utf8');
        logData = JSON.parse(content);
      }
    } catch (fileError) {
      console.warn('[lighthouse-trends] File read failed (expected in Vercel):', fileError);
      // In production, read from database or KV store
    }

    if (logData.length === 0) {
      return NextResponse.json({
        trends: [],
        rollingAverage: 0,
        change: 0,
        message: 'No historical data available yet',
      });
    }

    // Filter to last N days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = logData
      .filter((entry) => new Date(entry.timestamp) > cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (recent.length === 0) {
      return NextResponse.json({
        trends: [],
        rollingAverage: 0,
        change: 0,
        message: `No data in last ${days} days`,
      });
    }

    // Extract metric values
    const values = recent.map((entry) => entry[metric as keyof typeof entry] as number);
    const rollingAverage = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    // Calculate change (first vs last)
    const change = values.length > 1 ? values[values.length - 1] - values[0] : 0;

    // Prepare chart-ready data
    const trends = recent.map((entry) => ({
      date: entry.timestamp,
      perf: entry.perf,
      acc: entry.acc,
      bp: entry.bp,
      seo: entry.seo,
      avg: entry.avg,
    }));

    return NextResponse.json(
      {
        metric,
        days,
        trends,
        rollingAverage,
        change,
        changePercent: values.length > 1
          ? Math.round((change / values[0]) * 100)
          : 0,
        current: values[values.length - 1],
        min: Math.min(...values),
        max: Math.max(...values),
        count: recent.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('[lighthouse-trends] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compute trends' },
      { status: 500 }
    );
  }
}

