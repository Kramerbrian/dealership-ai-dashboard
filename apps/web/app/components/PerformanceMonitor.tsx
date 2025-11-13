'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database, Wifi, Cpu, HardDrive } from 'lucide-react';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  cacheHitRate: number;
}

interface PerformanceMonitorProps {
  tenantId: string;
}

export default function PerformanceMonitor({ tenantId }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate real-time performance metrics
      setMetrics(prev => ({
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 20),
        throughput: Math.max(100, prev.throughput + (Math.random() - 0.5) * 50),
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.5),
        cpuUsage: Math.max(10, prev.cpuUsage + (Math.random() - 0.5) * 10),
        memoryUsage: Math.max(20, prev.memoryUsage + (Math.random() - 0.5) * 5),
        diskUsage: Math.max(30, prev.diskUsage + (Math.random() - 0.5) * 2),
        networkLatency: Math.max(10, prev.networkLatency + (Math.random() - 0.5) * 5),
        cacheHitRate: Math.max(80, prev.cacheHitRate + (Math.random() - 0.5) * 5)
      }));

      // Check for performance alerts
      checkPerformanceAlerts();
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const checkPerformanceAlerts = () => {
    const newAlerts = [];
    
    if (metrics.responseTime > 500) {
      newAlerts.push({
        id: Date.now(),
        type: 'warning',
        message: 'High response time detected',
        value: `${metrics.responseTime.toFixed(0)}ms`
      });
    }
    
    if (metrics.errorRate > 5) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'error',
        message: 'Error rate above threshold',
        value: `${metrics.errorRate.toFixed(1)}%`
      });
    }
    
    if (metrics.cpuUsage > 80) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'warning',
        message: 'High CPU usage',
        value: `${metrics.cpuUsage.toFixed(0)}%`
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)]);
    }
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBg = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100';
    if (value <= thresholds.warning) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
            <p className="text-gray-600">Real-time system performance and health metrics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isMonitoring ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? 'Monitoring' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? 'Pause' : 'Start'} Monitoring
          </button>
        </div>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-900 mb-3">Performance Alerts</h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-900">{alert.message}</span>
                </div>
                <span className="text-sm font-bold text-red-700">{alert.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Response Time</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(metrics.responseTime, { good: 200, warning: 500 })}`}>
            {metrics.responseTime.toFixed(0)}ms
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                metrics.responseTime <= 200 ? 'bg-green-500' :
                metrics.responseTime <= 500 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (metrics.responseTime / 1000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Throughput</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(metrics.throughput, { good: 1000, warning: 500 })}`}>
            {metrics.throughput.toFixed(0)} req/s
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (metrics.throughput / 2000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Error Rate</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(metrics.errorRate, { good: 1, warning: 5 })}`}>
            {metrics.errorRate.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                metrics.errorRate <= 1 ? 'bg-green-500' :
                metrics.errorRate <= 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, metrics.errorRate * 10)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Cache Hit Rate</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(100 - metrics.cacheHitRate, { good: 10, warning: 20 })}`}>
            {metrics.cacheHitRate.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.cacheHitRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cpu className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">CPU Usage</h3>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getStatusColor(metrics.cpuUsage, { good: 50, warning: 80 })}`}>
            {metrics.cpuUsage.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                metrics.cpuUsage <= 50 ? 'bg-green-500' :
                metrics.cpuUsage <= 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.cpuUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Memory Usage</h3>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getStatusColor(metrics.memoryUsage, { good: 60, warning: 80 })}`}>
            {metrics.memoryUsage.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                metrics.memoryUsage <= 60 ? 'bg-green-500' :
                metrics.memoryUsage <= 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <HardDrive className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Disk Usage</h3>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getStatusColor(metrics.diskUsage, { good: 70, warning: 85 })}`}>
            {metrics.diskUsage.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                metrics.diskUsage <= 70 ? 'bg-green-500' :
                metrics.diskUsage <= 85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.diskUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Network Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Latency</span>
              <span className={`text-sm font-bold ${getStatusColor(metrics.networkLatency, { good: 50, warning: 100 })}`}>
                {metrics.networkLatency.toFixed(0)}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  metrics.networkLatency <= 50 ? 'bg-green-500' :
                  metrics.networkLatency <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.networkLatency / 200) * 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Bandwidth</span>
              <span className="text-sm font-bold text-green-600">1.2 Gbps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Enable CDN</h4>
              <p className="text-sm text-gray-600">Reduce response time by 30-40% with global content delivery</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Database className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Optimize Database</h4>
              <p className="text-sm text-gray-600">Add indexes to improve query performance by 50%</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Activity className="w-3 h-3 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Implement Caching</h4>
              <p className="text-sm text-gray-600">Increase cache hit rate to 95% for better performance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cpu className="w-3 h-3 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Scale Resources</h4>
              <p className="text-sm text-gray-600">Consider upgrading to handle increased load</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
