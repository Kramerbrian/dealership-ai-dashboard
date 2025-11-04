'use client';

/**
 * AIV Modal Component
 * 
 * Displays Algorithmic Visibility Index (AIV™) and AI Visibility ROI (AIVR™) scores
 * in a modal dialog with detailed breakdown
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3, Info } from 'lucide-react';
import { useAIVCalculator, type AIVOutputs } from '@/lib/hooks/useAIVCalculator';

interface AIVModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealerId: string;
}

const AIVModal: React.FC<AIVModalProps> = ({ isOpen, onClose, dealerId }) => {
  const { outputs, isLoading, error } = useAIVCalculator(dealerId, {
    enabled: isOpen,
    refetchInterval: 60 * 1000, // Refetch every minute when open
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Algorithmic Visibility Index (AIV™)</h2>
                  <p className="text-sm text-blue-100 mt-1">
                    Weighted findability across ChatGPT, Gemini, Claude, Perplexity & Google AI Overviews
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 text-sm">Failed to load AIV data. Please try again.</p>
                  </div>
                )}

                {outputs && (
                  <div className="space-y-6">
                    {/* Main Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ScoreCard
                        title="Current AIV™"
                        value={outputs.AIV_score.toFixed(3)}
                        subtitle="Visibility Score"
                        icon={<BarChart3 className="w-6 h-6" />}
                        color="blue"
                      />
                      <ScoreCard
                        title="AI Visibility ROI (AIVR™)"
                        value={outputs.AIVR_score.toFixed(3)}
                        subtitle="ROI Score"
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="green"
                      />
                      <ScoreCard
                        title="Revenue at Risk"
                        value={`$${(outputs.Revenue_at_Risk_USD / 1000).toFixed(1)}K`}
                        subtitle="Per Month"
                        icon={<DollarSign className="w-6 h-6" />}
                        color="red"
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-1">Summary</h3>
                          <p className="text-sm text-blue-800">{outputs.modal_summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <BreakdownItem label="AIV Core" value={outputs.breakdown.AIV_core.toFixed(3)} />
                        <BreakdownItem label="AIV SEL" value={outputs.breakdown.AIV_sel.toFixed(3)} />
                        <BreakdownItem label="AIV Mods" value={outputs.breakdown.AIV_mods.toFixed(3)} />
                        <BreakdownItem label="SEO" value={outputs.breakdown.SEO.toFixed(1)} />
                        <BreakdownItem label="AEO" value={outputs.breakdown.AEO.toFixed(1)} />
                        <BreakdownItem label="GEO" value={outputs.breakdown.GEO.toFixed(1)} />
                        <BreakdownItem label="UGC" value={outputs.breakdown.UGC.toFixed(1)} />
                        <BreakdownItem label="GeoLocal" value={outputs.breakdown.GeoLocal.toFixed(1)} />
                      </div>
                    </div>

                    {/* Formula Reference */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Calculation Formula</h3>
                      <div className="text-sm text-gray-700 space-y-1 font-mono">
                        <p>AIV_core = 0.25×SEO + 0.30×AEO + 0.25×GEO + 0.10×UGC + 0.05×GeoLocal</p>
                        <p>AIV_sel = 0.35×SCS + 0.35×SIS + 0.30×SCR</p>
                        <p>AIV = (AIV_core × AIV_mods) × (1 + 0.25×AIV_sel)</p>
                        <p>AIVR = AIV × (1 + CTR_delta + Conversion_delta)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface ScoreCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red';
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  );
};

interface BreakdownItemProps {
  label: string;
  value: string;
}

const BreakdownItem: React.FC<BreakdownItemProps> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-xs text-gray-600 mb-1">{label}</div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
  </div>
);

export default AIVModal;

