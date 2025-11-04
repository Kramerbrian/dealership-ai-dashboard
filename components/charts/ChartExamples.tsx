'use client';

/**
 * Chart Examples Component
 * Demonstrates usage of AdvancedChartWithExport component
 */

import React from 'react';
import AdvancedChartWithExport from './AdvancedChartWithExport';

// Example data generators
const generateTimeSeriesData = (days: number = 30) => {
  const data = [];
  const now = new Date();
  let baseValue = 85;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    baseValue += (Math.random() - 0.5) * 2; // Small random variation
    baseValue = Math.max(70, Math.min(100, baseValue)); // Clamp between 70-100

    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(baseValue * 10) / 10,
      timestamp: date.toISOString(),
    });
  }

  return data;
};

const generateRevenueData = () => {
  return [
    { name: 'SEO', value: 87.3, target: 85 },
    { name: 'AEO', value: 82.1, target: 80 },
    { name: 'GEO', value: 75.8, target: 75 },
    { name: 'UGC', value: 71.2, target: 70 },
    { name: 'GeoLocal', value: 79.5, target: 78 },
  ];
};

const generateTrafficSourcesData = () => {
  return [
    { name: 'Organic', value: 45 },
    { name: 'Direct', value: 28 },
    { name: 'Social', value: 12 },
    { name: 'Referral', value: 9 },
    { name: 'Paid', value: 6 },
  ];
};

const generateMultiSeriesData = (days: number = 30) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'AI Visibility': 85 + Math.random() * 10,
      'Industry Avg': 70 + Math.random() * 5,
      'Top Performer': 90 + Math.random() * 5,
      timestamp: date.toISOString(),
    });
  }

  return data;
};

export default function ChartExamples() {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Advanced Data Visualization
        </h1>
        <p className="text-white/60">
          Interactive charts with export capabilities (PDF, PNG, CSV, Excel)
        </p>
      </div>

      {/* Example 1: Line Chart with Time Series */}
      <AdvancedChartWithExport
        data={generateTimeSeriesData(30)}
        type="line"
        title="AI Visibility Trend (30 Days)"
        description="Daily AI visibility score across all platforms"
        height={400}
        color="#3b82f6"
        xAxisKey="name"
        yAxisKey="value"
        showBrush={true}
        interactive={true}
        exportFormats={['pdf', 'png', 'csv', 'xlsx']}
        metadata={{
          title: 'AI Visibility Trend',
          description: '30-day performance tracking',
          author: 'DealershipAI',
          date: new Date().toISOString().split('T')[0],
          dataSource: 'DealershipAI Analytics',
        }}
      />

      {/* Example 2: Multi-Series Line Chart */}
      <AdvancedChartWithExport
        data={generateMultiSeriesData(30)}
        type="line"
        title="Competitive Analysis"
        description="Your performance vs industry average and top performers"
        height={400}
        dataKeys={['AI Visibility', 'Industry Avg', 'Top Performer']}
        xAxisKey="name"
        showLegend={true}
        showBrush={true}
        interactive={true}
        exportFormats={['pdf', 'png', 'csv', 'xlsx']}
        metadata={{
          title: 'Competitive Analysis',
          description: 'Multi-series comparison',
          author: 'DealershipAI',
          date: new Date().toISOString().split('T')[0],
        }}
      />

      {/* Example 3: Bar Chart */}
      <AdvancedChartWithExport
        data={generateRevenueData()}
        type="bar"
        title="Visibility Breakdown by Channel"
        description="Performance across different search types"
        height={400}
        xAxisKey="name"
        dataKeys={['value', 'target']}
        showLegend={true}
        interactive={true}
        exportFormats={['pdf', 'png', 'csv', 'xlsx']}
        metadata={{
          title: 'Visibility Breakdown',
          description: 'Channel performance metrics',
        }}
      />

      {/* Example 4: Area Chart */}
      <AdvancedChartWithExport
        data={generateTimeSeriesData(90)}
        type="area"
        title="Revenue Trend (90 Days)"
        description="Revenue at risk over the past 90 days"
        height={400}
        color="#10b981"
        xAxisKey="name"
        yAxisKey="value"
        showBrush={true}
        interactive={true}
        exportFormats={['pdf', 'png', 'csv', 'xlsx']}
      />

      {/* Example 5: Pie Chart */}
      <AdvancedChartWithExport
        data={generateTrafficSourcesData()}
        type="pie"
        title="Traffic Sources Distribution"
        description="Percentage breakdown of traffic sources"
        height={400}
        xAxisKey="name"
        yAxisKey="value"
        interactive={true}
        exportFormats={['pdf', 'png', 'csv', 'xlsx']}
      />

      {/* Example 6: Radar Chart */}
      <AdvancedChartWithExport
        data={generateRevenueData()}
        type="radar"
        title="Multi-Dimensional Performance"
        description="Performance across all visibility dimensions"
        height={400}
        xAxisKey="name"
        dataKeys={['value', 'target']}
        showLegend={true}
        interactive={true}
        exportFormats={['pdf', 'png', 'csv', 'xlsx']}
      />
    </div>
  );
}

