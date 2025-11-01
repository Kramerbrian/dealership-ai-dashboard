'use client';

export function DecayTaxBanner({ decayTax, score }: { decayTax: number; score: number }) {
  if (decayTax === 0) return null;

  return (
    <div className="sticky top-0 z-10 bg-yellow-600 text-white px-6 py-3 text-center text-sm font-medium">
      ⚠️ Your AI visibility score has decayed by {decayTax} points since last audit. 
      Re-run your audit to see updated recommendations.
    </div>
  );
}
