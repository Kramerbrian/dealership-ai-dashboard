'use client';

import { useState, useEffect } from 'react';
import { Tier, canAccessFeature, getTierFeatures } from '@/config/tier-features';
import { eeatCalculator } from '@/core/eeat-calculator';
import { mysteryShop } from '@/integrations/mystery-shop';

interface Dealer {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  brand: string;
  tier: Tier;
  locations: number;
}

interface DashboardData {
  dealer: Dealer;
  scores: {
    seo_visibility: number;
    aeo_visibility: number;
    geo_visibility: number;
    overall: number;
    confidence: number;
  };
  eeat?: {
    experience: number;
    expertise: number;
    authoritativeness: number;
    trustworthiness: number;
    overall: number;
  };
  actionItems?: any[];
  mysteryShops?: any[];
  chatSessions?: number;
  monthlyScans?: number;
}

export function ConsolidatedDashboard({ dealerId }: { dealerId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [dealerId]);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with real API calls
      const mockData: DashboardData = {
        dealer: {
          id: dealerId,
          name: 'Terry Reid Hyundai',
          domain: 'terryreidhyundai.com',
          city: 'Naples',
          state: 'FL',
          brand: 'Hyundai',
          tier: 'pro',
          locations: 1
        },
        scores: {
          seo_visibility: 87,
          aeo_visibility: 92,
          geo_visibility: 78,
          overall: 86,
          confidence: 94
        },
        eeat: {
          experience: 85,
          expertise: 78,
          authoritativeness: 82,
          trustworthiness: 91,
          overall: 84
        },
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
        monthlyScans: 1
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const tierFeatures = getTierFeatures(data.dealer.tier);
  const tabs = getAvailableTabs(data.dealer.tier);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                DealershipAI Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {data.dealer.name} • {data.dealer.city}, {data.dealer.state} • {tierFeatures.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Tier</div>
                <div className="font-semibold text-gray-900">
                  {tierFeatures.name}
                </div>
              </div>
              {data.dealer.tier !== 'free' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Manage Billing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent(activeTab, data, tierFeatures)}
      </div>
    </div>
  );
}

function getAvailableTabs(tier: Tier) {
  const allTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ai-search', label: 'AI Search Health', icon: '🤖' },
    { id: 'website', label: 'Website Health', icon: '🌐' },
    { id: 'schema', label: 'Schema Audit', icon: '🔍' },
    { id: 'chatgpt', label: 'ChatGPT Analysis', icon: '💬' },
    { id: 'reviews', label: 'Reviews Hub', icon: '⭐' },
    { id: 'monthly-scan', label: 'Monthly Scan', icon: '📈' },
    { id: 'mystery-shop', label: 'Mystery Shop', icon: '🛍️' },
    { id: 'predictive', label: 'Predictive Analytics', icon: '🔮' }
  ];

  return allTabs.filter(tab => {
    switch (tab.id) {
      case 'schema':
      case 'chatgpt':
      case 'reviews':
        return canAccessFeature(tier, 'schema_audit') || canAccessFeature(tier, 'chatgpt_analysis') || canAccessFeature(tier, 'reviews_hub');
      case 'mystery-shop':
        return canAccessFeature(tier, 'mystery_shop');
      case 'predictive':
        return canAccessFeature(tier, 'predictive_analytics');
      default:
        return true;
    }
  });
}

function renderTabContent(tabId: string, data: DashboardData, tierFeatures: any) {
  switch (tabId) {
    case 'overview':
      return <OverviewTab data={data} tierFeatures={tierFeatures} />;
    case 'ai-search':
      return <AISearchTab data={data} tierFeatures={tierFeatures} />;
    case 'website':
      return <WebsiteTab data={data} tierFeatures={tierFeatures} />;
    case 'schema':
      return <SchemaTab data={data} tierFeatures={tierFeatures} />;
    case 'chatgpt':
      return <ChatGPTTab data={data} tierFeatures={tierFeatures} />;
    case 'reviews':
      return <ReviewsTab data={data} tierFeatures={tierFeatures} />;
    case 'monthly-scan':
      return <MonthlyScanTab data={data} tierFeatures={tierFeatures} />;
    case 'mystery-shop':
      return <MysteryShopTab data={data} tierFeatures={tierFeatures} />;
    case 'predictive':
      return <PredictiveTab data={data} tierFeatures={tierFeatures} />;
    default:
      return <OverviewTab data={data} tierFeatures={tierFeatures} />;
  }
}

// Tab Components
function OverviewTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Overall Score"
          value={`${data.scores.overall}/100`}
          trend="+5.2%"
          color="blue"
        />
        <MetricCard
          title="AI Visibility"
          value={`${data.scores.aeo_visibility}/100`}
          trend="+8.1%"
          color="green"
        />
        <MetricCard
          title="E-E-A-T Score"
          value={data.eeat ? `${data.eeat.overall}/100` : 'N/A'}
          trend={data.eeat ? '+3.4%' : ''}
          color="purple"
        />
        <MetricCard
          title="Confidence"
          value={`${data.scores.confidence}%`}
          trend="+2.1%"
          color="orange"
        />
      </div>

      {/* E-E-A-T Breakdown */}
      {data.eeat && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">E-E-A-T Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${eeatCalculator.getEEATColor(data.eeat.experience)}`}>
                {data.eeat.experience}
              </div>
              <div className="text-sm text-gray-600">Experience</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${eeatCalculator.getEEATColor(data.eeat.expertise)}`}>
                {data.eeat.expertise}
              </div>
              <div className="text-sm text-gray-600">Expertise</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${eeatCalculator.getEEATColor(data.eeat.authoritativeness)}`}>
                {data.eeat.authoritativeness}
              </div>
              <div className="text-sm text-gray-600">Authoritativeness</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${eeatCalculator.getEEATColor(data.eeat.trustworthiness)}`}>
                {data.eeat.trustworthiness}
              </div>
              <div className="text-sm text-gray-600">Trustworthiness</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      {data.actionItems && data.actionItems.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {data.actionItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-gray-600">{item.category} • {item.impact}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {tierFeatures.name} Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tierFeatures.features.slice(0, 6).map((feature: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700 capitalize">
                {feature.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AISearchTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Search Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.scores.seo_visibility}
            </div>
            <div className="text-sm text-gray-600">SEO Visibility</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {data.scores.aeo_visibility}
            </div>
            <div className="text-sm text-gray-600">AI Engine Optimization</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.scores.geo_visibility}
            </div>
            <div className="text-sm text-gray-600">Geographic Optimization</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebsiteTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Health</h3>
        <p className="text-gray-600">Website health analysis coming soon...</p>
      </div>
    </div>
  );
}

function SchemaTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  if (!canAccessFeature(data.dealer.tier, 'schema_audit')) {
    return <UpgradeRequired feature="Schema Audit" tier={tierFeatures.name} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Audit</h3>
        <p className="text-gray-600">Schema audit functionality coming soon...</p>
      </div>
    </div>
  );
}

function ChatGPTTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  if (!canAccessFeature(data.dealer.tier, 'chatgpt_analysis')) {
    return <UpgradeRequired feature="ChatGPT Analysis" tier={tierFeatures.name} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ChatGPT Analysis</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Sessions used: {data.chatSessions || 0} / {tierFeatures.limits.chat_sessions}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((data.chatSessions || 0) / tierFeatures.limits.chat_sessions) * 100}%` }}
            ></div>
          </div>
        </div>
        <p className="text-gray-600">ChatGPT analysis functionality coming soon...</p>
      </div>
    </div>
  );
}

function ReviewsTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  if (!canAccessFeature(data.dealer.tier, 'reviews_hub')) {
    return <UpgradeRequired feature="Reviews Hub" tier={tierFeatures.name} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews Hub</h3>
        <p className="text-gray-600">Reviews hub functionality coming soon...</p>
      </div>
    </div>
  );
}

function MysteryShopTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  if (!canAccessFeature(data.dealer.tier, 'mystery_shop')) {
    return <UpgradeRequired feature="Mystery Shop" tier={tierFeatures.name} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mystery Shop Automation</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Shops this month: {data.mysteryShops?.length || 0} / {tierFeatures.limits.mystery_shops}
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Deploy New Mystery Shop
        </button>
      </div>
    </div>
  );
}

function PredictiveTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  if (!canAccessFeature(data.dealer.tier, 'predictive_analytics')) {
    return <UpgradeRequired feature="Predictive Analytics" tier={tierFeatures.name} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
        <p className="text-gray-600">Predictive analytics functionality coming soon...</p>
      </div>
    </div>
  );
}

function MonthlyScanTab({ data, tierFeatures }: { data: DashboardData; tierFeatures: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly AI Visibility Scan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">What is Monthly Scan?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Our monthly scan analyzes your dealership's visibility across 6 AI platforms 
              (ChatGPT, Claude, Perplexity, Gemini, Google SGE, Grok) using 50 top dealer queries.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Scans 50 top dealer queries
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Tracks mentions and rankings
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Analyzes sentiment and citations
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Calculates visibility score
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Your Current Status</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {data.scores.overall}/100
              </div>
              <div className="text-sm text-gray-600 mb-2">Visibility Score</div>
              <div className="text-xs text-gray-500">
                Based on last scan: {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4">
              <a 
                href="/monthly-scan"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Full Leaderboard
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-lg font-bold text-blue-600">ChatGPT</div>
            <div className="text-sm text-gray-600">AI Search</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-lg font-bold text-green-600">Claude</div>
            <div className="text-sm text-gray-600">AI Search</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-lg font-bold text-purple-600">Perplexity</div>
            <div className="text-sm text-gray-600">AI Search</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-lg font-bold text-orange-600">Gemini</div>
            <div className="text-sm text-gray-600">AI Search</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-lg font-bold text-red-600">Google SGE</div>
            <div className="text-sm text-gray-600">Search Engine</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-lg font-bold text-indigo-600">Grok</div>
            <div className="text-sm text-gray-600">AI Search</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Scan Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📊</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Competitive Intelligence</h4>
              <p className="text-sm text-gray-600">See how you rank against competitors</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">📈</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Performance Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your AI visibility over time</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">🎯</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Actionable Insights</h4>
              <p className="text-sm text-gray-600">Get specific recommendations to improve</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm">⚡</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Automated Monitoring</h4>
              <p className="text-sm text-gray-600">Runs automatically every month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpgradeRequired({ feature, tier }: { feature: string; tier: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {feature} requires {tier}
      </h3>
      <p className="text-gray-600 mb-4">
        Upgrade your plan to access this feature
      </p>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Upgrade Now
      </button>
    </div>
  );
}

function MetricCard({ title, value, trend, color }: { 
  title: string; 
  value: string; 
  trend: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
            {value}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-green-600">{trend}</p>
        </div>
      </div>
    </div>
  );
}
