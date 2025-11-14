'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * DealershipAI Pulse Decision Inbox (JSX version)
 * - Default home = triage / incidents
 * - Pulse cards = decision items, not ticker noise
 * - Fetches from /api/pulse endpoint
 */

const LEVEL_COLORS = {
  critical: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  high: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  medium: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
  low: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  info: 'bg-zinc-500/20 text-zinc-200 border-zinc-400/40'
};

const KIND_LABELS = {
  kpi_delta: 'KPI',
  incident_opened: 'Incident',
  incident_resolved: 'Resolved',
  market_signal: 'Market',
  auto_fix: 'Auto-Fix',
  sla_breach: 'SLA',
  system_health: 'System'
};

function levelChip(level) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${
        LEVEL_COLORS[level] || LEVEL_COLORS.info
      }`}
    >
      {level.toUpperCase()}
    </span>
  );
}

function kindChip(kind) {
  return (
    <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-zinc-200">
      {KIND_LABELS[kind] || kind}
    </span>
  );
}

export default function DealershipAI_PulseDecisionInbox() {
  const { user } = useUser();
  const [filterKind, setFilterKind] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [mutedKeys, setMutedKeys] = useState({});
  const [selectedThread, setSelectedThread] = useState(null);
  const [pulses, setPulses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get dealerId from user metadata or fallback
  const dealerId = useMemo(() => {
    return user?.publicMetadata?.dealerId || 
           user?.publicMetadata?.dealer || 
           user?.id || 
           'demo-tenant';
  }, [user]);

  // Fetch pulses from API
  useEffect(() => {
    let alive = true;
    const fetchPulses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          dealerId,
          limit: '50',
        });
        const res = await fetch(`/api/pulse?${params}`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data = await res.json();
        if (!alive) return;
        setPulses(data.cards || []);
        setError(null);
      } catch (err) {
        if (!alive) return;
        console.error('[PulseInbox] Fetch error:', err);
        setError(err.message);
        // Fallback to empty array on error
        setPulses([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchPulses();
    // Poll every 30 seconds
    const interval = setInterval(fetchPulses, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [dealerId]);

  const filteredPulses = useMemo(() => {
    return pulses.filter((p) => {
      if (p.dedupe_key && mutedKeys[p.dedupe_key]) return false;
      if (filterKind !== 'all' && p.kind !== filterKind) return false;
      if (filterLevel !== 'all' && p.level !== filterLevel) return false;
      return true;
    });
  }, [pulses, filterKind, filterLevel, mutedKeys]);

  const todaySummary = useMemo(() => {
    const crit = filteredPulses.filter((p) => p.level === 'critical').length;
    const resolved = pulses.filter((p) => p.kind === 'incident_resolved').length;
    const fixes = filteredPulses.filter((p) => p.kind === 'auto_fix').length;
    return { crit, resolved, fixes };
  }, [filteredPulses, pulses]);

  async function handleAction(pulse, action) {
    if (action === 'mute' && pulse.dedupe_key) {
      setMutedKeys((prev) => ({ ...prev, [pulse.dedupe_key]: true }));
      // TODO: Persist mute preference to backend
    }
    if (action === 'open' && pulse.thread) {
      setSelectedThread(pulse.thread);
    }
    if (action === 'snooze') {
      // TODO: Implement snooze via API
      console.log('Snooze pulse:', pulse.id);
    }
    if (action === 'fix') {
      try {
        // TODO: Wire to Auto-Fix engine endpoint when available
        // await fetch(`/api/pulse/${pulse.id}/fix`, { method: 'POST' });
        console.log('Trigger fix for', pulse.id);
      } catch (err) {
        console.error('Fix action failed:', err);
      }
    }
    if (action === 'assign') {
      // TODO: Open assign modal or route to /team
      console.log('Assign incident', pulse.id);
    }
  }

  return (
    <div className="min-h-screen bg-[#05070c] text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-[#05070c]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400" />
            <span className="font-semibold tracking-tight">Pulse Inbox</span>
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              Default Home = Triage
            </span>
          </div>
          <div className="text-xs text-zinc-400">
            Today:{' '}
            <span className="text-amber-200">{todaySummary.crit} critical</span> •{' '}
            <span className="text-emerald-200">{todaySummary.resolved} incidents resolved</span> •{' '}
            <span className="text-sky-200">{todaySummary.fixes} auto-fixes</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <section className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 text-xs">
            {['all', 'critical', 'high', 'medium', 'low', 'info'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl ${
                  filterLevel === lvl ? 'bg-white text-[#05070c] font-semibold' : 'text-zinc-300'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 text-xs">
            {[
              ['all', 'All'],
              ['kpi_delta', 'KPI'],
              ['incident_opened', 'Incidents'],
              ['market_signal', 'Market'],
              ['auto_fix', 'Auto-Fix'],
              ['sla_breach', 'SLA'],
              ['system_health', 'System']
            ].map(([kind, label]) => (
              <button
                key={kind}
                onClick={() => setFilterKind(kind)}
                className={`px-3 py-1.5 rounded-xl ${
                  filterKind === kind ? 'bg-white text-[#05070c] font-semibold' : 'text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Pulse list */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && (
            <div className="col-span-full text-sm text-zinc-400 border border-white/10 rounded-2xl p-6 bg-white/5 text-center">
              Loading pulse data...
            </div>
          )}
          {error && (
            <div className="col-span-full text-sm text-rose-400 border border-rose-400/40 rounded-2xl p-6 bg-rose-500/10">
              Error loading pulses: {error}
            </div>
          )}
          {!loading && !error && filteredPulses.length === 0 && (
            <div className="col-span-full text-sm text-zinc-400 border border-white/10 rounded-2xl p-6 bg-white/5">
              Nothing urgent in this view. Enjoy the quiet.
            </div>
          )}

          {!loading && filteredPulses.map((pulse) => (
            <article
              key={pulse.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.04] p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex gap-2 flex-wrap">
                    {levelChip(pulse.level)}
                    {kindChip(pulse.kind)}
                    {pulse.thread && (
                      <span className="px-2 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-zinc-200">
                        Thread: {pulse.thread.type} • {pulse.thread.id}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{pulse.title}</h3>
                  {pulse.detail && (
                    <p className="text-xs text-zinc-300 leading-relaxed">{pulse.detail}</p>
                  )}
                </div>
                {pulse.delta != null && (
                  <div className="text-xs text-right text-zinc-300">
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Delta
                    </div>
                    <div className="font-semibold">
                      {typeof pulse.delta === 'number' ? `${pulse.delta > 0 ? '+' : ''}${pulse.delta}` : pulse.delta}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {pulse.actions?.map((a) => {
                  const labelMap = {
                    open: 'Open',
                    fix: 'Fix',
                    assign: 'Assign',
                    snooze: 'Snooze',
                    mute: 'Mute'
                  };
                  const primary = a === 'open' || a === 'fix';
                  return (
                    <button
                      key={a}
                      onClick={() => handleAction(pulse, a)}
                      className={
                        primary
                          ? 'h-8 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-semibold'
                          : 'h-8 px-3 rounded-xl border border-white/10 bg-white/5 text-xs text-zinc-200'
                      }
                    >
                      {labelMap[a] || a}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Thread drawer */}
      {selectedThread && (
        <ThreadDrawer 
          refInfo={selectedThread} 
          onClose={() => setSelectedThread(null)}
          dealerId={dealerId}
        />
      )}
    </div>
  );
}

function ThreadDrawer({ refInfo, onClose, dealerId }) {
  const [threadEvents, setThreadEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!refInfo?.id) return;
    
    let alive = true;
    const fetchThread = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ dealerId: dealerId || 'demo-tenant' });
        const res = await fetch(`/api/pulse/thread/${refInfo.id}?${params}`);
        if (!res.ok) throw new Error(`Failed to fetch thread: ${res.statusText}`);
        const data = await res.json();
        if (!alive) return;
        setThreadEvents(data.thread?.events || []);
        setError(null);
      } catch (err) {
        if (!alive) return;
        console.error('[ThreadDrawer] Fetch error:', err);
        setError(err.message);
        setThreadEvents([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchThread();
    return () => { alive = false; };
  }, [refInfo?.id, dealerId]);

  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-full max-w-md bg-[#05070c] border-l border-white/10 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Thread</div>
            <div className="text-sm font-semibold">
              {refInfo.type} • {refInfo.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20"
          >
            Close
          </button>
        </div>
        <div className="text-xs text-zinc-400">
          Showing latest events for this KPI / incident. Use this to see cause → effect quickly.
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mt-2">
          {loading && (
            <div className="text-xs text-zinc-400 text-center py-4">Loading thread history...</div>
          )}
          {error && (
            <div className="text-xs text-rose-400 text-center py-4">Error: {error}</div>
          )}
          {!loading && !error && threadEvents.length === 0 && (
            <div className="text-xs text-zinc-400 text-center py-4">No events found for this thread.</div>
          )}
          {!loading && threadEvents.map((evt) => (
            <div
              key={evt.id}
              className="border border-white/10 rounded-2xl p-3 bg-white/[0.03] text-xs space-y-1"
            >
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>{new Date(evt.ts).toLocaleString()}</span>
                <span>{evt.kind}</span>
              </div>
              <div className="font-semibold text-zinc-100">{evt.title}</div>
              {evt.detail && (
                <div className="text-zinc-300">{evt.detail}</div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

