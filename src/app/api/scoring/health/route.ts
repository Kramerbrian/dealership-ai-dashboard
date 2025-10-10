import { NextRequest, NextResponse } from 'next/server';
import { scoringEngine } from '@/core/scoring-engine';

/**
 * GET /api/scoring/health
 * Returns system health metrics and quality indicators
 */
export async function GET(request: NextRequest) {
  try {
    const healthMetrics = await scoringEngine.monitorSystemHealth();
    
    // Determine overall health status
    const isHealthy = 
      healthMetrics.data_accuracy >= 0.85 &&
      healthMetrics.api_uptime >= 0.995 &&
      healthMetrics.query_success_rate >= 0.98 &&
      healthMetrics.cost_per_dealer <= 5.00;
    
    return NextResponse.json({
      success: true,
      data: {
        ...healthMetrics,
        overall_status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString()
      },
      message: 'System health metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving system health:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve system health',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
