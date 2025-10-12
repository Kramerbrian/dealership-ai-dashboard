/**
 * DealershipAI v2.0 - Main Dashboard Page
 * 
 * Integrates all components with API endpoints
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SessionCounter } from '@/src/components/SessionCounter';
import { EEATScores } from '@/src/components/EEATScores';
import { MysteryShopPanel } from '@/src/components/MysteryShopPanel';
import { TierGate } from '@/src/components/TierGate';
import { Activity, TrendingUp, Shield, Users, Zap, AlertCircle } from 'lucide-react';

interface DashboardData {
  dealership: {
    id: string;
    name: string;
    city: string;
    state: string;
    website?: string;
    phone?: string;
    email?: string;
    lastAnalyzed?: string;
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
  tier: string;
  sessionsUsed: number;
  sessionsLimit: number;
  sessionsResetAt: string;
}

interface SessionUsage {
  analysis: { used: number; limit: number; remaining: number };
  eeat: { used: number; limit: number; remaining: number };
  mystery_shop: { used: number; limit: number; remaining: number };
  api_call: { used: number; limit: number; remaining: number };
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [sessionUsage, setSessionUsage] = useState<SessionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');

  // Mock authentication token (in production, this would come from auth context)
  const authToken = 'mock-jwt-token';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load main dashboard data
      const response = await fetch('/api/analyze?dealerId=demo&dealerName=Demo%20Dealership&city=Los%20Angeles&state=CA', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setCurrentTier(data.tier);

      // Load session usage data
      await loadSessionUsage();

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionUsage = async () => {
    try {
      // Mock session usage data (in production, this would come from a separate API)
      const mockSessionUsage: SessionUsage = {
        analysis: { used: 15, limit: currentTier === 'FREE' ? 0 : currentTier === 'PRO' ? 50 : 200, remaining: 35 },
        eeat: { used: 5, limit: currentTier === 'FREE' ? 0 : currentTier === 'PRO' ? 50 : 200, remaining: 45 },
        mystery_shop: { used: 2, limit: currentTier === 'ENTERPRISE' ? 200 : 0, remaining: currentTier === 'ENTERPRISE' ? 198 : 0 },
        api_call: { used: 25, limit: currentTier === 'FREE' ? 0 : currentTier === 'PRO' ? 50 : 200, remaining: 25 }
      };
      setSessionUsage(mockSessionUsage);
    } catch (err) {
      console.error('Failed to load session usage:', err);
    }
  };

  const handleUpgrade = () => {
    // In production, this would redirect to Stripe checkout
    console.log('Upgrade clicked');
    alert('Upgrade flow would be implemented here');
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      await loadDashboardData();
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleAnalyze}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">DealershipAI Dashboard</h1>
              {dashboardData && (
                <div className="text-sm text-gray-500">
                  {dashboardData.dealership.name} • {dashboardData.dealership.city}, {dashboardData.dealership.state}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {sessionUsage && (
                <SessionCounter
                  plan={currentTier}
                  sessionUsage={sessionUsage}
                  onUpgrade={handleUpgrade}
                />
              )}
              
              <button
                onClick={handleAnalyze}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Analyze</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardData && (
          <>
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">AI Visibility</h3>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dashboardData.scores.aiVisibility}
                </div>
                <div className="text-sm text-gray-500">35% weight</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Zero-Click Shield</h3>
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dashboardData.scores.zeroClick}
                </div>
                <div className="text-sm text-gray-500">20% weight</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">UGC Health</h3>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dashboardData.scores.ugcHealth}
                </div>
                <div className="text-sm text-gray-500">20% weight</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Geo Trust</h3>
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dashboardData.scores.geoTrust}
                </div>
                <div className="text-sm text-gray-500">15% weight</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">SGP Integrity</h3>
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dashboardData.scores.sgpIntegrity}
                </div>
                <div className="text-sm text-gray-500">10% weight</div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Overall Score</h2>
                  <p className="text-gray-600">Your dealership's AI visibility performance</p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold text-gray-900 mb-2">
                    {dashboardData.scores.overall}
                  </div>
                  <div className="text-sm text-gray-500">out of 100</div>
                </div>
              </div>
            </div>

            {/* E-E-A-T Analysis (Pro+ only) */}
            <div className="mb-8">
              <EEATScores
                currentTier={currentTier}
                onUpgrade={handleUpgrade}
                eeatData={dashboardData.eeat}
                loading={false}
              />
            </div>

            {/* Mystery Shop Testing (Enterprise only) */}
            <div className="mb-8">
              <MysteryShopPanel
                currentTier={currentTier}
                onUpgrade={handleUpgrade}
                tests={[]} // Mock data - would come from API
                loading={false}
                onScheduleTest={(testType, scheduledFor, testParameters) => {
                  console.log('Schedule test:', { testType, scheduledFor, testParameters });
                }}
                onExecuteTest={(testId, results) => {
                  console.log('Execute test:', { testId, results });
                }}
              />
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    Improve AI search visibility by optimizing content for AI queries and implementing structured data.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    Implement featured snippets and rich results to protect against zero-click searches.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    Enhance user-generated content quality and encourage more verified reviews.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}