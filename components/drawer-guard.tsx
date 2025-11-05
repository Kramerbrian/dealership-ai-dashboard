"use client";

/**
 * Generic Drawer Guard Component
 * 
 * Unlocks features on Tier ≥ requiredTier, or Tier-1 with an active 24h trial.
 * Otherwise overlays a gray CTA with a one-click trial grant.
 * 
 * Usage:
 * ```tsx
 * <DrawerGuard tier={tier} featureId="schema_fix" requiredTier={2}>
 *   {/* your existing feature UI */}
 * </DrawerGuard>
 * ```
 */

import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { isTrialActive, fetchActiveTrials } from '@/lib/utils/trial-feature';

interface DrawerGuardProps {
  tier: 1 | 2 | 3;
  featureId: string;
  requiredTier: 2 | 3;
  featureName?: string;
  children: React.ReactNode;
  description?: string;
}

const FEATURE_NAMES: Record<string, string> = {
  schema_fix: 'Schema Auditor',
  zero_click_drawer: 'Zero-Click Drawer',
  mystery_shop: 'Mystery Shop Simulator',
  competitor_analysis: 'Competitor Battle Plan',
  autonomous_fix_engine: 'Autonomous Fix Engine',
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  schema_fix: 'Schema validation, JSON-LD fix generator, and implementation recommendations',
  zero_click_drawer: 'Interactive Zero-Click coverage analysis and recovery playbook',
  mystery_shop: 'AI-powered mystery shopping scenarios and recommendations',
  competitor_analysis: 'Top-5 competitor analysis and battle plan',
  autonomous_fix_engine: 'Autonomous execution with compounding optimizations',
};

export function DrawerGuard({ 
  tier, 
  featureId, 
  requiredTier,
  featureName,
  children,
  description,
}: DrawerGuardProps) {
  const [trialActive, setTrialActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);

  const displayName = featureName || FEATURE_NAMES[featureId] || featureId;
  const displayDescription = description || FEATURE_DESCRIPTIONS[featureId] || '';

  // Check trial status on mount
  useEffect(() => {
    const checkTrial = async () => {
      setLoading(true);
      
      // Check localStorage first (fast)
      const localActive = isTrialActive(featureId);
      
      // Also check API for server-side cookies
      const activeTrials = await fetchActiveTrials();
      const apiActive = activeTrials.includes(featureId);
      
      setTrialActive(localActive || apiActive);
      setLoading(false);
    };
    
    checkTrial();
  }, [featureId]);

  // Determine if content should be unlocked
  const isUnlocked = tier >= requiredTier || trialActive;

  // Handle trial grant
  const handleGrantTrial = async () => {
    setGranting(true);
    
    try {
      const response = await fetch('/api/trial/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          feature_id: featureId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store in localStorage for immediate client-side checks
        if (data.data) {
          localStorage.setItem(`dai:trial:${featureId}`, JSON.stringify({
            feature_id: data.data.feature_id,
            unlocked_at: new Date().toISOString(),
            expires_at: data.data.expires_at,
          }));
        }
        
        // Update state
        setTrialActive(true);
        
        // Show success message
        alert(`${displayName} unlocked for 24 hours!`);
      } else {
        throw new Error(data.error || 'Failed to grant trial');
      }
    } catch (error) {
      console.error('Trial grant error:', error);
      alert('Failed to enable trial. Please try again.');
    } finally {
      setGranting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-white/60">Checking access...</div>
        </div>
      </div>
    );
  }

  // Show unlocked content
  if (isUnlocked) {
    return <>{children}</>;
  }

  // Show locked state with CTA
  const tierName = requiredTier === 2 ? 'DIY Guide' : 'Hyperdrive';
  
  return (
    <div className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
      {/* Overlay gradient */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-12">
        {/* Lock icon */}
        <div className="mb-4 rounded-full bg-gray-700/50 p-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        
        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-white">
          {displayName} is locked
        </h3>
        
        {/* Description */}
        <p className="mb-6 max-w-sm text-sm text-gray-400">
          {tier === 1 
            ? `Upgrade to ${tierName} (Tier ${requiredTier}) or try it free for 24 hours`
            : `This feature requires ${tierName} (Tier ${requiredTier}) or higher`}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {tier === 1 && (
            <button
              onClick={handleGrantTrial}
              disabled={granting}
              className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {granting ? 'Unlocking...' : 'Try for 24 hours'}
            </button>
          )}
          
          <button
            onClick={() => {
              window.location.href = '/pricing';
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Upgrade to {tierName}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature preview hint */}
        {tier === 1 && displayDescription && (
          <p className="mt-6 text-xs text-gray-500">
            <Sparkles className="inline w-3 h-3 mr-1" />
            Trial unlocks: {displayDescription}
          </p>
        )}
      </div>
    </div>
  );
}

// Re-export as SchemaDrawerGuard for convenience
export { DrawerGuard as SchemaDrawerGuard };

