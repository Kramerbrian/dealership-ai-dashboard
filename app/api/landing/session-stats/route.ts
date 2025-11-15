import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface SessionStats {
  activeSessions: number;
  scansToday: number;
  avgRevenueFound: number;
  lastUpdate: string;
}

export async function GET() {
  try {
    // Get Redis client (with graceful fallback if unavailable)
    const redisClient = (redis as any)();

    if (!redisClient) {
      // Return mock data if Redis not available
      return NextResponse.json({
        activeSessions: Math.floor(Math.random() * 20) + 5,
        scansToday: Math.floor(Math.random() * 100) + 150,
        avgRevenueFound: 45000 + Math.floor(Math.random() * 20000),
        lastUpdate: new Date().toISOString(),
      });
    }

    // Get active sessions (visitors in last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const activeSessions = await redisClient.zcount(
      'landing:active_visitors',
      fiveMinutesAgo,
      Date.now()
    );

    // Get scans today
    const todayKey = `landing:scans:${new Date().toISOString().split('T')[0]}`;
    const scansToday = await redisClient.get(todayKey) || '0';

    // Get average revenue found (from last 100 scans)
    const revenueList = await redisClient.lrange('landing:revenue_found', 0, 99);
    const avgRevenueFound = revenueList.length > 0
      ? revenueList.reduce((sum: number, val: any) => sum + parseInt(val), 0) / revenueList.length
      : 45000;

    // Track this visitor
    const visitorId = `visitor:${Date.now()}:${Math.random()}`;
    await redisClient.zadd('landing:active_visitors', {
      score: Date.now(),
      member: visitorId,
    });

    // Clean up old visitors (older than 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    await redisClient.zremrangebyscore(
      'landing:active_visitors',
      0,
      tenMinutesAgo
    );

    const stats: SessionStats = {
      activeSessions: Math.max(activeSessions, 3), // Minimum 3 for social proof
      scansToday: parseInt(scansToday) || 150,
      avgRevenueFound: Math.round(avgRevenueFound),
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Session stats error:', error);

    // Return mock data on error
    return NextResponse.json({
      activeSessions: Math.floor(Math.random() * 20) + 5,
      scansToday: Math.floor(Math.random() * 100) + 150,
      avgRevenueFound: 45000 + Math.floor(Math.random() * 20000),
      lastUpdate: new Date().toISOString(),
    });
  }
}

// Helper to increment scan counter
export async function POST(request: Request) {
  try {
    const { revenueFound } = await request.json();
    const redisClient = (redis as any)();

    if (!redisClient) {
      return NextResponse.json({ success: true });
    }

    // Increment today's scan counter
    const todayKey = `landing:scans:${new Date().toISOString().split('T')[0]}`;
    await redisClient.incr(todayKey);
    await redisClient.expire(todayKey, 86400 * 7); // Keep for 7 days

    // Add revenue found to rolling list
    if (revenueFound) {
      await redisClient.lpush('landing:revenue_found', revenueFound.toString());
      await redisClient.ltrim('landing:revenue_found', 0, 99); // Keep last 100
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to increment scan counter:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
