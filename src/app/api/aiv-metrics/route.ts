import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId') || 'default';

    // Mock AIV metrics data
    const mockMetrics = {
      aiv_score: Math.floor(Math.random() * 30) + 70, // 70-100
      ati_score: Math.floor(Math.random() * 25) + 65, // 65-90
      crs_score: Math.floor(Math.random() * 20) + 75, // 75-95
      elasticity_usd_per_pt: Math.floor(Math.random() * 100) + 100, // 100-200
      r2_coefficient: 0.75 + Math.random() * 0.2, // 0.75-0.95
      timestamp: new Date().toISOString(),
      metadata: {
        status: 'mock_data',
        confidence_score: 0.85 + Math.random() * 0.1,
        query_count: Math.floor(Math.random() * 1000) + 500,
        calculation_method: 'Kalman Filter + Linear Regression',
        recommendations: [
          'Optimize schema markup for better AI understanding',
          'Increase customer review response rate',
          'Publish more educational content about car buying',
          'Improve local SEO signals'
        ]
      }
    };

    return NextResponse.json(mockMetrics);
  } catch (error) {
    console.error('Error fetching AIV metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AIV metrics' },
      { status: 500 }
    );
  }
}
