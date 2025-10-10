// ab.ts
export type Variant = 'A' | 'B';

export function getVariant(): Variant {
  const sp = new URLSearchParams(window.location.search);
  const qp = sp.get('variant');
  if (qp === 'A' || qp === 'B') return qp;

  const m = document.cookie.match(/(?:^|; )dai_variant=(A|B)/);
  if (m?.[1]) return m[1] as Variant;

  const v: Variant = Math.random() < 0.5 ? 'A' : 'B';
  document.cookie = `dai_variant=${v}; Path=/; Max-Age=${60 * 60 * 24 * 90}`;
  return v;
}

// Example helpers
export const copyByVariant = (v: Variant) =>
  v === 'A' ? 'Run Free AI Visibility Scan' : 'Get Your Free AI Scan';
export const ctaStyleByVariant = (v: Variant) =>
  v === 'A' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-blue-700';
