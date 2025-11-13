import { NextResponse } from 'next/server';
import { getAnalyticsClient } from '@/lib/analytics/google-analytics-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if environment variables are configured
    if (!process.env.GA_PROPERTY_ID) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Analytics not configured',
          message: 'GA_PROPERTY_ID environment variable is missing',
        },
        { status: 500 }
      );
    }

    const client = getAnalyticsClient();

    // Run health check
    const healthCheck = await client.healthCheck();
    if (!healthCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Health check failed',
          message: healthCheck.message,
        },
        { status: 500 }
      );
    }

    // Fetch test data
    const [
      activeUsers,
      realtimeUsers,
      userEngagement,
      topPages,
      trafficSources,
      deviceBreakdown,
    ] = await Promise.all([
      client.getActiveUsers('30daysAgo', 'today'),
      client.getRealtimeUsers(),
      client.getUserEngagement('7daysAgo', 'today'),
      client.getTopPages('30daysAgo', 'today', 5),
      client.getTrafficSources('30daysAgo', 'today'),
      client.getDeviceBreakdown('30daysAgo', 'today'),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Google Analytics Data API integration successful',
      data: {
        summary: {
          activeUsers30Days: activeUsers,
          realtimeUsers,
        },
        userEngagement: userEngagement.slice(0, 7), // Last 7 days
        topPages,
        trafficSources: trafficSources.slice(0, 5),
        deviceBreakdown,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'API request failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
