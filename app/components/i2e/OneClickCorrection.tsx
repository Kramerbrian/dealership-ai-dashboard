"use client";

/**
 * One-Click Correction Widget Component
 * 
 * Small, isolated widgets that appear only when a fix is simple
 * - For minor, common issues (e.g., 'Fix Data Drift', 'Approve New Theme')
 * - Presents recommended fix with single 'Do It Now' button
 * - Executes change without leaving the screen
 * 
 * Action Metric: Number of manual fix tasks averted per session
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OneClickCorrection as CorrectionType, InsightSeverity } from './types';
import { CheckCircle2, X, Loader2, Zap, AlertCircle } from 'lucide-react';

interface OneClickCorrectionProps {
  correction: CorrectionType;
  onExecute?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const severityConfig: Record<InsightSeverity, { 
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  low: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  medium: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  high: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

export function OneClickCorrection({ 
  correction, 
  onExecute,
  onDismiss,
  className = '' 
}: OneClickCorrectionProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const config = severityConfig[correction.severity];

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await correction.action();
      setIsCompleted(true);
      onExecute?.(correction.id);
      
      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        setIsDismissed(true);
        setTimeout(() => onDismiss?.(correction.id), 300);
      }, 2000);
    } catch (error) {
      console.error('Correction execution failed:', error);
      setIsExecuting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => onDismiss?.(correction.id), 300);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`
          rounded-xl border-2 backdrop-blur-sm shadow-lg
          ${config.bgColor} ${config.borderColor}
          ${className}
        `}
      >
        {isCompleted ? (
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">
                  Fixed!
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {correction.issue} has been resolved
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-white/60 ${config.color}`}>
                  {correction.severity === 'critical' || correction.severity === 'high' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">
                    Quick Fix Available
                  </div>
                  {correction.category && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {correction.category}
                    </div>
                  )}
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Issue Description */}
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {correction.issue}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                {correction.fix}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className={`
                w-full py-2.5 px-4 rounded-lg font-semibold text-sm
                transition-all duration-200
                ${correction.severity === 'critical' ? 'bg-red-600' :
                  correction.severity === 'high' ? 'bg-orange-600' :
                  correction.severity === 'medium' ? 'bg-amber-600' :
                  'bg-blue-600'}
                text-white hover:opacity-90 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Do It Now
                  {correction.estimatedTime && (
                    <span className="text-xs opacity-75 ml-1">
                      ({correction.estimatedTime})
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

interface OneClickCorrectionListProps {
  corrections: CorrectionType[];
  onExecute?: (id: string) => void;
  onDismiss?: (id: string) => void;
  maxItems?: number;
  className?: string;
}

export function OneClickCorrectionList({ 
  corrections, 
  onExecute,
  onDismiss,
  maxItems = 3,
  className = '' 
}: OneClickCorrectionListProps) {
  const displayedCorrections = corrections.slice(0, maxItems);

  if (displayedCorrections.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {displayedCorrections.map((correction) => (
        <OneClickCorrection
          key={correction.id}
          correction={correction}
          onExecute={onExecute}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

