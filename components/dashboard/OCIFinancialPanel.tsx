"use client";
import React from "react";

interface Props {
  monthlyRisk: number;
  topIssues: string[];
}

export function OCIFinancialPanel({ monthlyRisk, topIssues }: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/85 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-rose-300">Opportunity Cost of Inaction</p>
      <p className="mt-2 text-sm text-slate-300">Estimated monthly revenue at risk from unfixed AI visibility gaps.</p>
      <p className="mt-4 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-3xl font-black text-transparent">
        ${monthlyRisk.toLocaleString()}/mo
      </p>
      <p className="mt-1 text-[11px] text-slate-400">Based on trust, schema, zero-click and UGC gaps across your current footprint.</p>
      <div className="mt-4 space-y-1 text-xs text-slate-300">
        {topIssues.map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>{i}</span>
          </div>
        ))}
      </div>
      <button className="mt-auto mt-4 rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20">
        Generate 14-day fix plan
      </button>
    </div>
  );
}
