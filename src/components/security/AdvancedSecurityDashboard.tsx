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
  Calendar,
  Filter,
  X
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

interface AdvancedFilters {
  search: string;
  severity: string;
  eventType: string;
  source: string;
  dateRange: {
    start: string;
    end: string;
  };
  ipAddress: string;
  actorId: string;
}

interface AdvancedSecurityDashboardProps {
  tenantId?: string;
  userRole?: 'super_admin' | 'enterprise_admin' | 'dealership_admin' | 'user';
}

export default function AdvancedSecurityDashboard({ 
  tenantId, 
  userRole = 'user' 
}: AdvancedSecurityDashboardProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({
    search: '',
    severity: 'all',
    eventType: 'all',
    source: 'all',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      end: new Date().toISOString().split('T')[0] // today
    },
    ipAddress: '',
    actorId: ''
  });

  // Fetch security events
  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        tenantId: tenantId || '',
        ...filters
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
  }, [filters, tenantId]);

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
      ['ID', 'Event Type', 'Severity', 'Source', 'Actor ID', 'IP Address', 'Occurred At', 'User Agent'],
      ...events.map(event => [
        event.id,
        event.event_type,
        event.severity,
        event.source || 'N/A',
        event.actor_id,
        event.ip_address || 'N/A',
        formatTimestamp(event.occurred_at),
        event.user_agent || 'N/A'
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

  const clearFilters = () => {
    setFilters({
      search: '',
      severity: 'all',
      eventType: 'all',
      source: 'all',
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      ipAddress: '',
      actorId: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.severity !== 'all') count++;
    if (filters.eventType !== 'all') count++;
    if (filters.source !== 'all') count++;
    if (filters.ipAddress) count++;
    if (filters.actorId) count++;
    return count;
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
            Advanced Security Events Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor and analyze security events with advanced filtering capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2 ${
              showAdvancedFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
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

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="auth.login">Login</option>
                <option value="auth.logout">Logout</option>
                <option value="api.call">API Call</option>
                <option value="data.access">Data Access</option>
                <option value="security.alert">Security Alert</option>
                <option value="tier.limit_reached">Tier Limit</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="authentication">Authentication</option>
                <option value="api">API</option>
                <option value="data_access">Data Access</option>
                <option value="security_monitor">Security Monitor</option>
                <option value="tier_manager">Tier Manager</option>
              </select>
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
              <input
                type="text"
                placeholder="192.168.1.1"
                value={filters.ipAddress}
                onChange={(e) => setFilters(prev => ({ ...prev, ipAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actor ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actor ID</label>
              <input
                type="text"
                placeholder="user-123"
                value={filters.actorId}
                onChange={(e) => setFilters(prev => ({ ...prev, actorId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      {event.actor_id && (
                        <div className="text-xs text-gray-500">Actor: {event.actor_id}</div>
                      )}
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
