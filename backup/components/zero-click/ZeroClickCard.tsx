'use client';

import { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ZeroClickCard({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`/api/zero-click/summary?tenantId=${tenantId}&days=30`)
      .then(r => r.json())
      .then(d => {
        setData(
          d.series?.map((x: any) => ({
            x: new Date(x.date).toLocaleDateString(),
            adj: x.adjustedZeroClick,
            zcr: x.zcr,
            zcco: x.zcco
          })) || []
        );
      });
  }, [tenantId]);

  const latest = data.at(-1);

  return (
    <div className="rounded-2xl p-5 bg-white/60 dark:bg-black/40 border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          <h3 className="font-semibold">Adjusted Zero-Click %</h3>
        </div>
        <span className="text-xs opacity-70">ZCR − ZCCO</span>
      </div>

      <div className="text-3xl font-semibold mb-1">
        {latest ? `${Math.round(latest.adj * 100)}%` : '—'}
      </div>
      <div className="text-xs opacity-70 mb-4">Latest vs 30-day trend</div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="x" hide />
            <YAxis domain={[0, 1]} tickCount={3} />
            <Tooltip />
            <Line type="monotone" dataKey="adj" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {latest && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-black/5 p-3">
            <div className="opacity-70 text-xs">Zero-Click (raw)</div>
            <div className="font-semibold">{Math.round(latest.zcr * 100)}%</div>
          </div>
          <div className="rounded-xl border border-black/5 p-3">
            <div className="opacity-70 text-xs">GBP Save-Rate</div>
            <div className="font-semibold">{Math.round(latest.zcco * 100)}%</div>
          </div>
          <div className="rounded-xl border border-black/5 p-3">
            <div className="opacity-70 text-xs">Net</div>
            <div className="font-semibold">{Math.round(latest.adj * 100)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

