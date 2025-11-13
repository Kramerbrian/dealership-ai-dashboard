"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, TrendingDown, ShieldCheck, Loader2, Package } from "lucide-react";
import { useRar } from "@/app/(dashboard)/hooks/useRar";
import { getApiBase } from "@/lib/apiConfig";
import FixPackDrawer from "./FixPackDrawer";

type Props = {
  domain: string;
  open: boolean;
  onClose: () => void;
};

export default function RaRModal({ domain, open, onClose }: Props) {
  const { rar, rarError, rarLoading, refreshRar } = useRar(domain);
  const [simDelta, setSimDelta] = useState<number>(10); // simulate +10% improvement default
  const [deploying, setDeploying] = useState(false);
  const [showFixPack, setShowFixPack] = useState(false);

  useEffect(() => {
    if (open) refreshRar();
  }, [open, refreshRar]);

  const monthly = rar?.monthly ?? 0;
  const confidence = rar?.confidence ?? 0.0;
  const annual = rar?.annual ?? 0;
  const drivers = rar?.drivers ?? [];

  const projectedRecovery = useMemo(() => {
    // Example: assume 1% improvement yields 1% reduction of RaR
    const rec = (monthly * (simDelta / 100));
    return Math.round(rec);
  }, [monthly, simDelta]);

  async function handleDeployFix() {
    try {
      setDeploying(true);
      const base = getApiBase();
      // Example: orchestrate a "fix pack" – schema + review + cwv
      const payloads = [
        { kind: "schema", domain },
        { kind: "review", domain },
        { kind: "cwv",    domain }
      ];
      await Promise.all(
        payloads.map((p) =>
          fetch(`${base}/fix/deploy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p)
          })
        )
      );
      await refreshRar();
    } catch (e) {
      console.error(e);
    } finally {
      setDeploying(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white/95 backdrop-blur-xl border-l border-white/10 p-6 text-gray-900 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-600/20 text-red-600">
              <TrendingDown size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold">Revenue at Risk</div>
              <div className="text-xs text-gray-600">{domain}</div>
            </div>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Loading state */}
        {rarLoading && (
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin" />
            <div>Calculating revenue risk…</div>
          </div>
        )}
        {rarError && <div className="text-red-400 text-sm">Error: {String(rarError)}</div>}

        {!rarLoading && !rarError && rar && (
          <>
            {/* KPI Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/80 border border-gray-200">
                <div className="text-sm text-gray-600">Monthly RaR</div>
                <div className="text-3xl font-light text-red-600">${monthly.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Confidence: {(confidence * 100).toFixed(0)}%</div>
              </div>
              <div className="p-4 rounded-xl bg-white/80 border border-gray-200">
                <div className="text-sm text-gray-600">Annualized RaR</div>
                <div className="text-3xl font-light">${annual.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/80 border border-gray-200">
                <div className="text-sm text-gray-600">Projected Recovery</div>
                <div className="text-3xl font-light text-emerald-600">
                  +${projectedRecovery.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Top Drivers</div>
                <div className="text-xs text-gray-600">% of risk contribution</div>
              </div>
              <div className="space-y-2">
                {drivers.map((d, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{d.label}</div>
                      <div className="text-sm text-gray-700">{Math.round(d.impact)}%</div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-red-500 rounded"
                        style={{ width: `${Math.min(100, Math.max(0, d.impact))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation */}
            <div className="mb-6 bg-gray-50 rounded p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Simulate Recovery</div>
                <div className="text-sm text-gray-600">{simDelta}% improvement</div>
              </div>
              <input
                type="range"
                className="w-full"
                min={0}
                max={50}
                step={1}
                value={simDelta}
                onChange={(e) => setSimDelta(parseInt(e.target.value, 10))}
              />
              <div className="text-xs text-gray-600 mt-1">
                Move the slider to simulate how a {simDelta}% improvement in root causes impacts RaR.
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFixPack(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Package size={16} />
                <span>Open Fix Pack</span>
              </button>
              <button
                onClick={handleDeployFix}
                disabled={deploying}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                {deploying ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                <span>{deploying ? "Deploying…" : "Quick Deploy"}</span>
              </button>
              <button
                onClick={() => {
                  // Example: open proof route or spawn a proof modal
                  window.open(`/proofs?domain=${encodeURIComponent(domain)}&type=rar`, "_blank");
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                View Proof
              </button>
              <button
                onClick={() => alert(`Simulated +$${projectedRecovery.toLocaleString()} recovery at ${simDelta}% improvement`)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Run Simulation
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

