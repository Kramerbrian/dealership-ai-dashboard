'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Target, Award, Calendar, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AttributionData {
  subscription_start: string;
  confidence: number;
  attributed: {
    revenue: number;
    monthly_gain: number;
    leads: number;
    conversions: number;
  };
  roi: {
    subscription_cost: number;
    roi_multiple: number;
    payback_period_days: number;
    annual_value: number;
  };
  baseline: {
    leads: number;
    conversions: number;
    revenue: number;
  };
  current: {
    leads: number;
    conversions: number;
    revenue: number;
  };
  breakdown?: Array<{
    strategy: string;
    deployed_date: string;
    accuracy: number;
    expected_impact: number;
    actual_impact: number;
    revenue_attributed: number;
  }>;
}

interface ROIDashboardProps {
  dealershipId: string;
}

export function ROIDashboard({ dealershipId }: ROIDashboardProps) {
  const [attribution, setAttribution] = useState<AttributionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/attribution?dealership=${dealershipId}`)
      .then(r => r.json())
      .then(setAttribution)
      .finally(() => setLoading(false));
  }, [dealershipId]);

  if (loading) {
    return <div className="animate-pulse h-[800px] bg-gray-200 dark:bg-gray-700 rounded-xl" />;
  }

  if (!attribution) return null;

  const daysSubscribed = Math.floor(
    (new Date().getTime() - new Date(attribution.subscription_start).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 
                      dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 
                      dark:border-green-800 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              💰 Your DealershipAI ROI
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Since joining {daysSubscribed} days ago
            </p>
          </div>
          
          <div className={`px-4 py-2 rounded-lg ${getConfidenceBadgeStyle(attribution.confidence)}`}>
            <span className="text-sm font-semibold">
              {attribution.confidence}% Confidence
            </span>
          </div>
        </div>

        {/* Main ROI Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Attributed Revenue
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-6xl font-light text-green-600 dark:text-green-400">
                ${attribution.attributed.revenue.toLocaleString()}
              </div>
              <div className="text-2xl text-gray-500">
                / ${attribution.roi.subscription_cost}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attribution.roi.roi_multiple}x
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Return on Investment
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attribution.roi.payback_period_days} days
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Payback Period
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-green-200 
                          dark:border-green-800">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Monthly Revenue Gain
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${attribution.attributed.monthly_gain.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                ${attribution.roi.annual_value.toLocaleString()}/year
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before vs After */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                      dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            📊 Performance Comparison
          </h3>

          <div className="space-y-6">
            <ComparisonMetric
              label="Leads per Month"
              before={attribution.baseline.leads}
              after={attribution.current.leads}
              attributed={attribution.attributed.leads}
            />
            
            <ComparisonMetric
              label="Conversions"
              before={attribution.baseline.conversions}
              after={attribution.current.conversions}
              attributed={attribution.attributed.conversions}
            />
            
            <ComparisonMetric
              label="Revenue"
              before={attribution.baseline.revenue}
              after={attribution.current.revenue}
              attributed={attribution.attributed.revenue}
              isCurrency
            />
          </div>
        </div>

        {/* Attribution Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                      dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            🎯 Lead Attribution Sources
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'AI Search (ChatGPT, Claude)', value: 40, color: '#10b981' },
                    { name: 'Organic (Brand Search)', value: 35, color: '#3b82f6' },
                    { name: 'AIV Correlation', value: 25, color: '#8b5cf6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'AI Search (ChatGPT, Claude)', value: 40, color: '#10b981' },
                    { name: 'Organic (Brand Search)', value: 35, color: '#3b82f6' },
                    { name: 'AIV Correlation', value: 25, color: '#8b5cf6' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            <LegendItem color="#10b981" label="Direct AI Referrals" percentage="40%" />
            <LegendItem color="#3b82f6" label="Organic Brand Searches" percentage="35%" />
            <LegendItem color="#8b5cf6" label="AIV Improvement Lift" percentage="25%" />
          </div>
        </div>
      </div>

      {/* Strategy Impact Breakdown */}
      {attribution.breakdown && attribution.breakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                      dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            🚀 Strategy Impact Breakdown
          </h3>

          <div className="space-y-4">
            {attribution.breakdown.map((strategy, idx) => (
              <StrategyImpactCard key={idx} strategy={strategy} />
            ))}
          </div>
        </div>
      )}

      {/* Share Success */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 
                      dark:to-purple-900/20 rounded-xl border border-blue-200 
                      dark:border-blue-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📢 Share Your Success Story
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You've achieved a {attribution.roi.roi_multiple}x ROI. Help other dealers discover DealershipAI!
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                             font-medium transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 
                             dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 
                             rounded-lg font-medium transition-colors">
              Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComparisonMetricProps {
  label: string;
  before: number;
  after: number;
  attributed: number;
  isCurrency?: boolean;
}

function ComparisonMetric({ label, before, after, attributed, isCurrency = false }: ComparisonMetricProps) {
  const improvement = ((after - before) / before * 100).toFixed(1);
  const attributionPercent = ((attributed / after) * 100).toFixed(0);

  const format = (val: number) => isCurrency ? `$${val.toLocaleString()}` : val.toLocaleString();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className={`text-sm font-semibold ${
          parseFloat(improvement) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
        }`}>
          {parseFloat(improvement) > 0 && '+'}{improvement}%
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Before</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(before)}
          </div>
        </div>

        <div className="text-gray-400">→</div>

        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">After</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(after)}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-green-600 dark:text-green-400 mb-1">
            Attributed ({attributionPercent}%)
          </div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {format(attributed)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StrategyImpactCardProps {
  strategy: {
    strategy: string;
    deployed_date: string;
    accuracy: number;
    expected_impact: number;
    actual_impact: number;
    revenue_attributed: number;
  };
}

function StrategyImpactCard({ strategy }: StrategyImpactCardProps) {
  const accuracyColor = strategy.accuracy >= 90 ? 'text-green-600' :
                       strategy.accuracy >= 75 ? 'text-yellow-600' :
                       'text-red-600';

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {strategy.strategy}
          </h4>
          <p className="text-xs text-gray-500">
            Deployed {strategy.deployed_date}
          </p>
        </div>
        
        <div className={`text-sm font-semibold ${accuracyColor}`}>
          {strategy.accuracy}% Accurate
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-500 text-xs">Expected Impact</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            +{strategy.expected_impact} AIV
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Actual Impact</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            +{strategy.actual_impact} AIV
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Revenue Attributed</div>
          <div className="font-semibold text-green-600 dark:text-green-400">
            ${strategy.revenue_attributed.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  percentage: string;
}

function LegendItem({ color, label, percentage }: LegendItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {percentage}
      </div>
    </div>
  );
}

function getConfidenceBadgeStyle(confidence: number): string {
  if (confidence >= 90) {
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  } else if (confidence >= 75) {
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  } else {
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
  }
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

