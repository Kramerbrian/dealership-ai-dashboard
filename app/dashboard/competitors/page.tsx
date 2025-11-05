'use client';

import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Competitors() {
  const tenantId =
    typeof window !== 'undefined'
      ? localStorage.getItem('tenantId') || 'demo'
      : 'demo';
  const { data, isLoading } = useSWR(
    `/api/competitors/nearby?tenantId=${tenantId}`,
    fetcher,
    { refreshInterval: 60000 }
  );
  const rows = data?.competitors || [];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Competitive Benchmark</h1>
      {isLoading ? (
        <div className="text-white/60">Loading competitors...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((c: any, i: number) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-xs text-white/60 mb-2">
                Rating {c.rating ?? '—'} • Reviews {c.reviewCount ?? '—'}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <Stat label="AI Visibility" value={`${c.aiVisibility}%`} />
                <Stat label="Zero-Click" value={`${c.zeroClick}%`} />
                <Stat label="Sentiment" value={`${c.sentiment}%`} />
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                  Compare
                </button>
                <MysteryUpsell competitor={c.name} tenantId={tenantId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="text-[11px] text-white/60">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function MysteryUpsell({
  competitor,
  tenantId,
}: {
  competitor: string;
  tenantId: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  async function run(tier: 'lite' | 'hybrid' | 'full') {
    setLoading(true);
    try {
      await fetch('/api/upsell/mystery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          competitorName: competitor,
          tier,
        }),
      });
      alert(`Mystery Shop queued for ${competitor} (${tier})`);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to queue mystery shop:', error);
      alert('Failed to queue mystery shop');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="px-3 py-1.5 text-xs rounded-full bg-sky-600 hover:bg-sky-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Queuing...' : 'Run Mystery Shop'}
      </button>
      {showMenu && (
        <div className="absolute z-10 mt-2 p-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-xs min-w-[140px]">
          <button
            onClick={() => run('lite')}
            className="block w-full text-left px-3 py-1 hover:bg-white/10 rounded"
          >
            Lite (AI)
          </button>
          <button
            onClick={() => run('hybrid')}
            className="block w-full text-left px-3 py-1 hover:bg-white/10 rounded"
          >
            Hybrid (Human+AI)
          </button>
          <button
            onClick={() => run('full')}
            className="block w-full text-left px-3 py-1 hover:bg-white/10 rounded"
          >
            Full (White-glove)
          </button>
        </div>
      )}
    </div>
  );
}

