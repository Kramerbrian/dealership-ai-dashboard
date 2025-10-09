import { NextRequest, NextResponse } from 'next/server';

// Mock leaderboard data - replace with real database queries
const mockLeaderboardData = [
  {
    id: 'dealer_1',
    name: 'Terry Reid Hyundai',
    brand: 'Hyundai',
    city: 'Naples',
    state: 'FL',
    tier: 'pro',
    visibility_score: 87,
    total_mentions: 23,
    avg_rank: 2.3,
    sentiment_score: 0.8,
    total_citations: 15,
    scan_date: '2024-01-01',
    rank: 1,
    score_change: 5,
    percent_change: 6.1
  },
  {
    id: 'dealer_2',
    name: 'Naples Nissan',
    brand: 'Nissan',
    city: 'Naples',
    state: 'FL',
    tier: 'pro',
    visibility_score: 82,
    total_mentions: 19,
    avg_rank: 2.8,
    sentiment_score: 0.7,
    total_citations: 12,
    scan_date: '2024-01-01',
    rank: 2,
    score_change: 3,
    percent_change: 3.8
  },
  {
    id: 'dealer_3',
    name: 'Honda of Fort Myers',
    brand: 'Honda',
    city: 'Fort Myers',
    state: 'FL',
    tier: 'enterprise',
    visibility_score: 79,
    total_mentions: 17,
    avg_rank: 3.1,
    sentiment_score: 0.6,
    total_citations: 10,
    scan_date: '2024-01-01',
    rank: 3,
    score_change: -2,
    percent_change: -2.5
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const tier = searchParams.get('tier');
    const state = searchParams.get('state');
    const brand = searchParams.get('brand');
    const sortBy = searchParams.get('sortBy') || 'visibility_score';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('Fetching leaderboard data:', { limit, tier, state, brand, sortBy, sortOrder });

    // Filter data based on parameters
    let filteredData = [...mockLeaderboardData];

    if (tier) {
      filteredData = filteredData.filter(dealer => dealer.tier === tier);
    }

    if (state) {
      filteredData = filteredData.filter(dealer => dealer.state === state);
    }

    if (brand) {
      filteredData = filteredData.filter(dealer => dealer.brand === brand);
    }

    // Sort data
    filteredData.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply limit
    const limitedData = filteredData.slice(0, limit);

    // Calculate summary statistics
    const totalDealers = limitedData.length;
    const avgScore = limitedData.reduce((sum, dealer) => sum + dealer.visibility_score, 0) / totalDealers;
    const totalMentions = limitedData.reduce((sum, dealer) => sum + dealer.total_mentions, 0);
    const avgSentiment = limitedData.reduce((sum, dealer) => sum + dealer.sentiment_score, 0) / totalDealers;

    // Calculate tier distribution
    const tierDistribution = limitedData.reduce((acc, dealer) => {
      acc[dealer.tier] = (acc[dealer.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate brand distribution
    const brandDistribution = limitedData.reduce((acc, dealer) => {
      acc[dealer.brand] = (acc[dealer.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate state distribution
    const stateDistribution = limitedData.reduce((acc, dealer) => {
      acc[dealer.state] = (acc[dealer.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find top performers
    const topPerformers = limitedData.slice(0, 10);
    const biggestGainers = limitedData
      .filter(dealer => dealer.score_change > 0)
      .sort((a, b) => b.score_change - a.score_change)
      .slice(0, 5);
    
    const biggestLosers = limitedData
      .filter(dealer => dealer.score_change < 0)
      .sort((a, b) => a.score_change - b.score_change)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: limitedData,
        summary: {
          total_dealers: totalDealers,
          avg_visibility_score: Math.round(avgScore * 10) / 10,
          total_mentions: totalMentions,
          avg_sentiment: Math.round(avgSentiment * 100) / 100,
          scan_date: limitedData[0]?.scan_date || new Date().toISOString().split('T')[0]
        },
        distributions: {
          tier: tierDistribution,
          brand: brandDistribution,
          state: stateDistribution
        },
        highlights: {
          top_performers: topPerformers,
          biggest_gainers: biggestGainers,
          biggest_losers: biggestLosers
        },
        filters_applied: {
          tier,
          state,
          brand,
          sort_by: sortBy,
          sort_order: sortOrder,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch leaderboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}