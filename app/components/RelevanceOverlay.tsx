import React from "react";
import { computeRI } from "@/app/lib/scoring/relevance";
import type { RelevanceInputs } from "@/types/metrics";

export default function RelevanceOverlay({ nodes }: { nodes: Array<RelevanceInputs & { name: string }> }) {
  // Minimal stub: map nodes to RI and render a simple list (replace with your heatmap/graph)
  const ranked = nodes.map(n => ({ name: n.name, ...computeRI(n) })).sort((a,b) => b.ri - a.ri);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Relevance Overlay</h3>
        <span className="text-xs text-gray-500">dealershipAI shows what to fix next — see sound bite</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="py-2 font-semibold text-gray-900">Source</th>
            <th className="py-2 font-semibold text-gray-900">RI</th>
            <th className="py-2 font-semibold text-gray-900">Visibility</th>
            <th className="py-2 font-semibold text-gray-900">Proximity</th>
            <th className="py-2 font-semibold text-gray-900">Authority</th>
            <th className="py-2 font-semibold text-gray-900">Schema Weight</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(r => (
            <tr key={r.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-2 font-medium text-gray-900">{r.name}</td>
              <td className="py-2 text-gray-700">{r.ri.toFixed(3)}</td>
              <td className="py-2 text-gray-700">{r.visibility.toFixed(2)}</td>
              <td className="py-2 text-gray-700">{r.proximity.toFixed(2)}</td>
              <td className="py-2 text-gray-700">{r.authority.toFixed(2)}</td>
              <td className="py-2 text-gray-700">{r.scsWeight.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
