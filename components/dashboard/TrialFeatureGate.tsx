'use client';

/**
 * TrialFeatureGate Component
 * 
 * Wraps locked features/drawers and shows upgrade prompt or trial unlock option
 * Checks trial status and unlocks if active
 */

import React from 'react';
import { Lock, Clock, Sparkles } from 'lucide-react';
import { useTrialFeature } from '@/lib/hooks/useTrialFeature';
import { motion } from 'framer-motion';

interface TrialFeatureGateProps {
  featureId: string;
  tierRequired: 'tier2' | 'tier3';
  currentTier: 'tier1' | 'tier2' | 'tier3';
  children: React.ReactNode;
  onUpgrade?: () => void;
  featureName?: string;
}

export const TrialFeatureGate: React.FC<TrialFeatureGateProps> = ({
  featureId,
  tierRequired,
  currentTier,
  children,
  onUpgrade,
  featureName = 'this feature',
}) => {
  const { status, isLoading, grantTrial } = useTrialFeature(featureId);
  const isTrialActive = status.is_active;
  
  // Check if user has access
  const hasAccess = 
    (currentTier === tierRequired) || 
    (currentTier === 'tier3' && tierRequired === 'tier2') ||
    isTrialActive;

  if (hasAccess) {
    return (
      <>
        {isTrialActive && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 px-3 py-2">
            <Clock className="w-4 h-4 text-cyan-300" />
            <span className="text-xs text-cyan-200">
              Trial active: {status.hours_remaining}h remaining
            </span>
          </div>
        )}
        {children}
      </>
    );
  }

  // Show locked state
  return (
    <div className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-gray-700/50 p-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-white">
          {featureName} is locked
        </h3>
        
        <p className="mb-4 text-sm text-gray-400">
          {tierRequired === 'tier2' ? 'Enhanced' : 'Premium'} tier required
        </p>

        {currentTier === 'tier1' && (
          <div className="space-y-3 w-full max-w-sm">
            <button
              onClick={async () => {
                try {
                  await grantTrial();
                  // Refresh to show unlocked content
                  window.location.reload();
                } catch (error) {
                  console.error('Error granting trial:', error);
                  alert('Failed to enable trial. Please try again.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Try for 24 hours
            </button>
            
            <button
              onClick={() => {
                if (onUpgrade) {
                  onUpgrade();
                } else {
                  window.location.href = '/pricing';
                }
              }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Upgrade to {tierRequired === 'tier2' ? 'Enhanced' : 'Premium'}
            </button>
          </div>
        )}

        {currentTier !== 'tier1' && (
          <button
            onClick={() => {
              if (onUpgrade) {
                onUpgrade();
              } else {
                window.location.href = '/pricing';
              }
            }}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Upgrade to {tierRequired === 'tier2' ? 'DIY Guide' : 'Hyperdrive'}
          </button>
        )}
      </div>
    </div>
  );
};

