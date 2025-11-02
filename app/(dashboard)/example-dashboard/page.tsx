/**
 * Example Dashboard - Connected to Real Data Sources
 * 
 * Features:
 * - Real API data from /api/example-dashboard/data
 * - AI Copilot insights from /api/ai/copilot-insights
 * - Dynamic Easter Eggs from /api/ai/easter-egg
 * - Auto-refresh every 5 minutes
 */

'use client';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import React, { useState, useEffect, useCallback } from 'react';
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
import { Shield, Bell } from 'lucide-react';
import useSWR from 'swr';
import { Suspense } from 'react';

// Data fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.success ? data.data : data;
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

// Ensure this is only rendered client-side
function ExampleDashboardPageClient() {
  const [user, setUser] = useState({
    id: 'user123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    plan: 'PRO' as 'free' | 'pro' | 'enterprise',
    sessionsLimit: 100,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewConfig, setViewConfig] = useState(defaultViewConfig);
  const { alerts, addAlert, removeAlert } = useAlerts();
  const dealerId = 'demo'; // Can be extracted from auth context

  // Fetch dashboard data from API
  const { data: dashboardState, error: dataError, isLoading, mutate } = useSWR(
    `/api/example-dashboard/data?dealerId=${dealerId}`,
    fetcher,
    {
      refreshInterval: viewConfig.refreshInterval * 60 * 1000, // Convert minutes to ms
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Update current time for Easter eggs
  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Show alerts on data load
  useEffect(() => {
    if (dashboardState && !isLoading) {
      addAlert('info', 'Dashboard data loaded!', undefined, 5000);
    }
    if (dataError) {
      addAlert('warning', 'Failed to load dashboard data. Using cached data.', undefined, 8000);
    }
  }, [dashboardState, isLoading, dataError, addAlert]);

  const handleCompetitorClick = (competitor: any) => {
    addAlert('info', `Viewing details for ${competitor.name}`, undefined, 4000);
    haptics.light();
  };

  const handleViewConfigSave = (newConfig: typeof defaultViewConfig) => {
    setViewConfig(newConfig);
    addAlert('success', 'Dashboard layout saved!', undefined, 3000);
    haptics.success();
    // Update SWR refresh interval
    mutate();
  };

  // Historical data for anomaly detection (would come from API in production)
  const historicalData = dashboardState ? [
    { trustScore: dashboardState.trustScore - 8, traffic: (dashboardState.traffic || 5200) - 400, aiCitations: (dashboardState.aiCitations || 145) - 5, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { trustScore: dashboardState.trustScore - 6, traffic: (dashboardState.traffic || 5200) - 300, aiCitations: (dashboardState.aiCitations || 145) - 3, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { trustScore: dashboardState.trustScore - 3, traffic: (dashboardState.traffic || 5200) - 200, aiCitations: (dashboardState.aiCitations || 145) - 2, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { trustScore: dashboardState.trustScore - 5, traffic: (dashboardState.traffic || 5200) - 150, aiCitations: (dashboardState.aiCitations || 145) - 4, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { trustScore: dashboardState.trustScore - 2, traffic: (dashboardState.traffic || 5200) - 50, aiCitations: (dashboardState.aiCitations || 145) - 1, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { trustScore: dashboardState.trustScore - 1, traffic: (dashboardState.traffic || 5200) - 20, aiCitations: dashboardState.aiCitations || 145, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { trustScore: dashboardState.trustScore, traffic: dashboardState.traffic || 5200, aiCitations: dashboardState.aiCitations || 145, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ] : [];

  if (isLoading || !dashboardState) {
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
              onClick={() => mutate()} 
              className="p-2 rounded-lg hover:bg-gray-800"
              title="Refresh data"
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
                historicalData={[
                  dashboardState.trustScore - 8,
                  dashboardState.trustScore - 6,
                  dashboardState.trustScore - 3,
                  dashboardState.trustScore - 5,
                  dashboardState.trustScore - 2,
                  dashboardState.trustScore - 1,
                  dashboardState.trustScore - dashboardState.scoreDelta,
                  dashboardState.trustScore
                ]}
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
        {historicalData.length > 0 && (
          <div className="mb-6">
            <AnomalyAlerts
              currentData={{
                trustScore: dashboardState.trustScore,
                scoreDelta: dashboardState.scoreDelta,
                traffic: dashboardState.traffic,
                aiCitations: dashboardState.aiCitations,
                competitors: dashboardState.competitors.map((c: any) => ({
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
        )}

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

        {/* Example Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {viewConfig.visiblePillars.seo && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">SEO Pillar</h3>
              <p className="text-4xl font-extrabold text-cyan-400">{dashboardState.pillars.seo}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow 
                  historicalData={[dashboardState.pillars.seo - 5, dashboardState.pillars.seo - 3, dashboardState.pillars.seo - 2, dashboardState.pillars.seo - 1, dashboardState.pillars.seo]} 
                  currentValue={dashboardState.pillars.seo} 
                />
              )}
            </div>
          )}
          {viewConfig.visiblePillars.aeo && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">AEO Pillar</h3>
              <p className="text-4xl font-extrabold text-purple-400">{dashboardState.pillars.aeo}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow 
                  historicalData={[dashboardState.pillars.aeo - 5, dashboardState.pillars.aeo - 3, dashboardState.pillars.aeo - 2, dashboardState.pillars.aeo - 1, dashboardState.pillars.aeo]} 
                  currentValue={dashboardState.pillars.aeo} 
                />
              )}
            </div>
          )}
          {viewConfig.visiblePillars.geo && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">GEO Pillar</h3>
              <p className="text-4xl font-extrabold text-amber-400">{dashboardState.pillars.geo}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow 
                  historicalData={[dashboardState.pillars.geo - 5, dashboardState.pillars.geo - 3, dashboardState.pillars.geo - 2, dashboardState.pillars.geo - 1, dashboardState.pillars.geo]} 
                  currentValue={dashboardState.pillars.geo} 
                />
              )}
            </div>
          )}
          {viewConfig.visiblePillars.qai && (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">QAI Pillar</h3>
              <p className="text-4xl font-extrabold text-green-400">{dashboardState.pillars.qai}</p>
              {viewConfig.showTrends && (
                <PredictiveTrendArrow 
                  historicalData={[dashboardState.pillars.qai - 5, dashboardState.pillars.qai - 3, dashboardState.pillars.qai - 2, dashboardState.pillars.qai - 1, dashboardState.pillars.qai]} 
                  currentValue={dashboardState.pillars.qai} 
                />
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

// Export with Suspense to prevent SSR issues
export default function ExampleDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white p-8">Loading...</div>}>
      <ExampleDashboardPageClient />
    </Suspense>
  );
}

