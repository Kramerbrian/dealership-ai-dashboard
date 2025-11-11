'use client';

import { useEffect, useState } from 'react';
import { Gauge, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WhereDidClicksGo from './modals/WhereDidClicksGo';

export default function ZeroClickCard({ tenantId }: { tenantId: string }) {
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
            adj: x.adjustedZeroClick,
            zcr: x.zcr,
            zcco: x.zcco
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch zero-click data:', err);
        setLoading(false);
      });
  }, [tenantId]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <>
      <div className="rounded-2xl p-5 bg-white/60 dark:bg-black/40 border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            <h3 className="font-semibold">Adjusted Zero-Click %</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">ZCR − ZCCO</span>
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
          {loading ? '—' : latest ? `${Math.round(latest.adj * 100)}%` : '—'}
        </div>
        <div className="text-xs opacity-70 mb-4">Latest vs 30-day trend</div>

        {!loading && data.length > 0 && (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="x" hide />
                <YAxis domain={[0, 1]} tickCount={3} />
                <Tooltip
                  formatter={(value: number) => `${Math.round(value * 100)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="adj"
                  dot={false}
                  strokeWidth={2}
                  stroke="#667eea"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {latest && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-black/5 p-3">
              <div className="opacity-70 text-xs">Zero-Click (raw)</div>
              <div className="font-semibold">
                {Math.round(latest.zcr * 100)}%
              </div>
            </div>
            <div className="rounded-xl border border-black/5 p-3">
              <div className="opacity-70 text-xs">GBP Save-Rate</div>
              <div className="font-semibold">
                {Math.round(latest.zcco * 100)}%
              </div>
            </div>
            <div className="rounded-xl border border-black/5 p-3">
              <div className="opacity-70 text-xs">Net</div>
              <div className="font-semibold">
                {Math.round(latest.adj * 100)}%
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="h-44 flex items-center justify-center text-sm opacity-50">
            Loading...
          </div>
        )}
      </div>

      <WhereDidClicksGo open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
