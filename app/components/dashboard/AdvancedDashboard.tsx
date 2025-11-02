'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Zap, Brain, Target, Lock } from 'lucide-react';

interface Hack {
  id: string;
  category: 'visibility' | 'conversion' | 'execution' | 'trust';
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: number[];
  formula: string;
  insights: string;
  actionable: boolean;
}

interface AdvancedDashboardProps {
  userTier: 'free' | 'pro' | 'enterprise';
  hackData: Hack[];
}

const CATEGORY_CONFIG = {
  visibility: {
    label: 'AI Visibility',
    icon: Brain,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    description: 'How AI engines discover and cite you'
  },
  conversion: {
    label: 'Conversion Velocity',
    icon: Target,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    description: 'Speed from AI mention → closed deal'
  },
  execution: {
    label: 'Operational Excellence',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Internal data quality & process integrity'
  },
  trust: {
    label: 'Trust Signals',
    icon: TrendingUp,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    description: 'E-E-A-T factors that influence AI confidence'
  }
} as const;

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  userTier,
  hackData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const isLocked = userTier === 'free';

  // Filter hacks
  const filteredHacks = useMemo(() => {
    return hackData.filter(hack => {
      const matchesSearch = hack.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || hack.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [hackData, searchQuery, activeCategory]);

  // Group by category
  const groupedHacks = useMemo(() => {
    return {
      visibility: filteredHacks.filter(h => h.category === 'visibility'),
      conversion: filteredHacks.filter(h => h.category === 'conversion'),
      execution: filteredHacks.filter(h => h.category === 'execution'),
      trust: filteredHacks.filter(h => h.category === 'trust')
    };
  }, [filteredHacks]);

  // Count critical issues per category
  const criticalCounts = useMemo(() => {
    return {
      visibility: groupedHacks.visibility.filter(h => h.status === 'critical').length,
      conversion: groupedHacks.conversion.filter(h => h.status === 'critical').length,
      execution: groupedHacks.execution.filter(h => h.status === 'critical').length,
      trust: groupedHacks.trust.filter(h => h.status === 'critical').length
    };
  }, [groupedHacks]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          {/* Title Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Advanced Analytics
              </h1>
              <p className="text-sm text-gray-400">
                40 proprietary metrics that separate market leaders from everyone else
              </p>
            </div>

            {/* Tier Badge */}
            {isLocked && (
              <button
                onClick={() => setShowUnlockPrompt(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg 
                  bg-purple-500/10 border border-purple-500/20 
                  hover:bg-purple-500/20 transition-colors"
              >
                <Lock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">
                  Unlock Full Access
                </span>
              </button>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search metrics... (e.g., 'Authority Decay Rate')"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 
                  text-white placeholder:text-gray-500 text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                  transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${activeCategory === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                All ({hackData.length})
              </button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const count = groupedHacks[key as keyof typeof groupedHacks].length;
                const criticals = criticalCounts[key as keyof typeof criticalCounts];

                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap
                      transition-all duration-200 flex items-center gap-2
                      ${activeCategory === key
                        ? `bg-${config.color}-500 text-white`
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label} ({count})
                    {criticals > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                        {criticals}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Category Sections */}
        {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
          const hacks = groupedHacks[categoryKey as keyof typeof groupedHacks];
          if (activeCategory !== 'all' && activeCategory !== categoryKey) return null;
          if (hacks.length === 0) return null;

          const Icon = config.icon;

          return (
            <div key={categoryKey} className="mb-12">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {config.label}
                  </h2>
                  <p className="text-xs text-gray-400">{config.description}</p>
                </div>
                <div className="flex-1 h-px bg-gray-700 ml-4" />
                <span className="text-sm text-gray-400">
                  {hacks.length} metrics
                </span>
              </div>

              {/* Hack Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {hacks.map((hack) => (
                  <div
                    key={hack.id}
                    className="p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={`w-2 h-2 rounded-full ${
                          hack.status === 'good' ? 'bg-green-500' : 
                          hack.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        } flex-shrink-0 mt-1.5`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white leading-tight mb-1">
                            {hack.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium capitalize ${
                              hack.status === 'good' ? 'text-green-500' : 
                              hack.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {hack.status}
                            </span>
                            {hack.actionable && (
                              <span className="text-xs text-purple-500">• Fixable</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${
                          hack.status === 'good' ? 'text-green-500' : 
                          hack.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {hack.value.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-400">{hack.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredHacks.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No metrics found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
