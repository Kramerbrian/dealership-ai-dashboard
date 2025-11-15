'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, Clock } from 'lucide-react';

interface SessionStats {
  activeSessions: number;
  scansToday: number;
  avgRevenueFound: number;
  lastUpdate: string;
}

export default function SessionCounter() {
  const [stats, setStats] = useState<SessionStats>({
    activeSessions: 0,
    scansToday: 0,
    avgRevenueFound: 0,
    lastUpdate: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial stats
    fetchStats();

    // Update every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/landing/session-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch session stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeSince = (isoString: string) => {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900 rounded-xl border border-purple-500/30 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400 animate-pulse" />
          Live Activity
        </h3>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeSince(stats.lastUpdate)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Active Sessions */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Active Now</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.activeSessions}
          </div>
          <div className="text-xs text-gray-500 mt-1">visitors online</div>
        </div>

        {/* Scans Today */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Scans Today</span>
            <TrendingUp className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.scansToday.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">dealerships analyzed</div>
        </div>

        {/* Avg Revenue Found */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Avg. Found</span>
            <span className="text-xs text-green-400">+{((stats.avgRevenueFound / 1000) * 100).toFixed(0)}%</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${(stats.avgRevenueFound / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-gray-500 mt-1">revenue at risk</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="space-y-2">
          <ActivityFeedItem
            city="Naples, FL"
            action="completed scan"
            amount={52000}
            timeAgo="12s ago"
          />
          <ActivityFeedItem
            city="Fort Myers, FL"
            action="unlocked report"
            amount={38000}
            timeAgo="34s ago"
          />
          <ActivityFeedItem
            city="Atlanta, GA"
            action="started trial"
            amount={67000}
            timeAgo="1m ago"
          />
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            <span className="text-purple-400 font-semibold">2,847</span> dealerships scanned this month
          </span>
          <span className="text-gray-500">Trusted by dealers nationwide</span>
        </div>
      </div>
    </div>
  );
}

function ActivityFeedItem({
  city,
  action,
  amount,
  timeAgo,
}: {
  city: string;
  action: string;
  amount: number;
  timeAgo: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
        <span className="text-gray-300">
          <span className="text-white font-medium">{city}</span> {action}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-semibold">
          ${(amount / 1000).toFixed(0)}K
        </span>
        <span className="text-gray-500">{timeAgo}</span>
      </div>
    </div>
  );
}
