'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Minimize2
} from 'lucide-react';
import InteractiveChart from '../charts/InteractiveChart';
import { trackSLO } from '@/lib/slo';
import SEOModal from '../modals/SEOModal';
import AEOModal from '../modals/AEOModal';
import GEOModal from '../modals/GEOModal';

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

export default function EnhancedDealershipDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [openModal, setOpenModal] = useState<'seo' | 'aeo' | 'geo' | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const startTime = Date.now();
      setRefreshing(true);
      setError(null);

      const response = await fetch(`/api/dashboard/overview?timeRange=${selectedTimeRange}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      
      // Enhance with mock real-time data
      const enhancedData: DashboardMetrics = {
        aiVisibility: {
          score: data.aiVisibility?.score || 87.3,
          trend: data.aiVisibility?.trend || 2.1,
          breakdown: {
            seo: data.aiVisibility?.breakdown?.seo || 89.1,
            aeo: data.aiVisibility?.breakdown?.aeo || 73.8,
            geo: data.aiVisibility?.breakdown?.geo || 65.2
          }
        },
        revenue: {
          atRisk: data.revenue?.atRisk || 367000,
          potential: data.revenue?.potential || 1250000,
          trend: data.revenue?.trend || 5.2
        },
        performance: {
          loadTime: data.performance?.loadTime || 1.2,
          uptime: data.performance?.uptime || 99.9,
          score: data.performance?.score || 92
        },
        leads: {
          monthly: data.leads?.monthly || 245,
          trend: data.leads?.trend || 12.3,
          conversion: data.leads?.conversion || 3.2
        }
      };

      setMetrics(enhancedData);
      
      // Track SLO
      const duration = Date.now() - startTime;
      trackSLO('dashboard.overview', duration);

      // Generate mock alerts
      generateMockAlerts();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimeRange]);

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

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, autoRefresh]);

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

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
                <h1 className="text-2xl font-bold text-white">DealershipAI Dashboard</h1>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Visibility Trend */}
          <InteractiveChart
            data={generateTimeSeriesData(30)}
            type="line"
            title="AI Visibility Trend"
            description="30-day performance across all AI platforms"
            height={300}
            color="#3b82f6"
          />

          {/* Revenue Breakdown */}
          <InteractiveChart
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
          />
        </div>

        {/* Visibility Breakdown Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Visibility Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SEO Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenModal('seo')}
              className="glass-card p-6 interactive-element cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Search className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{metrics?.aiVisibility.breakdown.seo.toFixed(1)}%</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-white/60 mb-1">SEO Visibility</h3>
              <div className="text-3xl font-bold text-white mb-2">
                {metrics?.aiVisibility.breakdown.seo.toFixed(1)}%
              </div>
              <p className="text-xs text-white/60">Traditional search optimization</p>
              <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm">
                <span>Click to analyze</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* AEO Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenModal('aeo')}
              className="glass-card p-6 interactive-element cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{metrics?.aiVisibility.breakdown.aeo.toFixed(1)}%</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-white/60 mb-1">AEO Visibility</h3>
              <div className="text-3xl font-bold text-white mb-2">
                {metrics?.aiVisibility.breakdown.aeo.toFixed(1)}%
              </div>
              <p className="text-xs text-white/60">Answer Engine Optimization</p>
              <div className="mt-4 flex items-center gap-2 text-orange-400 text-sm">
                <span>Click to analyze</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* GEO Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenModal('geo')}
              className="glass-card p-6 interactive-element cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{metrics?.aiVisibility.breakdown.geo.toFixed(1)}%</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-white/60 mb-1">GEO Visibility</h3>
              <div className="text-3xl font-bold text-white mb-2">
                {metrics?.aiVisibility.breakdown.geo.toFixed(1)}%
              </div>
              <p className="text-xs text-white/60">Generative Engine Optimization</p>
              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                <span>Click to analyze</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {alerts.filter(a => !a.read).length}
              </span>
            </div>
            <button className="text-sm text-white/60 hover:text-white transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  alert.read ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${
                    alert.type === 'success' ? 'bg-green-500/20' :
                    alert.type === 'warning' ? 'bg-yellow-500/20' :
                    alert.type === 'error' ? 'bg-red-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{alert.title}</h4>
                    <p className="text-sm text-white/60">{alert.message}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
