"use client";

import { motion } from "framer-motion";
import { X, Zap, Clock, DollarSign, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface FixTierDrawerProps {
  open: boolean;
  onClose: () => void;
  preview: {
    summary: string;
    diff: string;
    risk: 'low' | 'medium' | 'high';
    etaSeconds: number;
    projectedDeltaUSD: number;
  } | null;
  onApply: () => Promise<{ ok: boolean; receiptId?: string }>;
  onAutopilot: () => Promise<{ ok: boolean }>;
  onUndo: () => Promise<{ ok: boolean }>;
}

export default function FixTierDrawer({
  open,
  onClose,
  preview,
  onApply,
  onAutopilot,
  onUndo,
}: FixTierDrawerProps) {
  const [applying, setApplying] = useState(false);
  const [tier, setTier] = useState<'quick' | 'standard' | 'comprehensive'>('standard');

  if (!open || !preview) return null;

  const riskColors = {
    low: "text-emerald-400 border-emerald-500/40 bg-emerald-900/20",
    medium: "text-amber-400 border-amber-500/40 bg-amber-900/20",
    high: "text-red-400 border-red-500/40 bg-red-900/20",
  }[preview.risk];

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply();
      onClose();
    } catch (error) {
      console.error("Failed to apply fix:", error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        className="absolute right-0 top-0 w-[420px] h-full bg-neutral-900 text-white border-l border-neutral-800 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Deploy Fix</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <section>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Summary</h3>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-white font-medium">{preview.summary}</div>
            </div>
          </section>

          {/* Details */}
          <section>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Details</h3>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono">
                {preview.diff}
              </pre>
            </div>
          </section>

          {/* Impact Metrics */}
          <section className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-emerald-400" />
                <div className="text-xs text-white/60">Projected Impact</div>
              </div>
              <div className="text-2xl font-semibold text-emerald-400">
                +${(preview.projectedDeltaUSD / 1000).toFixed(1)}K/mo
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-sky-400" />
                <div className="text-xs text-white/60">Estimated Time</div>
              </div>
              <div className="text-2xl font-semibold text-sky-400">
                ~{Math.round(preview.etaSeconds / 60)} min
              </div>
            </div>
          </section>

          {/* Risk Assessment */}
          <section>
            <div className={`p-4 rounded-lg border ${riskColors}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} />
                <div className="text-sm font-medium">Risk Level</div>
              </div>
              <div className="text-sm text-white/80 capitalize">{preview.risk}</div>
            </div>
          </section>

          {/* Tier Selection */}
          <section>
            <h3 className="text-sm font-semibold text-white/80 mb-3">Deployment Tier</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                <input
                  type="radio"
                  name="tier"
                  value="quick"
                  checked={tier === 'quick'}
                  onChange={() => setTier('quick')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Quick Fix</div>
                  <div className="text-xs text-white/60">Fast deployment, minimal validation</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                <input
                  type="radio"
                  name="tier"
                  value="standard"
                  checked={tier === 'standard'}
                  onChange={() => setTier('standard')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Standard</div>
                  <div className="text-xs text-white/60">Full validation, staging preview</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                <input
                  type="radio"
                  name="tier"
                  value="comprehensive"
                  checked={tier === 'comprehensive'}
                  onChange={() => setTier('comprehensive')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Comprehensive</div>
                  <div className="text-xs text-white/60">Full audit, rollback plan, monitoring</div>
                </div>
              </label>
            </div>
          </section>

          {/* Actions */}
          <section className="pt-4 border-t border-neutral-800 space-y-3">
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Apply Fix
                </>
              )}
            </button>

            <button
              onClick={async () => {
                await onAutopilot();
                onClose();
              }}
              className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              Enable Autopilot
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-lg border border-white/20 hover:bg-white/10 text-white"
            >
              Cancel
            </button>
          </section>
        </div>
      </motion.aside>
    </div>
  );
}

