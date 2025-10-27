'use client';

import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AiriCard({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`/api/zero-click/summary?tenantId=${tenantId}&days=30`)
      .then(r => r.json())
      .then(d => {
        setData(
          d.series?.map((x: any) => ({
            x: new Date(x.date).toLocaleDateString(),
            airi: x.airi,
            aiPresence: x.aiPresenceRate
          })) || []
        );
      });
  }, [tenantId]);

  const latest = data.at(-1);

  return (
    <div className="rounded-2xl p-5 bg-white/60 dark:bg-black/40 border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-semibold">AI Replacement Index (AIRI)</h3>
        </div>
        <span className="text-xs opacity-70">AI presence × (CTR baseline − actual)</span>
      </div>

      <div className="text-3xl font-semibold mb-1">
        {latest ? `${(latest.airi * 100).toFixed(1)}%` : '—'}
      </div>
      <div className="text-xs opacity-70 mb-4">Higher = more traffic displaced by AI</div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="x" hide />
            <YAxis domain={[0, 1]} tickCount={3} />
            <Tooltip />
            <Area type="monotone" dataKey="airi" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {latest && (
        <div className="mt-4 text-sm opacity-80">
          AI presence this period: <span className="font-semibold">{Math.round(latest.aiPresence * 100)}%</span>
        </div>
      )}
    </div>
  );
}

