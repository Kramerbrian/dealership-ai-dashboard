"use client";

/**
 * Schema Drawer Guard Component
 * 
 * Unlocks Schema panel on Tier ≥2, or Tier-1 with an active 24h trial.
 * Otherwise overlays a gray CTA with a one-click trial grant.
 * 
 * Usage:
 * ```tsx
 * <SchemaDrawerGuard tier={tier}>
 *   {/* your existing schema audit UI */}
 * </SchemaDrawerGuard>
 * ```
 */

import React, { useEffect } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialStatus';

function TrialChip({ label }: { label: string }) {
  return (
    <span className="absolute right-3 top-3 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
      {label}
    </span>
  );
}

interface SchemaDrawerGuardProps {
  tier: 1 | 2 | 3;
  children: React.ReactNode;
}

export function SchemaDrawerGuard({ tier, children }: SchemaDrawerGuardProps) {
  const trial = useTrialStatus();
  const status = trial.get("schema_fix");
  const unlocked = tier >= 2 || status.active;
  const label = status.active ? `${trial.format(status.msLeft)} left` : "Trial inactive";

  // Auto-dismiss overlay when trial fires
  useEffect(() => {
    const onGrant = () => { /* hook refresh already runs; no-op here */ };
    window.addEventListener("dai:trial_granted", onGrant as any);
    return () => window.removeEventListener("dai:trial_granted", onGrant as any);
  }, []);

  // Determine if content should be unlocked
  const isUnlocked = tier >= 2 || status.active;

  // Handle trial grant
  const handleGrantTrial = async () => {
    try {
      const response = await fetch('/api/trial/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          feature_id: 'schema_fix',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store in localStorage for immediate client-side checks
        if (data.data) {
          localStorage.setItem(`dai:trial:schema_fix`, JSON.stringify({
            feature_id: data.data.feature_id,
            unlocked_at: new Date().toISOString(),
            expires_at: data.data.expires_at,
          }));
        }
        
        // Fire event to refresh hook
        window.dispatchEvent(new Event("dai:trial_granted"));
      }
    } catch (error) {
      console.error('Failed to grant trial:', error);
    }
  };

  // If unlocked, show children with trial chip if applicable
  if (isUnlocked) {
    return (
      <div className="relative">
        {status.active && tier < 2 && <TrialChip label={label} />}
        {children}
      </div>
    );
  }

  // Else show overlay
  return (
    <div className="relative">
      <div aria-disabled={!unlocked} className={!unlocked ? "pointer-events-none select-none opacity-40" : ""}>
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-black/80 backdrop-blur-sm">
        <div className="mx-4 max-w-sm rounded-xl border border-white/10 bg-gray-900/95 p-6 text-center text-white">
          {/* Icon */}
          <div className="mb-4 rounded-full bg-gray-700/50 p-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          
          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-white">
            Schema Auditor is locked
          </h3>
          
          {/* Description */}
          <p className="mb-6 max-w-sm text-sm text-gray-400">
            {tier === 1 
              ? 'Upgrade to Enhanced (Tier 2) or try it free for 24 hours'
              : 'This feature requires Enhanced (Tier 2) or higher'}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {tier === 1 && (
              <button
                onClick={handleGrantTrial}
                className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Try for 24 hours
              </button>
            )}
            
            <button
              onClick={() => {
                window.location.href = '/pricing';
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Upgrade to Enhanced
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
