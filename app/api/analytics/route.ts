import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock data for testing without authentication
    return NextResponse.json({
      success: true,
      data: {
        rowCount: 7,
        rows: [
          {
            dimensionValues: [{ value: '2024-01-01' }, { value: 'desktop' }],
            metricValues: [{ value: '150' }, { value: '120' }, { value: '300' }, { value: '0.45' }]
          },
          {
            dimensionValues: [{ value: '2024-01-02' }, { value: 'mobile' }],
            metricValues: [{ value: '200' }, { value: '180' }, { value: '450' }, { value: '0.38' }]
          }
        ]
      },
      metadata: {
        propertyId: 'mock-property',
        dateRange: { startDate: '7daysAgo', endDate: 'today' },
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, startDate, endDate, metrics, dimensions } = await request.json();

    // For now, return mock data regardless of input
    // In production, this would use Google Analytics API
    return NextResponse.json({
      success: true,
      data: {
        rowCount: 7,
        rows: [
          {
            dimensionValues: [{ value: '2024-01-01' }, { value: 'desktop' }],
            metricValues: [{ value: '150' }, { value: '120' }, { value: '300' }, { value: '0.45' }]
          },
          {
            dimensionValues: [{ value: '2024-01-02' }, { value: 'mobile' }],
            metricValues: [{ value: '200' }, { value: '180' }, { value: '450' }, { value: '0.38' }]
          }
        ]
      },
      metadata: {
        propertyId: propertyId || 'mock-property',
        dateRange: { startDate: startDate || '7daysAgo', endDate: endDate || 'today' },
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}