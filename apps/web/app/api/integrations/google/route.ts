import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { GoogleAPIsIntegration } from '@/lib/integrations/google-apis';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const accountId = searchParams.get('accountId');

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 3. Initialize Google APIs integration
    const googleAPIs = new GoogleAPIsIntegration();

    let result;

    switch (action) {
      case 'business_profile':
        if (!accountId) {
          return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }
        result = await googleAPIs.getGoogleBusinessProfile(accountId);
        break;

      case 'places':
        const placeId = searchParams.get('placeId');
        if (!placeId) {
          return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
        }
        result = await googleAPIs.getGooglePlacesData(placeId);
        break;

      case 'search_console':
        const siteUrl = searchParams.get('siteUrl');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (!siteUrl || !startDate || !endDate) {
          return NextResponse.json({ error: 'Site URL, start date, and end date are required' }, { status: 400 });
        }
        
        result = await googleAPIs.getSearchConsoleData(
          siteUrl,
          new Date(startDate),
          new Date(endDate)
        );
        break;

      case 'analytics':
        const propertyId = searchParams.get('propertyId');
        const analyticsStartDate = searchParams.get('startDate');
        const analyticsEndDate = searchParams.get('endDate');
        
        if (!propertyId || !analyticsStartDate || !analyticsEndDate) {
          return NextResponse.json({ error: 'Property ID, start date, and end date are required' }, { status: 400 });
        }
        
        result = await googleAPIs.getGoogleAnalyticsData(
          propertyId,
          new Date(analyticsStartDate),
          new Date(analyticsEndDate)
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Google APIs integration error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google data' },
      { status: 500 }
    );
  }
}

// POST endpoint for updating Google data
export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, accountId, data } = await req.json();

    if (!action || !accountId) {
      return NextResponse.json({ error: 'Action and account ID are required' }, { status: 400 });
    }

    // 2. Initialize Google APIs integration
    const googleAPIs = new GoogleAPIsIntegration();

    let result;

    switch (action) {
      case 'update_profile':
        result = await googleAPIs.updateGoogleBusinessProfile(accountId, data);
        break;

      case 'create_post':
        result = await googleAPIs.createGoogleBusinessPost(accountId, data);
        break;

      case 'respond_review':
        const { placeId, reviewId, response } = data;
        if (!placeId || !reviewId || !response) {
          return NextResponse.json({ error: 'Place ID, review ID, and response are required' }, { status: 400 });
        }
        result = await googleAPIs.respondToGoogleReview(placeId, reviewId, response);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Google APIs update error:', error);
    return NextResponse.json(
      { error: 'Failed to update Google data' },
      { status: 500 }
    );
  }
}
