'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity, 
  Users, 
  Globe, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface SecurityStatus {
  active_threats: number;
  locked_users: number;
  recent_violations: number;
  system_health: 'healthy' | 'warning' | 'critical';
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: 'login' | 'access' | 'violation' | 'threat' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  ip_address: string;
  resource: string;
  action: string;
  details: any;
}

interface SecurityDashboardProps {
  className?: string;
}

export default function SecurityDashboard({ className = '' }: SecurityDashboardProps) {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch security status
      const statusResponse = await fetch('/api/security/check?userId=admin');
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setSecurityStatus(statusData.security_status);
      }

      // Fetch recent security events
      const eventsResponse = await fetch('/api/security/events?limit=10');
      const eventsData = await eventsResponse.json();

      if (eventsData.success) {
        setRecentEvents(eventsData.events);
      }

    } catch (err) {
      console.error('Error fetching security data:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': return <Users className="h-4 w-4" />;
      case 'access': return <Eye className="h-4 w-4" />;
      case 'violation': return <XCircle className="h-4 w-4" />;
      case 'threat': return <AlertTriangle className="h-4 w-4" />;
      case 'admin_action': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Security Error</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(securityStatus?.system_health || 'healthy')}`}>
            {securityStatus?.system_health?.toUpperCase() || 'HEALTHY'}
          </span>
          <button
            onClick={fetchSecurityData}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Activity className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Active Threats */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Threats</p>
              <p className="text-2xl font-bold text-red-600">{securityStatus?.active_threats || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Locked Users */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Locked Users</p>
              <p className="text-2xl font-bold text-orange-600">{securityStatus?.locked_users || 0}</p>
            </div>
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        {/* Recent Violations */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Violations</p>
              <p className="text-2xl font-bold text-yellow-600">{securityStatus?.recent_violations || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
              <p className="text-lg font-bold text-green-600">
                {securityStatus?.system_health === 'healthy' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : securityStatus?.system_health === 'warning' ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No recent security events</p>
            </div>
          ) : (
            recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getEventIcon(event.event_type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {event.user_id} • {event.resource} • {event.action}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Run Security Scan</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Unlock Users</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">View Audit Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
