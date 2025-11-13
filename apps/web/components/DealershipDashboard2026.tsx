'use client';
import { useState, useEffect } from 'react';
import { hasFeature } from '@/lib/featureFlags';
import CompetitiveUGC from './CompetitiveUGC';
import ZeroClickTab from './ZeroClickTab';
import AIHealthPanel from './AIHealthPanel';

interface KPIData {
  vai: number;
  piqr: number;
  hrp: number;
  qaiStar: number;
  revenueAtRisk: number;
  seo: number;
  velocity: number;
}

interface DashboardData {
  kpis: KPIData;
  plan: 'ignition' | 'momentum' | 'hyperdrive';
  role: 'dealer_user' | 'manager' | 'admin' | 'superadmin';
  trialEndsAt?: string;
  used: number;
  limit: number;
}

export default function DealershipDashboard2026() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call to get dashboard data
        const mockData: DashboardData = {
          kpis: {
            vai: 78.5,
            piqr: 1.2,
            hrp: 0.15,
            qaiStar: 82.3,
            revenueAtRisk: 24800,
            seo: 75.2,
            velocity: 0.12
          },
          plan: 'momentum',
          role: 'manager',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          used: 156,
          limit: 400
        };

        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const KPI = ({ title, value, trend, description, onFix }: { 
    title: string; 
    value: string; 
    trend?: 'up' | 'down' | 'stable';
    description: string;
    onFix?: () => void;
  }) => (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      <div className="text-2xl font-mono tabular-nums font-semibold mb-1 text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mb-2">{description}</div>
      {onFix && (
        <button 
          onClick={onFix}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Fix Next Blocker
        </button>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ai-health', label: 'AI Health', icon: '🤖' },
    { id: 'zero-click', label: 'Zero-Click', icon: '🎯' },
    { id: 'competitive', label: 'Competitive', icon: '📈' },
    { id: 'schema', label: 'Schema', icon: '🏗️' },
    { id: 'website', label: 'Website', icon: '🌐' }
  ].filter(tab => {
    if (tab.id === 'ai-health' || tab.id === 'zero-click') return hasFeature(data?.plan || 'ignition', 'ai_health');
    if (tab.id === 'competitive') return hasFeature(data?.plan || 'ignition', 'competitive_ugc');
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500">
            <p>Failed to load dashboard data</p>
          </div>
        </div>
      </div>
    );
  }

  const isTrialExpired = data.trialEndsAt && new Date(data.trialEndsAt) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DealershipAI Dashboard 2026</h1>
              <p className="text-sm text-gray-500">
                {data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} Plan • 
                {data.used}/{data.limit} queries used
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isTrialExpired && (
                <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                  Trial Expired
                </div>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <KPI 
                title="AI Visibility Index (VAI)" 
                value={`${data.kpis.vai.toFixed(1)}%`} 
                trend="up"
                description="Platform-weighted AI visibility"
                onFix={() => console.log('Fix VAI')}
              />
              <KPI 
                title="Page Integrity Quality Rating (PIQR)" 
                value={data.kpis.piqr.toFixed(1)} 
                trend="down"
                description="VDP merchandising risk multiplier"
                onFix={() => console.log('Fix PIQR')}
              />
              <KPI 
                title="Hallucination Risk Penalty (HRP)" 
                value={`${(data.kpis.hrp * 100).toFixed(1)}%`} 
                trend="stable"
                description="Content accuracy risk score"
                onFix={() => console.log('Fix HRP')}
              />
              <KPI 
                title="Quantum Authority Index (QAI*)" 
                value={`${data.kpis.qaiStar.toFixed(1)}%`} 
                trend="up"
                description="Executive composite score"
                onFix={() => console.log('Fix QAI*')}
              />
              <KPI 
                title="Revenue at Risk" 
                value={`$${data.kpis.revenueAtRisk.toLocaleString()}`} 
                trend="down"
                description="Monthly revenue exposure"
                onFix={() => console.log('Fix Revenue Risk')}
              />
              <KPI 
                title="SEO Health" 
                value={`${data.kpis.seo.toFixed(1)}%`} 
                trend="up"
                description="Search engine optimization"
                onFix={() => console.log('Fix SEO')}
              />
            </div>

            {/* Action Queue */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>📋</span>
                Action Queue
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-sm">Inject Vehicle JSON-LD on 24 VDPs</span>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                    Fix Now
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm">Add 40–60 word summary to 8 pages</span>
                  </div>
                  <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">
                    Fix Now
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm">Reply to 12 negative reviews (HRP-safe)</span>
                  </div>
                  <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                    Fix Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-health' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIHealthPanel />
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>📊</span>
                AI Performance Trends
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Weekly Performance</div>
                  <div className="text-2xl font-bold text-blue-900">+5.2%</div>
                  <div className="text-xs text-blue-600">vs last week</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Monthly Performance</div>
                  <div className="text-2xl font-bold text-green-900">+12.8%</div>
                  <div className="text-xs text-green-600">vs last month</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zero-click' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ZeroClickTab />
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span>
                Zero-Click Optimization
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">High-Risk Keywords</div>
                  <div className="text-lg font-bold text-orange-900">23 keywords</div>
                  <div className="text-xs text-orange-600">Need immediate attention</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Opportunity Score</div>
                  <div className="text-lg font-bold text-purple-900">87/100</div>
                  <div className="text-xs text-purple-600">Strong optimization potential</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompetitiveUGC />
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>📈</span>
                Competitive Analysis
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Crisis Level</div>
                  <div className="text-lg font-bold text-red-900">High</div>
                  <div className="text-xs text-red-600">2 platforms need attention</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Response Forecast</div>
                  <div className="text-lg font-bold text-blue-900">+15%</div>
                  <div className="text-xs text-blue-600">Expected improvement</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🏗️</span>
              Schema Auditor
            </h3>
            <div className="text-center text-gray-500 py-8">
              <p>Schema auditing tools coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'website' && (
          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🌐</span>
              Website Health
            </h3>
            <div className="text-center text-gray-500 py-8">
              <p>Website health monitoring tools coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
