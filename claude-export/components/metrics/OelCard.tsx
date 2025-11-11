'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/orchestratorClient';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

type OelData = {
  oel: number;
  oelAdjusted: number;
  score: number;
  wastedSpend: number;
  lostLeads: number;
  recovered: number;
  rootCauses: Array<{ type: string; impact: number }>;
  breakdown: {
    wastedAdSpend: number;
    lostQualifiedLeads: number;
    recovered: number;
    netLoss: number;
  };
};

export default function OelCard({ domain }: { domain: string }) {
  const [data, setData] = useState<OelData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!domain) return;
    setLoading(true);
    apiFetch<OelData>(`/metrics/oel?domain=${encodeURIComponent(domain)}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [domain]);

  if (loading) return <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10">Loading OEL...</div>;
  if (!data) return null;

  const isGood = data.score >= 70;
  const isWarning = data.score >= 50 && data.score < 70;

  return (
    <div className={`p-6 rounded-xl border ${
      isGood ? 'bg-emerald-900/20 border-emerald-500/40' :
      isWarning ? 'bg-amber-900/20 border-amber-500/40' :
      'bg-red-900/20 border-red-500/40'
    } text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-white/60 mb-1">Opportunity Efficiency Loss (OEL)</div>
          <div className="text-2xl font-semibold">
            ${(data.oelAdjusted / 1000).toFixed(1)}K <span className="text-sm text-white/60">/mo</span>
          </div>
        </div>
        <div className={`text-right ${isGood ? 'text-emerald-300' : isWarning ? 'text-amber-300' : 'text-red-300'}`}>
          <div className="text-sm">Efficiency Score</div>
          <div className="text-3xl font-light">{data.score}</div>
          <div className="text-xs">/ 100</div>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Wasted Ad Spend</span>
          <span className="font-medium">${data.breakdown.wastedAdSpend.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Lost Qualified Leads</span>
          <span className="font-medium">${data.breakdown.lostQualifiedLeads.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Recovered</span>
          <span className="font-medium text-emerald-300">${data.breakdown.recovered.toLocaleString()}</span>
        </div>
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold">Net Loss</span>
          <span className="text-lg font-semibold text-red-300">${data.breakdown.netLoss.toLocaleString()}</span>
        </div>
      </div>

      {data.rootCauses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-2">Top Root Causes</div>
          <div className="space-y-2">
            {data.rootCauses.slice(0, 3).map((cause, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="capitalize">{cause.type}</span>
                <span className="text-white/70">${Math.round(cause.impact).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

