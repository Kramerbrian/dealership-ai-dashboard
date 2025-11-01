'use client';

import useSWR from 'swr';

interface RaRCardProps {
  dealerId: string;
  month?: string;
}

export default function RaRCard({ dealerId, month }: RaRCardProps) {
  const params = new URLSearchParams({ dealerId });
  if (month) params.append('month', month);

  const { data, error, isLoading } = useSWR(
    `/api/rar/summary?${params.toString()}`,
    (url) => fetch(url).then((r) => r.json())
  );

  const d = data || {};

  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 shadow-sm border bg-white/80 backdrop-blur">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-5 shadow-sm border bg-red-50">
        <div className="text-sm text-red-600">Error loading RaR data</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 shadow-sm border bg-white/80 backdrop-blur ring-1 ring-gray-900/5">
      <div className="text-sm opacity-70 mb-2">Revenue at Risk</div>
      <div className="text-3xl font-semibold text-gray-900 font-mono tabular-nums">
        {d.rar ? `$${Math.round(d.rar).toLocaleString()}` : '—'}
      </div>
      <div className="mt-1 text-sm text-gray-600">
        Recoverable now:{' '}
        <b className="text-gray-900">
          {d.recoverable ? `$${Math.round(d.recoverable).toLocaleString()}` : '—'}
        </b>
      </div>
      {d.topLosingIntents && Array.isArray(d.topLosingIntents) && d.topLosingIntents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs opacity-70 mb-2">Top Losing Intents</div>
          <ul className="text-sm space-y-1.5">
            {(d.topLosingIntents as any[]).map((it: any) => (
              <li key={it.intent} className="flex justify-between items-center">
                <span className="text-gray-700">{it.intent}</span>
                <span className="font-semibold text-gray-900 font-mono tabular-nums">
                  ${typeof it.rar === 'number' ? it.rar.toLocaleString() : '0'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {d.computedAt && (
        <div className="mt-3 text-xs text-gray-500">
          Updated: {new Date(d.computedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

