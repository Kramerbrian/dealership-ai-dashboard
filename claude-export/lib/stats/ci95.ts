export function ci95(samples: number[]) {
  const n = samples.length;
  if (n < 3) return { low: samples.at(-1) ?? 0, high: samples.at(-1) ?? 0, n };
  const mean = samples.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(samples.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  const se = sd / Math.sqrt(n);
  // t critical ~ 2.365 (n≈8). Good enough for 5–12 window.
  const t = 2.365;
  return { low: +(mean - t * se).toFixed(2), high: +(mean + t * se).toFixed(2), n };
}