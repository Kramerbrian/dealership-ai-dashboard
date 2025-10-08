import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const term = searchParams.get('term')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!businessId && (!term || !location)) {
      return NextResponse.json(
        { error: 'Either businessId or (term and location) are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.YELP_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Yelp API key not configured' },
        { status: 500 }
      )
    }

    let businessData, reviewsData

    if (businessId) {
      // Get specific business by ID
      const businessResponse = await fetch(
        `https://api.yelp.com/v3/businesses/${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!businessResponse.ok) {
        throw new Error(`Yelp Business API error: ${businessResponse.statusText}`)
      }

      businessData = await businessResponse.json()

      // Get reviews for the business
      const reviewsResponse = await fetch(
        `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (reviewsResponse.ok) {
        reviewsData = await reviewsResponse.json()
      }
    } else {
      // Search for businesses
      const searchUrl = new URL('https://api.yelp.com/v3/businesses/search')
      searchUrl.searchParams.set('term', term!)
      searchUrl.searchParams.set('location', location!)
      searchUrl.searchParams.set('limit', limit.toString())
      searchUrl.searchParams.set('sort_by', 'rating')

      const searchResponse = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!searchResponse.ok) {
        throw new Error(`Yelp Search API error: ${searchResponse.statusText}`)
      }

      const searchData = await searchResponse.json()
      businessData = searchData.businesses?.[0] || null

      // Get reviews for the first business found
      if (businessData) {
        const reviewsResponse = await fetch(
          `https://api.yelp.com/v3/businesses/${businessData.id}/reviews`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (reviewsResponse.ok) {
          reviewsData = await reviewsResponse.json()
        }
      }
    }

    if (!businessData) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Process business data
    const business = {
      id: businessData.id,
      name: businessData.name,
      rating: businessData.rating,
      reviewCount: businessData.review_count,
      price: businessData.price,
      phone: businessData.phone,
      displayPhone: businessData.display_phone,
      url: businessData.url,
      imageUrl: businessData.image_url,
      categories: businessData.categories?.map((cat: any) => ({
        alias: cat.alias,
        title: cat.title,
      })) || [],
      location: {
        address1: businessData.location?.address1,
        address2: businessData.location?.address2,
        address3: businessData.location?.address3,
        city: businessData.location?.city,
        zipCode: businessData.location?.zip_code,
        country: businessData.location?.country,
        state: businessData.location?.state,
        displayAddress: businessData.location?.display_address,
      },
      coordinates: businessData.coordinates,
      hours: businessData.hours?.map((hour: any) => ({
        open: hour.open,
        hoursType: hour.hours_type,
        isOpenNow: hour.is_open_now,
      })) || [],
      photos: businessData.photos || [],
      isClosed: businessData.is_closed,
      transactions: businessData.transactions || [],
    }

    // Process reviews data
    const reviews = reviewsData?.reviews?.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      timeCreated: review.time_created,
      user: {
        id: review.user.id,
        profileUrl: review.user.profile_url,
        imageUrl: review.user.image_url,
        name: review.user.name,
      },
      url: review.url,
    })) || []

    // Calculate review metrics
    const reviewMetrics = {
      averageRating: business.rating,
      totalReviews: business.reviewCount,
      recentReviews: reviews.length,
      ratingDistribution: calculateRatingDistribution(reviews),
      sentimentScore: calculateSentimentScore(reviews),
    }

    return NextResponse.json({
      business,
      reviews,
      reviewMetrics,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Yelp API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Yelp data', details: error.message },
      { status: 500 }
    )
  }
}

function calculateRatingDistribution(reviews: any[]): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  reviews.forEach(review => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1
  })
  
  return distribution
}

function calculateSentimentScore(reviews: any[]): number {
  if (!reviews.length) return 0
  
  // Simple sentiment analysis based on rating
  const totalSentiment = reviews.reduce((sum, review) => {
    // Convert rating (1-5) to sentiment score (-1 to 1)
    return sum + ((review.rating - 3) / 2)
  }, 0)
  
  return Math.round((totalSentiment / reviews.length) * 100) / 100
}
