"use client";
import React from "react";
import { ArrowUpRight, LineChart, ThermometerSun, Zap } from "lucide-react";

const baseItems = [
  {
    id: 1,
    icon: Zap,
    label: "Used prices climb toward 18-month high",
    body: "Wholesale lanes show +2.1% MoM; clean late-model SUVs and trucks leading.",
    impact: "+$420/unit potential if retail reacts in sync",
    action: "Open AIM valuation view"
  },
  {
    id: 2,
    icon: LineChart,
    label: "Zero-Click coverage lagging in Naples DMA",
    body: "Competitors appear in 3x more AI Overviews for 'oil change near me' queries.",
    impact: "Est. 18–22 lost ROs/mo",
    action: "View AEO checklist"
  },
  {
    id: 3,
    icon: ThermometerSun,
    label: "Review velocity cooling off",
    body: "Last 30 days: down 27% vs rolling 90-day avg; reply time creeping above 24h.",
    impact: "Trust Score drag of −3.4 pts if trend continues",
    action: "Open UGC playbook"
  }
];

export function PulseCardsPanel({ variant = "grid" }: { variant?: "grid"|"timeline" }) {
  if (variant === "timeline") {
    return (
      <div className="space-y-3">
        {baseItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="relative rounded-2xl border border-slate-800 bg-slate-950/80 p-3 transition-all hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-2">
                  <Icon className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.body}</p>
                  <p className="mt-2 text-xs font-medium text-emerald-300">{item.impact}</p>
                </div>
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800/80">
                {item.action}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {baseItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-3 transition-all hover:border-slate-700 hover:bg-slate-900/80"
          >
            <div className="flex items-start gap-2">
              <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-2">
                <Icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-200">{item.label}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{item.body}</p>
            <p className="mt-2 text-xs font-medium text-emerald-300">{item.impact}</p>
            <button className="mt-auto mt-3 flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800/80">
              {item.action}
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
