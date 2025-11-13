/**
 * Overview Widget
 * Main dashboard overview with KPIs, trends, and quick actions
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Brain, 
  Shield, 
  AlertTriangle,
  Zap,
  Search,
  Target,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OverviewWidgetProps {
  data: {
    vai: number;
    piqr: number;
    hrp: number;
    qai: number;
    revenueAtRisk: number;
    revenueAtRiskChange: number;
    lastScan: string;
    quickWins: number;
    criticalIssues: number;
  };
  onActionClick?: (action: string) => void;
}

export default function OverviewWidget({ data, onActionClick }: OverviewWidgetProps) {
  const kpis = [
    {
      title: 'VAI Score',
      value: data.vai,
      unit: '%',
      trend: data.vai >= 80 ? 'up' : data.vai >= 60 ? 'neutral' : 'down',
      change: '+2.1%',
      icon: Brain,
      color: 'blue',
      description: 'AI Visibility Index across all platforms',
    },
    {
      title: 'PIQR Score',
      value: data.piqr,
      unit: '%',
      trend: data.piqr >= 80 ? 'up' : data.piqr >= 60 ? 'neutral' : 'down',
      change: '+1.8%',
      icon: Shield,
      color: 'green',
      description: 'Platform Intelligence Quality Rating',
    },
    {
      title: 'HRP Score',
      value: data.hrp,
      unit: '',
      trend: data.hrp <= 0.2 ? 'up' : data.hrp <= 0.4 ? 'neutral' : 'down',
      change: '-0.03',
      icon: AlertTriangle,
      color: 'orange',
      description: 'High-Risk Profile (lower is better)',
    },
    {
      title: 'Revenue at Risk',
      value: data.revenueAtRisk,
      unit: '$',
      trend: data.revenueAtRiskChange < 0 ? 'up' : 'down',
      change: data.revenueAtRiskChange < 0 ? `-$${Math.abs(data.revenueAtRiskChange).toLocaleString()}` : `+$${data.revenueAtRiskChange.toLocaleString()}`,
      icon: DollarSign,
      color: 'red',
      description: 'Monthly revenue opportunity',
    },
  ];

  const quickActions = [
    { id: 'scan', label: 'Run Full Scan', icon: Search, color: 'blue' },
    { id: 'fixes', label: 'View Auto-Fixes', icon: Zap, color: 'green' },
    { id: 'competitors', label: 'Competitor Analysis', icon: Target, color: 'purple' },
    { id: 'recommendations', label: 'Get Recommendations', icon: BarChart3, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${kpi.color}-50`}>
                    <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                  </div>
                  {kpi.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {kpi.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {kpi.unit === '$' 
                      ? `$${kpi.value.toLocaleString()}` 
                      : `${kpi.value}${kpi.unit}`}
                  </p>
                  <p className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {kpi.change}
                  </p>
                </div>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onActionClick?.(action.id)}
                className={`p-4 rounded-lg bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors text-left`}
              >
                <action.icon className={`w-6 h-6 text-${action.color}-600 mb-2`} />
                <p className="font-semibold text-gray-900">{action.label}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quick Wins Available</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickWins}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical Issues</p>
                <p className="text-2xl font-bold text-gray-900">{data.criticalIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Scan</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(data.lastScan).toLocaleDateString()}
                </p>
              </div>
              <Search className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

