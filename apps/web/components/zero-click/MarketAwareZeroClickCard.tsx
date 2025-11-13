'use client';
import { useEffect, useState } from 'react';
import { Gauge, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGeoPersonalization } from '@/hooks/useGeoPersonalization';

export default function MarketAwareZeroClickCard({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any[]>([]);
  const { location, marketAnalysis, loading: geoLoading } = useGeoPersonalization({ autoDetect: true });

  useEffect(() => {
    fetch(`/api/zero-click/summary?tenantId=${tenantId}&days=30`)
      .then(r => r.json())
      .then(d => {
        setData(d.series?.map((x: any) => ({
          x: new Date(x.date).toLocaleDateString(),
          adj: x.adjustedZeroClick,
          zcr: x.zcr,
          zcco: x.zcco
        })) || []);
      });
  }, [tenantId]);

  const latest = data.at(-1);

  return (
    <div className="rounded-2xl p-5 bg-white/60 dark:bg-black/40 border border-black/5 shadow-sm">
      {/* Location Badge */}
      {location && (
        <div className="flex items-center gap-2 mb-3 text-xs opacity-70">
          <MapPin className="h-3 w-3" />
          <span>{location.city}, {location.state}</span>
        </div>
      )}

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

      {/* Market Comparison */}
      {marketAnalysis && (
        <div className="text-xs mb-4 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {marketAnalysis.benchmarkVsMarket > 0 ? '↑' : '↓'} {Math.abs(marketAnalysis.benchmarkVsMarket * 100).toFixed(1)}%
          </span>
          {marketAnalysis.benchmarkVsMarket > 0 && ' better than market avg'}
          {marketAnalysis.benchmarkVsMarket < 0 && ' vs market avg'}
        </div>
      )}

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

      {/* Regional Insights */}
      {marketAnalysis?.regionalInsights && marketAnalysis.regionalInsights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <h4 className="text-xs font-semibold mb-2">Regional Insights</h4>
          <ul className="space-y-1 text-xs opacity-80">
            {marketAnalysis.regionalInsights.slice(0, 2).map((insight, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-blue-600">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
