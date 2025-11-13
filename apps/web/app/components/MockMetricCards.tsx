'use client';

import { useState, useEffect } from 'react';

interface MetricCard {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  description: string;
  icon: string;
}

export default function MockMetricCards() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      id: 'qai',
      title: 'QAI Score',
      value: 78.3,
      unit: '%',
      change: 2.1,
      changeType: 'increase',
      description: 'Quality Audit Index',
      icon: '📊'
    },
    {
      id: 'vco',
      title: 'VCO Rating',
      value: 4.2,
      unit: '/5',
      change: 0.3,
      changeType: 'increase',
      description: 'Vehicle Content Optimization',
      icon: '🚗'
    },
    {
      id: 'piqr',
      title: 'PIQR Index',
      value: 85.7,
      unit: '%',
      change: -1.2,
      changeType: 'decrease',
      description: 'Price Integrity & Quality Rating',
      icon: '💰'
    },
    {
      id: 'mystery',
      title: 'Mystery Shop',
      value: 67.0,
      unit: '%',
      change: 5.4,
      changeType: 'increase',
      description: 'Lead Response Rate',
      icon: '🕵️'
    }
  ]);

  // Simulate metric updates based on chat interactions
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        // Random small fluctuations
        const fluctuation = (Math.random() - 0.5) * 0.5;
        const newValue = Math.max(0, Math.min(100, metric.value + fluctuation));
        
        return {
          ...metric,
          value: Math.round(newValue * 10) / 10,
          change: Math.round(fluctuation * 10) / 10,
          changeType: fluctuation > 0 ? 'increase' : fluctuation < 0 ? 'decrease' : 'neutral'
        };
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSymmetryMode = () => {
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.min(100, metric.value + 3.2),
      change: 3.2,
      changeType: 'increase' as const
    })));
  };

  const handleTimeDilation = () => {
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.min(100, metric.value + 4.1),
      change: 4.1,
      changeType: 'increase' as const
    })));
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return '↗️';
      case 'decrease': return '↘️';
      default: return '→';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.id} className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{metric.icon}</span>
              <h3 className="text-sm font-medium text-gray-900">{metric.title}</h3>
            </div>
            <div className={`text-xs font-medium ${getChangeColor(metric.changeType)}`}>
              {getChangeIcon(metric.changeType)} {Math.abs(metric.change).toFixed(1)}
            </div>
          </div>
          
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metric.value}{metric.unit}
          </div>
          
          <div className="text-xs text-gray-500">
            {metric.description}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Last updated</span>
              <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
