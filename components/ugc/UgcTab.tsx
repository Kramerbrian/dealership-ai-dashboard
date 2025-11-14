"use client";

import React, { useEffect, useState } from "react";
import { Check, Download, AlertTriangle } from "lucide-react";

import { RedditUGCFeed } from '@/components/ugc/RedditUGCFeed';

export default function UgcTab({ dealer }: { dealer: string }) {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    fetch(`/api/ugc?dealer=${encodeURIComponent(dealer)}`)
      .then(r => r.json())
      .then(setData);
  }, [dealer]);

  if (!data) return <div className="text-gray-500">Loading mentions…</div>;

  const csv = () => {
    const rows = ["platform,author,excerpt,sentiment,timestamp"].concat(
      data.feed.map((f: any) => [
        f.platform,
        f.author,
        `"${(f.excerpt || '').replaceAll('"', "'")}"`,
        f.sentiment,
        f.timestamp
      ].join(","))
    ).join("\n");
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ugc_${dealer}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${
        data.alert ? "border-amber-300 bg-amber-50" : "border-green-200 bg-green-50"
      }`}>
        <div className="flex items-center gap-2 text-sm">
          {data.alert ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <b>Alert:</b> {data.alert}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <b>All Good:</b> No critical UGC risks detected
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Metric title="Mentions (7d)" value={data.summary.mentions7d} />
        <Metric title="Positive %" value={`${Math.round(data.summary.positive * 100)}%`} />
        <Metric title="Avg Response (h)" value={data.summary.avgResponseHrs} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700">Live Feed</div>
          <button
            onClick={csv}
            className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <ul className="divide-y">
          {data.feed.map((f: any) => (
            <li key={f.id} className="py-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">
                  {f.platform} · @{f.author}
                </div>
                <div className={`text-xs ${
                  f.sentiment === 'positive' ? 'text-green-600' :
                  f.sentiment === 'negative' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {f.sentiment}
                </div>
              </div>
              <div className="text-gray-700 mt-1">{f.excerpt}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(f.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Reddit UGC Feed */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Reddit Mentions</h3>
        <RedditUGCFeed 
          dealershipName={dealer}
          limit={10}
        />
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

