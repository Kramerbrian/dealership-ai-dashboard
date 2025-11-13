'use client';

import { useEffect, useState } from 'react';
import { Brain, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AiriExplainer from './modals/AiriExplainer';

export default function AiriCard({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/zero-click/summary?tenantId=${tenantId}&days=30`)
      .then((r) => r.json())
      .then((d) => {
        const series = d.series || [];
        setData(
          series.map((x: any) => ({
            x: new Date(x.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            airi: x.airi,
            aiPresence: x.aiPresenceRate
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch AIRI data:', err);
        setLoading(false);
      });
  }, [tenantId]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <>
      <div className="rounded-2xl p-5 bg-white/60 dark:bg-black/40 border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="font-semibold">AI Replacement Index (AIRI)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">
              AI presence × (CTR baseline − actual)
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              title="Learn more"
            >
              <Info className="h-4 w-4 opacity-70" />
            </button>
          </div>
        </div>

        <div className="text-3xl font-semibold mb-1">
          {loading ? '—' : latest ? `${(latest.airi * 100).toFixed(1)}%` : '—'}
        </div>
        <div className="text-xs opacity-70 mb-4">
          Higher = more traffic displaced by AI
        </div>

        {!loading && data.length > 0 && (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis dataKey="x" hide />
                <YAxis domain={[0, 1]} tickCount={3} />
                <Tooltip
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                />
                <Area
                  type="monotone"
                  dataKey="airi"
                  fillOpacity={0.2}
                  fill="#667eea"
                  stroke="#667eea"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {latest && (
          <div className="mt-4 text-sm opacity-80">
            AI presence this period:{' '}
            <span className="font-semibold">
              {Math.round(latest.aiPresence * 100)}%
            </span>
          </div>
        )}

        {loading && (
          <div className="h-44 flex items-center justify-center text-sm opacity-50">
            Loading...
          </div>
        )}
      </div>

      <AiriExplainer open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
