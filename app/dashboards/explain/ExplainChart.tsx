"use client";

import React, { useEffect, useState } from "react";

interface ChartData {
  image_path: string;
  values: Record<string, number>;
}

export default function ExplainChart({ decisionId, decision }: { decisionId: string; decision?: any }) {
  const [chart, setChart] = useState<string>();
  const [vals, setVals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!decision && !decisionId) return;

    const payload = decision || { id: decisionId };

    fetch("/api/explain/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((d: ChartData) => {
        if (d.error) {
          setError(d.error);
        } else {
          setChart(d.image_path);
          setVals(d.values || {});
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [decisionId, decision]);

  if (loading) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-lg">
        <div className="animate-pulse">Generating chart…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-lg">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-4 rounded-lg">
      {chart ? (
        <img src={`/${chart.replace(/^\/tmp\//, "")}`} alt="Feature Contributions" className="w-full" />
      ) : (
        <div>No chart available</div>
      )}
      <ul className="text-sm mt-2 space-y-1">
        {Object.entries(vals)
          .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
          .map(([f, v]) => (
            <li key={f} className="flex justify-between">
              <span>{f}:</span>
              <span className={v > 0 ? "text-green-400" : "text-red-400"}>
                {v.toFixed(3)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

