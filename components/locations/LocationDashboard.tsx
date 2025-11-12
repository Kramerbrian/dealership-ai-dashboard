'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
  location_id: string;
  dealer_id: string;
  dealership_name: string;
  city: string;
  state: string;
  domain: string;
  latest_schema_coverage: number | null;
  latest_eeat_score: number | null;
  latest_ai_visibility_score: number | null;
  last_scanned_at: string | null;
  status: string;
}

interface DealerGroup {
  id: string;
  group_name: string;
  group_slug: string;
}

interface LocationDashboardProps {
  initialGroupId?: string;
}

export default function LocationDashboard({ initialGroupId }: LocationDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DealerGroup | null>(null);
  const [allGroups, setAllGroups] = useState<DealerGroup[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchLocations(initialGroupId);
  }, [initialGroupId]);

  const fetchLocations = async (groupId?: string) => {
    try {
      setLoading(true);
      const url = groupId
        ? `/api/locations?groupId=${groupId}`
        : '/api/locations';

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setLocations(data.locations || []);
        setSelectedGroup(data.group);
        setAllGroups(data.allGroups || []);
      }
    } catch (error) {
      console.error('[LocationDashboard] Error fetching locations:', error);
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

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-gray-800/50';
    if (score >= 90) return 'bg-emerald-900/30';
    if (score >= 70) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {selectedGroup?.group_name || 'All Locations'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {locations.length} location{locations.length !== 1 ? 's' : ''} in this group
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>

          {/* Group selector */}
          {allGroups.length > 1 && (
            <select
              value={selectedGroup?.id || ''}
              onChange={(e) => fetchLocations(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {allGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.group_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Locations */}
      {locations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No locations found</div>
          <p className="text-gray-600 text-sm">
            Add your first dealership location to get started
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {locations.map((location) => (
              <motion.div
                key={location.location_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                {/* Location header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {location.dealership_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{location.city}, {location.state}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{location.domain}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className={`${getScoreBg(location.latest_schema_coverage)} rounded-lg p-3`}>
                    <div className="text-xs text-gray-400 mb-1">Schema</div>
                    <div className={`text-xl font-bold ${getScoreColor(location.latest_schema_coverage)}`}>
                      {location.latest_schema_coverage !== null ? `${location.latest_schema_coverage}%` : '—'}
                    </div>
                  </div>

                  <div className={`${getScoreBg(location.latest_eeat_score)} rounded-lg p-3`}>
                    <div className="text-xs text-gray-400 mb-1">E-E-A-T</div>
                    <div className={`text-xl font-bold ${getScoreColor(location.latest_eeat_score)}`}>
                      {location.latest_eeat_score !== null ? location.latest_eeat_score : '—'}
                    </div>
                  </div>

                  <div className={`${getScoreBg(location.latest_ai_visibility_score)} rounded-lg p-3`}>
                    <div className="text-xs text-gray-400 mb-1">AI Vis</div>
                    <div className={`text-xl font-bold ${getScoreColor(location.latest_ai_visibility_score)}`}>
                      {location.latest_ai_visibility_score !== null ? location.latest_ai_visibility_score : '—'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last scan: {formatDate(location.last_scanned_at)}</span>
                  <span className={`px-2 py-1 rounded ${
                    location.status === 'active'
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {location.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  City/State
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Schema
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  E-E-A-T
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  AI Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Scan
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {locations.map((location) => (
                <tr key={location.location_id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{location.dealership_name}</div>
                    <div className="text-xs text-gray-400">{location.domain}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {location.city}, {location.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-lg font-bold ${getScoreColor(location.latest_schema_coverage)}`}>
                      {location.latest_schema_coverage !== null ? `${location.latest_schema_coverage}%` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-lg font-bold ${getScoreColor(location.latest_eeat_score)}`}>
                      {location.latest_eeat_score !== null ? location.latest_eeat_score : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-lg font-bold ${getScoreColor(location.latest_ai_visibility_score)}`}>
                      {location.latest_ai_visibility_score !== null ? location.latest_ai_visibility_score : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(location.last_scanned_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded ${
                      location.status === 'active'
                        ? 'bg-emerald-900/30 text-emerald-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {location.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
