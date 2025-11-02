/**
 * Example Dashboard - Complete Integration Example
 * 
 * Demonstrates all priority features working together:
 * - DynamicEasterEggEngine
 * - AICopilot
 * - CompetitorRadar
 * Plus additional polish features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DynamicEasterEggEngine } from '@/app/components/dashboard/DynamicEasterEggEngine';
import { AICopilot } from '@/app/components/dashboard/AICopilot';
import { CompetitorRadar } from '@/app/components/dashboard/CompetitorRadar';
import { SkeletonCard } from '@/app/components/dashboard/SkeletonCard';
import { PredictiveTrendArrow } from '@/app/components/dashboard/PredictiveTrendArrow';
import { AlertBanner, useAlerts } from '@/app/components/dashboard/AlertBanner';
import { AnomalyAlerts } from '@/app/components/dashboard/AnomalyAlerts';
import { AchievementSystem } from '@/app/components/dashboard/AchievementSystem';
import { ViewCustomizer } from '@/app/components/dashboard/ViewCustomizer';
import { soundEngine } from '@/utils/soundEffects';
import { haptics } from '@/utils/haptics';
import { Sparkles, Brain, Target, Settings, Bell, TrendingUp, DollarSign, Shield, Zap } from 'lucide-react';

// Mock data for demonstration
const mockDashboardState = {
  trustScore: 78,
  scoreDelta: 5,
  traffic: 5200,
  aiCitations: 145,
  pillars: {
    seo: 85,
    aeo: 72,
    geo: 90,
    qai: 65,
  },
  competitors: [
    { id: 'comp1', name: 'AutoNation', trustScore: 82, scoreDelta: 3, distance: 5, city: 'Naples', strengths: ['Brand Recognition'], weaknesses: ['Slow Response'] },
    { id: 'comp2', name: 'Germain Toyota', trustScore: 75, scoreDelta: -2, distance: 2, city: 'Naples', strengths: ['Local SEO'], weaknesses: ['Outdated Inventory'] },
    { id: 'comp3', name: 'Honda of Estero', trustScore: 70, scoreDelta: 6, distance: 10, city: 'Estero', strengths: ['Aggressive Pricing'], weaknesses: ['Poor Reviews'] },
    { id: 'comp4', name: 'Toyota of Fort Myers', trustScore: 80, scoreDelta: 1, distance: 15, city: 'Fort Myers', strengths: ['Large Inventory'], weaknesses: ['High Ad Spend'] },
  ],
  criticalIssues: 2,
  recentActivity: ['New negative review', 'Schema markup fixed'],
};

const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  plan: 'PRO' as 'free' | 'pro' | 'enterprise',
  sessionsLimit: 100,
};

const defaultViewConfig = {
  layout: 'grid' as 'grid' | 'list' | 'compact',
  visiblePillars: {
    seo: true,
    aeo: true,
    geo: true,
    qai: true,
  },
  showTrends: true,
  showOCI: true,
  cardSize: 'medium' as 'small' | 'medium' | 'large',
  refreshInterval: 5,
};

export default function ExampleDashboardPage() {
  const [dashboardState, setDashboardState] = useState(mockDashboardState);
  const [user, setUser] = useState(mockUser);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [viewConfig, setViewConfig] = useState(defaultViewConfig);
  const { alerts, addAlert, removeAlert } = useAlerts();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
      addAlert('info', 'Welcome to your personalized dashboard!', undefined, 5000);
    }, 1500);

    // Update current time every second for Easter eggs
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Simulate score changes for predictive trends and Easter eggs (disabled for now to avoid noise)
    // const scoreInterval = setInterval(() => {
    //   setDashboardState(prev => {
    //     const newScore = Math.min(100, Math.max(50, prev.trustScore + Math.floor(Math.random() * 5) - 2));
    //     const newScoreDelta = newScore - prev.trustScore;
    //     if (newScoreDelta > 0) soundEngine.play('score-improve');
    //     if (newScoreDelta < 0) soundEngine.play('score-decline');

    //     return {
    //       ...prev,
    //       trustScore: newScore,
    //       scoreDelta: newScoreDelta,
    //       recentActivity: newScoreDelta > 0 ? ['Trust Score improved!'] : newScoreDelta < 0 ? ['Trust Score declined!'] : prev.recentActivity,
    //     };
    //   });
    // }, 30000); // Every 30 seconds

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
      // clearInterval(scoreInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompetitorClick = (competitor: any) => {
    addAlert('info', `Viewing details for ${competitor.name}`, undefined, 4000);
    haptics.light();
  };

  const handleViewConfigSave = (newConfig: typeof defaultViewConfig) => {
    setViewConfig(newConfig);
    addAlert('success', 'Dashboard layout saved!', undefined, 3000);
    haptics.success();
  };

  // Historical data for anomaly detection
  const historicalData = [
    { trustScore: 70, traffic: 4800, aiCitations: 140, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { trustScore: 72, traffic: 4900, aiCitations: 142, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { trustScore: 75, traffic: 5100, aiCitations: 143, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { trustScore: 73, traffic: 5000, aiCitations: 141, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { trustScore: 76, traffic: 5150, aiCitations: 144, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { trustScore: 77, traffic: 5180, aiCitations: 145, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { trustScore: 78, traffic: 5200, aiCitations: 145, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Loading Dashboard...</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Alert Banners */}
      <div className="fixed top-0 left-0 right-0 z-50 space-y-2">
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
      </div>

      <div className="max-w-7xl mx-auto p-6 pt-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">DealershipAI Dashboard</h1>
            <p className="text-gray-400">Welcome, {user.firstName}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => addAlert('warning', 'This is a test warning!', { label: 'Fix It', onClick: () => console.log('Fixing...') })} 
              className="p-2 rounded-lg hover:bg-gray-800"
            >
              <Bell className="w-5 h-5 text-gray-400" />
            </button>
            <ViewCustomizer defaultConfig={defaultViewConfig} onSave={handleViewConfigSave} />
            <span className="px-3 py-1.5 bg-purple-600 rounded-full text-sm font-semibold">{user.plan}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Trust Score Card */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Overall Trust Score</h2>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-6xl font-extrabold text-purple-400 mb-2">{dashboardState.trustScore}</p>
            <p className="text-gray-400 text-lg">
              Your dealership's AI trustworthiness.
            </p>
            <div className="mt-4">
              <PredictiveTrendArrow
                historicalData={[70, 72, 75, 73, 76, 77, dashboardState.trustScore - dashboardState.scoreDelta, dashboardState.trustScore]}
                currentValue={dashboardState.trustScore}
              />
            </div>
          </div>

          {/* AI Copilot */}
          <div className="lg:col-span-1">
            <AICopilot dashboardState={dashboardState} userTier={user.plan} />
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="mb-6">
          <AnomalyAlerts
            currentData={{
              trustScore: dashboardState.trustScore,
              scoreDelta: dashboardState.scoreDelta,
              traffic: dashboardState.traffic,
              aiCitations: dashboardState.aiCitations,
              competitors: dashboardState.competitors.map(c => ({
                score: c.trustScore,
                scoreDelta: c.scoreDelta
              })),
              pillars: dashboardState.pillars
            }}
            historicalData={historicalData}
            autoRefresh={true}
            refreshInterval={60000}
          />
        </div>

        {/* Competitor Radar */}
        <div className="mb-6">
          <CompetitorRadar
            competitors={dashboardState.competitors}
            yourScore={dashboardState.trustScore}
            yourCity="Naples"
            onCompetitorClick={handleCompetitorClick}
          />
        </div>

        {/* Achievement System */}
        <div className="mb-6">
          <AchievementSystem
            userProgress={{
              trustScore: dashboardState.trustScore,
              criticalIssuesFixed: 3,
              competitorsOvertaken: 2,
              consecutiveDaysImproving: 5
            }}
          />
        </div>

        {/* Example Pillar Cards (conditionally rendered based on viewConfig) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {viewConfig.visiblePillars.seo && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">SEO Pillar</h3>
              <p className="text-4xl font-extrabold text-cyan-400">{dashboardState.pillars.seo}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow historicalData={[80, 82, 81, 84, 85]} currentValue={dashboardState.pillars.seo} />
              )}
            </div>
          )}
          {viewConfig.visiblePillars.aeo && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">AEO Pillar</h3>
              <p className="text-4xl font-extrabold text-purple-400">{dashboardState.pillars.aeo}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow historicalData={[70, 68, 70, 71, 72]} currentValue={dashboardState.pillars.aeo} />
              )}
            </div>
          )}
          {viewConfig.visiblePillars.geo && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">GEO Pillar</h3>
              <p className="text-4xl font-extrabold text-amber-400">{dashboardState.pillars.geo}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow historicalData={[88, 89, 91, 90, 90]} currentValue={dashboardState.pillars.geo} />
              )}
            </div>
          )}
          {viewConfig.visiblePillars.qai && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">QAI Pillar</h3>
              <p className="text-4xl font-extrabold text-green-400">{dashboardState.pillars.qai}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow historicalData={[60, 62, 61, 63, 65]} currentValue={dashboardState.pillars.qai} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Easter Egg Engine */}
      <DynamicEasterEggEngine
        context={{ ...dashboardState, currentTime, dealershipName: 'Your Dealership' }}
        userTier={user.plan}
      />
    </div>
  );
}

