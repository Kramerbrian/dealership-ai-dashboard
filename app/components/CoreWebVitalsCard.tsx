"use client";

import React from "react";
import type { CoreWebVitals } from "@/types/metrics";

export default function CoreWebVitalsCard({ data }: { data: CoreWebVitals }) {
  const lcpSec = (data.lcp_ms / 1000).toFixed(1);
  const lcpDeltaValue = data.lcp_delta_ms ? (data.lcp_delta_ms / 1000).toFixed(1) : null;
  const lcpDelta = lcpDeltaValue ? " (down " + lcpDeltaValue + " s)" : "";
  
  const clsStatus = data.cls <= 0.1 ? "[OK] Stable" : "[WARN] Jumpy";
  const inpStatus = data.inp_ms < 200 ? "[OK] Responsive" : "[WARN] Laggy";
  const lcpStatusGood = "[OK] Good" + lcpDelta;
  const lcpStatusWarn = "[WARN] Needs work" + lcpDelta;
  const lcpStatus = data.lcp_ms < 2500 ? lcpStatusGood : lcpStatusWarn;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Page Performance Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="font-semibold text-gray-900">Metric</div>
        <div className="font-semibold text-gray-900">Label</div>
        <div className="font-semibold text-gray-900">Meaning</div>
        <div className="font-semibold text-gray-900">Status</div>

        <div className="text-gray-700">Speed (LCP)</div>
        <div className="text-gray-700">Loads in ~{lcpSec} seconds</div>
        <div className="text-gray-600">How fast the biggest thing (photo or headline) appears. Under 2.5 s = feels snappy.</div>
        <div className="text-gray-700">{lcpStatus}</div>

        <div className="text-gray-700">Stability (CLS)</div>
        <div className="text-gray-700">Page stays steady</div>
        <div className="text-gray-600">Measures layout jumps while loading. Less than or equal to 0.1 = no annoying shifts.</div>
        <div className="text-gray-700">{clsStatus} ({data.cls})</div>

        <div className="text-gray-700">Response (INP)</div>
        <div className="text-gray-700">Reacts in {(data.inp_ms/1000).toFixed(2)} seconds</div>
        <div className="text-gray-600">How quickly the site responds when someone taps or clicks. Less than 0.2 s = feels instant.</div>
        <div className="text-gray-700">{inpStatus}</div>
      </div>
    </div>
  );
}
