/**
 * Real-Time Analytics Component
 * Live dashboard analytics with WebSocket updates
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Users, TrendingUp, DollarSign, Eye, MousePointer, Clock } from 'lucide-react';

interface AnalyticsData {
  visitors: {
    current: number;
    today: number;
    change: number;
  };
  pageViews: {
    current: number;
    today: number;
    change: number;
  };
  conversions: {
    current: number;
    today: number;
    change: number;
  };
  revenue: {
    current: number;
    today: number;
    change: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    bounceRate: number;
  }>;
  realTimeEvents: Array<{
    id: string;
    type: 'page_view' | 'conversion' | 'error';
    timestamp: string;
    data: any;
  }>;
}

export default function RealTimeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeWebSocket();
    fetchInitialData();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const initializeWebSocket = () => {
    try {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/analytics');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setLoading(false);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setData(prevData => {
            if (!prevData) return null;
            
            // Update real-time data
            return {
              ...prevData,
              visitors: { ...prevData.visitors, current: update.visitors || prevData.visitors.current },
              pageViews: { ...prevData.pageViews, current: update.pageViews || prevData.pageViews.current },
              conversions: { ...prevData.conversions, current: update.conversions || prevData.conversions.current },
              revenue: { ...prevData.revenue, current: update.revenue || prevData.revenue.current },
              realTimeEvents: [
                ...(update.event ? [update.event] : []),
                ...prevData.realTimeEvents.slice(0, 9) // Keep last 10 events
              ]
            };
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          initializeWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching initial analytics data:', error);
      // Set mock data for demo purposes
      setData({
        visitors: { current: 42, today: 1247, change: 12.5 },
        pageViews: { current: 156, today: 3892, change: 8.3 },
        conversions: { current: 3, today: 47, change: -2.1 },
        revenue: { current: 1247, today: 28450, change: 15.7 },
        topPages: [
          { path: '/dashboard', views: 892, bounceRate: 23.4 },
          { path: '/calculator', views: 456, bounceRate: 18.7 },
          { path: '/intelligence', views: 234, bounceRate: 31.2 }
        ],
        realTimeEvents: []
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return null;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'conversion': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'error': return <Activity className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{data.visitors.current}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex items-center space-x-1 mt-2">
            {getChangeIcon(data.visitors.change)}
            <span className={`text-sm font-medium ${getChangeColor(data.visitors.change)}`}>
              {data.visitors.change > 0 ? '+' : ''}{data.visitors.change}%
            </span>
            <span className="text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(data.pageViews.current)}</p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex items-center space-x-1 mt-2">
            {getChangeIcon(data.pageViews.change)}
            <span className={`text-sm font-medium ${getChangeColor(data.pageViews.change)}`}>
              {data.pageViews.change > 0 ? '+' : ''}{data.pageViews.change}%
            </span>
            <span className="text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-3xl font-bold text-gray-900">{data.conversions.current}</p>
            </div>
            <MousePointer className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex items-center space-x-1 mt-2">
            {getChangeIcon(data.conversions.change)}
            <span className={`text-sm font-medium ${getChangeColor(data.conversions.change)}`}>
              {data.conversions.change > 0 ? '+' : ''}{data.conversions.change}%
            </span>
            <span className="text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.revenue.current)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex items-center space-x-1 mt-2">
            {getChangeIcon(data.revenue.change)}
            <span className={`text-sm font-medium ${getChangeColor(data.revenue.change)}`}>
              {data.revenue.change > 0 ? '+' : ''}{data.revenue.change}%
            </span>
            <span className="text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Real-Time Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.realTimeEvents.length > 0 ? (
              data.realTimeEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {data.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{page.path}</p>
                  <p className="text-xs text-gray-500">{page.bounceRate}% bounce rate</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(page.views)}</p>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
