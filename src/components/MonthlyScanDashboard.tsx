'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  brand: string;
  city: string;
  state: string;
  tier: string;
  visibility_score: number;
  total_mentions: number;
  avg_rank: number;
  sentiment_score: number;
  total_citations: number;
  rank: number;
  score_change: number;
  percent_change: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  summary: {
    total_dealers: number;
    avg_visibility_score: number;
    total_mentions: number;
    avg_sentiment: number;
    scan_date: string;
  };
  distributions: {
    tier: Record<string, number>;
    brand: Record<string, number>;
    state: Record<string, number>;
  };
  highlights: {
    top_performers: LeaderboardEntry[];
    biggest_gainers: LeaderboardEntry[];
    biggest_losers: LeaderboardEntry[];
  };
}

export function MonthlyScanDashboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tier: '',
    state: '',
    brand: '',
    sortBy: 'visibility_score',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchLeaderboardData();
  }, [filters]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.tier) params.append('tier', filters.tier);
      if (filters.state) params.append('state', filters.state);
      if (filters.brand) params.append('brand', filters.brand);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('limit', '100');

      // Mock data for development - API route doesn't exist yet
      const mockLeaderboardData = {
        success: true,
        data: {
          dealers: [
            { id: 'dealer-1', name: 'ABC Motors', score: 95, rank: 1, change: '+2' },
            { id: 'dealer-2', name: 'XYZ Auto', score: 92, rank: 2, change: '+1' },
            { id: 'dealer-3', name: 'Premium Cars', score: 89, rank: 3, change: '-1' }
          ],
          total_dealers: 150,
          last_updated: new Date().toISOString()
        }
      };
      
      setLeaderboard(mockLeaderboardData.data);
      setLoading(false);
      return;

      const response = await fetch(`/api/leaderboard?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch leaderboard data');
      }
    } catch (err) {
      setError('Network error while fetching data');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerMonthlyScan = async () => {
    try {
      // Mock data for development - API route doesn't exist yet
      const mockScanData = {
        success: true,
        data: {
          scan_id: 'scan-' + Date.now(),
          status: 'completed',
          dealers_scanned: 150,
          total_errors: 3,
          completion_time: '2h 15m',
          timestamp: new Date().toISOString()
        }
      };
      
      setScanStatus(mockScanData.data);
      setLoading(false);
      return;

      const response = await fetch('/api/cron/monthly-scan', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'default-secret'}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Monthly scan triggered successfully!');
        fetchLeaderboardData(); // Refresh data
      } else {
        alert(`Scan failed: ${result.error}`);
      }
    } catch (err) {
      alert('Failed to trigger monthly scan');
      console.error('Error triggering scan:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Monthly Scan Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchLeaderboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Monthly Scan Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                AI Visibility Leaderboard • Last scan: {data.summary.scan_date}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={triggerMonthlyScan}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Trigger Monthly Scan
              </button>
              <button 
                onClick={fetchLeaderboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.summary.total_dealers}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dealers</p>
                <p className="text-xs text-gray-500">Scanned this month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {data.summary.avg_visibility_score}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Visibility Score</p>
                <p className="text-xs text-gray-500">Out of 100</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.summary.total_mentions}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mentions</p>
                <p className="text-xs text-gray-500">Across all platforms</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.summary.avg_sentiment}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                <p className="text-xs text-gray-500">-1 to 1 scale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
              <select
                value={filters.tier}
                onChange={(e) => setFilters({...filters, tier: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tiers</option>
                <option value="free">Free</option>
                <option value="pro">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({...filters, state: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All States</option>
                <option value="FL">Florida</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({...filters, brand: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Nissan">Nissan</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="visibility_score">Visibility Score</option>
                <option value="total_mentions">Total Mentions</option>
                <option value="sentiment_score">Sentiment Score</option>
                <option value="name">Dealer Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Visibility Leaderboard</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dealer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.leaderboard.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{dealer.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                        <div className="text-sm text-gray-500">{dealer.city}, {dealer.state}</div>
                        <div className="text-xs text-gray-400">{dealer.brand} • {dealer.tier}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{dealer.visibility_score}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dealer.total_mentions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dealer.avg_rank.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dealer.sentiment_score.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        dealer.score_change > 0 
                          ? 'bg-green-100 text-green-800' 
                          : dealer.score_change < 0 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {dealer.score_change > 0 ? '+' : ''}{dealer.score_change} ({dealer.percent_change > 0 ? '+' : ''}{dealer.percent_change}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {data.highlights.top_performers.map((dealer, index) => (
                <div key={dealer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="text-lg font-bold text-gray-900 mr-3">#{index + 1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{dealer.name}</div>
                      <div className="text-sm text-gray-500">{dealer.city}, {dealer.state}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{dealer.visibility_score}</div>
                    <div className="text-sm text-gray-500">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biggest Gainers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biggest Gainers</h3>
            <div className="space-y-3">
              {data.highlights.biggest_gainers.map((dealer) => (
                <div key={dealer.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{dealer.name}</div>
                    <div className="text-sm text-gray-500">{dealer.city}, {dealer.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">+{dealer.score_change}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
