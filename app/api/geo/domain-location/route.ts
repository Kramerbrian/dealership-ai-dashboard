import { NextRequest, NextResponse } from 'next/server';

interface DomainLocationRequest {
  domain: string;
}

interface DomainLocationResponse {
  success: boolean;
  data: {
    domain: string;
    businessName?: string;
    address?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    city: string;
    state: string;
    country: string;
  };
  meta: {
    timestamp: string;
    responseTime: string;
    source: 'domain-lookup';
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: DomainLocationRequest = await req.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Simulate domain location lookup
    // In production, this would:
    // 1. Look up the domain's business information
    // 2. Use Google Maps Geocoding API
    // 3. Extract location from business listings
    // 4. Fall back to IP geolocation if needed

    const mockLocationData = await simulateDomainLocationLookup(domain);
    
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: mockLocationData,
      meta: {
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`,
        source: 'domain-lookup'
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'Server-Timing': `domain-location;dur=${duration}`
      }
    });

  } catch (error) {
    console.error('Domain Location API Error:', error);
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Failed to lookup domain location',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function simulateDomainLocationLookup(domain: string) {
  // Simulate business location lookup based on domain
  const mockBusinesses = [
    {
      domain: 'example-dealership.com',
      businessName: 'Example Auto Group',
      address: '123 Main Street, Austin, TX 78701',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      city: 'Austin',
      state: 'Texas',
      country: 'United States'
    },
    {
      domain: 'premium-cars.com',
      businessName: 'Premium Cars Dealership',
      address: '456 Oak Avenue, Denver, CO 80202',
      coordinates: { lat: 39.7392, lng: -104.9903 },
      city: 'Denver',
      state: 'Colorado',
      country: 'United States'
    },
    {
      domain: 'family-auto.com',
      businessName: 'Family Auto Center',
      address: '789 Pine Street, Phoenix, AZ 85001',
      coordinates: { lat: 33.4484, lng: -112.0740 },
      city: 'Phoenix',
      state: 'Arizona',
      country: 'United States'
    },
    {
      domain: 'luxury-motors.com',
      businessName: 'Luxury Motors',
      address: '321 Elm Drive, Miami, FL 33101',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      city: 'Miami',
      state: 'Florida',
      country: 'United States'
    },
    {
      domain: 'northwest-auto.com',
      businessName: 'Northwest Auto Group',
      address: '654 Maple Lane, Seattle, WA 98101',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      city: 'Seattle',
      state: 'Washington',
      country: 'United States'
    }
  ];

  // Try to find exact match first
  let business = mockBusinesses.find(b => b.domain === domain);
  
  // If no exact match, use domain hash to pick consistent mock data
  if (!business) {
    const hash = domain.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % mockBusinesses.length;
    business = mockBusinesses[index];
  }

  return {
    domain,
    businessName: business.businessName,
    address: business.address,
    coordinates: business.coordinates,
    city: business.city,
    state: business.state,
    country: business.country
  };
}
