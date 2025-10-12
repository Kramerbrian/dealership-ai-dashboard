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
  TrendingUp
} from 'lucide-react';

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

interface BasicSecurityDashboardProps {
  tenantId?: string;
  userRole?: 'super_admin' | 'enterprise_admin' | 'dealership_admin' | 'user';
}

export default function BasicSecurityDashboard({ 
  tenantId, 
  userRole = 'user' 
}: BasicSecurityDashboardProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch security events
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
            Security Events Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor and analyze security events across your organization
          </p>
        </div>
        <div className="flex gap-2">
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
                <p className="text-sm font-medium text-gray-600">Top Event Type</p>
                <p className="text-2xl font-bold">{metrics.topEventTypes[0]?.type || 'N/A'}</p>
                <p className="text-xs text-gray-500">{metrics.topEventTypes[0]?.count || 0} occurrences</p>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
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
          <p className="text-sm text-gray-600">{events.length} events found</p>
        </div>
        
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events found for the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
    </div>
  );
}
