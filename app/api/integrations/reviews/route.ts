import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { ReviewServicesIntegration } from '@/lib/integrations/review-services';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || undefined;
    const dealershipId = searchParams.get('dealershipId') || undefined;

    if (!action || !dealershipId) {
      return NextResponse.json({ error: 'Action and dealership ID are required' }, { status: 400 });
    }

    // 3. Initialize review services integration
    const reviewServices = new ReviewServicesIntegration();

    let result;

    switch (action) {
      case 'all_reviews':
        result = await reviewServices.getAllReviews(dealershipId);
        break;

      case 'stats':
        result = await reviewServices.getReviewStats(dealershipId);
        break;

      case 'trends':
        const months = parseInt(searchParams.get('months') || undefined || '6');
        result = await reviewServices.getReviewTrends(dealershipId, months);
        break;

      case 'sentiment':
        const reviews = await reviewServices.getAllReviews(dealershipId);
        result = await reviewServices.analyzeReviewSentiment(reviews);
        break;

      case 'monitor_mentions':
        const dealershipName = searchParams.get('dealershipName') || undefined;
        const keywords = searchParams.get('keywords') || undefined?.split(',') || [];
        
        if (!dealershipName) {
          return NextResponse.json({ error: 'Dealership name is required' }, { status: 400 });
        }
        
        result = await reviewServices.monitorReviewMentions(dealershipName, keywords);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Review services integration error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review data' },
      { status: 500 }
    );
  }
}

// POST endpoint for review actions
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, platform, reviewId, response } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 2. Initialize review services integration
    const reviewServices = new ReviewServicesIntegration();

    let result;

    switch (action) {
      case 'respond':
        if (!platform || !reviewId || !response) {
          return NextResponse.json({ error: 'Platform, review ID, and response are required' }, { status: 400 });
        }
        result = await reviewServices.respondToReview(platform, reviewId, response);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Review services action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform review action' },
      { status: 500 }
    );
  }
}
