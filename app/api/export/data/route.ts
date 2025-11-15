import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * Export scenarios and trends data
 * Supports CSV and JSON formats
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined;
    const format = searchParams.get('format') || undefined || 'json'; // 'json' | 'csv'
    const type = searchParams.get('type') || undefined || 'all'; // 'scenarios' | 'trends' | 'all'
    const days = parseInt(searchParams.get('days') || undefined || '30');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId required' },
        { status: 400 }
      );
    }

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      dealerId,
    };

    // Export scenarios
    if (type === 'scenarios' || type === 'all') {
      const scenarios = await db.pulseScenario.findMany({
        where: { dealerId },
        orderBy: { createdAt: 'desc' },
      });

      exportData.scenarios = scenarios.map((s) => ({
        id: s.id,
        name: s.scenarioName,
        description: s.description,
        actions: s.actions,
        baselineScore: s.baselineScore,
        projectedScore: s.projectedScore,
        improvement: s.improvement,
        confidence: s.confidence,
        monteCarlo: s.monteCarlo,
        roi: s.roi,
        createdAt: s.createdAt.toISOString(),
      }));
    }

    // Export trends
    if (type === 'trends' || type === 'all') {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const scores = await db.score.findMany({
        where: {
          dealerId,
          analyzedAt: { gte: since },
        },
        orderBy: { analyzedAt: 'asc' },
      });

      exportData.trends = scores.map((s) => ({
        date: s.analyzedAt.toISOString(),
        overall: s.qaiScore,
        aiVisibility: s.aiVisibility,
        zeroClickShield: s.zeroClickShield,
        ugcHealth: s.ugcHealth,
        geoTrust: s.geoTrust,
        sgpIntegrity: s.sgpIntegrity,
      }));

      // Get pulse trends if available
      const pulseTrends = await db.pulseTrend.findMany({
        where: {
          dealerId,
          timestamp: { gte: since },
        },
        orderBy: { timestamp: 'asc' },
      });

      exportData.pulseTrends = pulseTrends.map((pt) => ({
        metric: pt.metric,
        current: pt.current,
        trend: pt.trend,
        velocity: pt.velocity,
        acceleration: pt.acceleration,
        forecast: pt.forecast,
        timestamp: pt.timestamp.toISOString(),
      }));
    }

    // Format response based on requested format
    if (format === 'csv') {
      return generateCSV(exportData, type);
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dealershipai-export-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSV(data: any, type: string): NextResponse {
  let csv = '';

  if (type === 'scenarios' || type === 'all') {
    csv += 'Scenarios\n';
    csv += 'ID,Name,Description,Baseline Score,Projected Score,Improvement,Confidence,ROI %,Created At\n';
    
    if (data.scenarios) {
      data.scenarios.forEach((s: any) => {
        csv += `"${s.id}","${s.name}","${s.description || ''}",${s.baselineScore},${s.projectedScore},${s.improvement},${s.confidence},${s.roi?.roiPercent || 0},"${s.createdAt}"\n`;
      });
    }
    csv += '\n';
  }

  if (type === 'trends' || type === 'all') {
    csv += 'Trends\n';
    csv += 'Date,Overall Score,AI Visibility,Zero-Click Shield,UGC Health,Geo Trust,Schema Integrity\n';
    
    if (data.trends) {
      data.trends.forEach((t: any) => {
        csv += `"${t.date}",${t.overall},${t.aiVisibility},${t.zeroClickShield},${t.ugcHealth},${t.geoTrust},${t.sgpIntegrity}\n`;
      });
    }
    csv += '\n';
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="dealershipai-export-${Date.now()}.csv"`,
    },
  });
}

