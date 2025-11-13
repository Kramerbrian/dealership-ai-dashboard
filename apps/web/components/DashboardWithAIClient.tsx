/**
 * Dashboard with AI Assistant - Client Component
 *
 * This is the client-side wrapper that integrates the AI Assistant
 * into your main dashboard. It's separated from the server component
 * to handle client-side interactivity.
 */

'use client';

import { useState, useMemo } from 'react';
import { AIAssistantQuery, AIQuickActions } from './AIAssistantQuery';
import { Sparkles, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface DashboardData {
  revenueAtRisk: number;
  aiVisibility: number;
  overallScore: number;
  seoScore: number;
  localScore: number;
  dealershipName: string;
  userName: string;
}

interface DashboardWithAIClientProps {
  initialData: DashboardData;
}

export function DashboardWithAIClient({ initialData }: DashboardWithAIClientProps) {
  const [showAI, setShowAI] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Prepare AI context from dashboard data
  const aiContext = useMemo(() => ({
    revenueAtRisk: initialData.revenueAtRisk,
    aiVisibility: initialData.aiVisibility,
    overallScore: initialData.overallScore,
    seoScore: initialData.seoScore,
    localScore: initialData.localScore,
    criticalAlerts: initialData.revenueAtRisk > 300000,
    dealershipName: initialData.dealershipName,
    competitorCount: 0, // You can fetch this from your API
  }), [initialData]);

  if (!showAI) {
    // Floating action button when hidden
    return (
      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110 z-50 flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <>
      {/* Critical Alert Banner (if applicable) */}
      {initialData.revenueAtRisk > 300000 && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                ⚠️ Critical: High Revenue at Risk
              </h3>
              <p className="text-sm text-red-800">
                ${(initialData.revenueAtRisk / 1000).toFixed(0)}K annual revenue is at risk due to low AI visibility.
                Ask the AI assistant below for immediate optimization strategies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Card */}
      <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg border border-blue-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Visibility Assistant</h2>
                <p className="text-sm text-blue-100">
                  Context-aware insights for {initialData.dealershipName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowAI(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Hide AI Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {expanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Quick Stats */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Current Metrics
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Revenue at Risk</span>
                      <span className={`font-semibold ${
                        initialData.revenueAtRisk > 300000 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        ${(initialData.revenueAtRisk / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">AI Visibility</span>
                      <span className="font-semibold text-blue-600">
                        {initialData.aiVisibility}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                        style={{ width: `${initialData.aiVisibility}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Score</span>
                      <span className="font-semibold text-green-600">
                        {initialData.overallScore}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                        style={{ width: `${initialData.overallScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: AI Chat */}
              <div className="lg:col-span-2">
                <AIAssistantQuery
                  context="dealership-overview"
                  data={aiContext}
                  theme="light"
                  placeholder={`Ask me anything about ${initialData.dealershipName}'s AI visibility...`}
                  maxHeight="350px"
                  className="shadow-md"
                />

                {/* Quick Actions */}
                <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    💡 Quick Questions
                  </h4>
                  <AIQuickActions
                    theme="light"
                    onAction={(query) => {
                      console.log('Quick action:', query);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                Pro Tip
              </h4>
              <p className="text-sm text-blue-800">
                The AI assistant understands your specific metrics and can provide
                customized recommendations. Try asking about your biggest opportunities
                or quick wins specific to your {initialData.aiVisibility}% AI visibility score.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
