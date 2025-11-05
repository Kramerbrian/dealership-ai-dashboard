'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Target,
  DollarSign,
  Users,
  Globe,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Star,
  Award,
  ChevronRight,
  ChevronDown,
  Brain,
  Maximize2,
  Minimize2,
  MapPin,
  MessageSquare,
  ShoppingCart,
  Car,
  Phone,
  Mail,
  ExternalLink,
  Database,
  Cpu,
  Network,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import InteractiveChart from '../charts/InteractiveChart';
import AdvancedChartWithExport from '../charts/AdvancedChartWithExport';
import { trackSLO } from '@/lib/slo';
import SEOModal from '../modals/SEOModal';
import AEOModal from '../modals/AEOModal';
import GEOModal from '../modals/GEOModal';
import { userManager } from '@/lib/user-management';
import { DrawerGuard } from '@/components/drawer-guard';
import LiveMetricsDashboard from '@/components/DashboardHovercards';

interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  requiresAuth?: boolean;
  premiumFeature?: boolean;
}

interface DashboardMetrics {
  aiVisibility: {
    score: number;
    trend: number;
    breakdown: {
      seo: number;
      aeo: number;
      geo: number;
    };
  };
  revenue: {
    atRisk: number;
    potential: number;
    trend: number;
  };
  performance: {
    loadTime: number;
    uptime: number;
    score: number;
  };
  leads: {
    monthly: number;
    trend: number;
    conversion: number;
  };
}

interface TimeSeriesData {
  name: string;
  value: number;
  timestamp: string;
}

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Fetch function for React Query
async function fetchDashboardData(timeRange: string): Promise<DashboardMetrics> {
  const response = await fetch(`/api/dashboard/overview?timeRange=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const data = await response.json();
  
  // Extract data from response
  const responseData = data.data || data;
  
  // Enhance with fallback data
  return {
    aiVisibility: {
      score: responseData.aiVisibility?.score || 87.3,
      trend: responseData.aiVisibility?.trend || 2.1,
      breakdown: {
        seo: responseData.aiVisibility?.breakdown?.seo || 89.1,
        aeo: responseData.aiVisibility?.breakdown?.aeo || 73.8,
        geo: responseData.aiVisibility?.breakdown?.geo || 65.2
      }
    },
    revenue: {
      atRisk: responseData.revenue?.atRisk || 367000,
      potential: responseData.revenue?.potential || 1250000,
      trend: responseData.revenue?.trend || 5.2
    },
    performance: {
      loadTime: responseData.performance?.loadTime || 1.2,
      uptime: responseData.performance?.uptime || 99.9,
      score: responseData.performance?.score || 92
    },
    leads: {
      monthly: responseData.leads?.monthly || 245,
      trend: responseData.leads?.trend || 12.3,
      conversion: responseData.leads?.conversion || 3.2
    }
  };
}

export default function TabbedDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [openModal, setOpenModal] = useState<'seo' | 'aeo' | 'geo' | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Real-time updates via SSE
  const { events, isConnected: realtimeConnected, latestEvent } = useRealtimeEvents('/api/realtime/events');

  // React Query hook - replaces fetch/useState/useEffect
  const { 
    data: metrics, 
    isLoading: loading,
    error: queryError,
    isRefetching: refreshing,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'overview', selectedTimeRange],
    queryFn: () => fetchDashboardData(selectedTimeRange),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30s if enabled
    retry: 2,
  });

  // Update metrics when real-time events arrive
  useEffect(() => {
    if (latestEvent && latestEvent.type === 'metrics' && latestEvent.data && metrics) {
      // Merge real-time updates into existing metrics
      queryClient.setQueryData(['dashboard', 'overview', selectedTimeRange], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...latestEvent.data,
          // Update timestamp to show it's live
          _lastUpdated: new Date().toISOString(),
        };
      });
    }
  }, [latestEvent, queryClient, selectedTimeRange, metrics]);

  // Track SLO when data is fetched
  useEffect(() => {
    if (metrics) {
      trackSLO('dashboard.overview', 0); // Duration tracked in API
      generateMockAlerts();
    }
  }, [metrics]);

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  // Generate mock alerts
  const generateMockAlerts = () => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'success',
        title: 'AI Visibility Improved',
        message: 'Your AI visibility score increased by 2.1% this week',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Revenue at Risk Alert',
        message: 'Potential revenue loss detected in GEO performance',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'New Competitor Detected',
        message: 'Competitor launched new AI-optimized service page',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true
      }
    ];
    setAlerts(mockAlerts);
  };

  // Generate time series data
  const generateTimeSeriesData = (days: number): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 20) + 80, // Mock data between 80-100
        timestamp: date.toISOString()
      });
    }
    
    return data;
  };

  // Auto-refresh is now handled by React Query refetchInterval
  // No need for manual useEffect/interval

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Get trend color
  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  // Get trend icon
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Live KPI Metrics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Performance Metrics</h2>
          <p className="text-sm text-white/60">Real-time KPI scores with trend indicators</p>
        </div>
        <LiveMetricsDashboard />
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* AI Visibility Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 interactive-element"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(metrics?.aiVisibility.trend || 0)}`}>
              {getTrendIcon(metrics?.aiVisibility.trend || 0)}
              <span className="text-sm font-medium">
                {formatPercentage(metrics?.aiVisibility.trend || 0)}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-white/60 mb-1">AI Visibility Score</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {metrics?.aiVisibility.score.toFixed(1)}%
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.aiVisibility.score || 0}%` }}
            />
          </div>
        </motion.div>

        {/* Revenue at Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 interactive-element"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-400" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(metrics?.revenue.trend || 0)}`}>
              {getTrendIcon(metrics?.revenue.trend || 0)}
              <span className="text-sm font-medium">
                {formatPercentage(metrics?.revenue.trend || 0)}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-white/60 mb-1">Revenue at Risk</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {formatCurrency(metrics?.revenue.atRisk || 0)}
          </div>
          <p className="text-xs text-white/60">Monthly exposure</p>
        </motion.div>

        {/* Monthly Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 interactive-element"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(metrics?.leads.trend || 0)}`}>
              {getTrendIcon(metrics?.leads.trend || 0)}
              <span className="text-sm font-medium">
                {formatPercentage(metrics?.leads.trend || 0)}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-white/60 mb-1">Monthly Leads</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {metrics?.leads.monthly.toLocaleString()}
          </div>
          <p className="text-xs text-white/60">{metrics?.leads.conversion}% conversion rate</p>
        </motion.div>

        {/* Performance Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 interactive-element"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">99.9%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-white/60 mb-1">Performance Score</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {metrics?.performance.score}%
          </div>
          <p className="text-xs text-white/60">{metrics?.performance.loadTime}s load time</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Visibility Trend - Enhanced with Export */}
        <AdvancedChartWithExport
          data={generateTimeSeriesData(30)}
          type="line"
          title="AI Visibility Trend"
          description="30-day performance across all AI platforms"
          height={300}
          color="#3b82f6"
          xAxisKey="name"
          yAxisKey="value"
          showBrush={true}
          interactive={true}
          exportFormats={['pdf', 'png', 'csv', 'xlsx']}
          metadata={{
            title: 'AI Visibility Trend',
            description: '30-day performance tracking',
            author: 'DealershipAI Dashboard',
            date: new Date().toISOString().split('T')[0],
          }}
        />

        {/* Revenue Breakdown - Enhanced with Export */}
        <AdvancedChartWithExport
          data={[
            { name: 'SEO', value: metrics?.aiVisibility.breakdown.seo || 0 },
            { name: 'AEO', value: metrics?.aiVisibility.breakdown.aeo || 0 },
            { name: 'GEO', value: metrics?.aiVisibility.breakdown.geo || 0 }
          ]}
          type="radar"
          title="Visibility Breakdown"
          description="Performance across different search types"
          height={300}
          color="#8b5cf6"
          xAxisKey="name"
          yAxisKey="value"
          interactive={true}
          exportFormats={['pdf', 'png', 'csv', 'xlsx']}
          metadata={{
            title: 'Visibility Breakdown',
            description: 'Performance by search type',
            author: 'DealershipAI Dashboard',
            date: new Date().toISOString().split('T')[0],
          }}
        />
      </div>
    </div>
  );

  // AI Health Tab Component
  const AIHealthTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Platform Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            AI Platform Status
          </h3>
          <div className="space-y-3">
            {[
              { name: 'ChatGPT', status: 'operational', score: 94 },
              { name: 'Gemini', status: 'operational', score: 89 },
              { name: 'Perplexity', status: 'operational', score: 92 },
              { name: 'Claude', status: 'operational', score: 87 }
            ].map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <span className="text-white/80">{platform.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">{platform.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80">Response Time</span>
                <span className="text-white">1.2s</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80">Uptime</span>
                <span className="text-white">99.9%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80">Accuracy</span>
                <span className="text-white">94.2%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            Health Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">All Systems Operational</span>
              </div>
              <p className="text-xs text-white/60">Last checked 2 minutes ago</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Performance Optimized</span>
              </div>
              <p className="text-xs text-white/60">Response times improved by 15%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Website Tab Component
  const WebsiteTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Speed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Page Speed Analysis
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-1">92</div>
                <div className="text-sm text-white/60">Desktop Score</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400 mb-1">78</div>
                <div className="text-sm text-white/60">Mobile Score</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">First Contentful Paint</span>
                <span className="text-white">1.2s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Largest Contentful Paint</span>
                <span className="text-white">2.1s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Cumulative Layout Shift</span>
                <span className="text-white">0.05</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Core Web Vitals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Core Web Vitals
          </h3>
          <div className="space-y-4">
            {[
              { metric: 'LCP', value: '2.1s', status: 'good', color: 'green' },
              { metric: 'FID', value: '45ms', status: 'good', color: 'green' },
              { metric: 'CLS', value: '0.05', status: 'good', color: 'green' }
            ].map((vital) => (
              <div key={vital.metric} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">{vital.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{vital.value}</span>
                  <div className={`w-2 h-2 bg-${vital.color}-400 rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Device Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-orange-400" />
          Device Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { device: 'Desktop', score: 92, color: 'green' },
            { device: 'Mobile', score: 78, color: 'yellow' },
            { device: 'Tablet', score: 85, color: 'blue' }
          ].map((device) => (
            <div key={device.device} className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {device.device === 'Desktop' && <Monitor className="w-6 h-6 text-white/60" />}
                {device.device === 'Mobile' && <Smartphone className="w-6 h-6 text-white/60" />}
                {device.device === 'Tablet' && <Tablet className="w-6 h-6 text-white/60" />}
              </div>
              <div className={`text-2xl font-bold text-${device.color}-400 mb-1`}>{device.score}</div>
              <div className="text-sm text-white/60">{device.device}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Helper to get user tier from subscription
  const getUserTier = (): 1 | 2 | 3 => {
    if (!userSubscription) return 1; // Default to tier 1
    const plan = userSubscription.plan?.toLowerCase() || '';
    if (plan.includes('enterprise') || plan.includes('tier3') || plan === 'hyperdrive') return 3;
    if (plan.includes('pro') || plan.includes('tier2') || plan === 'diy guide') return 2;
    return 1; // tier1, free, ignition, etc.
  };

  // Schema Tab Component
  const SchemaTab = () => {
    const userTier = getUserTier();
    
    return (
      <DrawerGuard tier={userTier} featureId="schema_fix" requiredTier={2}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schema Markup Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Schema Markup Status
              </h3>
              <div className="space-y-3">
                {[
                  { type: 'Organization', status: 'implemented', pages: 12 },
                  { type: 'LocalBusiness', status: 'implemented', pages: 8 },
                  { type: 'Product', status: 'partial', pages: 45 },
                  { type: 'Review', status: 'missing', pages: 0 },
                  { type: 'FAQ', status: 'implemented', pages: 3 }
                ].map((schema) => (
                  <div key={schema.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80">{schema.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">{schema.pages} pages</span>
                      <div className={`w-2 h-2 rounded-full ${
                        schema.status === 'implemented' ? 'bg-green-400' :
                        schema.status === 'partial' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Schema Validation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Schema Validation
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">94%</div>
                  <div className="text-sm text-white/60">Valid Schema</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Valid Pages</span>
                    <span className="text-green-400">68</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Errors</span>
                    <span className="text-red-400">4</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Warnings</span>
                    <span className="text-yellow-400">2</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DrawerGuard>
    );
  };

  // Reviews Tab Component
  const ReviewsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Review Summary
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">4.7</div>
            <div className="text-sm text-white/60 mb-4">Average Rating</div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-white/60 w-4">{rating}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white/60 w-8">
                    {rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Review Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Review Sources
          </h3>
          <div className="space-y-3">
            {[
              { source: 'Google', count: 142, rating: 4.8 },
              { source: 'Facebook', count: 89, rating: 4.6 },
              { source: 'Yelp', count: 67, rating: 4.5 },
              { source: 'DealerRater', count: 45, rating: 4.7 }
            ].map((source) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">{source.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">{source.count} reviews</span>
                  <span className="text-sm text-yellow-400">{source.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            Recent Reviews
          </h3>
          <div className="space-y-3">
            {[
              { name: 'John D.', rating: 5, text: 'Excellent service and great prices!' },
              { name: 'Sarah M.', rating: 5, text: 'Very professional team.' },
              { name: 'Mike R.', rating: 4, text: 'Good experience overall.' }
            ].map((review, index) => (
              <div key={index} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-white">{review.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-white/30'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/60">{review.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Mystery Shop Tab Component
  const MysteryShopTab = () => {
    const userTier = getUserTier();
    
    return (
      <DrawerGuard tier={userTier} featureId="mystery_shop" requiredTier={2}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mystery Shop Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Mystery Shop Results
              </h3>
              <div className="space-y-4">
                {[
                  { metric: 'Response Time', score: 85, target: 90 },
                  { metric: 'Follow-up Quality', score: 92, target: 85 },
                  { metric: 'Information Accuracy', score: 88, target: 90 },
                  { metric: 'Customer Service', score: 94, target: 85 }
                ].map((result) => (
                  <div key={result.metric} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">{result.metric}</span>
                      <span className={`text-sm font-medium ${result.score >= result.target ? 'text-green-400' : 'text-yellow-400'}`}>
                        {result.score}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${result.score >= result.target ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Competitor Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                Competitor Comparison
              </h3>
              <div className="space-y-3">
                {[
                  { competitor: 'Your Dealership', score: 89 },
                  { competitor: 'Competitor A', score: 76 },
                  { competitor: 'Competitor B', score: 82 },
                  { competitor: 'Competitor C', score: 71 }
                ].map((comp) => (
                  <div key={comp.competitor} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80">{comp.competitor}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${comp.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-medium">{comp.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </DrawerGuard>
    );
  };

  // Predictive Tab Component
  const PredictiveTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Revenue Predictions
          </h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">+12.5%</div>
              <div className="text-sm text-white/60">Next Month Growth</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Current Revenue</span>
                <span className="text-white">$367K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Predicted Revenue</span>
                <span className="text-green-400">$413K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Confidence Level</span>
                <span className="text-blue-400">87%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lead Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Lead Predictions
          </h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">+18%</div>
              <div className="text-sm text-white/60">Next Month Leads</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Current Leads</span>
                <span className="text-white">245</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Predicted Leads</span>
                <span className="text-blue-400">289</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Conversion Rate</span>
                <span className="text-green-400">3.4%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // GEO/SGE Tab Component
  const GEOSGETab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GEO Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            GEO Performance
          </h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">65.2%</div>
              <div className="text-sm text-white/60">GEO Visibility Score</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">AI Overviews</span>
                <span className="text-white">23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Featured Snippets</span>
                <span className="text-white">45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Knowledge Panels</span>
                <span className="text-white">8</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SGE Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            SGE Opportunities
          </h3>
          <div className="space-y-3">
            {[
              { keyword: 'best car deals', opportunity: 'high', volume: 12.5 },
              { keyword: 'new car financing', opportunity: 'medium', volume: 8.2 },
              { keyword: 'car service near me', opportunity: 'high', volume: 15.8 },
              { keyword: 'used car inventory', opportunity: 'low', volume: 5.1 }
            ].map((opp) => (
              <div key={opp.keyword} className="p-3 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/80 text-sm">{opp.keyword}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    opp.opportunity === 'high' ? 'bg-green-500/20 text-green-400' :
                    opp.opportunity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {opp.opportunity}
                  </span>
                </div>
                <div className="text-xs text-white/60">{opp.volume}K monthly searches</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Settings Tab Component
  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dashboard Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Dashboard Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Auto Refresh</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Notifications</span>
              <button className="w-12 h-6 rounded-full bg-blue-500">
                <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-400" />
            Data Sources
          </h3>
          <div className="space-y-3">
            {[
              { source: 'Google Search Console', status: 'connected', lastUpdate: '2 min ago' },
              { source: 'Google Analytics', status: 'connected', lastUpdate: '5 min ago' },
              { source: 'PageSpeed Insights', status: 'connected', lastUpdate: '1 hour ago' },
              { source: 'Social Media APIs', status: 'disconnected', lastUpdate: 'Never' }
            ].map((source) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">{source.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">{source.lastUpdate}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    source.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Define tabs
  const tabs: TabData[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      component: <OverviewTab />
    },
    {
      id: 'ai-health',
      label: 'AI Health',
      icon: <Brain className="w-4 h-4" />,
      component: <AIHealthTab />
    },
    {
      id: 'website',
      label: 'Website',
      icon: <Globe className="w-4 h-4" />,
      component: <WebsiteTab />
    },
    {
      id: 'schema',
      label: 'Schema',
      icon: <Database className="w-4 h-4" />,
      component: <SchemaTab />
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star className="w-4 h-4" />,
      component: <ReviewsTab />
    },
    {
      id: 'mystery-shop',
      label: 'Mystery Shop',
      icon: <Eye className="w-4 h-4" />,
      component: <MysteryShopTab />,
      premiumFeature: true
    },
    {
      id: 'predictive',
      label: 'Predictive',
      icon: <TrendingUp className="w-4 h-4" />,
      component: <PredictiveTab />,
      premiumFeature: true
    },
    {
      id: 'geo-sge',
      label: 'GEO/SGE',
      icon: <Zap className="w-4 h-4" />,
      component: <GEOSGETab />,
      premiumFeature: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      component: <SettingsTab />
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6">
                <div className="loading-skeleton h-4 w-3/4 mb-2"></div>
                <div className="loading-skeleton h-8 w-1/2 mb-2"></div>
                <div className="loading-skeleton h-3 w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">DealershipAI Dashboard</h1>
                  {realtimeConnected && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-green-300 font-medium">Live</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/60">AI Visibility Analytics & Optimization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
                }`}
                title={autoRefresh ? 'Auto refresh enabled' : 'Auto refresh disabled'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
              </button>

              {/* Settings */}
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.premiumFeature && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tabs.find(tab => tab.id === activeTab)?.component}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <SEOModal 
        isOpen={openModal === 'seo'} 
        onClose={() => setOpenModal(null)} 
        domain="dealershipai.com"
      />
      <AEOModal 
        isOpen={openModal === 'aeo'} 
        onClose={() => setOpenModal(null)} 
        domain="dealershipai.com"
      />
      <GEOModal 
        isOpen={openModal === 'geo'} 
        onClose={() => setOpenModal(null)} 
        domain="dealershipai.com"
      />
    </div>
  );
}
