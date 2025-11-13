import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { dealerName, score, revenueAtRisk } = await request.json();

    // Track onboarding start event
    const redisClient = redis();

    if (redisClient) {
      // Increment onboarding starts counter
      const todayKey = `landing:onboarding_starts:${new Date().toISOString().split('T')[0]}`;
      await redisClient.incr(todayKey);
      await redisClient.expire(todayKey, 86400 * 30); // Keep for 30 days

      // Add to recent onboarding events
      const onboardingEvent = JSON.stringify({
        dealerName: dealerName || 'Anonymous',
        score: score || 0,
        revenueAtRisk: revenueAtRisk || 0,
        timestamp: new Date().toISOString(),
      });

      await redisClient.lpush('landing:recent_onboardings', onboardingEvent);
      await redisClient.ltrim('landing:recent_onboardings', 0, 99); // Keep last 100

      // Increment total onboarding counter
      await redisClient.incr('landing:total_onboardings');
    }

    // Log onboarding start
    console.log(`Onboarding started: ${dealerName || 'Anonymous'} - Score: ${score}`);

    return NextResponse.json({
      success: true,
      message: 'Onboarding start tracked',
    });
  } catch (error) {
    console.error('Failed to track onboarding start:', error);
    return NextResponse.json(
      { error: 'Failed to track onboarding start' },
      { status: 500 }
    );
  }
}

// Get onboarding stats
export async function GET() {
  try {
    const redisClient = redis();

    if (!redisClient) {
      return NextResponse.json({
        totalOnboardings: 0,
        todayCount: 0,
        recent: [],
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const [todayCount, totalOnboardings, recentOnboardings] = await Promise.all([
      redisClient.get(`landing:onboarding_starts:${today}`),
      redisClient.get('landing:total_onboardings'),
      redisClient.lrange('landing:recent_onboardings', 0, 9),
    ]);

    return NextResponse.json({
      totalOnboardings: parseInt(totalOnboardings || '0'),
      todayCount: parseInt(todayCount || '0'),
      recent: recentOnboardings.map((event) => JSON.parse(event)),
    });
  } catch (error) {
    console.error('Failed to get onboarding stats:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding stats' },
      { status: 500 }
    );
  }
}
