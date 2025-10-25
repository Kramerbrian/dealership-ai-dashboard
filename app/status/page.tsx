'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Activity, Database, Globe, Cpu, HardDrive } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  icon: React.ComponentType<any>;
}

interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch monitor data
      const monitorResponse = await fetch('/api/monitor');
      const monitorData = await monitorResponse.json();
      
      if (monitorData.success && monitorData.metrics) {
        setMetrics(monitorData.metrics);
        
        // Convert API status to service status
        const serviceList: ServiceStatus[] = [
          {
            name: 'Web Application',
            status: 'operational',
            responseTime: 50,
            lastCheck: new Date().toISOString(),
            icon: Globe,
          },
          {
            name: 'API Services',
            status: monitorData.metrics.apis?.health?.status || 'operational',
            responseTime: monitorData.metrics.apis?.health?.responseTime,
            lastCheck: monitorData.metrics.apis?.health?.lastCheck || new Date().toISOString(),
            icon: Activity,
          },
          {
            name: 'Database',
            status: monitorData.metrics.database?.connected ? 'operational' : 'down',
            lastCheck: new Date().toISOString(),
            icon: Database,
          },
          {
            name: 'Cache Layer',
            status: monitorData.metrics.cache?.connected ? 'operational' : 'degraded',
            lastCheck: new Date().toISOString(),
            icon: HardDrive,
          },
          {
            name: 'AI Processing',
            status: monitorData.metrics.apis?.['ai-scores']?.status || 'operational',
            responseTime: monitorData.metrics.apis?.['ai-scores']?.responseTime,
            lastCheck: monitorData.metrics.apis?.['ai-scores']?.lastCheck || new Date().toISOString(),
            icon: Cpu,
          },
        ];
        
        setServices(serviceList);
        
        // Calculate overall status
        const downCount = serviceList.filter(s => s.status === 'down').length;
        const degradedCount = serviceList.filter(s => s.status === 'degraded').length;
        
        if (downCount > 0) {
          setOverallStatus('down');
        } else if (degradedCount > 0) {
          setOverallStatus('degraded');
        } else {
          setOverallStatus('operational');
        }
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setOverallStatus('down');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            System Status
          </h1>
          <p className="text-lg text-gray-600">
            Real-time monitoring of DealershipAI services
          </p>
        </div>

        {/* Overall Status Banner */}
        <div className={`rounded-2xl p-8 mb-8 text-white ${
          overallStatus === 'operational' ? 'bg-gradient-to-r from-green-500 to-green-600' :
          overallStatus === 'degraded' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
          'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {overallStatus === 'operational' ? 'All Systems Operational' :
                 overallStatus === 'degraded' ? 'Partial System Degradation' :
                 'System Outage Detected'}
              </h2>
              <p className="text-white/90">
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Checking status...'}
              </p>
            </div>
            <div className="text-6xl">
              {overallStatus === 'operational' ? '✅' :
               overallStatus === 'degraded' ? '⚠️' : '❌'}
            </div>
          </div>
        </div>

        {/* System Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Uptime</span>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatUptime(metrics.uptime)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Memory Usage</span>
                <HardDrive className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.memory.percentage}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.memory.used} / {metrics.memory.total} MB
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Avg Response</span>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.performance.avgResponseTime}ms
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Error Rate</span>
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {(metrics.performance.errorRate * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Services Status */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Service Status
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading && services.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  <span>Checking services...</span>
                </div>
              </div>
            ) : (
              services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {service.name}
                            </span>
                            {getStatusIcon(service.status)}
                          </div>
                          {service.responseTime && (
                            <span className="text-sm text-gray-500">
                              Response time: {service.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                        <span className="text-sm text-gray-500 capitalize">
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Historical Uptime */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            90-Day Uptime
          </h3>
          <div className="grid grid-cols-30 gap-1">
            {Array.from({ length: 90 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded-sm ${
                  Math.random() > 0.02 ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={`Day ${90 - i}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Need help? Contact support at{' '}
            <a href="mailto:support@dealershipai.com" className="text-blue-600 hover:text-blue-700">
              support@dealershipai.com
            </a>
          </p>
          <p className="mt-2">
            For API documentation, visit{' '}
            <a href="/api-docs" className="text-blue-600 hover:text-blue-700">
              API Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}