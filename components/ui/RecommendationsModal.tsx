'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ModalErrorBoundary } from '@/components/modals/ModalErrorBoundary';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  impact_score: number;
  category: string;
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: Recommendation[];
  dealerName: string;
  onImplement?: (recommendationId: string) => void;
}

const priorityColors = {
  high: 'text-red-400 bg-red-500/20 border-red-500/50',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
  low: 'text-green-400 bg-green-500/20 border-green-500/50'
};

const statusIcons = {
  pending: ClockIcon,
  in_progress: ExclamationTriangleIcon,
  completed: CheckCircleIcon
};

function RecommendationsModalContent({
  isOpen,
  onClose,
  recommendations,
  dealerName,
  onImplement
}: RecommendationsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-gray-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  AI-Powered Recommendations
                </h2>
                <p className="text-gray-400">
                  {dealerName} • {recommendations.length} action items
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  You're All Set!
                </h3>
                <p className="text-gray-400">
                  No pending recommendations at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((rec) => {
                    const StatusIcon = statusIcons[rec.status];
                    return (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${priorityColors[rec.priority]}`}
                              >
                                {rec.priority}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/50">
                                {rec.category}
                              </span>
                              <StatusIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {rec.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                              {rec.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Impact Score:</span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < Math.round(rec.impact_score / 20)
                                          ? 'bg-green-500'
                                          : 'bg-gray-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          {rec.status === 'pending' && onImplement && (
                            <button
                              onClick={() => onImplement(rec.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                              Implement
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 p-6 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Recommendations are generated based on your current AI visibility scores
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function RecommendationsModal(props: RecommendationsModalProps) {
  if (!props.isOpen) return null;
  
  return (
    <ModalErrorBoundary modalName="Recommendations Modal" onClose={props.onClose}>
      <RecommendationsModalContent {...props} />
    </ModalErrorBoundary>
  );
}
