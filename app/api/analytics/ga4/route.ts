import { NextRequest, NextResponse } from 'next/server';
import { GoogleAnalyticsService } from '@/lib/services/GoogleAnalyticsService';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId') || undefined;
    const metric = searchParams.get('metric') || undefined || 'overview';
    const dateRange = searchParams.get('dateRange') || undefined || '30d';
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const gaService = new GoogleAnalyticsService();
    let data;

    switch (metric) {
      case 'realtime':
        data = await gaService.getRealtimeData(propertyId);
        break;
      case 'traffic':
        data = await gaService.getTrafficData(propertyId, dateRange);
        break;
      case 'conversions':
        data = await gaService.getConversionData(propertyId, dateRange);
        break;
      case 'overview':
        data = await gaService.getOverviewData(propertyId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid metric. Use: realtime, traffic, conversions, or overview' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;

    const response = NextResponse.json({
      success: true,
      data,
      meta: {
        propertyId,
        metric,
        dateRange,
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`
      }
    });

    // Cache for 5 minutes for real-time data, 1 hour for other metrics
    const cacheTime = metric === 'realtime' ? 300 : 3600;
    response.headers.set('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`);
    response.headers.set('Server-Timing', `ga4-${metric};dur=${duration}`);
    
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    const propertyId = new URL((req as any).url || '').searchParams.get('propertyId') || undefined;
    logger.googleAnalytics.apiError('GET', propertyId || 'unknown', error as Error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Google Analytics data',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, action, dateRange = '30d' } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const gaService = new GoogleAnalyticsService();

    switch (action) {
      case 'refresh':
        // Force refresh of cached data
        const overviewData = await gaService.getOverviewData(propertyId);
        return NextResponse.json({
          success: true,
          message: 'Data refreshed successfully',
          data: overviewData,
          timestamp: new Date().toISOString()
        });

      case 'validate':
        // Validate property ID and credentials
        try {
          await gaService.getRealtimeData(propertyId);
          return NextResponse.json({
            success: true,
            message: 'Property ID is valid and accessible',
            propertyId,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: 'Property ID is invalid or not accessible',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }, { status: 400 });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: refresh or validate' },
          { status: 400 }
        );
    }

  } catch (error) {
    const propertyId = 'unknown';
    logger.googleAnalytics.apiError('POST', propertyId, error as Error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
