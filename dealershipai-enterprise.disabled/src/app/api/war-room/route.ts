import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock War Room data - replace with real data source
    const warRoomData = {
      activeCampaigns: 3,
      totalCompetitors: 12,
      lastAnalysis: new Date().toISOString(),
      marketPosition: {
        rank: 3,
        marketShare: 15.2,
        trend: 'up'
      },
      competitors: [
        {
          id: 1,
          name: 'Competitor A',
          domain: 'competitor-a.com',
          threatLevel: 'high',
          recentActivity: 'Launched new SEO campaign',
          marketShare: 22.1
        },
        {
          id: 2,
          name: 'Competitor B',
          domain: 'competitor-b.com',
          threatLevel: 'medium',
          recentActivity: 'Updated pricing strategy',
          marketShare: 18.7
        }
      ],
      alerts: [
        { id: 1, type: 'threat', message: 'Competitor A gained 5% market share', priority: 'high' },
        { id: 2, type: 'opportunity', message: 'New keyword opportunity detected', priority: 'medium' }
      ]
    }

    return NextResponse.json(warRoomData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch war room data' },
      { status: 500 }
    )
  }
}
