'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { DrawerGuardProps } from './types';
import { useTrialFeature } from '@/lib/hooks/useTrialFeature';

/**
 * MysteryShopGuard
 * 
 * Protects Mystery Shop feature with tier-based access:
 * - Tier ≥ 2 → unlocked
 * - Tier 1 + active trial cookie → unlocked
 * - Else → gray overlay with "Enable 24h Trial" and Upgrade buttons
 */
export function MysteryShopGuard({ tier, children }: DrawerGuardProps) {
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const { data: trialStatus, mutate: checkTrial } = useTrialFeature('mystery_shop');

  useEffect(() => {
    if (trialStatus?.is_active) {
      setIsTrialActive(true);
    }
  }, [trialStatus]);

  // Tier ≥ 2 → unlocked
  if (tier >= 2) {
    return <>{children}</>;
  }

  // Tier 1 + active trial → unlocked
  if (tier === 1 && isTrialActive) {
    return <>{children}</>;
  }

  // Else → show overlay
  const handleEnableTrial = async () => {
    setIsGranting(true);
    try {
      const response = await fetch('/api/trial/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_id: 'mystery_shop' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsTrialActive(true);
          // Refresh trial status
          checkTrial();
        }
      }
    } catch (error) {
      console.error('Failed to grant trial:', error);
    } finally {
      setIsGranting(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing?upgrade=pro';
  };

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block">
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mystery Shop Simulator
          </h3>

          <p className="text-sm text-gray-600 mb-6 max-w-sm">
            This feature requires Pro tier or higher. Try it free for 24 hours!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={handleEnableTrial}
              disabled={isGranting}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
            >
              {isGranting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Enabling...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Enable 24h Trial</span>
                </>
              )}
            </button>

            <button
              onClick={handleUpgrade}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              <span>Upgrade</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            No credit card required for trial
          </p>
        </div>
      </div>
    </div>
  );
}

