/**
 * Model Nutrition API Route
 * 
 * Weekly report showing top patterns, best fixes, registry version
 * Used for GPT Actions and model improvement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ModelNutrition {
  date: string;
  week_start: string;
  week_end: string;
  registry_version: string;
  top_patterns: Array<{
    pattern: string;
    frequency: number;
    avg_impact_usd: number;
    avg_resolution_min: number;
  }>;
  best_fixes: Array<{
    pulse_id: string;
    impact_usd: number;
    resolution_min: number;
    pattern: string;
  }>;
  model_performance: {
    recommendation_accuracy?: number;
    fix_success_rate?: number;
    avg_time_to_fix?: number;
  };
  metadata?: {
    total_pulses_analyzed?: number;
    total_revenue_impact?: number;
    top_integration?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    const isCron = req.headers.get('x-vercel-cron') === '1';
    
    if (!session && !isCron) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get week range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const week_start = startDate.toISOString().split('T')[0];
    const week_end = endDate.toISOString().split('T')[0];
    const date = endDate.toISOString().split('T')[0];

    // Fetch weekly data
    const weeklyData = await fetchWeeklyData(week_start, week_end);

    // Analyze patterns
    const top_patterns = analyzePatterns(weeklyData.pulses);
    const best_fixes = weeklyData.pulses
      .sort((a, b) => b.deltaUSD - a.deltaUSD)
      .slice(0, 10)
      .map(p => ({
        pulse_id: p.id,
        impact_usd: p.deltaUSD,
        resolution_min: p.timeToResolveMin,
        pattern: extractPattern(p.id)
      }));

    // Calculate model performance
    const model_performance = calculateModelPerformance(weeklyData.receipts);

    const nutrition: ModelNutrition = {
      date,
      week_start,
      week_end,
      registry_version: process.env.MODEL_REGISTRY_VERSION || '1.0.0',
      top_patterns,
      best_fixes,
      model_performance,
      metadata: {
        total_pulses_analyzed: weeklyData.pulses.length,
        total_revenue_impact: weeklyData.pulses.reduce((sum, p) => sum + p.deltaUSD, 0),
        top_integration: weeklyData.topIntegration
      }
    };

    return NextResponse.json(nutrition, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Model Nutrition error:', error);
    return NextResponse.json(
      { error: 'Failed to generate model nutrition report' },
      { status: 500 }
    );
  }
}

// Helper functions
async function fetchWeeklyData(startDate: string, endDate: string) {
  // In production, query your database for the week's data
  // For now, return mock structure
  return {
    pulses: [],
    receipts: [],
    topIntegration: 'ga4'
  };
}

function analyzePatterns(pulses: Array<{ id: string; deltaUSD: number; timeToResolveMin: number }>) {
  // Group by pattern and calculate stats
  const patternMap = new Map<string, { count: number; totalImpact: number; totalTime: number }>();

  pulses.forEach(pulse => {
    const pattern = extractPattern(pulse.id);
    const existing = patternMap.get(pattern) || { count: 0, totalImpact: 0, totalTime: 0 };
    patternMap.set(pattern, {
      count: existing.count + 1,
      totalImpact: existing.totalImpact + pulse.deltaUSD,
      totalTime: existing.totalTime + pulse.timeToResolveMin
    });
  });

  return Array.from(patternMap.entries())
    .map(([pattern, stats]) => ({
      pattern,
      frequency: stats.count,
      avg_impact_usd: Math.round(stats.totalImpact / stats.count),
      avg_resolution_min: Math.round(stats.totalTime / stats.count)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

function extractPattern(pulseId: string): string {
  // Extract pattern from pulse ID (e.g., "missing_autodealer_schema" -> "schema_missing")
  if (pulseId.includes('schema')) return 'schema_issue';
  if (pulseId.includes('review')) return 'review_issue';
  if (pulseId.includes('citation')) return 'citation_issue';
  return 'other';
}

function calculateModelPerformance(receipts: Array<{ success: boolean; timeToResolve?: number }>) {
  if (receipts.length === 0) {
    return {
      recommendation_accuracy: undefined,
      fix_success_rate: undefined,
      avg_time_to_fix: undefined
    };
  }

  const successful = receipts.filter(r => r.success).length;
  const totalTime = receipts.reduce((sum, r) => sum + (r.timeToResolve || 0), 0);

  return {
    recommendation_accuracy: 0.85, // Would calculate from actual data
    fix_success_rate: successful / receipts.length,
    avg_time_to_fix: Math.round(totalTime / receipts.length)
  };
}
