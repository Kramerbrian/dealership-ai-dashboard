'use client';

import useSWR from 'swr';
import { ScoreDeltaBadge } from '@/app/components/ui/ScoreDeltaBadge';

interface CompetitiveBattlePlanRaRProps {
  dealerId: string;
}

/**
 * RaR integration for Competitive Battle Plan
 * Shows Top Losing Intents ranked by RaR with one-click playbooks
 */
export default function CompetitiveBattlePlanRaR({ dealerId }: CompetitiveBattlePlanRaRProps) {
  const { data: rarSummary } = useSWR(
    `/api/rar/summary?dealerId=${dealerId}`,
    (url) => fetch(url).then((r) => r.json())
  );

  const topIntents = (rarSummary?.topLosingIntents || []) as Array<{
    intent: string;
    rar: number;
  }>;

  const getPlaybookForIntent = (intent: string) => {
    const playbooks: Record<string, string[]> = {
      service_price: ['Add FAQ Schema', 'Sync GBP', 'Fix Schema'],
      hours: ['Update Business Hours', 'Sync GBP', 'Add Structured Data'],
      oil_change: ['Create Service Page', 'Add FAQ', 'Schema Markup'],
      tire_rotation: ['Create Service Page', 'Add FAQ', 'Schema Markup'],
      dealer_near_me: ['Optimize GBP', 'Location Schema', 'NAP Consistency'],
    };

    return playbooks[intent] || ['Add FAQ', 'Sync GBP', 'Fix Schema'];
  };

  if (!topIntents.length) {
    return (
      <div className="rounded-2xl p-5 shadow-sm border bg-gray-50">
        <div className="text-sm text-gray-500">No RaR data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Losing Intents by Revenue at Risk
      </h3>

      <div className="space-y-3">
        {topIntents.map((intent, idx) => {
          const playbooks = getPlaybookForIntent(intent.intent);

          return (
            <div
              key={intent.intent}
              className="rounded-xl p-4 border bg-white/80 backdrop-blur ring-1 ring-gray-900/5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400">
                      #{idx + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {intent.intent.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-red-600 font-mono tabular-nums">
                    ${Math.round(intent.rar).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Revenue at risk per month
                  </div>
                </div>
              </div>

              {/* One-click playbooks */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Quick Fixes:
                </div>
                <div className="flex flex-wrap gap-2">
                  {playbooks.map((playbook) => (
                    <button
                      key={playbook}
                      onClick={() => {
                        // TODO: Trigger orchestration action
                        console.log(`Deploy: ${playbook} for ${intent.intent}`);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      {playbook}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Deltas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Score Impact:
        </div>
        <div className="flex flex-wrap gap-2">
          <ScoreDeltaBadge
            label="AIV"
            delta={-2.1}
            reason="RaR pressure"
          />
          <ScoreDeltaBadge
            label="ATI"
            delta={-1.6}
            reason="RaR pressure"
          />
        </div>
      </div>
    </div>
  );
}

