'use client';

import { useState, useEffect } from 'react';
import { Server, Database, Cpu, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  description: string;
  lastChecked: string;
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const res = await fetch('/api/admin/system-health');
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-emerald-200 bg-emerald-50';
      case 'warning': return 'border-amber-200 bg-amber-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  const getMetricIcon = (name: string) => {
    if (name.toLowerCase().includes('server')) return <Server className="w-5 h-5" />;
    if (name.toLowerCase().includes('database')) return <Database className="w-5 h-5" />;
    if (name.toLowerCase().includes('cpu') || name.toLowerCase().includes('memory')) return <Cpu className="w-5 h-5" />;
    return <Server className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">System Health</h3>
        <button
          onClick={fetchSystemHealth}
          className="px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getMetricIcon(metric.name)}
                <h4 className="font-semibold text-slate-900">{metric.name}</h4>
              </div>
              {getStatusIcon(metric.status)}
            </div>
            
            <div className="mb-2">
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              <p className="text-sm text-slate-600">{metric.description}</p>
            </div>
            
            <p className="text-xs text-slate-500">
              Last checked: {new Date(metric.lastChecked).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-900">Overall System Status</h4>
            <p className="text-sm text-slate-600">All systems operational</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
