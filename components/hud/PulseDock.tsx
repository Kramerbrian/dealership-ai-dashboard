'use client';
import { useMemo } from 'react';
import { useHudStore } from '@/lib/store/hud';
import { TOKENS } from '@/styles/design-tokens';
import { playSonic } from '@/lib/sound/palette';
import { tap } from '@/lib/sound/haptics';

export function PulseDock() {
  const { pulse, clearPulse, pulseDockOpen, setPulseDock } = useHudStore();
  const latest = useMemo(() => pulse.slice(0, 2), [pulse]);

  const chip = (lvl: string): string => {
    const map: Record<string, string> = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#06b6d4',
      low: '#a6adbb',
    };
    return map[lvl] ?? '#a6adbb';
  };

  const handleToggle = () => {
    playSonic(pulseDockOpen ? 'close' : 'open');
    tap();
    setPulseDock(!pulseDockOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Collapsed bar */}
      {!pulseDockOpen && (
        <button
          onClick={handleToggle}
          className="rounded-full px-4 py-2 border flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{
            background: TOKENS.color.surface.panel,
            borderColor: TOKENS.color.surface.border,
            boxShadow: TOKENS.shadow.soft,
            color: TOKENS.color.text.primary,
          }}
          aria-label="Open pulse dock"
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: chip(latest[0]?.level ?? 'low') }}
          />
          <span className="text-sm">{latest[0]?.title ?? 'Pulse idle'}</span>
        </button>
      )}

      {/* Expanded panel */}
      {pulseDockOpen && (
        <div
          className="rounded-2xl border w-[340px] max-h-[60vh] overflow-hidden"
          style={{
            background: TOKENS.color.surface.panel,
            borderColor: TOKENS.color.surface.border,
            boxShadow: TOKENS.shadow.soft,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between border-b"
            style={{ borderColor: TOKENS.color.surface.border }}
          >
            <div className="text-sm font-medium" style={{ color: TOKENS.color.text.primary }}>
              Pulse
            </div>
            <div className="flex gap-2">
              <button
                className="text-xs opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: TOKENS.color.text.secondary }}
                onClick={() => {
                  clearPulse();
                  playSonic('click');
                  tap();
                }}
              >
                Clear
              </button>
              <button
                className="text-xs opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: TOKENS.color.text.secondary }}
                onClick={handleToggle}
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '50vh' }}>
            {pulse.length === 0 && (
              <div className="text-sm text-center py-8" style={{ color: TOKENS.color.text.muted }}>
                No recent events.
              </div>
            )}

            {pulse.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border p-3 hover:opacity-90 transition-opacity"
                style={{
                  borderColor: TOKENS.color.surface.border,
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: chip(ev.level) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: TOKENS.color.text.primary }}>
                      {ev.title}
                    </div>
                    {ev.detail && (
                      <div className="text-xs mt-1" style={{ color: TOKENS.color.text.secondary }}>
                        {ev.detail}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {typeof ev.delta !== 'undefined' && (
                        <div className="text-xs font-medium" style={{ color: TOKENS.color.accent.clarityCyan }}>
                          Δ {String(ev.delta)}
                        </div>
                      )}
                      <div className="text-xs" style={{ color: TOKENS.color.text.muted }}>
                        {new Date(ev.ts).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
