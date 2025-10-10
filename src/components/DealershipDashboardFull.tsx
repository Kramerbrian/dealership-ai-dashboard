'use client';

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
  Zap,
  Search,
  Eye,
  Settings,
  Brain,
  FileText,
  Star as StarIcon
} from 'lucide-react';
import { DealershipAI_TruthBased, DealerData, VisibilityScores, EEATScores } from '@/core/truth-based-scorer';
import ModelHealthTiles from '@/components/dashboard/ModelHealthTiles';

interface Dealer {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  brand: string;
  tier: string;
  locations: number;
}

interface DashboardData {
  dealer: Dealer;
  scores: VisibilityScores & {
    ai_visibility: number;
    zero_click: number;
    ugc_health: number;
    geo_trust: number;
  };
  eeat?: EEATScores;
  actionItems?: any[];
  mysteryShops?: any[];
  chatSessions?: number;
  monthlyScans?: number;
  recent_activity?: any[];
  recommendations?: any[];
  leaderboard?: any[];
  community?: any;
  analytics?: any;
  costInfo?: any;
  scoringComponents?: {
    seo?: any;
    aeo?: any;
    geo?: any;
  };
}

interface DealershipDashboardFullProps {
  dealershipId?: string;
  dealershipName?: string;
  apiBaseUrl?: string;
  theme?: 'light' | 'dark';
  showLeaderboard?: boolean;
  showCommunity?: boolean;
  showAnalytics?: boolean;
  showHeader?: boolean;
  className?: string;
}

export default function DealershipDashboardFull({
  dealershipId = 'lou-glutz-motors',
  dealershipName = 'Lou Glutz Motors',
  apiBaseUrl = '/api',
  theme = 'light',
  showLeaderboard = true,
  showCommunity = true,
  showAnalytics = true,
  showHeader = true,
  className = ''
}: DealershipDashboardFullProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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

      // Initialize truth-based scorer
      const scorer = new DealershipAI_TruthBased();
      
      // Create dealer data
      const dealerData: DealerData = {
        id: dealershipId,
        name: dealershipName,
        domain: 'example.com',
        city: 'Naples',
        state: 'FL',
        brand: 'Hyundai'
      };

      // Calculate scores using truth-based system
      const visibilityScores = scorer.calculateVisibilityScore(dealerData);
      const eeatScores = scorer.calculateEEATScore(dealerData);
      const costInfo = scorer.getCostInfo();

      // Get detailed scoring components (async)
      const seoResult = await scorer.calculateSEOScore(dealerData);
      const aeoResult = await scorer.calculateAEOScore(dealerData);

      const dashboardData: DashboardData = {
        dealer: {
          id: dealershipId,
          name: dealershipName,
          domain: 'example.com',
          city: 'Naples',
          state: 'FL',
          brand: 'Hyundai',
          tier: 'pro',
          locations: 1
        },
        scores: {
          ...visibilityScores,
          ai_visibility: visibilityScores.aeo_visibility,
          zero_click: Math.floor(Math.random() * 30) + 70, // Simulated
          ugc_health: Math.floor(Math.random() * 30) + 70, // Simulated
          geo_trust: visibilityScores.geo_visibility
        },
        eeat: eeatScores,
        actionItems: [
          {
            category: 'Experience',
            priority: 'high',
            action: 'Add customer testimonials with photos',
            impact: '+15 points',
            effort: '2 hours',
            cost: '$0'
          },
          {
            category: 'Expertise',
            priority: 'medium',
            action: 'Publish educational blog content',
            impact: '+12 points',
            effort: '4 hours/week',
            cost: '$200/month'
          }
        ],
        mysteryShops: [],
        chatSessions: 23,
        monthlyScans: 1,
        recent_activity: [
          {
            type: 'scan',
            message: 'Monthly AI visibility scan completed',
            timestamp: '2 hours ago'
          },
          {
            type: 'update',
            message: 'Website schema updated',
            timestamp: '1 day ago'
          },
          {
            type: 'alert',
            message: 'New competitor detected in rankings',
            timestamp: '3 days ago'
          }
        ],
        recommendations: [
          {
            title: 'Optimize for zero-click searches',
            description: 'Focus on featured snippets and direct answers',
            priority: 'high'
          },
          {
            title: 'Improve local SEO signals',
            description: 'Update Google My Business and local citations',
            priority: 'medium'
          }
        ],
        leaderboard: [
          {
            id: 1,
            name: 'Terry Reid Hyundai',
            website: 'terryreidhyundai.com',
            brand: 'Hyundai',
            city: 'Naples',
            state: 'FL',
            visibility_score: visibilityScores.overall,
            total_mentions: aeoResult.mentions || 1247
          },
          {
            id: 2,
            name: 'AutoMax Honda',
            website: 'automaxhonda.com',
            brand: 'Honda',
            city: 'Miami',
            state: 'FL',
            visibility_score: Math.floor(visibilityScores.overall * 0.95),
            total_mentions: Math.floor((aeoResult.mentions || 1247) * 0.9)
          }
        ],
        community: {
          total_posts: 156,
          avg_sentiment: 0.78,
          engagement_rate: 0.65,
          insights: [
            {
              title: 'Positive sentiment trend',
              description: 'Customer satisfaction increased 12% this month',
              type: 'positive',
              confidence: 0.89
            }
          ]
        },
        analytics: {
          platforms: [
            { name: 'ChatGPT', mentions: 45 },
            { name: 'Claude', mentions: 32 },
            { name: 'Perplexity', mentions: 28 }
          ]
        },
        costInfo: costInfo,
        scoringComponents: {
          seo: seoResult.components,
          aeo: aeoResult.components
        }
      };

      setDashboardData(dashboardData);
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
    <div className={`dealership-ai-dashboard ${theme === 'dark' ? 'dark' : ''} ${className}`}>
      {/* Header - conditionally rendered */}
      {showHeader && (
        <div className="dashboard-header">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                DealershipAI Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI Visibility Analytics for {dashboardData?.dealer.name || dealershipName}
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
                { id: 'ai-search', label: 'AI Search Health', icon: Brain },
                { id: 'website', label: 'Website Health', icon: Globe },
                { id: 'schema', label: 'Schema Audit', icon: FileText },
                { id: 'chatgpt', label: 'ChatGPT Analysis', icon: MessageSquare },
                { id: 'reviews', label: 'Reviews Hub', icon: StarIcon },
                { id: 'monthly-scan', label: 'Monthly Scan', icon: Activity },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                { id: 'community', label: 'Community', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
        {activeTab === 'ai-search' && <AISearchTab data={dashboardData} />}
        {activeTab === 'website' && <WebsiteTab data={dashboardData} />}
        {activeTab === 'schema' && <SchemaTab data={dashboardData} />}
        {activeTab === 'chatgpt' && <ChatGPTTab data={dashboardData} />}
        {activeTab === 'reviews' && <ReviewsTab data={dashboardData} />}
        {activeTab === 'monthly-scan' && <MonthlyScanTab data={dashboardData} />}
        {activeTab === 'leaderboard' && showLeaderboard && <LeaderboardTab data={dashboardData} />}
        {activeTab === 'community' && showCommunity && <CommunityTab data={dashboardData} />}
        {activeTab === 'analytics' && showAnalytics && <AnalyticsTab data={dashboardData} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  const scores = data.scores || {};

  return (
    <div className="space-y-6">
      {/* Model Health Tiles */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Model Health Dashboard</h2>
        <ModelHealthTiles />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="AI Visibility Score"
          value={scores.ai_visibility || 0}
          max={100}
          icon={Target}
          color="blue"
          trend={5.2}
        />
        <MetricCard
          title="Zero-Click Score"
          value={scores.zero_click || 0}
          max={100}
          icon={Zap}
          color="green"
          trend={8.1}
        />
        <MetricCard
          title="UGC Health"
          value={scores.ugc_health || 0}
          max={100}
          icon={MessageSquare}
          color="purple"
          trend={3.4}
        />
        <MetricCard
          title="Geo Trust"
          value={scores.geo_trust || 0}
          max={100}
          icon={Globe}
          color="orange"
          trend={2.1}
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

      {/* E-E-A-T Breakdown */}
      {data.eeat && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">E-E-A-T Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.eeat.experience}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.eeat.expertise}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expertise</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.eeat.authoritativeness}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Authoritativeness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.eeat.trustworthiness}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trustworthiness</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity & Recommendations */}
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

// AI Search Tab Component
function AISearchTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Search Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.scores.seo_visibility}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">SEO Visibility</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {data.scores.aeo_visibility}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">AI Engine Optimization</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.scores.geo_visibility}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Geographic Optimization</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Website Tab Component
function WebsiteTab({ data }: { data: DashboardData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Website Health</h3>
        <p className="text-gray-600 dark:text-gray-400">Website health analysis coming soon...</p>
      </div>
    </div>
  );
}

// Schema Tab Component
function SchemaTab({ data }: { data: DashboardData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schema Audit</h3>
        <p className="text-gray-600 dark:text-gray-400">Schema audit functionality coming soon...</p>
      </div>
    </div>
  );
}

// ChatGPT Tab Component
function ChatGPTTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ChatGPT Analysis</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Sessions used: {data.chatSessions || 0} / 100
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((data.chatSessions || 0) / 100) * 100}%` }}
            ></div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">ChatGPT analysis functionality coming soon...</p>
      </div>
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ data }: { data: DashboardData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reviews Hub</h3>
        <p className="text-gray-600 dark:text-gray-400">Reviews hub functionality coming soon...</p>
      </div>
    </div>
  );
}

// Monthly Scan Tab Component
function MonthlyScanTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly AI Visibility Scan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">What is Monthly Scan?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Our monthly scan analyzes your dealership's visibility across 6 AI platforms 
              (ChatGPT, Claude, Perplexity, Gemini, Google SGE, Grok) using 50 top dealer queries.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Scans 50 top dealer queries
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Tracks mentions and rankings
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Analyzes sentiment and citations
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Calculates visibility score
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Current Status</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {data.scores.overall}/100
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Visibility Score</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Based on last scan: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  const leaderboard = data.leaderboard || [];

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
function CommunityTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  const community = data.community || {};

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
function AnalyticsTab({ data }: { data: DashboardData | null }) {
  if (!data) return <div>No data available</div>;

  const analytics = data.analytics || {};

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
function MetricCard({ title, value, max, icon: Icon, color, trend }: {
  title: string;
  value: number;
  max: number;
  icon: any;
  color: string;
  trend: number;
}) {
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
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
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
