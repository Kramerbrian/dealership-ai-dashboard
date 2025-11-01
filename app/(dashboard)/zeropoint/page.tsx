'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  Globe,
} from 'lucide-react';

export default function ZeroPointPage() {
  const [metrics, setMetrics] = useState({
    aiVisibility: 87.3,
    revenueAtRisk: 45200,
    competitors: 12,
    alerts: 3,
    opportunities: 8,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'score_update',
      message: 'AI Visibility Score updated',
      time: '2 minutes ago',
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'alert',
      message: 'New competitor detected in your market',
      time: '15 minutes ago',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      id: 3,
      type: 'improvement',
      message: 'ChatGPT visibility increased by 5%',
      time: '1 hour ago',
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Zero Point</h1>
        <p className="mt-2 text-gray-600">Your command center for AI visibility intelligence</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="AI Visibility Score"
          value={`${metrics.aiVisibility}%`}
          change={+5.2}
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Revenue at Risk"
          value={`$${metrics.revenueAtRisk.toLocaleString()}`}
          change={-12.3}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          title="Active Competitors"
          value={metrics.competitors}
          change={+2}
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.alerts}
          icon={AlertTriangle}
          color="yellow"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Run Analysis</span>
              </div>
              <Zap className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Check Visibility</span>
              </div>
              <Zap className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">View Competitors</span>
              </div>
              <Zap className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Review Alerts</span>
              </div>
              <Zap className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Opportunities</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Optimize Google Business Profile', impact: 'High', value: '+$12K/mo' },
            { title: 'Improve ChatGPT Citations', impact: 'Medium', value: '+$8K/mo' },
            { title: 'Add Schema Markup', impact: 'High', value: '+$15K/mo' },
            { title: 'Increase Review Volume', impact: 'Medium', value: '+$6K/mo' },
          ].map((opp, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">{opp.impact} Impact</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{opp.title}</h3>
              <p className="text-lg font-bold text-green-600">{opp.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color: 'blue' | 'red' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

