'use client';

import { useMemo } from 'react';
import { useHudStore } from '@/lib/store/hud';
import { TOKENS } from '@/lib/design-tokens';

function GlowHalo({ severity, rounded = '9999px' }: { severity: 'none'|'high'|'critical'; rounded?: string }) {
  if (severity === 'none') return null;

  // Tron/Inception: cool cyan/blue for high, deep ember/red for critical
  const gradient =
    severity === 'critical'
      ? `radial-gradient(60% 60% at 50% 50%, rgba(239,68,68,0.16) 0%, rgba(245,158,11,0.12) 38%, rgba(59,130,246,0.06) 52%, rgba(0,0,0,0) 72%)`
      : `radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,0.22) 0%, rgba(6,182,212,0.14) 40%, rgba(0,0,0,0) 70%)`;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: rounded, filter: 'blur(16px)' }}>
        <div className="w-full h-full opacity-80 glow-halo" style={{ background: gradient, borderRadius: rounded }} />
      </div>
      <style jsx>{`
        .glow-halo {
          animation: haloPulse 2.4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
        }
        @keyframes haloPulse {
          0%   { opacity: 0.0; transform: scale(0.98); }
          40%  { opacity: 0.85; transform: scale(1.02); }
          100% { opacity: 0.0; transform: scale(0.98); }
        }
      `}</style>
    </>
  );
}

export function PulseDock() {
  const { pulse, clearPulse, pulseOpen, setPulseOpen } = useHudStore();

  const latest = useMemo(() => pulse[0], [pulse]);
  const severity: 'none' | 'high' | 'critical' = useMemo(() => {
    if (!latest) return 'none';
    if (latest.level === 'critical') return 'critical';
    if (latest.level === 'high') return 'high';
    return 'none';
  }, [latest]);

  const chip = (lvl: string) => {
    const map: Record<string, string> = {
      critical: '#ef4444', 
      high: '#3bd5ff', 
      medium: '#06b6d4', 
      low: '#a6adbb'
    };
    return map[lvl] ?? '#a6adbb';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Collapsed bar */}
      {!pulseOpen && (
        <div className="relative">
          <button
            onClick={() => setPulseOpen(true)}
            className="relative rounded-full px-4 py-2 border flex items-center gap-2"
            style={{
              background: TOKENS.color.surface.panel,
              borderColor: TOKENS.color.surface.border,
              boxShadow: TOKENS.shadow.soft,
              color: TOKENS.color.text.primary
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: chip(latest?.level ?? 'low') }} />
            <span className="text-sm">{latest?.title ?? 'Pulse idle'}</span>
          </button>

          {/* Soft neon halo (collapsed) */}
          <div className="absolute inset-0 -z-10" style={{ transform: 'translateY(4px)' }}>
            <GlowHalo severity={severity} />
          </div>
        </div>
      )}

      {/* Expanded panel */}
      {pulseOpen && (
        <div className="relative">
          <div
            className="relative rounded-2xl border w-[340px] max-h-[60vh] overflow-hidden"
            style={{
              background: TOKENS.color.surface.panel,
              borderColor: TOKENS.color.surface.border,
              boxShadow: TOKENS.shadow.soft,
              backdropFilter: `blur(20px)`
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: TOKENS.color.surface.border }}
            >
              <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>Pulse</div>
              <div className="flex gap-2">
                <button 
                  className="text-xs opacity-80 hover:opacity-100" 
                  style={{ color: TOKENS.color.text.secondary }} 
                  onClick={clearPulse}
                >
                  Clear
                </button>
                <button 
                  className="text-xs opacity-80 hover:opacity-100" 
                  style={{ color: TOKENS.color.text.secondary }} 
                  onClick={() => setPulseOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {pulse.length === 0 && (
                <div className="text-sm" style={{ color: TOKENS.color.text.muted }}>
                  No recent events.
                </div>
              )}

              {pulse.map(ev => (
                <div
                  key={ev.id}
                  className="relative rounded-xl border p-3"
                  style={{ 
                    borderColor: TOKENS.color.surface.border, 
                    background: TOKENS.color.surface.panel 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: chip(ev.level) }} />
                    <div className="text-sm" style={{ color: TOKENS.color.text.primary }}>
                      {ev.title}
                    </div>
                  </div>
                  {ev.detail && (
                    <div className="text-xs mt-1" style={{ color: TOKENS.color.text.secondary }}>
                      {ev.detail}
                    </div>
                  )}
                  {typeof ev.delta !== 'undefined' && (
                    <div className="text-xs mt-1" style={{ color: TOKENS.color.text.muted }}>
                      Δ {String(ev.delta)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Soft neon halo (expanded container) */}
          <div className="absolute inset-0 -z-10" style={{ transform: 'translateY(8px)' }}>
            <GlowHalo severity={severity} rounded="18px" />
          </div>
        </div>
      )}
    </div>
  );
}

