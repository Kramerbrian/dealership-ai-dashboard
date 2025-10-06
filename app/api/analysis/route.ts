import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessName = searchParams.get('businessName')
  const location = searchParams.get('location')

  if (!businessName || !location) {
    return NextResponse.json(
      { error: 'businessName and location are required parameters' },
      { status: 400 }
    )
  }

  try {
    // In production, this would call the Python backend
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    
    const response = await fetch(
      `${backendUrl}/api/v1/analysis?businessName=${encodeURIComponent(businessName)}&location=${encodeURIComponent(location)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Analysis API error:', error)
    
    // Return mock data for development
    const mockData = {
      dealership: businessName,
      location: location,
      visibility_reports: [
        {
          query: `${businessName} reviews ${location.split(',')[0]}`,
          visibility_score: 67.5,
          platforms_mentioned: ['Google', 'Yelp'],
          revenue_at_risk: 12500.00
        },
        {
          query: `best dealership near ${location.split(',')[0]}`,
          visibility_score: 34.2,
          platforms_mentioned: ['ChatGPT'],
          revenue_at_risk: 18750.00
        }
      ],
      competitor_reports: [
        {
          query: `${businessName} reviews ${location.split(',')[0]}`,
          competitors: [
            ['Competitor A', 3],
            ['Competitor B', 2]
          ]
        }
      ],
      review_data: {
        overall_rating: 4.2,
        overall_sentiment: 0.78,
        ratings: {
          Google: 4.1,
          Yelp: 4.3,
          DealerRater: 4.0
        },
        review_counts: {
          Google: 150,
          Yelp: 89,
          DealerRater: 67
        },
        response_rates: {
          Google: 0.85,
          Yelp: 0.23,
          DealerRater: 0.67
        }
      },
      auto_responses: {
        suggestions: {
          Yelp: "Thanks for your feedback! We're always working to improve our customer experience. We'd love to discuss this further - please call us at (555) 123-4567.",
          Google: "We appreciate your review and take all feedback seriously. Our team is committed to excellence in every interaction."
        }
      }
    }
    
    return NextResponse.json(mockData)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, location, dealershipUrl, analysisType = 'full' } = body

    if (!businessName || !location) {
      return NextResponse.json(
        { error: 'businessName and location are required' },
        { status: 400 }
      )
    }

    // Call backend analysis
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/api/v1/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: businessName,
        location: location,
        dealership_url: dealershipUrl,
        analysis_type: analysisType
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Analysis POST error:', error)
    return NextResponse.json(
      { error: 'Analysis request failed' },
      { status: 500 }
    )
  }
}