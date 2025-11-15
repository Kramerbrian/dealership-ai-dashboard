'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Eye, 
  Shield, 
  Zap, 
  Building,
  Settings,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Crown,
  Star
} from 'lucide-react';
// @ts-ignore
import TierGate from './TierGate';
import VisibilityScores from './VisibilityScores';
import PlatformTracking from './PlatformTracking';
import OpportunitiesEngine from './OpportunitiesEngine';
import EEATScores from './EEATScores';
import MysteryShopPanel from './MysteryShopPanel';
import CompetitiveIntel from './CompetitiveIntel';
import SessionCounter from './SessionCounter';
import TierBadge from './TierBadge';
// @ts-ignore
import UpgradeModal from './UpgradeModal';
import AIVStrip from '@/components/visibility/AIVStrip';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  sessionsLimit: number;
}

interface DashboardData {
  dealership: {
    id: string;
    name: string;
    city: string;
    state: string;
    website: string;
    phone: string;
    email: string;
    lastAnalyzed: string;
  };
  scores: {
    aiVisibility: number;
    zeroClick: number;
    ugcHealth: number;
    geoTrust: number;
    sgpIntegrity: number;
    overall: number;
  };
  eeat?: {
    expertise: number;
    experience: number;
    authoritativeness: number;
    trustworthiness: number;
    overall: number;
  };
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  sessionsUsed: number;
  sessionsLimit: number;
  sessionsResetAt: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-health' | 'eeat' | 'mystery-shop'>('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if ((result as any).authenticated && (result as any).user) {
        setUser((result as any).user);
        await loadDashboardData();
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analyze?dealerId=default&dealerName=Demo Dealership&city=Los Angeles&state=CA', {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if ((result as any).error) {
        if ((result as any).error === 'Session limit reached') {
          setShowUpgradeModal(true);
        }
        setError((result as any).error);
        return;
      }

      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      // Clear auth cookie
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'ai-health', label: 'AI Health', icon: <Eye className="w-4 h-4" /> },
    { 
      id: 'eeat', 
      label: 'E-E-A-T', 
      icon: <Shield className="w-4 h-4" />,
      requiredTier: 'PRO' as const
    },
    { 
      id: 'mystery-shop', 
      label: 'Mystery Shop', 
      icon: <Building className="w-4 h-4" />,
      requiredTier: 'ENTERPRISE' as const
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">DealershipAI</h1>
              </div>
              
              {user && (
                <div className="flex items-center space-x-3">
                  <TierBadge tier={user.plan} />
                  <SessionCounter 
                    used={data?.sessionsUsed || 0}
                    limit={data?.sessionsLimit || 0}
                    resetAt={data?.sessionsResetAt}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* AIV Strip */}
              <AIVStrip domain={undefined} className="hidden md:flex" />
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const hasAccess = !tab.requiredTier || (user && getTierLevel(user.plan) >= getTierLevel(tab.requiredTier));
              
              return (
                <button
                  key={tab.id}
                  onClick={() => hasAccess && setActiveTab(tab.id as any)}
                  disabled={!hasAccess}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : hasAccess
                      ? 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      : 'border-transparent text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.requiredTier && !hasAccess && (
                    <Crown className="w-3 h-3 text-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisibilityScores scores={data?.scores} />
                <PlatformTracking />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OpportunitiesEngine scores={data?.scores} />
                <CompetitiveIntel />
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-health' && (
            <motion.div
              key="ai-health"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisibilityScores scores={data?.scores} />
                <PlatformTracking />
              </div>
            </motion.div>
          )}

          {activeTab === 'eeat' && user && (
            <TierGate
              requiredTier="PRO"
              currentTier={user.plan}
              featureName="E-E-A-T Authority Scores"
            >
              <motion.div
                key="eeat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EEATScores eeat={data?.eeat} />
              </motion.div>
            </TierGate>
          )}

          {activeTab === 'mystery-shop' && user && (
            <TierGate
              requiredTier="ENTERPRISE"
              currentTier={user.plan}
              featureName="Mystery Shop Testing"
            >
              <motion.div
                key="mystery-shop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MysteryShopPanel />
              </motion.div>
            </TierGate>
          )}
        </AnimatePresence>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={user?.plan || 'FREE'}
        requiredTier="PRO"
        featureName="Additional Sessions"
      />
    </div>
  );
}

// Helper function
function getTierLevel(tier: 'FREE' | 'PRO' | 'ENTERPRISE'): number {
  const levels = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
  return levels[tier];
}
