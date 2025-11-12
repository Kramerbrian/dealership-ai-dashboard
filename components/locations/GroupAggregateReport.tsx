'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GroupSummary {
  group_name: string;
  total_locations: number;
  active_locations: number;
  avg_schema_coverage: number | null;
  avg_eeat_score: number | null;
  avg_ai_visibility_score: number | null;
  best_performing_location: string | null;
  worst_performing_location: string | null;
  total_competitors_tracked: number;
  last_scan_at: string | null;
}

interface LocationRanking {
  location_id: string;
  dealership_name: string;
  city: string;
  state: string;
  latest_schema_coverage: number | null;
  latest_eeat_score: number | null;
  latest_ai_visibility_score: number | null;
  schema_rank: number;
  eeat_rank: number;
  ai_rank: number;
  overall_rank: number;
}

interface ConsistencyAnalysis {
  location_id: string;
  dealership_name: string;
  schema_coverage: number | null;
  schema_types: string[] | null;
  missing_vs_group: string[] | null;
  consistency_score: number | null;
}

interface GroupAggregateReportProps {
  groupId: string;
}

export default function GroupAggregateReport({ groupId }: GroupAggregateReportProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [rankings, setRankings] = useState<LocationRanking[]>([]);
  const [consistency, setConsistency] = useState<ConsistencyAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'rankings' | 'consistency'>('overview');

  useEffect(() => {
    fetchReport();
  }, [groupId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/report`);
      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        setRankings(data.rankings || []);
        setConsistency(data.consistency || []);
      }
    } catch (error) {
      console.error('[GroupAggregateReport] Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
    if (rank === 3) return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
    return 'bg-gray-700/50 text-gray-400 border-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12 text-gray-500">
        No report data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{summary.group_name}</h2>
        <p className="text-gray-400 text-sm">
          Aggregate Performance Report • {summary.active_locations} Active Locations
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        {['overview', 'rankings', 'consistency'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? 'text-emerald-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="text-sm text-gray-400 mb-2">Avg Schema Coverage</div>
              <div className={`text-3xl font-bold ${getScoreColor(summary.avg_schema_coverage)}`}>
                {summary.avg_schema_coverage !== null ? `${summary.avg_schema_coverage}%` : '—'}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="text-sm text-gray-400 mb-2">Avg E-E-A-T Score</div>
              <div className={`text-3xl font-bold ${getScoreColor(summary.avg_eeat_score)}`}>
                {summary.avg_eeat_score !== null ? summary.avg_eeat_score : '—'}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="text-sm text-gray-400 mb-2">Avg AI Visibility</div>
              <div className={`text-3xl font-bold ${getScoreColor(summary.avg_ai_visibility_score)}`}>
                {summary.avg_ai_visibility_score !== null ? summary.avg_ai_visibility_score : '—'}
              </div>
            </div>
          </div>

          {/* Performance highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/50 border border-emerald-500/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <div className="text-sm text-emerald-300 font-medium">Best Performing</div>
              </div>
              <div className="text-lg font-semibold text-white">
                {summary.best_performing_location || 'N/A'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-gray-800/50 border border-red-500/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📉</span>
                <div className="text-sm text-red-300 font-medium">Needs Attention</div>
              </div>
              <div className="text-lg font-semibold text-white">
                {summary.worst_performing_location || 'N/A'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Group Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Locations</div>
                <div className="text-2xl font-bold text-white">{summary.total_locations}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Active</div>
                <div className="text-2xl font-bold text-emerald-400">{summary.active_locations}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Competitors Tracked</div>
                <div className="text-2xl font-bold text-white">{summary.total_competitors_tracked}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Last Scan</div>
                <div className="text-sm text-white">
                  {summary.last_scan_at
                    ? new Date(summary.last_scan_at).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
        >
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  Schema
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  E-E-A-T
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  AI Visibility
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  Overall Rank
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rankings.map((location) => (
                <tr key={location.location_id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getRankBadge(Math.round(location.overall_rank))}`}>
                      {Math.round(location.overall_rank)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{location.dealership_name}</div>
                    <div className="text-xs text-gray-400">{location.city}, {location.state}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-lg font-bold ${getScoreColor(location.latest_schema_coverage)}`}>
                      {location.latest_schema_coverage !== null ? `${location.latest_schema_coverage}%` : '—'}
                    </div>
                    <div className="text-xs text-gray-500">#{location.schema_rank}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-lg font-bold ${getScoreColor(location.latest_eeat_score)}`}>
                      {location.latest_eeat_score !== null ? location.latest_eeat_score : '—'}
                    </div>
                    <div className="text-xs text-gray-500">#{location.eeat_rank}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-lg font-bold ${getScoreColor(location.latest_ai_visibility_score)}`}>
                      {location.latest_ai_visibility_score !== null ? location.latest_ai_visibility_score : '—'}
                    </div>
                    <div className="text-xs text-gray-500">#{location.ai_rank}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRankBadge(Math.round(location.overall_rank))}`}>
                      {location.overall_rank.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Consistency Tab */}
      {activeTab === 'consistency' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {consistency.map((location) => (
            <div
              key={location.location_id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{location.dealership_name}</h3>
                  <div className="text-sm text-gray-400">
                    Schema Coverage: {location.schema_coverage !== null ? `${location.schema_coverage}%` : 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Consistency Score</div>
                  <div className={`text-2xl font-bold ${getScoreColor(location.consistency_score)}`}>
                    {location.consistency_score !== null ? `${location.consistency_score}%` : '—'}
                  </div>
                </div>
              </div>

              {location.missing_vs_group && location.missing_vs_group.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="text-sm text-red-300 font-medium mb-2">
                    Missing schemas found in other locations:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {location.missing_vs_group.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-red-500/20 text-red-200 rounded-lg text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(!location.missing_vs_group || location.missing_vs_group.length === 0) && (
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <div className="text-sm text-emerald-300 font-medium">
                    ✓ This location has all schemas present in other group locations
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
