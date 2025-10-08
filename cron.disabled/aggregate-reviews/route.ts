import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = headers().get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ReviewAggregator = (await import('@/../scripts/aggregate-reviews')).default;
    const aggregator = new ReviewAggregator();
    const results = await aggregator.aggregate();

    return NextResponse.json({ 
      success: true, 
      success_count: results.success,
      failed_count: results.failed,
      new_reviews: results.new_reviews
    });
  } catch (error) {
    console.error('Review aggregation cron failed:', error);
    return NextResponse.json(
      { error: 'Review aggregation failed' },
      { status: 500 }
    );
  }
}
