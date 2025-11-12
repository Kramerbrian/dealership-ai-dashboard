'use client';
import { useVitals } from '@/lib/hooks/useVitals';
import { TOKENS } from '@/styles/design-tokens';

export default function VitalsBadge() {
  const { lcp, cls, inp } = useVitals();

  const chip = (ok: boolean) => ({
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    background: ok ? 'rgba(34,197,94,.18)' : 'rgba(239,68,68,.18)',
    color: ok ? '#22c55e' : '#ef4444',
    border: `1px solid ${ok ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)'}`,
  });

  return (
    <div
      className="fixed bottom-4 left-4 z-[60] rounded-2xl border px-3 py-2"
      style={{
        background: TOKENS.color.surface.panel,
        borderColor: TOKENS.color.surface.border,
        boxShadow: TOKENS.shadow.soft,
        color: TOKENS.color.text.secondary,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Vitals</span>
        <span style={chip((lcp ?? 999) <= 2500)}>LCP {lcp ? `${lcp}ms` : '—'}</span>
        <span style={chip((cls ?? 1) <= 0.1)}>CLS {cls ?? '—'}</span>
        <span style={chip((inp ?? 999) <= 200)}>INP {inp ? `${inp}ms` : '—'}</span>
      </div>
    </div>
  );
}
