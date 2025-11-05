'use client';

import React, { useEffect } from 'react';
import { Clock, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { DrawerGuardProps } from './types';
import { useTrialStatus } from '@/hooks/useTrialStatus';

function TrialChip({ label }: { label: string }) {
  return (
    <span className="absolute right-3 top-3 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
      {label}
    </span>
  );
}

/**
 * MysteryShopGuard
 * 
 * Protects Mystery Shop feature with tier-based access:
 * - Tier ≥ 2 → unlocked
 * - Tier 1 + active trial cookie → unlocked
 * - Else → gray overlay with "Enable 24h Trial" and Upgrade buttons
 */
export function MysteryShopGuard({ tier, children }: DrawerGuardProps) {
  const trials = useTrialStatus();
  const s = trials.get("mystery_shop");
  const unlocked = tier >= 2 || s.active;
  const label = s.active ? `${trials.format(s.msLeft)} left` : "Trial inactive";

  return (
    <div className="relative">
      {s.active && tier < 2 && <TrialChip label={label} />}
      <div aria-disabled={!unlocked} className={!unlocked ? "pointer-events-none select-none opacity-40" : ""}>
        {children}
      </div>
      {!unlocked && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-xl border border-white/15 bg-black/60 p-4 text-center text-sm text-white">
            <div className="mb-2 font-semibold">Mystery Shop Simulator is locked on Basic</div>
            <div className="mb-3 text-white/80">Enable a 24h trial from Pricing to view AI-powered mystery shopping scenarios.</div>
            <button onClick={() => (window.location.href = "/pricing")} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90">
              Go to Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
