"use client";
import React from "react";
import { MetricTrendSpark } from "@/components/dashboard/MetricTrendSpark";

interface Props {
  title: string;
  score: number;
  status: string;
}

export function PillarCard({ title, score, status }: Props) {
  const color = score >= 85 ? "text-emerald-300" : score >= 70 ? "text-cyan-300" : "text-amber-300";
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <div>
        <p className="text-xs text-slate-400">{title}</p>
        <p className={`mt-1 text-2xl font-bold ${color}`}>{score}</p>
        <p className="text-xs text-slate-400">{status}</p>
      </div>
      <div className="mt-2">
        <MetricTrendSpark />
      </div>
    </div>
  );
}
