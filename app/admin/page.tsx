'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  Users, Activity, AlertTriangle, Database, 
  TrendingUp, DollarSign, Search, Settings 
} from 'lucide-react';

/**
 * Admin Panel - Main Dashboard
 * Role-based access (admin + super_admin only)
 */
export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      checkAuthorization();
    }
  }, [user, isLoaded]);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/admin/check-access');
      const data = await response.json();

      if (data.authorized) {
        setIsAuthorized(true);
        fetchStats();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Authorization check error:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">Checking authorization...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">System overview and management</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-zinc-500">Total Dealers</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalDealers || 0}</div>
              <div className="text-xs text-zinc-400 mt-1">
                {stats.newDealersThisWeek || 0} this week
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-xs text-zinc-500">MRR</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${(stats.mrr || 0).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                ARR: ${((stats.mrr || 0) * 12).toLocaleString()}
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-zinc-500">API Latency</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {(stats.avgLatency || 0).toFixed(0)}ms
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                P95: {(stats.p95Latency || 0).toFixed(0)}ms
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-zinc-500">Cache Hit Rate</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {(stats.cacheHitRate || 0).toFixed(0)}%
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Target: &gt; 90%
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/dealers')}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/30 transition-all text-left group"
          >
            <Users className="w-6 h-6 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-1">Dealer Management</h3>
            <p className="text-sm text-zinc-400">
              View all dealers, search, filter, and manage accounts
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/system')}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/30 transition-all text-left group"
          >
            <Activity className="w-6 h-6 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-1">System Health</h3>
            <p className="text-sm text-zinc-400">
              API performance, cache rates, error logs, cron status
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/support')}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/30 transition-all text-left group"
          >
            <Settings className="w-6 h-6 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-1">Support Tools</h3>
            <p className="text-sm text-zinc-400">
              User lookup, agent conversations, failed payments
            </p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { type: 'signup', message: 'New dealer signup: Terry Reid Hyundai', time: '2 min ago' },
              { type: 'upgrade', message: 'Upgrade: Free → Pro', time: '15 min ago' },
              { type: 'error', message: 'API error rate spike detected', time: '1 hour ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'error' ? 'bg-red-500' :
                  activity.type === 'upgrade' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-zinc-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
