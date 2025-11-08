"use client";
import React, { useEffect, useState } from "react";

const EXAMPLES = [
  { id: 1, txt: "Naples Toyota +6% zero-click in 48h" },
  { id: 2, txt: "Austin VW cut response time −40%" },
  { id: 3, txt: "Boston Honda +12 reviews this week" },
  { id: 4, txt: "Denver EV dealer matched Model 3 price" },
];

export default function LiveActivityFeed() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setTimeout(() => setIdx((i) => (i + 1) % EXAMPLES.length), 0),
      3000
    );
    return () => clearInterval(t);
  }, []);

  const item = EXAMPLES[idx];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Live activity</div>
        <div className="text-lg">{item.txt}</div>
      </div>
    </div>
  );
}
