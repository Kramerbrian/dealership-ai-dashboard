'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Download,
  RefreshCw,
  Eye,
  Activity,
  TrendingUp,
  Wifi,
  WifiOff,
  Bell,
  BellOff
} from 'lucide-react';
import { useWebSocket } from '@/src/lib/websocket';

interface SecurityEvent {
  id: number;
  event_type: string;
  actor_id: string;
  payload: any;
  occurred_at: string;
  tenant_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  eventsLast24h: number;
  eventsLast7d: number;
  topEventTypes: Array<{ type: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

interface RealTimeSecurityDashboardProps {
  tenantId?: string;
  userRole?: 'super_admin' | 'enterprise_admin' | 'dealership_admin' | 'user';
}

export default function RealTimeSecurityDashboard({ 
  tenantId, 
  userRole = 'user' 
}: RealTimeSecurityDashboardProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newEventsCount, setNewEventsCount] = useState(0);

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket('security_event', (newEvent: SecurityEvent) => {
    setEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
    setNewEventsCount(prev => prev + 1);
    
    // Show notification if enabled and event is high severity
    if (notificationsEnabled && (newEvent.severity === 'high' || newEvent.severity === 'critical')) {
      showNotification(newEvent);
    }
  });

  // Fetch initial security events
  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        tenantId: tenantId || '',
        search: searchTerm
      });

      const response = await fetch(`/api/security/events/mock?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.events || []);
      setMetrics(data.metrics || null);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, [searchTerm, tenantId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const showNotification = (event: SecurityEvent) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Security Alert: ${event.event_type}`, {
        body: `Severity: ${event.severity} - ${event.source}`,
        icon: '/favicon.ico',
        tag: `security-${event.id}`
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  const exportEvents = () => {
    const csvContent = [
      ['ID', 'Event Type', 'Severity', 'Source', 'Actor ID', 'Occurred At', 'IP Address'],
      ...events.map(event => [
        event.id,
        event.event_type,
        event.severity,
        event.source || 'N/A',
        event.actor_id,
        formatTimestamp(event.occurred_at),
        event.ip_address || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearNewEventsCount = () => {
    setNewEventsCount(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Real-Time Security Events Dashboard
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" title="Connected" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" title="Disconnected" />
            )}
          </h2>
          <p className="text-gray-600">
            Monitor security events in real-time with live updates
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2 ${
              notificationsEnabled ? 'bg-green-50 border-green-300' : 'border-gray-300'
            }`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-green-600" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-600" />
            )}
            {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
          </button>
          {newEventsCount > 0 && (
            <button 
              onClick={clearNewEventsCount}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {newEventsCount} New Events
            </button>
          )}
          <button 
            onClick={fetchSecurityEvents} 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button 
            onClick={exportEvents} 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg border ${
        isConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </span>
        </div>
        {!isConnected && (
          <p className="text-sm mt-1">
            Events will still be displayed but won't update automatically. Check your connection.
          </p>
        )}
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Last 24h: {metrics.eventsLast24h}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-500">{metrics.criticalEvents}</p>
                <p className="text-xs text-gray-500">Requires immediate attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-orange-500">{metrics.highSeverityEvents}</p>
                <p className="text-xs text-gray-500">Last 7 days: {metrics.eventsLast7d}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Real-Time Status</p>
                <p className="text-2xl font-bold">{isConnected ? 'Live' : 'Offline'}</p>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Receiving live updates' : 'Manual refresh only'}
                </p>
              </div>
              {isConnected ? (
                <Wifi className="h-8 w-8 text-green-500" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Search Events</h3>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Security Events</h3>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">{events.length} events found</p>
            {isConnected && (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs">Live</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events found for the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    index < newEventsCount ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                      {getSeverityIcon(event.severity)}
                    </div>
                    <div>
                      <div className="font-medium">{event.event_type}</div>
                      <div className="text-sm text-gray-600">
                        {event.source && `${event.source} • `}
                        {formatTimestamp(event.occurred_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    {event.ip_address && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {event.ip_address}
                      </span>
                    )}
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Permission Request */}
      {notificationsEnabled && 'Notification' in window && Notification.permission === 'default' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Enable Browser Notifications</h4>
              <p className="text-sm text-blue-700">
                Get notified when critical security events occur
              </p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Enable
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
