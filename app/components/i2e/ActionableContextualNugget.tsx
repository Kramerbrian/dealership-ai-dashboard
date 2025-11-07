"use client";

/**
 * Actionable Contextual Nugget (ACN) Component
 * 
 * Small, high-contrast badges placed directly on graphs/data points
 * - Contains 3-word insight summary (e.g., "Churn Risk High")
 * - Single primary CTA button (e.g., "Launch Retention Protocol")
 * - Appears directly on the data visualization, not in a separate feed
 * 
 * Action Metric: Reduction in time from insight perception to button click (Target: < 2 seconds)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionableContextualNugget as ACNType, InsightSeverity } from './types';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface ACNProps {
  nugget: ACNType;
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  containerRef?: React.RefObject<HTMLElement>; // Reference to the graph/chart container
}

const severityConfig: Record<InsightSeverity, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  low: {
    icon: <Info className="w-3.5 h-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  medium: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300'
  },
  high: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300'
  },
  critical: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  }
};

export function ActionableContextualNugget({ 
  nugget, 
  onDismiss, 
  onAction,
  containerRef 
}: ACNProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const config = severityConfig[nugget.severity];

  // Auto-dismiss logic
  useEffect(() => {
    if (nugget.autoDismiss && nugget.dismissAfter) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(nugget.id), 300); // Wait for animation
      }, nugget.dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [nugget.autoDismiss, nugget.dismissAfter, nugget.id, onDismiss]);

  const handleAction = async () => {
    setIsExecuting(true);
    try {
      await nugget.ctaAction();
      onAction?.(nugget.id);
    } catch (error) {
      console.error('ACN action failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(nugget.id), 300);
  };

  // Calculate position based on anchor
  const getPositionStyles = () => {
    const { x, y, anchor = 'top-right' } = nugget.position;
    
    const anchorMap = {
      'top-left': { top: `${y}%`, left: `${x}%`, transform: 'translate(0, 0)' },
      'top-right': { top: `${y}%`, right: `${x}%`, transform: 'translate(0, 0)' },
      'bottom-left': { bottom: `${y}%`, left: `${x}%`, transform: 'translate(0, 0)' },
      'bottom-right': { bottom: `${y}%`, right: `${x}%`, transform: 'translate(0, 0)' },
      'center': { top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }
    };

    return anchorMap[anchor];
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
        className="absolute z-50"
        style={getPositionStyles()}
      >
        <div
          className={`
            rounded-xl border-2 shadow-lg backdrop-blur-sm
            ${config.bgColor} ${config.borderColor}
            min-w-[200px] max-w-[280px]
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className={`${config.color} p-1 rounded-md bg-white/60`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-bold ${config.color} leading-tight`}>
                  {nugget.insight}
                </div>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* CTA Button */}
          <div className="px-3 pb-3">
            <button
              onClick={handleAction}
              disabled={isExecuting}
              className={`
                w-full py-2 px-4 rounded-lg font-semibold text-sm
                transition-all duration-200
                ${nugget.severity === 'critical' ? 'bg-red-600' :
                  nugget.severity === 'high' ? 'bg-orange-600' :
                  nugget.severity === 'medium' ? 'bg-amber-600' :
                  'bg-blue-600'}
                text-white hover:opacity-90 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {isExecuting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Executing...
                </>
              ) : (
                nugget.ctaText
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ACNContainerProps {
  nuggets: ACNType[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component that positions ACNs relative to a chart/graph
 */
export function ACNContainer({ 
  nuggets, 
  onDismiss, 
  onAction, 
  children,
  className = '' 
}: ACNContainerProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {nuggets.map((nugget) => (
        <ActionableContextualNugget
          key={nugget.id}
          nugget={nugget}
          onDismiss={onDismiss}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

