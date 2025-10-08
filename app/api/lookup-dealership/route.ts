import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { website } = await request.json();

    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Clean and validate URL
    let url = website.trim();
    if (!url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }

    // Mock response for now to avoid Terser issues
    const mockData = {
      name: 'Sample Dealership',
      description: 'A sample car dealership',
      phone: '(555) 123-4567',
      address: '123 Main St, City, State 12345',
      domain: url.replace(/^https?:\/\//, '').replace(/^www\./, ''),
      logo: null,
      socialMedia: {
        facebook: null,
        instagram: null,
        twitter: null,
      },
      businessHours: null,
      services: [],
      brands: [],
      location: {
        lat: null,
        lng: null,
      },
    };

    return NextResponse.json({
      success: true,
      data: mockData,
    });

  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to lookup dealership information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}