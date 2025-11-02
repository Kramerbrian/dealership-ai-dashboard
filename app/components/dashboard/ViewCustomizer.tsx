'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RotateCcw, Eye, EyeOff, 
  Grid, List, BarChart3, X, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewCustomizerProps {
  onSave: (config: DashboardConfig) => void;
  defaultConfig: DashboardConfig;
}

export interface DashboardConfig {
  layout: 'grid' | 'list' | 'compact';
  visiblePillars: {
    seo: boolean;
    aeo: boolean;
    geo: boolean;
    qai: boolean;
  };
  showTrends: boolean;
  showOCI: boolean;
  cardSize: 'small' | 'medium' | 'large';
  refreshInterval: number; // minutes
}

export const ViewCustomizer: React.FC<ViewCustomizerProps> = ({
  onSave,
  defaultConfig
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);

  // Detect changes
  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(defaultConfig));
  }, [config, defaultConfig]);

  const handleSave = () => {
    onSave(config);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dealershipai-view-config', JSON.stringify(config));
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dealershipai-view-config');
    }
  };

  // Load saved config on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dealershipai-view-config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
        } catch (e) {
          console.error('Failed to load saved config:', e);
        }
      }
    }
  }, []);

  // Easter egg: Konami code for "Cinema Mode" (hides everything except Trust Score)
  useEffect(() => {
    let sequence = '';
    const handleKeyPress = (e: KeyboardEvent) => {
      sequence += e.key.toLowerCase();
      // Keep last 6 characters
      if (sequence.length > 6) {
        sequence = sequence.slice(-6);
      }
      if (sequence.includes('cinema')) {
        setConfig({
          ...config,
          layout: 'compact',
          showTrends: false,
          visiblePillars: { seo: false, aeo: false, geo: false, qai: false }
        });
        console.log('🎬 Cinema mode activated');
        sequence = '';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [config]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="Customize view"
      >
        <Settings className="w-5 h-5 text-gray-400" />
        {hasChanges && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500" />
        )}
      </button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-700 
                z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">
                    Customize View
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Personalize your dashboard layout and preferences
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Layout Style */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Layout Style
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'grid', label: 'Grid', icon: Grid },
                      { value: 'list', label: 'List', icon: List },
                      { value: 'compact', label: 'Compact', icon: BarChart3 }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setConfig({ ...config, layout: value as any })}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                          ${config.layout === value
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 hover:border-purple-500/30'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 text-gray-300" />
                        <span className="text-xs font-medium text-gray-400">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visible Pillars */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Visible Pillars
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: 'seo', label: 'SEO Score', color: 'text-cyan-500' },
                      { key: 'aeo', label: 'AEO Score', color: 'text-purple-500' },
                      { key: 'geo', label: 'GEO Score', color: 'text-amber-500' },
                      { key: 'qai', label: 'QAI Score', color: 'text-green-500' }
                    ].map(({ key, label, color }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg 
                          bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <span className={`text-sm font-medium ${color}`}>
                          {label}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={config.visiblePillars[key as keyof typeof config.visiblePillars]}
                            onChange={(e) => setConfig({
                              ...config,
                              visiblePillars: {
                                ...config.visiblePillars,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 rounded-full bg-gray-700 peer-checked:bg-purple-500 
                            transition-colors" />
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white 
                            transition-transform peer-checked:translate-x-4" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Display Options
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-lg 
                      bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Show trend sparklines</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.showTrends}
                        onChange={(e) => setConfig({ ...config, showTrends: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 text-purple-500 
                          focus:ring-2 focus:ring-purple-500/20"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg 
                      bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Show OCI panel</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.showOCI}
                        onChange={(e) => setConfig({ ...config, showOCI: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 text-purple-500 
                          focus:ring-2 focus:ring-purple-500/20"
                      />
                    </label>
                  </div>
                </div>

                {/* Card Size */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Card Size
                  </h3>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setConfig({ ...config, cardSize: size as any })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize
                          transition-all
                          ${config.cardSize === size
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Refresh Interval */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Auto-refresh interval
                  </h3>
                  <select
                    value={config.refreshInterval}
                    onChange={(e) => setConfig({ ...config, refreshInterval: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 
                      text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value={0}>Never</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>

                {/* Easter Egg Hint */}
                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  <p className="text-xs text-gray-400 italic">
                    💡 Pro tip: Type "cinema" to activate focus mode
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 
                      text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold 
                      transition-all flex items-center justify-center gap-2
                      ${hasChanges
                        ? 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
