"use client";

import React, { useEffect, useState } from "react";

interface Explanation {
  id: number;
  dealer_id: string;
  schema_type: string;
  narrative: string;
  decision_time: string;
  score: number;
}

export default function ExplainCard() {
  const [items, setItems] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/explain/recent")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 text-white p-4 rounded-lg">
        <div className="animate-pulse">Loading explanations...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 text-white p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Recent AI Decisions</h2>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-slate-400">No decisions recorded yet.</li>
        ) : (
          items.map((x) => (
            <li key={x.id} className="border-b border-slate-600 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <b>{x.dealer_id}</b> — {x.schema_type}
                  <br />
                  <small className="text-slate-400">{x.narrative}</small>
                </div>
                <div className="text-xs text-slate-500 ml-4">
                  Score: {x.score.toFixed(2)}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

