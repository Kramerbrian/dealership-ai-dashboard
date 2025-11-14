import React, { useEffect, useMemo, useState } from 'react';
import { PulseCard, PulseThread } from '@/lib/types/pulse';
import { InboxHeader } from '@/app/components/pulse/InboxHeader';
import { useHudStore } from '@/lib/store/hud';
import { ThreadDrawer } from '@/app/components/pulse/ThreadDrawer';

function levelBadge(level: PulseCard['level']) {
  const map: any = {
    critical: 'bg-rose-100 text-rose-700',
    high: 'bg-amber-100 text-amber-700',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return `inline-flex items-center px-2 py-0.5 rounded ${map[level] || 'bg-gray-100'}`;
}

function kindToBucket(
  kind: PulseCard['kind']
): 'kpi' | 'incident' | 'market' | 'system' | 'other' {
  switch (kind) {
    case 'kpi_delta':
      return 'kpi';
    case 'incident_opened':
    case 'incident_resolved':
      return 'incident';
    case 'market_signal':
      return 'market';
    case 'system_health':
      return 'system';
    default:
      return 'other';
  }
}

export default function PulseInbox() {
  const addMany = useHudStore((s) => s.addManyPulse);
  const mute = useHudStore((s) => s.mute);
  const filter = useHudStore((s) => s.filter);
  const pulse = useHudStore((s) => s.pulse);
  const [openThread, setOpenThread] = useState<PulseThread | null>(null);
  const threadFor = useHudStore((s) => s.threadFor);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // initial load + poll
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        // Extract dealer from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const dealerId = urlParams.get('dealer') || 'demo-tenant';
        
        const r = await fetch(`/api/pulse?dealerId=${encodeURIComponent(dealerId)}`);
        if (!r.ok) {
          throw new Error(`API returned ${r.status}`);
        }
        const j = await r.json();
        if (!alive) return;
        // API returns { cards: PulseCard[] } not { items: PulseCard[] }
        addMany((j.cards || j.items || []) as PulseCard[]);
      } catch (error) {
        console.error('[PulseInbox] Failed to load cards:', error);
        // Don't break the UI, just log the error
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [addMany]);

  const filtered = useMemo(() => {
    if (filter === 'all') return pulse;
    if (filter === 'critical') return pulse.filter((p) => p.level === 'critical');
    const bucket = filter; // kpi|incident|market|system
    return pulse.filter((p) => kindToBucket(p.kind) === bucket);
  }, [pulse, filter]);

  const onSnooze = (mins: number) => {
    /* global DND handled in header; per-card snooze could be added */
  };

  return (
    <div className="space-y-4">
      <InboxHeader />
      <div className="rounded-2xl bg-white border p-4">
        {/* banner digest */}
        <DigestBanner items={pulse} />
        {/* list */}
        <ul className="divide-y">
          {filtered.map((e) => (
            <li key={e.id} className="py-3 flex items-start gap-3">
              <span className={levelBadge(e.level)}>{e.level}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold leading-tight">{e.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(e.ts).toLocaleTimeString()}
                  </div>
                </div>
                {e.detail && (
                  <div className="text-sm text-gray-600 mt-0.5">{e.detail}</div>
                )}
                <div className="mt-2 flex gap-2">
                  {e.actions?.includes('open') && (
                    <button
                      className="h-8 px-3 rounded border"
                      onClick={() => {
                        if (e.thread) {
                          const t = threadFor(e.thread);
                          if (t) setOpenThread(t);
                        }
                      }}
                    >
                      Open
                    </button>
                  )}
                  {e.actions?.includes('fix') && (
                    <button
                      className="h-8 px-3 rounded bg-blue-600 text-white"
                      onClick={() => {
                        /* wire Tier-2 Auto-Fix here */
                      }}
                    >
                      Fix
                    </button>
                  )}
                  {e.actions?.includes('assign') && (
                    <button
                      className="h-8 px-3 rounded border"
                      onClick={() => {
                        /* route to team */
                      }}
                    >
                      Assign
                    </button>
                  )}
                  {e.actions?.includes('snooze') && (
                    <button
                      className="h-8 px-3 rounded border"
                      onClick={() => onSnooze(60)}
                    >
                      Snooze
                    </button>
                  )}
                  {e.actions?.includes('mute') && e.dedupe_key && (
                    <button
                      className="h-8 px-3 rounded border"
                      onClick={() => mute(e.dedupe_key!)}
                    >
                      Mute 24h
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ThreadDrawer thread={openThread} onClose={() => setOpenThread(null)} />
    </div>
  );
}

function DigestBanner({ items }: { items: PulseCard[] }) {
  const last12h = items.filter(
    (i) => Date.now() - Date.parse(i.ts) < 12 * 60 * 60 * 1000
  );
  const aivDeltas = last12h.filter(
    (i) => i.kind === 'kpi_delta' && /AIV/i.test(i.title)
  );
  const incResolved = last12h.filter((i) => i.kind === 'incident_resolved')
    .length;
  const sla = last12h.filter((i) => i.kind === 'sla_breach').length;
  const topDelta = aivDeltas[0]?.delta ?? '0';

  return (
    <div className="mb-3 text-sm text-gray-700">
      Today: ΔAIV {String(topDelta)} • {incResolved} incidents resolved • {sla}{' '}
      SLA risk
    </div>
  );
}

