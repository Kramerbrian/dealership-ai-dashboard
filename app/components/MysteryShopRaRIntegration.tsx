'use client';

import useSWR from 'swr';
import RaRCard from '@/app/(dashboard)/intelligence/widgets/RaRCard';

interface MysteryShopRaRIntegrationProps {
  dealerId: string;
}

/**
 * RaR integration for Mystery Shop tab
 * Shows Zero-Click Coverage, RaR, and Recoverable metrics
 */
export default function MysteryShopRaRIntegration({ dealerId }: MysteryShopRaRIntegrationProps) {
  const { data: rarSummary } = useSWR(
    `/api/rar/summary?dealerId=${dealerId}`,
    (url) => fetch(url).then((r) => r.json())
  );

  // Calculate zero-click coverage (approximate from RaR data)
  const zeroClickCoverage = rarSummary?.lostSessions
    ? (rarSummary.lostSessions / (rarSummary.lostSessions + 10000)) * 100 // Approximation
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Zero-Click Coverage */}
        <div className="rounded-2xl p-5 shadow-sm border bg-white/80 backdrop-blur ring-1 ring-gray-900/5">
          <div className="text-sm opacity-70 mb-2">Zero-Click Coverage</div>
          <div className="text-3xl font-semibold text-gray-900 font-mono tabular-nums">
            {zeroClickCoverage ? `${Math.round(zeroClickCoverage)}%` : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Sessions lost to AI answers
          </div>
        </div>

        {/* Revenue at Risk */}
        <div className="rounded-2xl p-5 shadow-sm border bg-white/80 backdrop-blur ring-1 ring-gray-900/5">
          <div className="text-sm opacity-70 mb-2">Revenue at Risk</div>
          <div className="text-3xl font-semibold text-gray-900 font-mono tabular-nums">
            {rarSummary?.rar ? `$${Math.round(rarSummary.rar).toLocaleString()}` : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-500">Monthly</div>
        </div>

        {/* Recoverable */}
        <div className="rounded-2xl p-5 shadow-sm border bg-white/80 backdrop-blur ring-1 ring-gray-900/5">
          <div className="text-sm opacity-70 mb-2">Recoverable Now</div>
          <div className="text-3xl font-semibold text-gray-900 font-mono tabular-nums">
            {rarSummary?.recoverable ? `$${Math.round(rarSummary.recoverable).toLocaleString()}` : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-500">With AEO fixes</div>
        </div>
      </div>

      {/* Full RaR Card */}
      <div className="mt-6">
        <RaRCard dealerId={dealerId} />
      </div>
    </div>
  );
}

