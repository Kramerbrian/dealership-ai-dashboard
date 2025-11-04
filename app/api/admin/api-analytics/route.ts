import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAPIAnalytics } from '@/lib/api-analytics';
import { logger } from '@/lib/logger';

/**
 * API Analytics Endpoint
 * 
 * Returns API usage statistics and performance insights
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const analytics = getAPIAnalytics();
    
    await logger.info('API analytics retrieved', {
      userId,
      totalRequests: analytics.summary.totalRequests,
      avgResponseTime: analytics.summary.avgResponseTime,
    });
    
    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await logger.error('Failed to fetch API analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

