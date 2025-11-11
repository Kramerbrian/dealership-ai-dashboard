'use client';

import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Eye, MousePointer } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  traffic: {
    organic: number;
    direct: number;
    social: number;
    referral: number;
    paid: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topPages: Array<{
    page: string;
    views: number;
    avgTime: number;
    bounceRate: number;
  }>;
  trends: Array<{
    date: string;
    sessions: number;
    conversions: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        overview: {
          totalSessions: 12543,
          avgSessionDuration: 245,
          bounceRate: 34.2,
          conversionRate: 2.8
        },
        traffic: {
          organic: 45.2,
          direct: 28.7,
          social: 12.1,
          referral: 8.9,
          paid: 5.1
        },
        devices: {
          desktop: 52.3,
          mobile: 41.2,
          tablet: 6.5
        },
        topPages: [
          { page: '/inventory', views: 3241, avgTime: 180, bounceRate: 28.5 },
          { page: '/financing', views: 2156, avgTime: 320, bounceRate: 22.1 },
          { page: '/service', views: 1892, avgTime: 145, bounceRate: 35.2 },
          { page: '/about', views: 1234, avgTime: 95, bounceRate: 45.8 },
          { page: '/contact', views: 987, avgTime: 210, bounceRate: 18.3 }
        ],
        trends: [
          { date: '2024-01-01', sessions: 1200, conversions: 34 },
          { date: '2024-01-02', sessions: 1350, conversions: 38 },
          { date: '2024-01-03', sessions: 1180, conversions: 32 },
          { date: '2024-01-04', sessions: 1420, conversions: 42 },
          { date: '2024-01-05', sessions: 1580, conversions: 45 },
          { date: '2024-01-06', sessions: 1650, conversions: 48 },
          { date: '2024-01-07', sessions: 1720, conversions: 52 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {['1d', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Sessions</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {data.overview.totalSessions.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">+12.5% vs last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg. Session Duration</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {Math.floor(data.overview.avgSessionDuration / 60)}m {data.overview.avgSessionDuration % 60}s
          </div>
          <div className="text-sm text-green-600">+8.3% vs last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Bounce Rate</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {data.overview.bounceRate}%
          </div>
          <div className="text-sm text-red-600">+2.1% vs last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MousePointer className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {data.overview.conversionRate}%
          </div>
          <div className="text-sm text-green-600">+0.4% vs last period</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(data.traffic).map(([source, percentage]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    source === 'organic' ? 'bg-green-500' :
                    source === 'direct' ? 'bg-blue-500' :
                    source === 'social' ? 'bg-purple-500' :
                    source === 'referral' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {source}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        source === 'organic' ? 'bg-green-500' :
                        source === 'direct' ? 'bg-blue-500' :
                        source === 'social' ? 'bg-purple-500' :
                        source === 'referral' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Device Types</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(data.devices).map(([device, percentage]) => (
              <div key={device} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    device === 'desktop' ? 'bg-blue-500' :
                    device === 'mobile' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {device}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        device === 'desktop' ? 'bg-blue-500' :
                        device === 'mobile' ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounce Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.floor(page.avgTime / 60)}m {page.avgTime % 60}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.bounceRate < 30 ? 'bg-green-100 text-green-800' :
                      page.bounceRate < 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {page.bounceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
