"use client";

import { motion } from "framer-motion";
import { X, ArrowRight, Coins, BadgeCheck } from "lucide-react";

export type ScanSummary = {
  avi?: number;
  zero_click?: number;
  review_trust?: number;
  schema?: number;
  geo?: number;
  cwv?: { lcp: string; inp: string; cls: string };
  rar_monthly?: number;
};

export default function ScanSummaryModal({
  open,
  onClose,
  onOpenRAR,
  onOpenQAI,
  summary
}: {
  open: boolean;
  onClose: () => void;
  onOpenRAR: () => void;
  onOpenQAI: () => void;
  summary: ScanSummary | null;
}) {
  if (!open || !summary) return null;

  const k = (v?: number | string) => (v === 0 || v ? v : "—");

  return (
    <div className="fixed inset-0 z-[98]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="absolute left-1/2 -translate-x-1/2 top-16 w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-lg font-semibold">Cognitive Scan Summary</div>
          <button className="p-2 text-white/70 hover:text-white" onClick={onClose}><X/></button>
        </div>

        <div className="p-5 space-y-6">
          {/* headline row */}
          <div className="grid grid-cols-3 gap-4">
            <Kpi title="AI Visibility" value={k(summary.avi) + "%"} tone="blue"/>
            <Kpi title="Zero-Click" value={k(summary.zero_click) + "%"} tone="amber"/>
            <Kpi title="Review Trust" value={k(summary.review_trust)} tone="green"/>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Kpi title="Schema Coverage" value={k(summary.schema) + "%"} tone="green"/>
            <Kpi title="GEO Integrity" value={k(summary.geo) + "%"} tone="blue"/>
            <div className="p-4 rounded-xl border border-white/10 bg-white/8">
              <div className="text-xs text-white/60">Core Web Vitals</div>
              <div className="mt-1 space-x-2 text-sm">
                <Badge title="LCP" value={summary.cwv?.lcp}/>
                <Badge title="INP" value={summary.cwv?.inp}/>
                <Badge title="CLS" value={summary.cwv?.cls}/>
              </div>
            </div>
          </div>

          {/* RaR callout */}
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/40 flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Revenue at Risk (monthly)</div>
              <div className="text-3xl font-light text-red-300">${(summary.rar_monthly || 0).toLocaleString()}</div>
            </div>
            <button
              onClick={onOpenRAR}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              aria-label="Open Revenue at Risk"
            >
              <Coins size={16}/> Open RaR
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              label="Open Quality Authority Index (QAI)"
              onClick={onOpenQAI}
            />
            <ActionButton
              label="Review Fix Pack"
              onClick={() => {
                const e = new CustomEvent("open-fix-pack");
                window.dispatchEvent(e);
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Kpi({ title, value, tone }: { title: string; value: string|number; tone: "blue"|"green"|"amber"|"red" }) {
  const toneClass = {
    blue:  "bg-sky-900/20 border-sky-500/40 text-sky-300",
    green: "bg-emerald-900/20 border-emerald-500/40 text-emerald-300",
    amber: "bg-amber-900/20 border-amber-500/40 text-amber-300",
    red:   "bg-red-900/20 border-red-500/40 text-red-300"
  }[tone];
  return (
    <div className={`p-4 rounded-xl border ${toneClass}`}>
      <div className="text-xs text-white/70">{title}</div>
      <div className="text-3xl font-light">{value}</div>
    </div>
  );
}

function Badge({ title, value }:{ title:string; value:any }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/10">
      <BadgeCheck size={12}/><span className="text-white/80 text-xs">{title}: {value ?? "—"}</span>
    </span>
  );
}

function ActionButton({ label, onClick }:{ label:string; onClick: ()=>void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 hover:bg-white/12 text-left flex items-center justify-between"
    >
      <span className="text-sm">{label}</span>
      <ArrowRight size={18} className="text-white/70"/>
    </button>
  );
}

