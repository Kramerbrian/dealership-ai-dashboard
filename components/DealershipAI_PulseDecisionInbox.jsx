'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPulse, setAssignPulse] = useState(null);
  const [assigneeInput, setAssigneeInput] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [fixSuccess, setFixSuccess] = useState(null);

  // Get dealerId from user metadata or fallback
  const dealerId = useMemo(() => {
    return user?.publicMetadata?.dealerId || 
           user?.publicMetadata?.dealer || 
           user?.id || 
           'demo-tenant';
  }, [user]);

  // Fetch pulses from API (initial load)
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
        setPulses([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchPulses();

    // Load muted keys from API
    const loadMutedKeys = async () => {
      try {
        const params = new URLSearchParams({ dealerId });
        const res = await fetch(`/api/pulse/mute?${params}`);
        if (res.ok) {
          const data = await res.json();
          const muted = {};
          (data.muted || []).forEach((key) => {
            muted[key] = true;
          });
          setMutedKeys(muted);
        }
      } catch (err) {
        console.error('[PulseInbox] Load muted keys error:', err);
      }
    };
    loadMutedKeys();

    return () => {
      alive = false;
    };
  }, [dealerId]);

  // SSE real-time updates
  useEffect(() => {
    if (!dealerId) return;

    const params = new URLSearchParams({
      dealerId,
      filter: 'all',
    });
    const eventSource = new EventSource(`/api/pulse/stream?${params}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update' && data.cards) {
          setPulses(data.cards);
        } else if (data.type === 'heartbeat') {
          // Connection alive
        }
      } catch (err) {
        console.error('[PulseInbox] SSE parse error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[PulseInbox] SSE error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
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

  const handleAction = useCallback(async (pulse, action) => {
    if (action === 'mute' && pulse.dedupe_key) {
      try {
        const res = await fetch('/api/pulse/mute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dedupeKey: pulse.dedupe_key,
            dealerId,
            durationHours: 24,
          }),
        });
        if (res.ok) {
          setMutedKeys((prev) => ({ ...prev, [pulse.dedupe_key]: true }));
        }
      } catch (err) {
        console.error('Mute action failed:', err);
        // Fallback to client-side mute
        setMutedKeys((prev) => ({ ...prev, [pulse.dedupe_key]: true }));
      }
    }
    if (action === 'open' && pulse.thread) {
      setSelectedThread(pulse.thread);
    }
    if (action === 'snooze') {
      // Snooze is client-side for now (could be extended with API)
      console.log('Snooze pulse:', pulse.id);
    }
    if (action === 'fix') {
      try {
        const params = new URLSearchParams({ dealerId });
        const res = await fetch(`/api/pulse/${pulse.id}/fix?${params}`, {
          method: 'POST',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Show success feedback
          setFixSuccess(`Fixed: ${pulse.title}`);
          setTimeout(() => setFixSuccess(null), 3000);
          // Refresh pulses after fix
          const refreshRes = await fetch(`/api/pulse?${new URLSearchParams({ dealerId, limit: '50' })}`);
          const refreshData = await refreshRes.json();
          if (refreshRes.ok) {
            setPulses(refreshData.cards || []);
          }
        } else {
          setFixSuccess(`Failed to fix: ${data.error || 'Unknown error'}`);
          setTimeout(() => setFixSuccess(null), 3000);
        }
      } catch (err) {
        console.error('Fix action failed:', err);
        setFixSuccess(`Error: ${err.message}`);
        setTimeout(() => setFixSuccess(null), 3000);
      }
    }
    if (action === 'assign') {
      // Open assign modal
      setAssignPulse(pulse);
      setAssignModalOpen(true);
    }
  }, [dealerId, setMutedKeys, setSelectedThread, setPulses]);

  // Keyboard shortcuts (must be after filteredPulses and handleAction are defined)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Escape: Close thread drawer
      if (e.key === 'Escape' && selectedThread) {
        setSelectedThread(null);
        return;
      }

      // Number keys 1-5: Select first 5 pulses and trigger actions
      if (e.key >= '1' && e.key <= '5' && filteredPulses.length > 0) {
        const index = parseInt(e.key) - 1;
        if (index < filteredPulses.length) {
          const pulse = filteredPulses[index];
          
          // Modifier keys
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              // Cmd/Ctrl+Shift+Number: Assign
              if (pulse.actions?.includes('assign')) {
                handleAction(pulse, 'assign');
              }
            } else {
              // Cmd/Ctrl+Number: Fix
              if (pulse.actions?.includes('fix')) {
                handleAction(pulse, 'fix');
              }
            }
          } else if (e.shiftKey) {
            e.preventDefault();
            // Shift+Number: Open thread
            if (pulse.thread && pulse.actions?.includes('open')) {
              handleAction(pulse, 'open');
            }
          } else {
            // Just number: Focus on card (could scroll into view)
            e.preventDefault();
            const cardElement = document.querySelector(`[data-pulse-id="${pulse.id}"]`);
            if (cardElement) {
              cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              cardElement.focus();
            }
          }
        }
      }

      // 'f' key: Filter toggle
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Cycle through filters
        const filters = ['all', 'critical', 'high', 'medium', 'low', 'info'];
        const currentIndex = filters.indexOf(filterLevel);
        const nextIndex = (currentIndex + 1) % filters.length;
        setFilterLevel(filters[nextIndex]);
      }

      // 'k' key: Kind filter toggle
      if (e.key === 'k' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const kinds = ['all', 'kpi_delta', 'incident_opened', 'market_signal', 'auto_fix', 'sla_breach', 'system_health'];
        const currentIndex = kinds.indexOf(filterKind);
        const nextIndex = (currentIndex + 1) % kinds.length;
        setFilterKind(kinds[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredPulses, selectedThread, filterLevel, filterKind, handleAction]);

  // Handle assign submission
  const handleAssignSubmit = useCallback(async () => {
    if (!assignPulse || !assigneeInput) return;
    
    setAssignLoading(true);
    try {
      const params = new URLSearchParams({ dealerId });
      const res = await fetch(`/api/pulse/${assignPulse.id}/assign?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeId: assigneeInput,
          assigneeName: assigneeInput,
          note: `Assigned by user`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh pulses after assignment
        const refreshRes = await fetch(`/api/pulse?${new URLSearchParams({ dealerId, limit: '50' })}`);
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setPulses(refreshData.cards || []);
        }
        setAssignModalOpen(false);
        setAssigneeInput('');
        setAssignPulse(null);
        setFixSuccess(`Assigned to ${assigneeInput}`);
        setTimeout(() => setFixSuccess(null), 3000);
      } else {
        setFixSuccess(`Failed to assign: ${data.error || 'Unknown error'}`);
        setTimeout(() => setFixSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Assign action failed:', err);
      setFixSuccess(`Error: ${err.message}`);
      setTimeout(() => setFixSuccess(null), 3000);
    } finally {
      setAssignLoading(false);
    }
  }, [assignPulse, assigneeInput, dealerId, setPulses]);

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
        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-zinc-500 mb-2">
          <span className="font-semibold">Shortcuts:</span> 1-5 (select), Shift+1-5 (open), Cmd/Ctrl+1-5 (fix), Cmd/Ctrl+Shift+1-5 (assign), f (filter level), k (filter kind), Esc (close)
        </div>
        
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold mb-2">Error loading pulses</p>
                  <p className="text-rose-300">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    const params = new URLSearchParams({ dealerId, limit: '50' });
                    fetch(`/api/pulse?${params}`)
                      .then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
                        return res.json();
                      })
                      .then(data => {
                        setPulses(data.cards || []);
                        setError(null);
                      })
                      .catch(err => {
                        setError(err.message);
                      })
                      .finally(() => setLoading(false));
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!loading && !error && filteredPulses.length === 0 && (
            <div className="col-span-full text-sm text-zinc-400 border border-white/10 rounded-2xl p-6 bg-white/5">
              Nothing urgent in this view. Enjoy the quiet.
            </div>
          )}

          {!loading && filteredPulses.map((pulse, index) => (
            <article
              key={pulse.id}
              data-pulse-id={pulse.id}
              tabIndex={0}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.04] p-4 flex flex-col gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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

      {/* Success notification */}
      {fixSuccess && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-sm">
          {fixSuccess}
        </div>
      )}

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="bg-[#05070c] border-white/10">
          <DialogHeader>
            <DialogTitle>Assign Pulse</DialogTitle>
            <DialogDescription>
              Assign "{assignPulse?.title}" to a team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Assignee Name or ID
              </label>
              <input
                type="text"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                placeholder="Enter assignee name or ID"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && assigneeInput && !assignLoading) {
                    handleAssignSubmit();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setAssignModalOpen(false);
                  setAssigneeInput('');
                  setAssignPulse(null);
                }}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={!assigneeInput || assignLoading}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assignLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

