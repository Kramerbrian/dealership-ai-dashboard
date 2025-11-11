'use client';
import { useState, useEffect } from 'react';
import { CupertinoKPICard, CupertinoMetricCard, CupertinoHeroCard } from './CupertinoWidget';

interface DashboardData {
  vai: number;
  piqr: number;
  hrp: number;
  qaiStar: number;
  revenueAtRisk: number;
  seo: number;
  velocity: number;
  queries: number;
  clicks: number;
  impressions: number;
  ctr: number;
  conversions: number;
}

export default function CupertinoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setTimeout(() => {
        setData({
          vai: 87.3,
          piqr: 1.2,
          hrp: 0.15,
          qaiStar: 92.1,
          revenueAtRisk: 24800,
          seo: 78.5,
          velocity: 0.12,
          queries: 1247,
          clicks: 89,
          impressions: 12400,
          ctr: 0.7,
          conversions: 23
        });
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleWidgetAction = (action: string) => {
    console.log(`Action triggered: ${action}`);
    // Here you would typically trigger a modal, navigation, or API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            DealershipAI Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered insights with Cupertino design
          </p>
        </div>

        {/* Hero Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CupertinoHeroCard
              title="AI Visibility Index"
              value={`${data.vai.toFixed(1)}%`}
              subtitle="Platform-weighted visibility across all AI engines"
              icon="🤖"
              color="blue"
              onTap={() => handleWidgetAction('vai-details')}
            />
            <CupertinoHeroCard
              title="Revenue at Risk"
              value={`$${data.revenueAtRisk.toLocaleString()}`}
              subtitle="Monthly revenue exposure from AI changes"
              icon="💰"
              color="red"
              onTap={() => handleWidgetAction('revenue-analysis')}
            />
            <CupertinoHeroCard
              title="Trust Score"
              value={data.qaiStar.toFixed(1)}
              subtitle="Customer trust and review sentiment"
              icon="⭐"
              color="green"
              onTap={() => handleWidgetAction('trust-metrics')}
            />
          </div>
        </div>

        {/* Performance KPIs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Performance KPIs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CupertinoKPICard
              title="Page Integrity"
              value={`${data.piqr.toFixed(1)}x`}
              trend="up"
              trendValue="+0.3"
              subtitle="Quality rating multiplier"
              color="purple"
              onTap={() => handleWidgetAction('piqr-optimization')}
            />
            <CupertinoKPICard
              title="Hallucination Risk"
              value={`${(data.hrp * 100).toFixed(1)}%`}
              trend="down"
              trendValue="-2.1%"
              subtitle="Content accuracy risk"
              color="orange"
              onTap={() => handleWidgetAction('hrp-reduction')}
            />
            <CupertinoKPICard
              title="SEO Health"
              value={`${data.seo.toFixed(1)}%`}
              trend="up"
              trendValue="+5.2%"
              subtitle="Search optimization score"
              color="green"
              onTap={() => handleWidgetAction('seo-improvement')}
            />
            <CupertinoKPICard
              title="Growth Velocity"
              value={`${(data.velocity * 100).toFixed(1)}%`}
              trend="stable"
              subtitle="Monthly growth momentum"
              color="gray"
              onTap={() => handleWidgetAction('velocity-tracking')}
            />
          </div>
        </div>

        {/* Traffic Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Traffic Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <CupertinoMetricCard
              title="Queries"
              value={data.queries.toLocaleString()}
              icon="🔍"
              color="blue"
              onTap={() => handleWidgetAction('query-analysis')}
            />
            <CupertinoMetricCard
              title="Clicks"
              value={data.clicks.toLocaleString()}
              icon="👆"
              color="green"
              onTap={() => handleWidgetAction('click-tracking')}
            />
            <CupertinoMetricCard
              title="Impressions"
              value={`${(data.impressions / 1000).toFixed(1)}K`}
              icon="👁️"
              color="purple"
              onTap={() => handleWidgetAction('impression-data')}
            />
            <CupertinoMetricCard
              title="CTR"
              value={`${data.ctr.toFixed(1)}%`}
              icon="📊"
              color="orange"
              onTap={() => handleWidgetAction('ctr-optimization')}
            />
            <CupertinoMetricCard
              title="Conversions"
              value={data.conversions.toLocaleString()}
              icon="🎯"
              color="red"
              onTap={() => handleWidgetAction('conversion-tracking')}
            />
            <CupertinoMetricCard
              title="Conversion Rate"
              value={`${((data.conversions / data.clicks) * 100).toFixed(1)}%`}
              icon="📈"
              color="green"
              onTap={() => handleWidgetAction('conversion-analysis')}
            />
          </div>
        </div>

        {/* Action Items */}
        <div className="p-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleWidgetAction('run-audit')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 transition-colors"
            >
              <div className="text-blue-600 font-medium">Run AI Audit</div>
              <div className="text-blue-500 text-sm">Analyze current performance</div>
            </button>
            <button
              onClick={() => handleWidgetAction('optimize-schema')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-200 transition-colors"
            >
              <div className="text-green-600 font-medium">Optimize Schema</div>
              <div className="text-green-500 text-sm">Improve structured data</div>
            </button>
            <button
              onClick={() => handleWidgetAction('generate-report')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-200 transition-colors"
            >
              <div className="text-purple-600 font-medium">Generate Report</div>
              <div className="text-purple-500 text-sm">Export insights</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
