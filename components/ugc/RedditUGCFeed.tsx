"use client";

/**
 * Reddit UGC Feed Component
 * 
 * Displays Reddit posts and comments related to a dealership.
 * Fetches data from /api/ugc/reddit and displays in a feed format.
 */

import { useEffect, useState } from "react";
import { ExternalLink, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";

interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  selftext?: string;
}

interface RedditUGCProps {
  dealershipName: string;
  location?: string;
  limit?: number;
}

export function RedditUGCFeed({ dealershipName, location, limit = 10 }: RedditUGCProps) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalMentions: number;
    engagementScore: number;
    topSubreddits: Array<{ name: string; count: number }>;
  } | null>(null);

  useEffect(() => {
    const fetchRedditData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          dealershipName,
          limit: limit.toString(),
        });
        if (location) params.set('location', location);

        const res = await fetch(`/api/ugc/reddit?${params.toString()}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setPosts(data.data?.raw?.posts || []);
        setStats(data.data?.reddit || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch Reddit data");
      } finally {
        setLoading(false);
      }
    };

    if (dealershipName) {
      fetchRedditData();
    }
  }, [dealershipName, location, limit]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Date.now() / 1000 - timestamp;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="text-slate-400">Loading Reddit mentions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-600/50 rounded-2xl">
        <p className="text-red-400">Error: {error}</p>
        {error.includes('REDDIT_DEVVIT_PROJECT_ID') && (
          <p className="text-sm text-red-300 mt-2">
            Reddit Devvit is not configured. Add REDDIT_DEVVIT_PROJECT_ID to your environment variables.
          </p>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-center">
        <p className="text-slate-400">No Reddit mentions found for {dealershipName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Total Mentions</div>
            <div className="text-2xl font-bold">{stats.totalMentions}</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Engagement Score</div>
            <div className="text-2xl font-bold">{stats.engagementScore}/100</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Top Subreddits</div>
            <div className="text-sm text-slate-300">
              {stats.topSubreddits.slice(0, 3).map(s => s.name).join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Reddit Mentions</h3>
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">r/{post.subreddit}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">u/{post.author}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    {formatTimeAgo(post.created_utc)}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-2">{post.title}</h4>
                {post.selftext && (
                  <p className="text-sm text-slate-300 line-clamp-2 mb-3">
                    {post.selftext}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.score.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.num_comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{Math.round(post.upvote_ratio * 100)}% upvoted</span>
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-500 flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

