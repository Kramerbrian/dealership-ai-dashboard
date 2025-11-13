'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TOKENS } from '@/lib/design-tokens';
import { useHudStore } from '@/lib/store/hud';
import { deployMockFix, openTriage, openInsightsAIV, compareCompetitors, togglePulse } from '@/lib/actions/mock';
import { playSonic } from '@/lib/sound/palette';
import { tap } from '@/lib/sound/haptics';

type Cmd = { id: string; label: string; run: () => void };

export function CommandPalette() {
  const { paletteOpen, setPalette } = useHudStore();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Cmd[] = useMemo(
    () => [
      {
        id: 'triage',
        label: 'Open Triage (Incidents)',
        run: openTriage,
      },
      {
        id: 'fix-next',
        label: 'Fix Next (Auto-Fix top incident)',
        run: () => deployMockFix({ kpi: 'Schema Coverage', delta: '+12' }),
      },
      {
        id: 'insights-aiv',
        label: 'Insights • AIV',
        run: openInsightsAIV,
      },
      {
        id: 'compare',
        label: 'Compare Competitors (GEO/AIV/ATI)',
        run: compareCompetitors,
      },
      {
        id: 'pulse-toggle',
        label: 'Toggle Pulse Dock',
        run: togglePulse,
      },
    ],
    []
  );

  const results = useMemo(() => {
    const k = q.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(k));
  }, [q, commands]);

  // Global shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        playSonic('pulse');
        tap();
        setPalette(!paletteOpen);
      }
      // Escape to close
      if (e.key === 'Escape' && paletteOpen) {
        setPalette(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPalette]);

  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQ(''); // Reset query when closed
    }
  }, [paletteOpen]);

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setPalette(false)}
        aria-label="Close command palette"
      />

      {/* Palette */}
      <div
        className="absolute left-1/2 top-24 -translate-x-1/2 w-full max-w-xl rounded-2xl border"
        style={{
          background: TOKENS.color.surface.panel,
          borderColor: TOKENS.color.surface.border,
          boxShadow: TOKENS.shadow.soft,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Input */}
        <div className="p-3 border-b" style={{ borderColor: TOKENS.color.surface.border }}>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command… (try: fix, insights, triage)"
            className="w-full bg-transparent outline-none"
            style={{
              fontSize: TOKENS.typography.fontSize.base,
              color: TOKENS.color.text.primary,
            }}
            aria-label="Command search"
          />
        </div>

        {/* Results */}
        <div className="p-2 max-h-[50vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="p-3 text-sm text-center" style={{ color: TOKENS.color.text.muted }}>
              No commands found.
            </div>
          )}

          {results.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.run();
                setPalette(false);
                playSonic('click');
                tap();
              }}
              className="w-full text-left rounded-xl p-3 border mb-2 hover:opacity-90 transition-opacity"
              style={{
                borderColor: TOKENS.color.surface.border,
                background: 'rgba(0,0,0,0.2)',
                color: TOKENS.color.text.primary,
              }}
            >
              <div className="text-sm">{cmd.label}</div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="px-3 py-2 border-t text-xs text-center"
          style={{
            borderColor: TOKENS.color.surface.border,
            color: TOKENS.color.text.muted,
          }}
        >
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
