import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const location = searchParams.get('location');
    const name = searchParams.get('name');

    if (!businessId && !location && !name) {
      return NextResponse.json(
        { error: 'Business ID, location, or name parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Yelp API key not configured' },
        { status: 500 }
      );
    }

    let yelpUrl: string;
    
    if (businessId) {
      yelpUrl = `https://api.yelp.com/v3/businesses/${businessId}`;
    } else {
      // Search by location and name
      const searchParams = new URLSearchParams({
        location: location || '',
        term: name || '',
        limit: '1'
      });
      yelpUrl = `https://api.yelp.com/v3/businesses/search?${searchParams}`;
    }

    const response = await fetch(yelpUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} - ${data.error?.description || 'Unknown error'}`);
    }

    // Handle search response vs business response
    const businessData = businessId ? data : data.businesses?.[0];
    
    if (!businessData) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const result = {
      id: businessData.id,
      name: businessData.name,
      rating: businessData.rating,
      reviewCount: businessData.review_count,
      price: businessData.price,
      categories: businessData.categories?.map((cat: any) => cat.title) || [],
      location: {
        address1: businessData.location?.address1,
        city: businessData.location?.city,
        state: businessData.location?.state,
        zipCode: businessData.location?.zip_code,
        country: businessData.location?.country
      },
      phone: businessData.phone,
      url: businessData.url,
      imageUrl: businessData.image_url,
      isClosed: businessData.is_closed,
      coordinates: businessData.coordinates,
      photos: businessData.photos || [],
      hours: businessData.hours?.[0]?.open || []
    };

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        businessId: businessData.id,
        searchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Yelp API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Yelp data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock data for testing
export async function POST(request: NextRequest) {
  const { businessId, name, location } = await request.json();
  
  return NextResponse.json({
    success: true,
    data: {
      id: businessId || 'mock-business-id',
      name: name || 'Mock Business',
      rating: 4.2,
      reviewCount: 127,
      price: '$$',
      categories: ['Automotive', 'Car Dealers'],
      location: {
        address1: '123 Main St',
        city: location?.split(',')[0] || 'Anytown',
        state: location?.split(',')[1]?.trim() || 'CA',
        zipCode: '12345',
        country: 'US'
      },
      phone: '+1-555-0123',
      url: 'https://yelp.com/biz/mock-business',
      imageUrl: 'https://example.com/image.jpg',
      isClosed: false,
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      hours: [
        { day: 0, start: '1000', end: '1800', is_overnight: false },
        { day: 1, start: '1000', end: '1800', is_overnight: false }
      ]
    },
    metadata: {
      businessId: businessId || 'mock-business-id',
      searchedAt: new Date().toISOString()
    }
  });
}
