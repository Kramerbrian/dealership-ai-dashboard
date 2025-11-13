'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

type Item = { ts: string; counts: { total: number } };

export default function DriftTrendSpark() {
  const [data, setData] = useState<Array<{ ts: string; total: number }>>([]);

  useEffect(() => {
    fetch('/api/driftguard/history')
      .then(r => r.json())
      .then(j => {
        const rows = (j.items as Item[]).map(i => ({
          ts: new Date(i.ts).toLocaleDateString(),
          total: i.counts.total
        }));
        setData(rows);
      })
      .catch(err => {
        console.error('Failed to fetch drift history:', err);
      });
  }, []);

  if (!data.length) return <div className="text-slate-400 text-sm">No history yet</div>;

  return (
    <div className="w-full h-24">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, left: 0, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="driftFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="ts" hide />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="total" stroke="#ef4444" fill="url(#driftFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

