'use client';

import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface AdvancedChartsProps {
  tenantId: string;
}

export default function AdvancedCharts({ tenantId }: AdvancedChartsProps) {
  const [activeChart, setActiveChart] = useState('ai-visibility');
  const [chartData, setChartData] = useState<Record<string, ChartData>>({});

  useEffect(() => {
    // Simulate chart data
    setChartData({
      'ai-visibility': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'AI Visibility Index',
            data: [65, 72, 78, 82, 87, 89],
            borderColor: 'rgb(59, 130, 246)' as any,
            backgroundColor: 'rgba(59, 130, 246, 0.1)' as any,
            fill: true
          },
          {
            label: 'Industry Average',
            data: [58, 61, 64, 67, 69, 71],
            borderColor: 'rgb(156, 163, 175)' as any,
            backgroundColor: 'rgba(156, 163, 175, 0.1)' as any,
            fill: true
          }
        ]
      },
      'traffic-sources': {
        labels: ['Organic', 'Direct', 'Social', 'Referral', 'Paid'],
        datasets: [
          {
            label: 'Traffic Sources',
            data: [45, 28, 12, 9, 6],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }
        ]
      },
      'competitor-analysis': {
        labels: ['Your Dealership', 'Competitor A', 'Competitor B', 'Competitor C', 'Market Leader'],
        datasets: [
          {
            label: 'AI Visibility Score',
            data: [89, 76, 82, 71, 94],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(156, 163, 175, 0.8)',
              'rgba(156, 163, 175, 0.8)',
              'rgba(156, 163, 175, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }
        ]
      },
      'conversion-funnel': {
        labels: ['Visitors', 'Leads', 'Qualified', 'Prospects', 'Customers'],
        datasets: [
          {
            label: 'Conversion Funnel',
            data: [10000, 2500, 1200, 600, 180],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }
        ]
      }
    });
  }, [tenantId]);

  const charts = [
    { id: 'ai-visibility', name: 'AI Visibility Trends', icon: TrendingUp },
    { id: 'traffic-sources', name: 'Traffic Sources', icon: PieChart },
    { id: 'competitor-analysis', name: 'Competitor Analysis', icon: BarChart3 },
    { id: 'conversion-funnel', name: 'Conversion Funnel', icon: Activity }
  ];

  const renderChart = (chartId: string) => {
    const data = chartData[chartId];
    if (!data) return null;

    switch (chartId) {
      case 'ai-visibility':
        return <LineChart data={data} />;
      case 'traffic-sources':
        return <PieChartComponent data={data} />;
      case 'competitor-analysis':
        return <BarChart data={data} />;
      case 'conversion-funnel':
        return <FunnelChart data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
            <p className="text-gray-600">Interactive charts and data visualizations</p>
          </div>
        </div>
      </div>

      {/* Chart Selector */}
      <div className="flex gap-2 flex-wrap">
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeChart === chart.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <chart.icon className="w-4 h-4" />
            {chart.name}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-96">
          {renderChart(activeChart)}
        </div>
      </div>

      {/* Chart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Key Insight</h3>
          <p className="text-gray-600 text-sm">
            Your AI visibility is 18% above industry average, indicating strong optimization performance.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Trend Analysis</h3>
          <p className="text-gray-600 text-sm">
            Consistent 3.2% monthly growth in AI visibility over the past 6 months.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
          <p className="text-gray-600 text-sm">
            Focus on social media optimization to capture the 12% traffic opportunity.
          </p>
        </div>
      </div>
    </div>
  );
}

// Chart Components
function LineChart({ data }: { data: ChartData }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📈</div>
        <p className="text-gray-600">Line Chart Visualization</p>
        <p className="text-sm text-gray-500 mt-2">
          AI Visibility: 89% (↑ 3.2% from last month)
        </p>
      </div>
    </div>
  );
}

function PieChartComponent({ data }: { data: ChartData }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🥧</div>
        <p className="text-gray-600">Pie Chart Visualization</p>
        <p className="text-sm text-gray-500 mt-2">
          Organic: 45% | Direct: 28% | Social: 12%
        </p>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: ChartData }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-gray-600">Bar Chart Visualization</p>
        <p className="text-sm text-gray-500 mt-2">
          You rank #2 in AI visibility among competitors
        </p>
      </div>
    </div>
  );
}

function FunnelChart({ data }: { data: ChartData }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔻</div>
        <p className="text-gray-600">Funnel Chart Visualization</p>
        <p className="text-sm text-gray-500 mt-2">
          Conversion Rate: 1.8% (Industry avg: 1.2%)
        </p>
      </div>
    </div>
  );
}
