import { NextRequest, NextResponse } from 'next/server';
import { trackSLO } from '@/lib/slo';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    const duration = Date.now() - startTime;
    trackSLO('api.performance-test', duration);
    
    const response = NextResponse.json({
      message: 'Performance test completed',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      serverTiming: `performance-test;dur=${duration}`,
      sloStatus: duration <= 100 ? 'OK' : 'SLOW'
    });
    
    response.headers.set('Server-Timing', `performance-test;dur=${duration}`);
    response.headers.set('X-SLO-Status', duration <= 100 ? 'OK' : 'SLOW');
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackSLO('api.performance-test', duration);
    
    return NextResponse.json(
      { error: 'Performance test failed' },
      { status: 500 }
    );
  }
}
