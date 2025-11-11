import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Mock SLO metrics for demo
    const sloMetrics = [
      { endpoint: 'api.dashboard.overview', status: 'OK', duration: 45, threshold: 250, breached: false },
      { endpoint: 'api.aeo.leaderboard', status: 'OK', duration: 32, threshold: 250, breached: false },
      { endpoint: 'api.aeo.breakdown', status: 'OK', duration: 28, threshold: 250, breached: false },
      { endpoint: 'api.observability', status: 'OK', duration: 15, threshold: 250, breached: false }
    ];
    
    // Calculate overall health
    const totalEndpoints = sloMetrics.length;
    const breachedEndpoints = sloMetrics.filter(m => m.breached).length;
    const warningEndpoints = sloMetrics.filter(m => m.status === 'WARNING').length;
    const healthyEndpoints = sloMetrics.filter(m => m.status === 'OK').length;
    
    const overallHealth = {
      status: breachedEndpoints > 0 ? 'CRITICAL' : 
              warningEndpoints > 0 ? 'WARNING' : 'HEALTHY',
      total: totalEndpoints,
      healthy: healthyEndpoints,
      warning: warningEndpoints,
      breached: breachedEndpoints,
      healthPercentage: Math.round((healthyEndpoints / totalEndpoints) * 100)
    };

    const duration = Date.now() - startTime;

    const response = NextResponse.json({
      overall: overallHealth,
      metrics: sloMetrics,
      detailed: {
        uptime: '99.9%',
        responseTime: '45ms',
        errorRate: '0.1%',
        throughput: '150 req/min'
      },
      ts: new Date().toISOString()
    });

    // Cache for 30 seconds (observability data changes frequently)
    response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    response.headers.set('Server-Timing', `observability;dur=${duration}`);
    
    return response;

  } catch (error) {
    console.error('Observability API error:', error);
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch observability data',
        ts: new Date().toISOString() 
      },
      { status: 500 }
    );
  }
}
