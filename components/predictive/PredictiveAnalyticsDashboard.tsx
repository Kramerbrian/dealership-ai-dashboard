'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Activity,
  BarChart3,
  Calendar,
  Zap,
  Brain,
  ChevronRight,
} from 'lucide-react';
import AdvancedChartWithExport from '../charts/AdvancedChartWithExport';
import { useQuery } from '@tanstack/react-query';

interface ForecastData {
  date: string;
  predicted: number;
  upper: number;
  lower: number;
  actual?: number;
  confidence: number;
}

interface Anomaly {
  id: string;
  date: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface PredictiveMetrics {
  revenue: {
    current: number;
    forecast30d: number;
    forecast90d: number;
    confidence: number;
    trend: number;
  };
  visibility: {
    current: number;
    forecast30d: number;
    forecast90d: number;
    confidence: number;
    trend: number;
  };
  leads: {
    current: number;
    forecast30d: number;
    forecast90d: number;
    confidence: number;
    trend: number;
  };
}

interface PredictiveAnalyticsDashboardProps {
  tenantId?: string;
}

export default function PredictiveAnalyticsDashboard({
  tenantId = 'default',
}: PredictiveAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'visibility' | 'leads'>('revenue');

  // Fetch predictive data
  const { data: predictiveData, isLoading } = useQuery({
    queryKey: ['predictive-analytics', tenantId, timeRange],
    queryFn: async () => {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return generatePredictiveData(timeRange);
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });

  // Generate forecast data
  const forecastData = useMemo(() => {
    if (!predictiveData) return [];
    
    return predictiveData.forecast.map((item: ForecastData) => ({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predicted: item.predicted,
      upper: item.upper,
      lower: item.lower,
      actual: item.actual,
      confidence: item.confidence,
    }));
  }, [predictiveData]);

  // Generate anomaly data
  const anomalyData = useMemo(() => {
    if (!predictiveData) return [];
    return predictiveData.anomalies;
  }, [predictiveData]);

  // Generate metrics
  const metrics = useMemo(() => {
    if (!predictiveData) return null;
    return predictiveData.metrics;
  }, [predictiveData]);

  // Calculate anomaly summary
  const anomalySummary = useMemo(() => {
    if (!anomalyData) return null;
    
    const high = anomalyData.filter((a: Anomaly) => a.severity === 'high').length;
    const medium = anomalyData.filter((a: Anomaly) => a.severity === 'medium').length;
    const low = anomalyData.filter((a: Anomaly) => a.severity === 'low').length;
    
    return { high, medium, low, total: anomalyData.length };
  }, [anomalyData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Predictive Analytics</h1>
            <p className="text-white/60">AI-powered forecasting and anomaly detection</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 glass-card p-2 rounded-lg">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Revenue Forecast"
            current={metrics.revenue.current}
            forecast30d={metrics.revenue.forecast30d}
            forecast90d={metrics.revenue.forecast90d}
            confidence={metrics.revenue.confidence}
            trend={metrics.revenue.trend}
            icon={DollarSign}
            color="green"
            format="currency"
          />
          <MetricCard
            title="Visibility Forecast"
            current={metrics.visibility.current}
            forecast30d={metrics.visibility.forecast30d}
            forecast90d={metrics.visibility.forecast90d}
            confidence={metrics.visibility.confidence}
            trend={metrics.visibility.trend}
            icon={Target}
            color="blue"
            format="percentage"
          />
          <MetricCard
            title="Leads Forecast"
            current={metrics.leads.current}
            forecast30d={metrics.leads.forecast30d}
            forecast90d={metrics.leads.forecast90d}
            confidence={metrics.leads.confidence}
            trend={metrics.leads.trend}
            icon={Activity}
            color="purple"
            format="number"
          />
        </div>
      )}

      {/* Anomaly Summary */}
      {anomalySummary && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Anomaly Detection</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{anomalySummary.high}</div>
                <div className="text-xs text-white/60">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{anomalySummary.medium}</div>
                <div className="text-xs text-white/60">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{anomalySummary.low}</div>
                <div className="text-xs text-white/60">Low</div>
              </div>
            </div>
          </div>

          {/* Anomaly List */}
          <div className="space-y-2">
            {anomalyData.slice(0, 5).map((anomaly: Anomaly) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      anomaly.severity === 'high'
                        ? 'bg-red-400'
                        : anomaly.severity === 'medium'
                        ? 'bg-yellow-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{anomaly.metric}</div>
                    <div className="text-xs text-white/60">{anomaly.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {anomaly.value.toLocaleString()} ({anomaly.deviation > 0 ? '+' : ''}
                    {anomaly.deviation.toFixed(1)}%)
                  </div>
                  <div className="text-xs text-white/60">
                    {new Date(anomaly.date).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast */}
        <AdvancedChartWithExport
          data={forecastData}
          type="area"
          title="Revenue Forecast with Confidence Intervals"
          description={`${timeRange} forecast with 95% confidence bands`}
          height={400}
          dataKeys={['predicted', 'upper', 'lower']}
          xAxisKey="name"
          showLegend={true}
          showBrush={true}
          interactive={true}
          exportFormats={['pdf', 'png', 'csv', 'xlsx']}
          metadata={{
            title: 'Revenue Forecast',
            description: `Predictive revenue forecast for ${timeRange}`,
            author: 'DealershipAI Predictive Analytics',
            date: new Date().toISOString().split('T')[0],
          }}
        />

        {/* Visibility Forecast */}
        <AdvancedChartWithExport
          data={forecastData.map((item: any) => ({
            ...item,
            predicted: item.predicted * 0.1, // Scale for visibility
            upper: item.upper * 0.1,
            lower: item.lower * 0.1,
          }))}
          type="line"
          title="Visibility Forecast"
          description={`${timeRange} AI visibility trend forecast`}
          height={400}
          dataKeys={['predicted', 'upper', 'lower']}
          xAxisKey="name"
          showLegend={true}
          showBrush={true}
          interactive={true}
          exportFormats={['pdf', 'png', 'csv', 'xlsx']}
          metadata={{
            title: 'Visibility Forecast',
            description: `Predictive visibility forecast for ${timeRange}`,
            author: 'DealershipAI Predictive Analytics',
            date: new Date().toISOString().split('T')[0],
          }}
        />
      </div>

      {/* What-If Scenario Planning */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">What-If Scenario Planning</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScenarioCard
            title="Optimistic Scenario"
            description="10% improvement in key metrics"
            impact="+15% Revenue"
            color="green"
          />
          <ScenarioCard
            title="Baseline Scenario"
            description="Current trend continues"
            impact="+5% Revenue"
            color="blue"
          />
          <ScenarioCard
            title="Conservative Scenario"
            description="Market slowdown expected"
            impact="-3% Revenue"
            color="red"
          />
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  current: number;
  forecast30d: number;
  forecast90d: number;
  confidence: number;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple';
  format: 'currency' | 'percentage' | 'number';
}

function MetricCard({
  title,
  current,
  forecast30d,
  forecast90d,
  confidence,
  trend,
  icon: Icon,
  color,
  format,
}: MetricCardProps) {
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const colorClasses = {
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
      </div>

      <h3 className="text-sm font-medium text-white/60 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-white mb-4">{formatValue(current)}</div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">30-day forecast:</span>
          <span className="text-white font-medium">{formatValue(forecast30d)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">90-day forecast:</span>
          <span className="text-white font-medium">{formatValue(forecast90d)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Confidence:</span>
          <span className="text-white font-medium">{confidence.toFixed(0)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// Scenario Card Component
interface ScenarioCardProps {
  title: string;
  description: string;
  impact: string;
  color: 'green' | 'blue' | 'red';
}

function ScenarioCard({ title, description, impact, color }: ScenarioCardProps) {
  const colorClasses = {
    green: 'border-green-500/50 bg-green-500/10',
    blue: 'border-blue-500/50 bg-blue-500/10',
    red: 'border-red-500/50 bg-red-500/10',
  };

  const textColors = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border ${colorClasses[color]}`}
    >
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 mb-4">{description}</p>
      <div className={`text-lg font-bold ${textColors[color]}`}>{impact}</div>
    </motion.div>
  );
}

// Generate mock predictive data
function generatePredictiveData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const now = new Date();
  
  // Generate forecast data
  const forecast: ForecastData[] = [];
  let baseValue = 250000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Simulate growth trend
    baseValue += (Math.random() - 0.3) * 5000; // Slight positive bias
    const predicted = baseValue;
    const confidence = 85 + Math.random() * 10; // 85-95% confidence
    const margin = baseValue * 0.1; // 10% margin
    
    forecast.push({
      date: date.toISOString(),
      predicted,
      upper: predicted + margin,
      lower: predicted - margin,
      actual: i < 7 ? baseValue + (Math.random() - 0.5) * 10000 : undefined, // First 7 days have actual
      confidence,
    });
  }
  
  // Generate anomalies
  const anomalies: Anomaly[] = [];
  const anomalyMetrics = ['Revenue', 'Visibility', 'Leads', 'Conversion Rate'];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    const metric = anomalyMetrics[Math.floor(Math.random() * anomalyMetrics.length)];
    const expected = 100 + Math.random() * 50;
    const deviation = (Math.random() - 0.3) * 30; // -30% to +30% with positive bias
    const value = expected * (1 + deviation / 100);
    
    const severity = Math.abs(deviation) > 20 ? 'high' : Math.abs(deviation) > 10 ? 'medium' : 'low';
    
    anomalies.push({
      id: `anomaly-${i}`,
      date: date.toISOString(),
      metric,
      value,
      expected,
      deviation,
      severity,
      description: `${metric} ${deviation > 0 ? 'spike' : 'drop'} detected`,
    });
  }
  
  // Generate metrics
  const metrics: PredictiveMetrics = {
    revenue: {
      current: 250000,
      forecast30d: 275000,
      forecast90d: 320000,
      confidence: 87.5,
      trend: 12.5,
    },
    visibility: {
      current: 87.3,
      forecast30d: 89.2,
      forecast90d: 92.1,
      confidence: 91.2,
      trend: 5.5,
    },
    leads: {
      current: 250,
      forecast30d: 275,
      forecast90d: 320,
      confidence: 83.7,
      trend: 28.0,
    },
  };
  
  return { forecast, anomalies, metrics };
}

