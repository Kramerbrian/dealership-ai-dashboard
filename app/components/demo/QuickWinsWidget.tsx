'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface QuickWin {
  id: string;
  title: string;
  description: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
  timeEstimate: string;
  category: 'schema' | 'gmb' | 'content' | 'technical' | 'reviews' | 'social';
  priority: number;
  revenueImpact?: number;
  status?: 'available' | 'in-progress' | 'completed';
}

interface QuickWinsData {
  wins: QuickWin[];
  totalImpact: number;
  totalRevenueImpact: number;
  averageEffort: string;
}

interface QuickWinsWidgetProps {
  domain?: string;
  dealerId?: string;
  className?: string;
  maxWins?: number;
}

export default function QuickWinsWidget({
  domain,
  dealerId,
  className = '',
  maxWins = 3
}: QuickWinsWidgetProps) {
  const [data, setData] = useState<QuickWinsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedWins, setCompletedWins] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!domain && !dealerId) {
      setLoading(false);
      return;
    }

    const fetchQuickWins = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (domain) params.append('domain', domain);
        if (dealerId) params.append('dealerId', dealerId);

        const response = await fetch(`/api/recommendations/quick-wins?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch quick wins');
        }

        const winsData = await response.json();
        setData(winsData);
      } catch (err) {
        console.error('Failed to fetch quick wins:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuickWins();
  }, [domain, dealerId]);

  const handleFixNow = (winId: string) => {
    // In production, this would trigger the fix action
    console.log(`Fixing quick win: ${winId}`);
    // For demo, just mark as in-progress
    setCompletedWins(new Set([...completedWins, winId]));
  };

  if (!domain && !dealerId) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow-sm ${className}`}>
        <p className="text-sm text-gray-500">Enter a domain to see quick wins</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Detecting quick wins...</p>
        </div>
      </div>
    );
  }

  if (error || !data || data.wins.length === 0) {
    return (
      <div className={`rounded-2xl border border-green-200 bg-green-50/80 backdrop-blur p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Great Job!
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {error || 'No quick wins available - your site is already optimized!'}
        </p>
      </div>
    );
  }

  const visibleWins = data.wins.slice(0, maxWins);
  const hasMore = data.wins.length > maxWins;

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schema':
        return '📋';
      case 'gmb':
        return '📍';
      case 'content':
        return '✍️';
      case 'technical':
        return '⚙️';
      case 'reviews':
        return '⭐';
      case 'social':
        return '📱';
      default:
        return '✨';
    }
  };

  // Get effort color
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-green-200 bg-green-50/50 backdrop-blur ring-1 ring-green-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Quick Wins Available
          </h3>
        </div>
        <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
          {data.wins.length} Found
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-white rounded-lg border border-green-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Impact</p>
          <p className="text-lg font-bold text-green-600">
            +{data.totalImpact.toFixed(1)} VAI
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Revenue Impact</p>
          <p className="text-lg font-bold text-green-600">
            +${(data.totalRevenueImpact / 1000).toFixed(1)}K
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Avg. Time</p>
          <p className="text-lg font-bold text-gray-900">
            {data.averageEffort}
          </p>
        </div>
      </div>

      {/* Quick Wins List */}
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {visibleWins.map((win, idx) => {
            const isCompleted = completedWins.has(win.id);
            
            return (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isCompleted ? 0.5 : 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 bg-white rounded-lg border ${
                  isCompleted 
                    ? 'border-gray-200 opacity-50' 
                    : 'border-green-200 hover:shadow-md'
                } transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getCategoryIcon(win.category)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{win.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getEffortColor(win.effort)}`}>
                          {win.effort}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{win.description}</p>
                    </div>
                  </div>
                  {!isCompleted && (
                    <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded whitespace-nowrap ml-2">
                      +{win.impact.toFixed(1)} VAI
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {win.timeEstimate}
                    </span>
                    {win.revenueImpact && (
                      <span className="text-green-600 font-medium">
                        +${(win.revenueImpact / 1000).toFixed(1)}K/mo
                      </span>
                    )}
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => handleFixNow(win.id)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm hover:shadow-md"
                    >
                      Fix Now
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View More CTA */}
      {hasMore && (
        <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
          View All {data.wins.length} Quick Wins →
        </button>
      )}

      {/* Bottom CTA */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
        <p className="text-sm text-gray-700 mb-2 font-medium">
          Complete these quick wins to boost your visibility score
        </p>
        <p className="text-xs text-gray-500">
          Estimated total time: {data.averageEffort} per item • 
          Total impact: +{data.totalImpact.toFixed(1)} VAI points
        </p>
      </div>
    </motion.div>
  );
}

