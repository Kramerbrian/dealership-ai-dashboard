/**
 * Reddit OAuth Client (Path B: Script Flow)
 * 
 * Uses Reddit's OAuth2 script flow for backend-only access.
 * This is the correct approach for pulling UGC data into the dashboard.
 * 
 * NOT using Devvit token - that's only for CLI/Devvit app runtime.
 */

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || 'dealershipAI-ugc-scoreboard/1.0 by dealershipai';

if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
  console.warn('[Reddit OAuth] REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET not configured');
}

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditPost {
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

interface RedditSearchResponse {
  data: {
    children: Array<{
      data: any;
    }>;
  };
}

/**
 * Get OAuth token using script flow (client credentials)
 */
async function getRedditToken(): Promise<string> {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    throw new Error('REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be configured');
  }

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': REDDIT_USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Reddit OAuth failed: ${response.status} ${errorText}`);
  }

  const tokenData: RedditTokenResponse = await response.json();
  return tokenData.access_token;
}

/**
 * Search Reddit for dealership mentions
 */
export async function searchRedditMentions(
  query: string,
  limit: number = 50
): Promise<RedditPost[]> {
  const accessToken = await getRedditToken();

  const searchUrl = `https://oauth.reddit.com/search?${new URLSearchParams({
    q: query,
    sort: 'new',
    limit: limit.toString(),
    t: 'all',
  })}`;

  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': REDDIT_USER_AGENT,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Reddit search failed: ${response.status} ${errorText}`);
  }

  const data: RedditSearchResponse = await response.json();
  
  return (data.data?.children || []).map((child: any) => ({
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
}

/**
 * Search for dealership-related content
 */
export async function searchRedditForDealership(
  dealershipName: string,
  location?: string,
  limit: number = 25
): Promise<{
  posts: RedditPost[];
  totalEngagement: number;
  mentions: number;
  subreddits: string[];
  lastUpdated: string;
}> {
  const query = location 
    ? `${dealershipName} ${location}`
    : dealershipName;

  const posts = await searchRedditMentions(query, limit);
  
  const subreddits = [...new Set(posts.map(p => p.subreddit))];
  const totalEngagement = posts.reduce((sum, post) => 
    sum + post.score + post.num_comments, 0
  );

  return {
    posts,
    totalEngagement,
    mentions: posts.length,
    subreddits,
    lastUpdated: new Date().toISOString(),
  };
}

