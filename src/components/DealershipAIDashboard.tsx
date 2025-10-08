/**
 * DealershipAI Dashboard - Complete React Component
 * Drop-in ready dashboard with all features
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

// Main Dashboard Component
export default function DealershipAIDashboard({
  dealershipId = 'lou-glutz-motors',
  dealershipName = 'Lou Glutz Motors',
  apiBaseUrl = '/api',
  theme = 'light',
  showLeaderboard = true,
  showCommunity = true,
  showAnalytics = true,
  showHeader = true
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    timeframe: '30d',
    brand: '',
    state: ''
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [dealershipId, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        dealershipId,
        timeframe: filters.timeframe,
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.state && { state: filters.state })
      });

      const response = await fetch(`${apiBaseUrl}/dashboard?${params}`);
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`dealership-ai-dashboard ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header - conditionally rendered */}
      {showHeader && (
        <div className="dashboard-header">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                DealershipAI Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI Visibility Analytics for {dealershipName}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchDashboardData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                { id: 'community', label: 'Community', icon: MessageSquare },
                { id: 'analytics', label: 'Analytics', icon: Activity }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
        </div>
      )}

      {/* Filters */}
      <div className="dashboard-filters mt-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex space-x-4">
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <select
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Brands</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
              </select>
              
              <select
                value={filters.state}
                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All States</option>
                <option value="CA">California</option>
                <option value="FL">Florida</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content mt-6">
        {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
        {activeTab === 'leaderboard' && showLeaderboard && <LeaderboardTab data={dashboardData} />}
        {activeTab === 'community' && showCommunity && <CommunityTab data={dashboardData} />}
        {activeTab === 'analytics' && showAnalytics && <AnalyticsTab data={dashboardData} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }) {
  if (!data) return <div>No data available</div>;

  const metrics = data.metrics || {};
  const scores = data.scores || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="AI Visibility Score"
          value={scores.ai_visibility || 0}
          max={100}
          icon={Target}
          color="blue"
          trend={metrics.ai_visibility_trend || 0}
        />
        <MetricCard
          title="Zero-Click Score"
          value={scores.zero_click || 0}
          max={100}
          icon={Zap}
          color="green"
          trend={metrics.zero_click_trend || 0}
        />
        <MetricCard
          title="UGC Health"
          value={scores.ugc_health || 0}
          max={100}
          icon={MessageSquare}
          color="purple"
          trend={metrics.ugc_health_trend || 0}
        />
        <MetricCard
          title="Geo Trust"
          value={scores.geo_trust || 0}
          max={100}
          icon={Globe}
          color="orange"
          trend={metrics.geo_trust_trend || 0}
        />
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Overall Score</h3>
            <p className="text-blue-100 mt-1">Comprehensive AI visibility rating</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{scores.overall || 0}</div>
            <div className="text-blue-100">out of 100</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${scores.overall || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {(data.recent_activity || []).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'scan' ? (
                    <Activity className="h-5 w-5 text-blue-600" />
                  ) : activity.type === 'update' ? (
                    <RefreshCw className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Recommendations
          </h3>
          <div className="space-y-3">
            {(data.recommendations || []).map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({ data }) {
  const leaderboard = data?.leaderboard || [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dealership Rankings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Dealership</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Brand</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">AI Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((dealer, index) => (
                <tr key={dealer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="font-medium">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{dealer.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{dealer.website}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {dealer.brand}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {dealer.city}, {dealer.state}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {dealer.visibility_score}
                      </div>
                      <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">/100</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {dealer.total_mentions}
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

// Community Tab Component
function CommunityTab({ data }) {
  const community = data?.community || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {community.total_posts || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Sentiment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {community.avg_sentiment ? (community.avg_sentiment * 100).toFixed(1) : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {community.engagement_rate ? (community.engagement_rate * 100).toFixed(1) : 0}%
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Community Insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Community Insights
        </h3>
        <div className="space-y-4">
          {(community.insights || []).map((insight, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  insight.type === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  insight.type === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {insight.type}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ data }) {
  const analytics = data?.analytics || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Score Trends
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platform Performance
          </h3>
          <div className="space-y-3">
            {(analytics.platforms || []).map((platform, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {platform.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {platform.mentions} mentions
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, max, icon: Icon, color, trend }) {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
    green: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">out of {max}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              color === 'blue' ? 'bg-blue-600' :
              color === 'green' ? 'bg-green-600' :
              color === 'purple' ? 'bg-purple-600' : 'bg-orange-600'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
