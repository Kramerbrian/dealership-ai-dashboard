/**
 * Complete Example Dashboard
 * 
 * Demonstrates integration of all three priority features:
 * - Dynamic Easter Egg Engine
 * - AI Copilot
 * - Competitor Radar
 * 
 * Plus: PredictiveTrendArrow, SkeletonCard, and other polish features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Activity, AlertTriangle, 
  Target, Brain, Sparkles 
} from 'lucide-react';
import { DynamicEasterEggEngine } from '@/app/components/dashboard/DynamicEasterEggEngine';
import { AICopilot } from '@/app/components/dashboard/AICopilot';
import { CompetitorRadar } from '@/app/components/dashboard/CompetitorRadar';
import { PredictiveTrendArrow } from '@/app/components/dashboard/PredictiveTrendArrow';
import { SkeletonCard } from '@/app/components/dashboard/SkeletonCard';
import { AlertBanner, useAlerts } from '@/app/components/dashboard/AlertBanner';

interface DashboardData {
  trustScore: number;
  scoreDelta: number;
  historicalScores: number[];
  pillars: {
    seo: number;
    aeo: number;
    geo: number;
    qai: number;
  };
  competitors: Array<{
    id: string;
    name: string;
    trustScore: number;
    scoreDelta: number;
    distance: number;
    city: string;
    recentActivity?: string;
  }>;
  criticalIssues: number;
  recentActivity: string[];
}

export default function ExampleDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { alerts, addAlert, removeAlert } = useAlerts();

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      const mockData: DashboardData = {
        trustScore: 87,
        scoreDelta: 5,
        historicalScores: [82, 83, 84, 85, 86, 87], // Last 6 days
        pillars: {
          seo: 88,
          aeo: 85,
          geo: 90,
          qai: 82
        },
        competitors: [
          {
            id: '1',
            name: 'Toyota Fort Myers',
            trustScore: 92,
            scoreDelta: 2,
            distance: 12,
            city: 'Fort Myers',
            recentActivity: 'Just improved SEO score by 5 points'
          },
          {
            id: '2',
            name: 'Honda Naples',
            trustScore: 85,
            scoreDelta: -1,
            distance: 5,
            city: 'Naples'
          },
          {
            id: '3',
            name: 'Ford Bonita Springs',
            trustScore: 78,
            scoreDelta: 4,
            distance: 8,
            city: 'Bonita Springs'
          },
          {
            id: '4',
            name: 'Chevrolet Estero',
            trustScore: 74,
            scoreDelta: -2,
            distance: 6,
            city: 'Estero'
          }
        ],
        criticalIssues: 2,
        recentActivity: ['Schema markup updated', 'New review received', 'Competitor alert triggered']
      };

      setDashboardData(mockData);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Show welcome alert on mount
  useEffect(() => {
    if (!loading && dashboardData) {
      addAlert(
        'success',
        'Welcome! Your dashboard is ready with AI-powered insights.',
        undefined,
        5000
      );
    }
  }, [loading, dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const easterEggContext = {
    trustScore: dashboardData.trustScore,
    topIssue: dashboardData.criticalIssues > 0 ? 'Schema markup issues' : undefined,
    competitorName: dashboardData.competitors.find(c => c.trustScore > dashboardData.trustScore)?.name,
    dealershipName: 'Your Dealership',
    currentTime: new Date(),
    recentAction: dashboardData.recentActivity[0]?.includes('Schema') ? 'fixed_schema' : undefined
  };

  const dashboardState = {
    trustScore: dashboardData.trustScore,
    scoreDelta: dashboardData.scoreDelta,
    pillars: dashboardData.pillars,
    competitors: dashboardData.competitors.map(c => ({
      name: c.name,
      score: c.trustScore,
      scoreDelta: c.scoreDelta
    })),
    criticalIssues: dashboardData.criticalIssues,
    recentActivity: dashboardData.recentActivity
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Alert Banners */}
      {alerts.map(alert => (
        <AlertBanner
          key={alert.id}
          type={alert.type}
          message={alert.message}
          action={alert.action}
          autoHide={alert.autoHide}
          onDismiss={() => removeAlert(alert.id)}
        />
      ))}

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              DealershipAI Dashboard
            </h1>
            <p className="text-gray-400">
              AI-powered insights for automotive dealerships
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-400 text-sm font-medium">
                {userTier.toUpperCase()} Plan
              </span>
            </div>
          </div>
        </motion.div>

        {/* Trust Score Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trust Score</h2>
                  <p className="text-sm text-gray-400">Overall AI visibility rating</p>
                </div>
              </div>
              <div className="text-7xl font-bold text-white mb-2">
                {dashboardData.trustScore}
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${
                  dashboardData.scoreDelta >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {dashboardData.scoreDelta >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {dashboardData.scoreDelta > 0 ? '+' : ''}{dashboardData.scoreDelta}
                  </span>
                  <span className="text-gray-400 text-sm">this week</span>
                </div>
                <PredictiveTrendArrow
                  historicalData={dashboardData.historicalScores}
                  currentValue={dashboardData.trustScore}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-2">Critical Issues</div>
              {dashboardData.criticalIssues > 0 ? (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-2xl font-bold">{dashboardData.criticalIssues}</span>
                </div>
              ) : (
                <div className="text-2xl font-bold text-green-400">0</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(dashboardData.pillars).map(([key, value]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + parseInt(key) * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white uppercase">{key}</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{value}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Competitor Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CompetitorRadar
            competitors={dashboardData.competitors}
            yourScore={dashboardData.trustScore}
            yourCity="Naples"
            onCompetitorClick={(competitor) => {
              addAlert(
                'info',
                `Analyzing ${competitor.name}...`,
                {
                  label: 'View Details',
                  onClick: () => console.log('View competitor:', competitor)
                },
                3000
              );
            }}
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-gray-300">{activity}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Components - Bottom Corners */}
      
      {/* AI Copilot - Bottom Left */}
      <AICopilot
        dashboardState={dashboardState}
        userTier={userTier}
      />

      {/* Dynamic Easter Eggs - Bottom Right */}
      <DynamicEasterEggEngine
        context={easterEggContext}
        userTier={userTier}
      />
    </div>
  );
}

