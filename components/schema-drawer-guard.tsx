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
  const trials = useTrialStatus();
  const s = trials.get("schema_fix");
  const unlocked = tier >= 2 || s.active;
  const label = s.active ? `${trials.format(s.msLeft)} left` : "Trial inactive";

  // Determine if content should be unlocked
  const isUnlocked = tier >= 2 || s.active;

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

  return (
    <div className="relative">
      {s.active && tier < 2 && <TrialChip label={label} />}
      <div aria-disabled={!unlocked} className={!unlocked ? "pointer-events-none select-none opacity-40" : ""}>
        {children}
      </div>
      {!unlocked && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-xl border border-white/15 bg-black/60 p-4 text-center text-sm text-white">
            <div className="mb-2 font-semibold">Schema Auditor is locked on Basic</div>
            <div className="mb-3 text-white/80">Enable a 24h trial from Pricing to view schema validation & JSON-LD fixes.</div>
            <button onClick={() => (window.location.href = "/pricing")} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90">
              Go to Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
