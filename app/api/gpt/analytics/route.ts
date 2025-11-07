/**
 * GPT Analytics API
 * 
 * Returns aggregated analytics data for GPT interactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // In production, query from database
    // For now, return mock aggregated data
    const analytics = await getAnalyticsData(range);

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getAnalyticsData(range: string) {
  // In production, query from Supabase:
  // SELECT * FROM gpt_interaction_analytics WHERE date >= NOW() - INTERVAL '30 days'
  
  // Mock data for now
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const dailyTrends = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return {
      date: date.toISOString().split('T')[0],
      total: Math.floor(Math.random() * 50) + 20,
      successful: Math.floor(Math.random() * 45) + 18,
      errors: Math.floor(Math.random() * 5) + 1,
      conversions: Math.floor(Math.random() * 10) + 2
    };
  });

  const totalInteractions = dailyTrends.reduce((sum, d) => sum + d.total, 0);
  const successful = dailyTrends.reduce((sum, d) => sum + d.successful, 0);
  const errors = dailyTrends.reduce((sum, d) => sum + d.errors, 0);
  const conversions = dailyTrends.reduce((sum, d) => sum + d.conversions, 0);

  return {
    totalInteractions,
    successful,
    errors,
    positiveFeedback: Math.floor(totalInteractions * 0.65),
    negativeFeedback: Math.floor(totalInteractions * 0.10),
    conversions,
    avgFunctionsPerInteraction: 1.8,
    uniqueUsers: Math.floor(totalInteractions * 0.3),
    dailyTrends,
    functionPerformance: [
      {
        function_name: 'appraiseVehicle',
        total_calls: Math.floor(totalInteractions * 0.4),
        successful_calls: Math.floor(totalInteractions * 0.38),
        avg_execution_time_ms: 450,
        error_count: 2
      },
      {
        function_name: 'fetchInventory',
        total_calls: Math.floor(totalInteractions * 0.35),
        successful_calls: Math.floor(totalInteractions * 0.34),
        avg_execution_time_ms: 320,
        error_count: 1
      },
      {
        function_name: 'scheduleTestDrive',
        total_calls: Math.floor(totalInteractions * 0.15),
        successful_calls: Math.floor(totalInteractions * 0.14),
        avg_execution_time_ms: 680,
        error_count: 3
      },
      {
        function_name: 'submitLead',
        total_calls: Math.floor(totalInteractions * 0.10),
        successful_calls: Math.floor(totalInteractions * 0.09),
        avg_execution_time_ms: 520,
        error_count: 1
      }
    ]
  };
}

