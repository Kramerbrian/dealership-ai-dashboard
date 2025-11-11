/**
 * Dashboard with AI Assistant Integration
 *
 * Example of integrating AIAssistantQuery into your dashboard
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { AIAssistantQuery, AIQuickActions } from './AIAssistantQuery';

export function DashboardWithAI() {
  const [metrics, setMetrics] = useState({
    revenueAtRisk: 0,
    aiVisibility: 0,
    overallScore: 0,
    impressions: [],
    competitorCount: 0,
    dealershipName: ''
  });

  const [showAI, setShowAI] = useState(false);

  // Fetch metrics on mount
  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Replace with your actual API endpoints
        const [scoresRes, usageRes] = await Promise.all([
          fetch('/api/scores?domain=example.com'),
          fetch('/api/usage')
        ]);

        const scores = await scoresRes.json();
        const usage = await usageRes.json();

        // Calculate metrics
        setMetrics({
          revenueAtRisk: calculateRevenueAtRisk(scores.data),
          aiVisibility: scores.data?.scores?.aiVisibility || 0,
          overallScore: scores.data?.scores?.overall || 0,
          impressions: scores.data?.impressions || [],
          competitorCount: 5, // From your competitors table
          dealershipName: scores.data?.dealer?.name || 'Your Dealership'
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    }

    fetchMetrics();
  }, []);

  // Prepare AI context
  const aiContext = useMemo(() => ({
    revenueAtRisk: metrics.revenueAtRisk,
    aiVisibility: metrics.aiVisibility,
    overallScore: metrics.overallScore,
    impressionsTrend: metrics.impressions,
    criticalAlerts: metrics.revenueAtRisk > 300000,
    dealershipName: metrics.dealershipName,
    competitorCount: metrics.competitorCount
  }), [metrics]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{metrics.dealershipName} Dashboard</h1>
        <p className="text-gray-400">AI-powered visibility analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue at Risk Card */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Revenue at Risk</h2>
              {metrics.revenueAtRisk > 300000 && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                  Critical
                </span>
              )}
            </div>
            <div className="text-4xl font-bold mb-2">
              ${(metrics.revenueAtRisk / 1000).toFixed(0)}K
            </div>
            <p className="text-gray-400 text-sm">
              Estimated annual revenue at risk from poor AI visibility
            </p>
          </div>

          {/* AI Visibility Score Card */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">AI Visibility Score</h2>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold">{metrics.aiVisibility}%</div>
              <div className={`text-sm ${getScoreColor(metrics.aiVisibility)}`}>
                {getScoreLabel(metrics.aiVisibility)}
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                style={{ width: `${metrics.aiVisibility}%` }}
              />
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Overall</div>
                <div className="text-2xl font-bold">{metrics.overallScore}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Competitors</div>
                <div className="text-2xl font-bold">{metrics.competitorCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Ranking</div>
                <div className="text-2xl font-bold">#2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - AI Assistant */}
        <div className="space-y-4">
          {/* AI Assistant Toggle */}
          <button
            onClick={() => setShowAI(!showAI)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>✨</span>
            {showAI ? 'Hide' : 'Show'} AI Assistant
          </button>

          {/* AI Assistant Panel */}
          {showAI && (
            <div className="space-y-4">
              <AIAssistantQuery
                context="dealership-overview"
                data={aiContext}
                theme="dark"
                placeholder="Ask about your AI visibility metrics..."
                className="shadow-xl"
              />

              {/* Quick Actions */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold mb-3 text-gray-400">
                  Quick Questions
                </h3>
                <AIQuickActions
                  theme="dark"
                  onAction={(query) => {
                    // This will trigger the AI assistant with the quick action query
                    console.log('Quick action:', query);
                  }}
                />
              </div>

              {/* Usage Stats */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold mb-3 text-gray-400">
                  AI Usage
                </h3>
                <div className="text-sm text-gray-300">
                  <div className="flex justify-between mb-2">
                    <span>Queries Today:</span>
                    <span className="font-semibold">12 / 50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tier:</span>
                    <span className="font-semibold text-blue-400">Pro</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {metrics.revenueAtRisk > 300000 && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-400 mb-1">
                Critical: High Revenue at Risk
              </h3>
              <p className="text-sm text-gray-300">
                Your $${(metrics.revenueAtRisk / 1000).toFixed(0)}K revenue at risk requires immediate attention.
                Ask the AI assistant for specific optimization strategies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper functions
 */

function calculateRevenueAtRisk(data: any): number {
  // Simple calculation - replace with your actual logic
  const aiVisibility = data?.scores?.aiVisibility || 0;
  const baseRevenue = 500000; // Average dealership revenue
  const riskFactor = (100 - aiVisibility) / 100;
  return baseRevenue * riskFactor;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Critical';
}

export default DashboardWithAI;
