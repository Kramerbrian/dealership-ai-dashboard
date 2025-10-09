'use client';

import { useState } from 'react';
import { User, getDashboardConfig } from '@/lib/rbac';
import { MetricCard } from '@/components/ui/MetricCard';

interface EnterpriseDashboardProps {
  user: User;
  config: ReturnType<typeof getDashboardConfig>;
}

export function EnterpriseDashboard({ user, config }: EnterpriseDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real API calls
  const dashboardData = {
    overallScore: 87,
    aiVisibility: 92,
    aoerScore: 78,
    aivScore: 85,
    totalQueries: 1247,
    conversionRate: 12.3,
    revenueAtRisk: 45000,
    monthlyGrowth: 8.2,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ai-search', label: 'AI Search Health', icon: '🤖' },
    { id: 'aoer', label: 'AOER Analytics', icon: '📈' },
    { id: 'algorithmic-visibility', label: 'Algorithmic Visibility', icon: '🔍' },
    { id: 'website', label: 'Website Health', icon: '🌐' },
    { id: 'reviews', label: 'Reviews Hub', icon: '⭐' },
    { id: 'mystery-shop', label: 'Mystery Shop', icon: '🛍️' },
    { id: 'predictive', label: 'Predictive Analytics', icon: '🔮' },
  ].filter(tab => {
    // Filter tabs based on user permissions and tier
    switch (tab.id) {
      case 'aoer':
        return config.showAOER;
      case 'algorithmic-visibility':
        return config.showAlgorithmicVisibility;
      case 'website':
      case 'reviews':
      case 'mystery-shop':
        return true; // Basic tabs available to all
      case 'predictive':
        return config.showPredictiveAnalytics;
      default:
        return true;
    }
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={dashboardData} user={user} config={config} />;
      default:
        return <OverviewTab data={dashboardData} user={user} config={config} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                DealershipAI Enterprise
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.first_name || user.email}! • {user.tenant?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Tier</div>
                <div className="font-semibold text-gray-900">
                  {user.tenant?.tier === 1 ? 'Test Drive' :
                   user.tenant?.tier === 2 ? 'Intelligence' :
                   user.tenant?.tier === 3 ? 'Boss Mode' : 'Enterprise'}
                </div>
              </div>
              {config.showBilling && (
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
        {renderTabContent()}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data, user, config }: { 
  data: any; 
  user: User; 
  config: ReturnType<typeof getDashboardConfig> 
}) {
  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Overall Score"
          value={`${data.overallScore}/100`}
          trend="+5.2%"
          color="blue"
        />
        <MetricCard
          title="AI Visibility"
          value={`${data.aiVisibility}/100`}
          trend="+8.1%"
          color="green"
        />
        <MetricCard
          title="Total AI Queries"
          value={data.totalQueries.toLocaleString()}
          trend="+12.3%"
          color="purple"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${data.conversionRate}%`}
          trend="+2.1%"
          color="orange"
        />
      </div>

      {/* Advanced Metrics (Tier-based) */}
      {config.showAOER && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="AOER Score"
            value={`${data.aoerScore}/100`}
            trend="+3.4%"
            color="indigo"
          />
          <MetricCard
            title="AIV Score"
            value={`${data.aivScore}/100`}
            trend="+6.7%"
            color="pink"
          />
        </div>
      )}

      {/* Revenue Impact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              ${data.revenueAtRisk.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenue at Risk</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              +{data.monthlyGrowth}%
            </div>
            <div className="text-sm text-gray-600">Monthly Growth</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {user.tenant?.tier === 4 ? 'Unlimited' : 'Limited'}
            </div>
            <div className="text-sm text-gray-600">API Access</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Citations</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">"Best car dealership in [City]"</p>
              <p className="text-sm text-gray-600">Cited by ChatGPT • 2 hours ago</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Positive</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">"Reliable auto service near me"</p>
              <p className="text-sm text-gray-600">Cited by Claude • 4 hours ago</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Neutral</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">"New car financing options"</p>
              <p className="text-sm text-gray-600">Cited by Perplexity • 6 hours ago</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Positive</span>
          </div>
        </div>
      </div>

      {/* Tier-specific features */}
      {user.tenant?.tier && user.tenant.tier > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.tenant.tier === 2 ? 'Intelligence Features' :
             user.tenant.tier === 3 ? 'Boss Mode Features' : 'Enterprise Features'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.showAOER && (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-700">AOER Analytics</span>
              </div>
            )}
            {config.showAlgorithmicVisibility && (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-700">Algorithmic Visibility Index</span>
              </div>
            )}
            {config.showPredictiveAnalytics && (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-700">Predictive Analytics</span>
              </div>
            )}
            {config.showAPI && (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-700">API Access</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
