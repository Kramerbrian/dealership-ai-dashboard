"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calculator, ShieldCheck, Loader2 } from "lucide-react";
import { getApiBase } from "@/lib/apiConfig";

type FixKind = "schema" | "review" | "cwv" | "nap";

export default function FixPackDrawer({
  domain,
  open,
  onClose
}: { domain: string; open: boolean; onClose: () => void }) {
  const base = getApiBase();
  const [selected, setSelected] = useState<FixKind[]>(["schema", "review", "cwv"]);
  const [estimating, setEstimating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  useEffect(() => {
    if (!open) {
      setEstimate(null);
      setSelected(["schema", "review", "cwv"]);
    }
  }, [open]);

  const disabledDeploy = selected.length === 0 || deploying;

  const toggle = (k: FixKind) =>
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  async function handleEstimate() {
    try {
      setEstimating(true);
      const res = await fetch(`${base}/fix/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, kinds: selected })
      });
      const json = await res.json();
      setEstimate(json);
    } finally {
      setEstimating(false);
    }
  }

  async function handleDeploy() {
    try {
      setDeploying(true);
      const res = await fetch(`${base}/fix/pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, kinds: selected })
      });
      const json = await res.json();
      console.log("Fix Pack jobs:", json);
      onClose();
    } finally {
      setDeploying(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[96]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.aside
        initial={{ x: 440, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 440, opacity: 0 }}
        className="absolute right-0 top-0 w-[440px] h-full bg-white/5 backdrop-blur-xl border-l border-white/10 text-white"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="text-xs text-white/60">Fix Pack</div>
            <div className="text-lg font-semibold">{domain}</div>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
            <X />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
          {/* Fix selection */}
          <section className="p-4 rounded-xl bg-white/8 border border-white/10">
            <div className="text-sm font-semibold mb-3">Choose fixes</div>
            <div className="grid grid-cols-2 gap-2">
              {(["schema","review","cwv","nap"] as FixKind[]).map((k) => (
                <label key={k} className="flex items-center gap-2 p-2 rounded bg-white/6 hover:bg-white/12 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(k)}
                    onChange={() => toggle(k)}
                  />
                  <span className="capitalize">{k}</span>
                </label>
              ))}
            </div>

            <div className="mt-3">
              <button
                onClick={handleEstimate}
                disabled={estimating || selected.length === 0}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm"
              >
                {estimating ? <Loader2 className="animate-spin" /> : <Calculator size={16} />}
                Estimate Recovery
              </button>
            </div>
          </section>

          {/* Estimate result */}
          {estimate && (
            <section className="p-4 rounded-xl bg-white/8 border border-white/10">
              <div className="text-sm font-semibold mb-2">Projected Recovery</div>
              <div className="text-3xl font-light text-emerald-400">
                +${estimate.estimatedRecovery.toLocaleString()} <span className="text-white/60 text-sm">/mo</span>
              </div>
              <div className="text-xs text-white/60 mt-1">
                Confidence: {(estimate.confidence * 100).toFixed(0)}%
              </div>

              <div className="mt-3 text-xs text-white/60">Breakdown</div>
              <div className="mt-1 space-y-2">
                {estimate.breakdown.map((b: any, i: number) => (
                  <div key={i} className="p-3 rounded bg-white/6 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="capitalize text-sm">{b.kind}</div>
                      <div className="text-sm text-emerald-300">
                        +${b.lift.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-white/60 mt-1">{b.notes}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deploy */}
          <section className="p-4 rounded-xl bg-white/8 border border-white/10">
            <div className="text-sm font-semibold mb-2">Deploy</div>
            <div className="text-xs text-white/60 mb-3">
              This will queue {selected.length} job{selected.length !== 1 ? "s" : ""}:
              {" "}{selected.join(", ")}. You'll see proof in the Decision Feed.
            </div>
            <button
              onClick={handleDeploy}
              disabled={disabledDeploy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
            >
              {deploying ? <Loader2 className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>{deploying ? "Deploying…" : "Deploy Fix Pack"}</span>
            </button>
          </section>
        </div>
      </motion.aside>
    </div>
  );
}
