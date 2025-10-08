import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_ANALYTICS_PROJECT_ID,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId') || process.env.GOOGLE_ANALYTICS_PROPERTY_ID
    const startDate = searchParams.get('startDate') || '7daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Get website traffic data
    const [trafficResponse, conversionsResponse] = await Promise.all([
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'deviceCategory' },
          { name: 'channelGroup' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'users' },
          { name: 'pageviews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          { name: 'eventName' },
        ],
        metrics: [
          { name: 'eventCount' },
          { name: 'conversions' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'CONTAINS',
              value: 'conversion',
            },
          },
        },
      }),
    ])

    // Process traffic data
    const trafficData = trafficResponse[0].rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value,
      device: row.dimensionValues?.[1]?.value,
      channel: row.dimensionValues?.[2]?.value,
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
      pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
    })) || []

    // Process conversion data
    const conversionData = conversionsResponse[0].rows?.map(row => ({
      eventName: row.dimensionValues?.[0]?.value,
      eventCount: parseInt(row.metricValues?.[0]?.value || '0'),
      conversions: parseInt(row.metricValues?.[1]?.value || '0'),
    })) || []

    // Calculate summary metrics
    const totalSessions = trafficData.reduce((sum, row) => sum + row.sessions, 0)
    const totalUsers = trafficData.reduce((sum, row) => sum + row.users, 0)
    const totalPageviews = trafficData.reduce((sum, row) => sum + row.pageviews, 0)
    const avgBounceRate = trafficData.reduce((sum, row) => sum + row.bounceRate, 0) / trafficData.length
    const totalConversions = conversionData.reduce((sum, row) => sum + row.conversions, 0)

    return NextResponse.json({
      summary: {
        totalSessions,
        totalUsers,
        totalPageviews,
        avgBounceRate: Math.round(avgBounceRate * 100) / 100,
        totalConversions,
        conversionRate: totalSessions > 0 ? Math.round((totalConversions / totalSessions) * 10000) / 100 : 0,
      },
      trafficData,
      conversionData,
      dateRange: { startDate, endDate },
    })

  } catch (error: any) {
    console.error('Google Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    )
  }
}
