'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Target,
  DollarSign
} from 'lucide-react';

interface AEMDMonitoringDashboardProps {
  tenantId: string;
}

const AEMDMonitoringDashboard: React.FC<AEMDMonitoringDashboardProps> = ({ tenantId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setData({
        aemdScore: 0.75,
        accuracy: 0.92,
        lastUpdated: new Date().toISOString(),
        metrics: [
          { name: 'Featured Snippet Capture', value: 0.68, trend: 'up' },
          { name: 'AI Overview Citations', value: 0.72, trend: 'up' },
          { name: 'PAA Box Ownership', value: 0.58, trend: 'down' },
          { name: 'E-E-A-T Trust Factor', value: 0.85, trend: 'stable' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AEMD Monitoring Dashboard</h2>
            <p className="text-gray-600">Tenant: {tenantId}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {(data.aemdScore * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">AEMD Score</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric: any, index: number) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{metric.name}</h3>
              <div className={`w-2 h-2 rounded-full ${
                metric.trend === 'up' ? 'bg-green-500' :
                metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(metric.value * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 capitalize">{metric.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Accuracy Monitoring */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Monitoring</h3>
        <div className="flex items-center space-x-4">
          <div className="text-4xl font-bold text-green-600">
            {(data.accuracy * 100).toFixed(1)}%
          </div>
          <div>
            <div className="text-sm text-gray-600">Model Accuracy</div>
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Within acceptable range</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AEMDMonitoringDashboard };
