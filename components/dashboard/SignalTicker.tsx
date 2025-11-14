"use client";
import React from "react";

export function SignalTicker() {
  const signals = [
    "🔥 New: Used prices climb toward 18-month high",
    "📊 Zero-Click coverage lagging in Naples DMA",
    "⚠️ Review velocity cooling off (-27% vs 90d avg)",
    "✅ Schema coverage improved to 94%",
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950/90 to-slate-900/80 px-4 py-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
          Live Pulse
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll flex gap-8 whitespace-nowrap text-sm text-slate-300">
            {signals.concat(signals).map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
