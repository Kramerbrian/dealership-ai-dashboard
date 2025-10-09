/**
 * AlertCenter Component - Profound-inspired
 * Centralized alert management and notification system
 */

import React, { useState } from 'react';

interface Alert {
  id: string;
  type: 'visibility' | 'competitor' | 'mention' | 'sentiment' | 'rank';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  source: string;
  metadata?: Record<string, any>;
}

interface AlertCenterProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  className?: string;
}

export function AlertCenter({
  alerts,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  className = ''
}: AlertCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'action_required'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visibility': return '📉';
      case 'competitor': return '🏆';
      case 'mention': return '🔍';
      case 'sentiment': return '😞';
      case 'rank': return '📊';
      default: return '⚡';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !alert.read) ||
      (filter === 'critical' && alert.severity === 'critical') ||
      (filter === 'action_required' && alert.actionRequired);
    
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    
    return matchesFilter && matchesType;
  });

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical').length;
  const actionRequiredCount = alerts.filter(alert => alert.actionRequired).length;

  return (
    <div className={`bg-white/5 p-6 rounded-lg border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Alert Center</h3>
          <p className="text-gray-400 text-sm">Monitor AI visibility changes and take action</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-white">{alerts.length}</div>
          <div className="text-sm text-gray-400">Total Alerts</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-orange-400">{unreadCount}</div>
          <div className="text-sm text-gray-400">Unread</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-yellow-400">{actionRequiredCount}</div>
          <div className="text-sm text-gray-400">Action Required</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'All Alerts' },
          { value: 'unread', label: 'Unread' },
          { value: 'critical', label: 'Critical' },
          { value: 'action_required', label: 'Action Required' }
        ].map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value as any)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === filterOption.value
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1 bg-white/5 border border-white/20 rounded-full text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="visibility">Visibility</option>
          <option value="competitor">Competitor</option>
          <option value="mention">Mention</option>
          <option value="sentiment">Sentiment</option>
          <option value="rank">Rank</option>
        </select>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎉</div>
            <div>No alerts match your filters</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                alert.read 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium ${alert.read ? 'text-gray-300' : 'text-white'}`}>
                      {alert.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.actionRequired && (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        Action Required
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">{alert.message}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{alert.timestamp}</span>
                    <span>Source: {alert.source}</span>
                    {alert.metadata && (
                      <span>Details: {JSON.stringify(alert.metadata)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!alert.read && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-sm hover:bg-gray-500/30 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
