import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { platform, dealerName } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    // Track share event
    const redisClient = redis();

    if (redisClient) {
      // Increment platform-specific counter
      const todayKey = `landing:shares:${platform}:${new Date().toISOString().split('T')[0]}`;
      await redisClient.incr(todayKey);
      await redisClient.expire(todayKey, 86400 * 30); // Keep for 30 days

      // Add to recent shares list
      const shareEvent = JSON.stringify({
        platform,
        dealerName: dealerName || 'Anonymous',
        timestamp: new Date().toISOString(),
      });

      await redisClient.lpush('landing:recent_shares', shareEvent);
      await redisClient.ltrim('landing:recent_shares', 0, 99); // Keep last 100

      // Increment total shares counter
      await redisClient.incr('landing:total_shares');
    }

    // Log share event (could integrate with analytics platform)
    console.log(`Share tracked: ${platform} - ${dealerName || 'Anonymous'}`);

    return NextResponse.json({
      success: true,
      message: 'Share tracked successfully',
    });
  } catch (error) {
    console.error('Failed to track share:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}

// Get share stats
export async function GET() {
  try {
    const redisClient = redis();

    if (!redisClient) {
      return NextResponse.json({
        totalShares: 0,
        byPlatform: { twitter: 0, linkedin: 0, facebook: 0 },
        recent: [],
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get platform-specific counts for today
    const [twitterShares, linkedinShares, facebookShares, totalShares, recentShares] =
      await Promise.all([
        redisClient.get(`landing:shares:twitter:${today}`),
        redisClient.get(`landing:shares:linkedin:${today}`),
        redisClient.get(`landing:shares:facebook:${today}`),
        redisClient.get('landing:total_shares'),
        redisClient.lrange('landing:recent_shares', 0, 9),
      ]);

    return NextResponse.json({
      totalShares: parseInt(totalShares || '0'),
      todayByPlatform: {
        twitter: parseInt(twitterShares || '0'),
        linkedin: parseInt(linkedinShares || '0'),
        facebook: parseInt(facebookShares || '0'),
      },
      recent: recentShares.map((share: any) => JSON.parse(share)),
    });
  } catch (error) {
    console.error('Failed to get share stats:', error);
    return NextResponse.json(
      { error: 'Failed to get share stats' },
      { status: 500 }
    );
  }
}
