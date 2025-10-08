import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId') || process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID
    const locationId = searchParams.get('locationId') || process.env.GOOGLE_MY_BUSINESS_LOCATION_ID

    if (!accountId || !locationId) {
      return NextResponse.json(
        { error: 'Account ID and Location ID are required' },
        { status: 400 }
      )
    }

    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: 401 }
      )
    }

    // Get business information
    const businessResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!businessResponse.ok) {
      throw new Error(`Business API error: ${businessResponse.statusText}`)
    }

    const businessData = await businessResponse.json()

    // Get reviews (if available)
    let reviewsData = null
    try {
      const reviewsResponse = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (reviewsResponse.ok) {
        reviewsData = await reviewsResponse.json()
      }
    } catch (error) {
      console.warn('Reviews API not available:', error)
    }

    // Get insights (if available)
    let insightsData = null
    try {
      const insightsResponse = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reportInsights`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (insightsResponse.ok) {
        insightsData = await insightsResponse.json()
      }
    } catch (error) {
      console.warn('Insights API not available:', error)
    }

    return NextResponse.json({
      business: {
        name: businessData.title,
        address: businessData.storefrontAddress,
        phone: businessData.primaryPhone,
        website: businessData.websiteUri,
        categories: businessData.primaryCategory,
        hours: businessData.regularHours,
        status: businessData.state,
      },
      reviews: reviewsData ? {
        totalReviews: reviewsData.reviews?.length || 0,
        averageRating: calculateAverageRating(reviewsData.reviews || []),
        recentReviews: reviewsData.reviews?.slice(0, 5) || [],
      } : null,
      insights: insightsData ? {
        views: insightsData.locationMetrics?.find((m: any) => m.metric === 'QUERIES_DIRECT')?.metricValues?.[0]?.value || 0,
        searches: insightsData.locationMetrics?.find((m: any) => m.metric === 'QUERIES_INDIRECT')?.metricValues?.[0]?.value || 0,
        actions: insightsData.locationMetrics?.find((m: any) => m.metric === 'QUERIES_CHAIN')?.metricValues?.[0]?.value || 0,
      } : null,
    })

  } catch (error: any) {
    console.error('Google My Business API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch My Business data', details: error.message },
      { status: 500 }
    )
  }
}

async function getAccessToken(): Promise<string | null> {
  try {
    // In production, you would use OAuth 2.0 flow
    // For now, return the service account token
    return process.env.GOOGLE_MY_BUSINESS_ACCESS_TOKEN || null
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}

function calculateAverageRating(reviews: any[]): number {
  if (!reviews.length) return 0
  
  const totalRating = reviews.reduce((sum, review) => sum + (review.starRating || 0), 0)
  return Math.round((totalRating / reviews.length) * 10) / 10
}
