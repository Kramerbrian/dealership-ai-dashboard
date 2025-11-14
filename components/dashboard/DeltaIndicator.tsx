"use client";
import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function DeltaIndicator({ delta, label }: { delta: number; label?: string }) {
  const isUp = delta >= 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const colorClass = isUp ? "text-emerald-300" : "text-rose-300";
  const textClass = isUp ? "text-emerald-200" : "text-rose-200";

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs">
      <Icon className={"h-3.5 w-3.5 " + colorClass} />
      <span className={textClass}>{isUp ? "+" : ""}{delta.toFixed(1)} pts</span>
      {label && <span className="ml-1 text-[11px] text-slate-400">{label}</span>}
    </div>
  );
}
