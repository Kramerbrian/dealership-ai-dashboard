'use client';
import useSWR from 'swr';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function WhatChangedAnalyzer() {
  const { data } = useSWR('/api/changes', fetcher);
  
  if (!data) return null;
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeltaColor = (delta: number) => {
    return delta > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-2">What Changed?</div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="font-medium">Total Changes</div>
          <div className="text-lg font-bold">{data.summary.total_changes}</div>
        </div>
        <div className="text-center">
          <div className="font-medium">Net Impact</div>
          <div className={`text-lg font-bold ${data.summary.total_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${data.summary.total_impact.toFixed(1)}K
          </div>
        </div>
      </div>

      {/* Changes List */}
      <ul className="text-sm space-y-2">
        {data.changes.map((c: any, i: number) => (
          <li key={i} className="border-t pt-2 first:border-t-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.metric}</span>
                  <span className={`text-sm font-semibold ${getDeltaColor(c.delta)}`}>
                    {c.delta > 0 ? `↑ +${c.delta}` : `↓ ${c.delta}`}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(c.severity)}`}>
                    {c.severity}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{c.cause}</div>
                <div className="text-xs text-gray-500 mt-1">{c.impact}</div>
              </div>
              <div className="text-xs text-gray-500 ml-2">
                {c.playbook !== 'None (auto-resolved)' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                    {c.playbook}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="text-[11px] text-gray-400 mt-2">
        Last updated: {new Date(data.last_updated).toLocaleString()}
      </div>
    </div>
  );
}
