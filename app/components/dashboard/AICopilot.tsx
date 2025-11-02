'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Lightbulb, AlertCircle, TrendingUp, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InsightAction {
  label: string;
  onClick: () => void;
}

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'prediction';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: InsightAction;
  context?: string;
  timestamp: Date;
}

interface AICopilotProps {
  dashboardState: {
    trustScore: number;
    scoreDelta: number;
    pillars: {
      seo: number;
      aeo: number;
      geo: number;
      qai: number;
    };
    competitors?: Array<{
      name: string;
      score: number;
      scoreDelta: number;
    }>;
    criticalIssues: number;
    recentActivity?: string[];
  };
  userTier: 'free' | 'pro' | 'enterprise';
}

export const AICopilot: React.FC<AICopilotProps> = ({ 
  dashboardState, 
  userTier 
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate insights
  const generateInsights = useCallback(async () => {
    if (userTier === 'free') {
      // Free tier gets generic insights
      setInsights([{
        id: '1',
        type: 'tip',
        priority: 'low',
        message: 'Upgrade to Pro to unlock AI-powered insights',
        timestamp: new Date()
      }]);
      return;
    }

    setIsGenerating(true);

    try {
      // Use API route instead of direct Anthropic call (keeps API key server-side)
      const response = await fetch('/api/ai/copilot-insights', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboardState),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const insightsArray = result.insights || [];
      
      // Add IDs and timestamps
      const enriched = insightsArray.map((insight: any, index: number) => ({
        ...insight,
        id: `${Date.now()}-${index}`,
        timestamp: new Date(),
        type: insight.type || (insight.priority === 'high' ? 'warning' : 'opportunity'),
      }));
      
      setInsights(enriched);
    } catch (error) {
      console.error('[AICopilot] Failed to generate insights:', error);
      
      // Fallback to rule-based insights
      const fallbackInsights: Insight[] = [];
      
      if (dashboardState.scoreDelta < -5) {
        fallbackInsights.push({
          id: 'fallback-1',
          type: 'warning',
          priority: 'high',
          message: `Trust Score dropped ${Math.abs(dashboardState.scoreDelta)} points this week`,
          context: 'Check for new negative reviews or technical issues',
          timestamp: new Date()
        });
      }
      
      if (dashboardState.criticalIssues > 0) {
        fallbackInsights.push({
          id: 'fallback-2',
          type: 'opportunity',
          priority: 'high',
          message: `${dashboardState.criticalIssues} critical issues need attention`,
          context: 'Fixing these could boost your score by 8-12 points',
          timestamp: new Date()
        });
      }

      if (dashboardState.pillars.seo < 70) {
        fallbackInsights.push({
          id: 'fallback-3',
          type: 'opportunity',
          priority: 'medium',
          message: `SEO pillar at ${dashboardState.pillars.seo} - quick win opportunity`,
          context: 'Improve schema markup and content freshness',
          timestamp: new Date()
        });
      }
      
      if (fallbackInsights.length > 0) {
        setInsights(fallbackInsights);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [dashboardState, userTier]);

  // Generate insights on mount and every 5 minutes
  useEffect(() => {
    generateInsights();
    const interval = setInterval(generateInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [generateInsights]);

  if (insights.length === 0 && !isGenerating) return null;

  const iconMap = {
    opportunity: TrendingUp,
    warning: AlertCircle,
    tip: Lightbulb,
    prediction: Brain
  };

  const colorMap = {
    high: {
      border: 'border-red-500',
      bg: 'bg-red-500/5',
      icon: 'text-red-500'
    },
    medium: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-500/5',
      icon: 'text-yellow-500'
    },
    low: {
      border: 'border-cyan-500',
      bg: 'bg-cyan-500/5',
      icon: 'text-cyan-500'
    }
  };

  return (
    <div className="fixed bottom-24 left-6 w-96 z-40">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-semibold text-white">AI Copilot</span>
          {isGenerating && (
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Insights */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {insights.map((insight, index) => {
              const Icon = iconMap[insight.type];
              const colors = colorMap[insight.priority];

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg bg-gray-900/95 backdrop-blur-sm border ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium mb-1 leading-tight">
                        {insight.message}
                      </p>
                      {insight.context && (
                        <p className="text-xs text-gray-400 leading-tight">
                          {insight.context}
                        </p>
                      )}
                      {insight.action && (
                        <button
                          onClick={insight.action.onClick}
                          className="mt-2 text-xs text-purple-500 hover:text-purple-400 font-medium"
                        >
                          {insight.action.label} →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Refresh Button */}
            <button
              onClick={generateInsights}
              disabled={isGenerating}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium
                bg-purple-500/10 hover:bg-purple-500/20 text-purple-500
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Analyzing...' : 'Refresh Insights'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
