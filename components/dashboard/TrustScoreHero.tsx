"use client";
import React from "react";
import { DeltaIndicator } from "@/components/dashboard/DeltaIndicator";

interface Props {
  score: number;
  delta: number;
  trustLabel: string;
}

export function TrustScoreHero({ score, delta, trustLabel }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-4 shadow-[0_16px_60px_rgba(15,23,42,0.85)]">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{
        backgroundImage: "radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.28),_transparent_55%)"
      }} />
      <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Algorithmic Trust Score</p>
          <p className="mt-1 max-w-xl text-sm text-slate-300">
            How much the AI ecosystem believes what your dealership publishes — based on schema, reviews, consistency, and AI mentions.
          </p>
        </div>
        <div className="flex items-end gap-6">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Trust Score</p>
            <p className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-4xl font-black text-transparent">
              {score}
            </p>
            <p className="mt-1 text-xs text-slate-300">Status: <span className="font-semibold text-emerald-300">{trustLabel}</span></p>
          </div>
          <DeltaIndicator delta={delta} label="vs last 7 days" />
        </div>
      </div>
    </div>
  );
}
