"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

// Types
interface Cohort {
  month: string;
  users: number;
  retention: number[]; // Month 0, 1, 2, 3...
  revenue: number[];
  ltv: number;
  churnRate: number;
}

interface FunnelStage {
  name: string;
  value: number;
  color: string;
  conversionRate: number;
  dropoffRate: number;
}

interface CohortMetrics {
  averageLTV: number;
  averageRetention: number;
  churnRate: number;
  revenueGrowth: number;
  topCohort: string;
}

const CohortAnalysis = () => {
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'retention' | 'revenue' | 'ltv'>('retention');

  // Mock cohort data
  const cohorts: Cohort[] = [
    {
      month: '2024-01',
      users: 1200,
      retention: [100, 85, 72, 68, 65, 62, 60, 58, 56, 54, 52, 50],
      revenue: [0, 15000, 28000, 42000, 55000, 68000, 80000, 92000, 104000, 116000, 128000, 140000],
      ltv: 116.67,
      churnRate: 0.15
    },
    {
      month: '2024-02',
      users: 1350,
      retention: [100, 88, 75, 70, 67, 64, 62, 60, 58, 56, 54, 52],
      revenue: [0, 18000, 32000, 48000, 63000, 78000, 92000, 106000, 120000, 134000, 148000, 162000],
      ltv: 120.00,
      churnRate: 0.12
    },
    {
      month: '2024-03',
      users: 1100,
      retention: [100, 82, 70, 65, 62, 59, 57, 55, 53, 51, 49, 47],
      revenue: [0, 14000, 26000, 39000, 51000, 63000, 75000, 87000, 99000, 111000, 123000, 135000],
      ltv: 122.73,
      churnRate: 0.18
    },
    {
      month: '2024-04',
      users: 1500,
      retention: [100, 90, 78, 73, 70, 67, 65, 63, 61, 59, 57, 55],
      revenue: [0, 20000, 36000, 54000, 71000, 88000, 105000, 122000, 139000, 156000, 173000, 190000],
      ltv: 126.67,
      churnRate: 0.10
    },
    {
      month: '2024-05',
      users: 1600,
      retention: [100, 92, 80, 75, 72, 69, 67, 65, 63, 61, 59, 57],
      revenue: [0, 22000, 40000, 60000, 79000, 98000, 117000, 136000, 155000, 174000, 193000, 212000],
      ltv: 132.50,
      churnRate: 0.08
    }
  ];

  // Funnel data
  const funnelStages: FunnelStage[] = [
    { name: 'Impressions', value: 45000, color: '#e3f2fd', conversionRate: 100, dropoffRate: 0 },
    { name: 'Clicks', value: 3200, color: '#90caf9', conversionRate: 7.1, dropoffRate: 92.9 },
    { name: 'Website Visits', value: 2800, color: '#42a5f5', conversionRate: 6.2, dropoffRate: 12.5 },
    { name: 'Form Fills', value: 420, color: '#1976d2', conversionRate: 0.9, dropoffRate: 85.0 },
    { name: 'Appointments', value: 180, color: '#0d47a1', conversionRate: 0.4, dropoffRate: 57.1 },
    { name: 'Sales', value: 95, color: '#004d40', conversionRate: 0.2, dropoffRate: 47.2 }
  ];

  // Calculate metrics
  const metrics: CohortMetrics = useMemo(() => {
    const totalLTV = cohorts.reduce((sum, cohort) => sum + cohort.ltv, 0);
    const totalRetention = cohorts.reduce((sum, cohort) => sum + cohort.retention[11], 0);
    const totalChurn = cohorts.reduce((sum, cohort) => sum + cohort.churnRate, 0);
    const totalRevenue = cohorts.reduce((sum, cohort) => sum + cohort.revenue[11], 0);
    const previousRevenue = cohorts.reduce((sum, cohort) => sum + cohort.revenue[10], 0);
    
    return {
      averageLTV: totalLTV / cohorts.length,
      averageRetention: totalRetention / cohorts.length,
      churnRate: totalChurn / cohorts.length,
      revenueGrowth: ((totalRevenue - previousRevenue) / previousRevenue) * 100,
      topCohort: cohorts.reduce((top, cohort) => cohort.ltv > top.ltv ? cohort : top).month
    };
  }, [cohorts]);

  // Prepare retention heatmap data
  const retentionData = cohorts.map(cohort => ({
    month: cohort.month,
    ...cohort.retention.reduce((acc, rate, index) => {
      acc[`month${index}`] = rate;
      return acc;
    }, {} as Record<string, number>)
  }));

  // Prepare revenue data
  const revenueData = cohorts.map(cohort => ({
    month: cohort.month,
    revenue: cohort.revenue[11], // 12-month revenue
    ltv: cohort.ltv,
    users: cohort.users
  }));

  const selectedCohortData = selectedCohort === 'all' 
    ? cohorts 
    : cohorts.filter(c => c.month === selectedCohort);

  const renderRetentionHeatmap = () => {
    const months = ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11'];
    
    return (
      <div className="retention-heatmap">
        <h3>Retention Heatmap</h3>
        <div className="heatmap-container">
          <div className="heatmap-header">
            <div className="cohort-label">Cohort</div>
            {months.map(month => (
              <div key={month} className="month-label">{month}</div>
            ))}
          </div>
          {selectedCohortData.map(cohort => (
            <div key={cohort.month} className="heatmap-row">
              <div className="cohort-name">{cohort.month}</div>
              {cohort.retention.map((rate, index) => (
                <div 
                  key={index}
                  className="heatmap-cell"
                  style={{ 
                    backgroundColor: `rgba(33, 150, 243, ${rate / 100})`,
                    color: rate > 50 ? 'white' : 'black'
                  }}
                  title={`${cohort.month} - ${months[index]}: ${rate}%`}
                >
                  {rate}%
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFunnelVisualization = () => {
    return (
      <div className="funnel-visualization">
        <h3>Conversion Funnel</h3>
        <div className="funnel-container">
          {funnelStages.map((stage, index) => (
            <div key={stage.name} className="funnel-stage">
              <div 
                className="funnel-bar"
                style={{ 
                  backgroundColor: stage.color,
                  width: `${(stage.value / funnelStages[0].value) * 100}%`
                }}
              >
                <div className="stage-content">
                  <div className="stage-name">{stage.name}</div>
                  <div className="stage-value">{stage.value.toLocaleString()}</div>
                  <div className="stage-conversion">{stage.conversionRate}%</div>
                </div>
              </div>
              {index < funnelStages.length - 1 && (
                <div className="funnel-arrow">
                  <div className="arrow-line"></div>
                  <div className="arrow-head"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="cohort-analysis">
      <div className="analysis-header">
        <h2>📊 Cohort Analysis & Funnel Visualization</h2>
        <p>Deep insights into customer behavior and conversion patterns</p>
      </div>

      {/* Controls */}
      <div className="analysis-controls">
        <div className="cohort-selector">
          <label>Cohort:</label>
          <select 
            value={selectedCohort} 
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="control-select"
          >
            <option value="all">All Cohorts</option>
            {cohorts.map(cohort => (
              <option key={cohort.month} value={cohort.month}>
                {cohort.month}
              </option>
            ))}
          </select>
        </div>

        <div className="view-selector">
          <label>View:</label>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as any)}
            className="control-select"
          >
            <option value="retention">Retention</option>
            <option value="revenue">Revenue</option>
            <option value="ltv">LTV</option>
          </select>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-value">${metrics.averageLTV.toFixed(0)}</div>
          <div className="metric-label">Average LTV</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.averageRetention.toFixed(1)}%</div>
          <div className="metric-label">12-Month Retention</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{(metrics.churnRate * 100).toFixed(1)}%</div>
          <div className="metric-label">Churn Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.revenueGrowth.toFixed(1)}%</div>
          <div className="metric-label">Revenue Growth</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.topCohort}</div>
          <div className="metric-label">Top Cohort</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Retention Curves</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retentionData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="month0" stroke="#2196F3" strokeWidth={2} name="Month 0" />
              <Line type="monotone" dataKey="month1" stroke="#ff9800" strokeWidth={2} name="Month 1" />
              <Line type="monotone" dataKey="month3" stroke="#4caf50" strokeWidth={2} name="Month 3" />
              <Line type="monotone" dataKey="month6" stroke="#f44336" strokeWidth={2} name="Month 6" />
              <Line type="monotone" dataKey="month11" stroke="#9c27b0" strokeWidth={2} name="Month 11" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Revenue by Cohort</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention Heatmap */}
      {renderRetentionHeatmap()}

      {/* Funnel Visualization */}
      {renderFunnelVisualization()}

      {/* Cohort Details Table */}
      <div className="cohort-details">
        <h3>Cohort Details</h3>
        <div className="details-table">
          <table>
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Users</th>
                <th>LTV</th>
                <th>12M Retention</th>
                <th>Churn Rate</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map(cohort => (
                <tr key={cohort.month}>
                  <td>{cohort.month}</td>
                  <td>{cohort.users.toLocaleString()}</td>
                  <td>${cohort.ltv.toFixed(2)}</td>
                  <td>{cohort.retention[11]}%</td>
                  <td>{(cohort.churnRate * 100).toFixed(1)}%</td>
                  <td>${(cohort.revenue[11] / 1000).toFixed(0)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CohortAnalysis;
