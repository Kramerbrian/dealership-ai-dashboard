"use client";

/**
 * Auto-Generated Execution Playbook Component
 * 
 * Non-dismissible side-drawer that opens when a major insight is clicked
 * - Pre-populated with automatically generated multi-step sequence
 * - Steps are clickable and auto-execute the first 1-2 steps upon approval
 * - Removes cognitive load by presenting clear action sequence
 * 
 * Action Metric: Reduction in decision-making time and task creation latency
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionPlaybook as PlaybookType, ExecutionStep, ActionStatus } from './types';
import { X, CheckCircle2, Circle, Loader2, Play, Clock, ArrowRight } from 'lucide-react';

interface ExecutionPlaybookProps {
  playbook: PlaybookType;
  isOpen: boolean;
  onClose: () => void;
  onStepComplete?: (stepId: string) => void;
  onPlaybookComplete?: (playbookId: string) => void;
}

const statusConfig: Record<ActionStatus, { 
  icon: React.ReactNode; 
  color: string;
  bgColor: string;
}> = {
  pending: {
    icon: <Circle className="w-4 h-4" />,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100'
  },
  in_progress: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },
  failed: {
    icon: <X className="w-4 h-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
};

function ExecutionStepItem({ 
  step, 
  index,
  onExecute,
  isAutoExecuting 
}: { 
  step: ExecutionStep; 
  index: number;
  onExecute: (step: ExecutionStep) => void;
  isAutoExecuting: boolean;
}) {
  const config = statusConfig[step.status];
  const canExecute = step.status === 'pending' && 
    (!step.dependencies || step.dependencies.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        rounded-xl border-2 p-4 mb-3 transition-all duration-200
        ${step.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 
          step.status === 'failed' ? 'bg-red-50 border-red-200' :
          step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
          'bg-white border-gray-200'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Step Number & Status */}
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-full
          ${config.bgColor} ${config.color} flex-shrink-0
        `}>
          {config.icon}
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {step.title}
            </h4>
            {step.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {step.estimatedTime}
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            {step.description}
          </p>

          {/* Result Message */}
          {step.result && (
            <div className={`
              text-xs p-2 rounded-lg mb-2
              ${step.result.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
            `}>
              {step.result.message}
            </div>
          )}

          {/* Action Button */}
          {canExecute && (
            <button
              onClick={() => onExecute(step)}
              disabled={isAutoExecuting}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200
                ${step.autoExecute ? 
                  'bg-blue-600 text-white hover:bg-blue-700' :
                  'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {step.autoExecute ? (
                <>
                  <Play className="w-3 h-3" />
                  Auto-Execute
                </>
              ) : (
                <>
                  <ArrowRight className="w-3 h-3" />
                  Execute Step
                </>
              )}
            </button>
          )}

          {/* Dependencies */}
          {step.dependencies && step.dependencies.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Waiting for {step.dependencies.length} prerequisite{step.dependencies.length > 1 ? 's' : ''}...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ExecutionPlaybook({ 
  playbook, 
  isOpen, 
  onClose,
  onStepComplete,
  onPlaybookComplete 
}: ExecutionPlaybookProps) {
  const [steps, setSteps] = useState<ExecutionStep[]>(playbook.steps);
  const [isAutoExecuting, setIsAutoExecuting] = useState(false);
  const [hasAutoExecuted, setHasAutoExecuted] = useState(false);

  // Auto-execute first N steps on open
  useEffect(() => {
    if (isOpen && !hasAutoExecuted && playbook.autoExecuteFirst) {
      const autoExecuteSteps = steps
        .filter(s => s.autoExecute && s.status === 'pending')
        .slice(0, playbook.autoExecuteFirst);
      
      if (autoExecuteSteps.length > 0) {
        setIsAutoExecuting(true);
        autoExecuteSteps.forEach((step, idx) => {
          setTimeout(() => {
            executeStep(step);
            if (idx === autoExecuteSteps.length - 1) {
              setIsAutoExecuting(false);
              setHasAutoExecuted(true);
            }
          }, idx * 500); // Stagger execution
        });
      }
    }
  }, [isOpen, hasAutoExecuted, playbook.autoExecuteFirst, steps]);

  const executeStep = async (step: ExecutionStep) => {
    // Update step status to in_progress
    setSteps(prev => prev.map(s => 
      s.id === step.id ? { ...s, status: 'in_progress' as ActionStatus } : s
    ));

    try {
      // Execute the step action if provided
      if (step.action) {
        await step.action();
      }

      // Mark as completed
      setSteps(prev => prev.map(s => 
        s.id === step.id ? { 
          ...s, 
          status: 'completed' as ActionStatus,
          result: { success: true, message: 'Step completed successfully' }
        } : s
      ));

      onStepComplete?.(step.id);

      // Check if all steps are complete
      const updatedSteps = steps.map(s => 
        s.id === step.id ? { 
          ...s, 
          status: 'completed' as ActionStatus,
          result: { success: true, message: 'Step completed successfully' }
        } : s
      );

      if (updatedSteps.every(s => s.status === 'completed')) {
        onPlaybookComplete?.(playbook.id);
      }
    } catch (error) {
      // Mark as failed
      setSteps(prev => prev.map(s => 
        s.id === step.id ? { 
          ...s, 
          status: 'failed' as ActionStatus,
          result: { 
            success: false, 
            message: error instanceof Error ? error.message : 'Step execution failed' 
          }
        } : s
      ));
    }
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {playbook.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {playbook.description}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{completedCount} of {totalSteps} steps</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-6">
              {steps.map((step, index) => (
                <ExecutionStepItem
                  key={step.id}
                  step={step}
                  index={index}
                  onExecute={executeStep}
                  isAutoExecuting={isAutoExecuting}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                {completedCount === totalSteps ? (
                  <span className="text-emerald-600 font-medium">
                    ✓ All steps completed
                  </span>
                ) : (
                  <span>
                    {totalSteps - completedCount} step{totalSteps - completedCount !== 1 ? 's' : ''} remaining
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

