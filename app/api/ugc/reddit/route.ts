// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { searchRedditForDealership } from '@/lib/reddit/reddit-oauth-client';
import { transformRedditToUGC } from '@/lib/reddit/devvit-client';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const redditQuerySchema = z.object({
  dealershipName: z.string().min(2).max(100),
  location: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
});

/**
 * GET /api/ugc/reddit
 * 
 * Fetches Reddit UGC data for a dealership.
 * 
 * Query params:
 * - dealershipName: Name of the dealership (required)
 * - location: City/state for better search results (optional)
 * - limit: Number of posts to fetch (optional, default: 25)
 */
async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealershipName = url.searchParams.get('dealershipName') || undefined;
    const location = url.searchParams.get('location') || undefined || undefined;
    const limit = parseInt(url.searchParams.get('limit') || undefined || '25', 10);

    if (!dealershipName) {
      return NextResponse.json(
        { error: 'dealershipName query parameter is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validated = redditQuerySchema.parse({
      dealershipName,
      location,
      limit,
    });

    // Fetch Reddit data using OAuth (Path B)
    const redditData = await searchRedditForDealership(
      validated.dealershipName,
      validated.location,
      validated.limit
    );

    // Calculate mentions summary
    const subredditCounts: Record<string, number> = {};
    redditData.posts.forEach(post => {
      subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
    });

    const topSubreddits = Object.entries(subredditCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxPossibleEngagement = redditData.posts.length * 1000;
    const engagementScore = Math.min(
      100,
      Math.round((redditData.totalEngagement / maxPossibleEngagement) * 100)
    );

    const mentions = {
      totalMentions: redditData.mentions,
      recentPosts: redditData.posts.slice(0, 10),
      topSubreddits,
      engagementScore,
    };

    // Transform to UGC format
    const ugcData = transformRedditToUGC(redditData);

    return NextResponse.json({
      success: true,
      data: {
        ...ugcData,
        reddit: {
          totalMentions: mentions.totalMentions,
          recentPosts: mentions.recentPosts,
          topSubreddits: mentions.topSubreddits,
          engagementScore: mentions.engagementScore,
        },
        raw: {
          posts: redditData.posts,
          comments: redditData.comments,
        },
      },
      metadata: {
        dealershipName: validated.dealershipName,
        location: validated.location,
        lastUpdated: redditData.lastUpdated,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=900',
      },
    });
  } catch (error: any) {
    console.error('[ugc/reddit] error:', error);
    
    if (error.message?.includes('REDDIT_CLIENT_ID') || error.message?.includes('REDDIT_CLIENT_SECRET')) {
      return NextResponse.json(
        { 
          error: 'Reddit OAuth not configured',
          message: 'REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables are required'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch Reddit UGC data',
        success: false 
      },
      { status: 500 }
    );
  }
}

export const GET = createPublicRoute(handler, {
  rateLimit: true,
});
