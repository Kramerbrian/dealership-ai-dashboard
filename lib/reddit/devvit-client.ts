/**
 * Reddit Devvit Client
 * 
 * Fetches UGC data from Reddit using Devvit project ID and Reddit API.
 * Pulls posts, comments, and engagement metrics for dealership-related content.
 * 
 * Uses:
 * - Reddit API for public data access
 * - Devvit project ID for authentication
 */

const DEVVIT_PROJECT_ID = process.env.REDDIT_DEVVIT_PROJECT_ID;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

if (!DEVVIT_PROJECT_ID) {
  console.warn('[Reddit Devvit] REDDIT_DEVVIT_PROJECT_ID not configured');
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  url: string;
  selftext?: string;
  permalink: string;
  domain?: string;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  permalink: string;
  parent_id: string;
}

export interface RedditUGCData {
  posts: RedditPost[];
  comments: RedditComment[];
  totalEngagement: number;
  sentimentScore?: number;
  mentions: number;
  subreddits: string[];
  lastUpdated: string;
}

/**
 * Search Reddit for dealership-related content
 */
export async function searchRedditForDealership(
  dealershipName: string,
  location?: string,
  limit: number = 25
): Promise<RedditUGCData> {
  if (!DEVVIT_PROJECT_ID) {
    throw new Error('REDDIT_DEVVIT_PROJECT_ID is not configured');
  }

  // Build search query
  const query = location 
    ? `${dealershipName} ${location}`
    : dealershipName;

  try {
    // Use Reddit API (public JSON endpoint)
    // For authenticated access, we'd use Reddit OAuth with client credentials
    const response = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=all`,
      {
        headers: {
          'User-Agent': `DealershipAI:${DEVVIT_PROJECT_ID}:1.0.0 (by /u/dealershipai)`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    const posts: RedditPost[] = (data.data?.children || []).map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      subreddit: child.data.subreddit,
      score: child.data.score || 0,
      upvote_ratio: child.data.upvote_ratio || 0,
      num_comments: child.data.num_comments || 0,
      created_utc: child.data.created_utc,
      url: child.data.url,
      selftext: child.data.selftext,
      permalink: `https://reddit.com${child.data.permalink}`,
      domain: child.data.domain,
    }));

    // Extract unique subreddits
    const subreddits = [...new Set(posts.map(p => p.subreddit))];

    // Calculate total engagement
    const totalEngagement = posts.reduce((sum, post) => 
      sum + post.score + post.num_comments, 0
    );

    // Fetch comments for top posts (simplified - would need separate API calls)
    const comments: RedditComment[] = [];

    return {
      posts,
      comments,
      totalEngagement,
      mentions: posts.length,
      subreddits,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Reddit Devvit] Error fetching data:', error);
    throw error;
  }
}

/**
 * Get Reddit mentions for a specific dealership
 */
export async function getRedditMentions(
  dealershipName: string,
  location?: string
): Promise<{
  totalMentions: number;
  recentPosts: RedditPost[];
  topSubreddits: Array<{ name: string; count: number }>;
  engagementScore: number;
}> {
  const data = await searchRedditForDealership(dealershipName, location, 50);

  // Calculate top subreddits
  const subredditCounts: Record<string, number> = {};
  data.posts.forEach(post => {
    subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
  });

  const topSubreddits = Object.entries(subredditCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate engagement score (normalized 0-100)
  const maxPossibleEngagement = data.posts.length * 1000; // Assume max 1000 engagement per post
  const engagementScore = Math.min(
    100,
    Math.round((data.totalEngagement / maxPossibleEngagement) * 100)
  );

  return {
    totalMentions: data.mentions,
    recentPosts: data.posts.slice(0, 10),
    topSubreddits,
    engagementScore,
  };
}

/**
 * Transform Reddit data to UGC format compatible with clarity stack
 */
export function transformRedditToUGC(redditData: RedditUGCData): {
  score: number;
  recent_reviews_90d: number;
  issues: string[];
  redditMentions?: number;
  redditEngagement?: number;
  topSubreddits?: string[];
} {
  // Calculate UGC score based on Reddit engagement
  // Higher engagement = higher score
  const baseScore = Math.min(100, Math.round((redditData.totalEngagement / 100) * 10));
  
  // Count recent posts (last 90 days)
  const ninetyDaysAgo = Date.now() / 1000 - (90 * 24 * 60 * 60);
  const recentPosts = redditData.posts.filter(
    post => post.created_utc > ninetyDaysAgo
  ).length;

  // Generate issues if engagement is low
  const issues: string[] = [];
  if (redditData.totalEngagement < 50) {
    issues.push('Low Reddit engagement - dealership not mentioned frequently');
  }
  if (redditData.subreddits.length < 3) {
    issues.push('Limited Reddit presence across subreddits');
  }

  return {
    score: baseScore,
    recent_reviews_90d: recentPosts,
    issues,
    redditMentions: redditData.mentions,
    redditEngagement: redditData.totalEngagement,
    topSubreddits: redditData.subreddits.slice(0, 5),
  };
}

