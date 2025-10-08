import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock Reviews data - replace with real data source
    const reviewsData = {
      totalReviews: 1247,
      averageRating: 4.3,
      lastUpdated: new Date().toISOString(),
      sentiment: {
        positive: 68,
        neutral: 25,
        negative: 7
      },
      recentReviews: [
        {
          id: 1,
          platform: 'Google',
          rating: 5,
          text: 'Excellent service and great selection of vehicles!',
          date: new Date().toISOString(),
          sentiment: 'positive'
        },
        {
          id: 2,
          platform: 'Yelp',
          rating: 4,
          text: 'Good experience overall, staff was helpful.',
          date: new Date().toISOString(),
          sentiment: 'positive'
        },
        {
          id: 3,
          platform: 'Facebook',
          rating: 2,
          text: 'Had some issues with the financing process.',
          date: new Date().toISOString(),
          sentiment: 'negative'
        }
      ],
      responseRate: 89,
      averageResponseTime: '4.2 hours'
    }

    return NextResponse.json(reviewsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews data' },
      { status: 500 }
    )
  }
}
