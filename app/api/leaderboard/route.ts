/**
 * Leaderboard API
 * Returns the latest AI visibility rankings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const scanDate = searchParams.get('scanDate');
    const brand = searchParams.get('brand');
    const state = searchParams.get('state');

    // Build query
    let query = supabase
      .from('dealer_leaderboard')
      .select('*')
      .order('visibility_score', { ascending: false })
      .limit(limit);

    // Apply filters
    if (scanDate) {
      query = query.eq('scan_date', scanDate);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    if (state) {
      query = query.eq('state', state);
    }

    const { data: leaderboard, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leaderboard data',
      }, { status: 500 });
    }

    // Get additional statistics
    const { data: stats } = await supabase
      .from('monthly_scans')
      .select('scan_date, visibility_score, total_mentions, sentiment_score')
      .eq('scan_date', scanDate || new Date().toISOString().split('T')[0])
      .eq('scan_status', 'completed');

    const statistics = {
      totalDealers: stats?.length || 0,
      averageScore: stats?.length ? 
        Math.round(stats.reduce((sum, s) => sum + (s.visibility_score || 0), 0) / stats.length) : 0,
      averageMentions: stats?.length ? 
        Math.round(stats.reduce((sum, s) => sum + (s.total_mentions || 0), 0) / stats.length) : 0,
      averageSentiment: stats?.length ? 
        Number((stats.reduce((sum, s) => sum + (s.sentiment_score || 0), 0) / stats.length).toFixed(2)) : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboard || [],
        statistics,
        scanDate: scanDate || new Date().toISOString().split('T')[0],
        filters: {
          limit,
          brand,
          state,
        },
      },
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
