'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Settings, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { RealTimeAnalytics } from './RealTimeAnalytics';
import { TrafficAnalytics } from './TrafficAnalytics';
import { ConversionAnalytics } from './ConversionAnalytics';

interface GoogleAnalyticsDashboardProps {
  propertyId?: string;
  className?: string;
}

export function GoogleAnalyticsDashboard({ 
  propertyId: initialPropertyId, 
  className = '' 
}: GoogleAnalyticsDashboardProps) {
  const [propertyId, setPropertyId] = useState(initialPropertyId || '');
  const [dateRange, setDateRange] = useState('30d');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateConnection = async () => {
    if (!propertyId) return;
    
    setIsValidating(true);
    setConnectionError(null);
    
    try {
      const response = await fetch('/api/analytics/ga4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          action: 'validate'
        })
      });
      
      const result = await response.json();
      
      if ((result as any).success) {
        setIsConnected(true);
        setConnectionError(null);
      } else {
        setIsConnected(false);
        setConnectionError((result as any).message || 'Connection failed');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError('Network error');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      validateConnection();
    }
  }, [propertyId]);

  const handlePropertyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPropertyId(e.target.value);
    setIsConnected(false);
    setConnectionError(null);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const exportData = async () => {
    if (!propertyId) return;
    
    try {
      const response = await fetch(`/api/analytics/ga4?propertyId=${propertyId}&metric=overview&dateRange=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${propertyId}-${dateRange}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[var(--brand-primary)]" />
            Google Analytics Dashboard
          </h2>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isValidating ? (
                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              ) : isConnected ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-white/70">
                {isValidating ? 'Validating...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Export Button */}
            {isConnected && (
              <button
                onClick={exportData}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Property ID Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Google Analytics Property ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={propertyId}
                onChange={handlePropertyIdChange}
                placeholder="Enter your GA4 Property ID (e.g., 123456789)"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={validateConnection}
                disabled={!propertyId || isValidating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Validate
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          {isConnected && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                {[
                  { value: '7d', label: '7 Days' },
                  { value: '30d', label: '30 Days' },
                  { value: '90d', label: '90 Days' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleDateRangeChange(range.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      dateRange === range.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connection Error */}
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {connectionError}
              </div>
            </motion.div>
          )}

          {/* Setup Instructions */}
          {!propertyId && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Setup Instructions</h4>
              <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
                <li>Go to Google Analytics 4 and find your Property ID</li>
                <li>Enable the Google Analytics Data API</li>
                <li>Create a service account and download the credentials</li>
                <li>Add the credentials to your environment variables</li>
                <li>Enter your Property ID above and click Validate</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Components */}
      {isConnected && propertyId && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Real-time Analytics */}
            <RealTimeAnalytics 
              propertyId={propertyId}
              className="lg:col-span-2"
            />

            {/* Traffic Analytics */}
            <TrafficAnalytics 
              propertyId={propertyId}
              dateRange={dateRange}
            />

            {/* Conversion Analytics */}
            <ConversionAnalytics 
              propertyId={propertyId}
              dateRange={dateRange}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Demo Mode */}
      {!isConnected && !propertyId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="lg:col-span-2 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">
              Connect Your Google Analytics
            </h3>
            <p className="text-white/50 mb-6">
              Enter your GA4 Property ID to see real-time analytics data
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Settings className="w-6 h-6 text-white/50" />
                </div>
                <div className="text-xs text-white/50">Setup</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-white/50" />
                </div>
                <div className="text-xs text-white/50">Analytics</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-white/50" />
                </div>
                <div className="text-xs text-white/50">Success</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
