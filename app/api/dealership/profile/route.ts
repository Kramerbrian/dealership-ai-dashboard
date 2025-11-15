import { NextRequest, NextResponse } from 'next/server';
import { trackSLO } from '@/lib/slo';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId') || undefined;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'DealerId is required' },
        { status: 400 }
      );
    }

    // Mock dealership profile data
    const profileData = {
      dealerId,
      timestamp: new Date().toISOString(),
      basicInfo: {
        name: 'Demo Dealership',
        domain: 'demo-dealership.com',
        address: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          country: 'USA'
        },
        contact: {
          phone: '(555) 123-4567',
          email: 'info@demo-dealership.com',
          website: 'https://demo-dealership.com'
        }
      },
      businessInfo: {
        type: 'New & Used Cars',
        brands: ['Toyota', 'Honda', 'Ford'],
        yearsInBusiness: 15,
        employees: 25,
        annualRevenue: 5000000
      },
      digitalPresence: {
        website: {
          url: 'https://demo-dealership.com',
          status: 'active',
          lastUpdated: '2024-10-15'
        },
        socialMedia: {
          facebook: 'https://facebook.com/demo-dealership',
          instagram: 'https://instagram.com/demo-dealership',
          twitter: 'https://twitter.com/demo-dealership'
        },
        directories: [
          'Google My Business',
          'Yelp',
          'DealerRater',
          'Cars.com'
        ]
      },
      performance: {
        vai: 87.3,
        piqr: 92.1,
        hrp: 0.12,
        qai: 78.9,
        lastCalculated: '2024-10-15T10:30:00Z'
      }
    };

    const duration = Date.now() - startTime;
    trackSLO('api.dealership.profile', duration);
    
    const response = NextResponse.json(profileData);
    response.headers.set('Server-Timing', `dealership-profile;dur=${duration}`);
    return response;
  } catch (error) {
    console.error('Dealership profile API error:', error);
    
    const duration = Date.now() - startTime;
    trackSLO('api.dealership.profile', duration);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { dealerId, updates } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'DealerId is required' },
        { status: 400 }
      );
    }

    // Mock profile update
    const updateResult = {
      dealerId,
      success: true,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
      updatedFields: Object.keys(updates || {}),
      changes: updates
    };

    const duration = Date.now() - startTime;
    trackSLO('api.dealership.profile.update', duration);
    
    const response = NextResponse.json(updateResult);
    response.headers.set('Server-Timing', `dealership-profile-update;dur=${duration}`);
    return response;
  } catch (error) {
    console.error('Dealership profile update error:', error);
    
    const duration = Date.now() - startTime;
    trackSLO('api.dealership.profile.update', duration);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
