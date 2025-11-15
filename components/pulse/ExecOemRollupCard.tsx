/**
 * ExecOemRollupCard
 * Group-level OEM coverage card for executive Pulse dashboard
 * Shows coverage across all rooftops for a specific OEM model
 */

'use client';

type ExecOemRollupCardProps = {
  oemLabel: string; // "2026 Toyota Tacoma"
  brand: string; // "Toyota"
  rollup: {
    group_id: string;
    group_name: string;
    rooftops_total: number;
    rooftops_relevant: number;
    rooftops_high_priority: number;
    avg_priority_score: number; // 0–100
  };
  onApplyAll?: () => void; // "Fix all Toyota rooftops"
  onOpenDetails?: () => void;
};

export function ExecOemRollupCard({
  oemLabel,
  brand,
  rollup,
  onApplyAll,
  onOpenDetails,
}: ExecOemRollupCardProps) {
  const coveragePct = rollup.rooftops_total
    ? Math.round((rollup.rooftops_relevant / rollup.rooftops_total) * 100)
    : 0;

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-950/90 px-5 py-4 sm:px-6 sm:py-5 shadow-[0_18px_40px_rgba(15,23,42,0.8)]"
      aria-label={`OEM coverage for ${oemLabel} in ${rollup.group_name}`}
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">
            OEM Coverage • {brand}
          </p>
          <h2 className="text-sm font-semibold text-slate-50 sm:text-base">
            {oemLabel}
          </h2>
          <p className="mt-1 text-[12px] text-slate-400">
            {rollup.group_name} • {rollup.rooftops_relevant}/{rollup.rooftops_total} rooftops touched
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-slate-50">
            {rollup.avg_priority_score}
          </div>
          <div className="text-[11px] text-slate-500">Avg priority score</div>
        </div>
      </header>

      <div className="mb-3 grid grid-cols-3 gap-3 text-[11px] text-slate-300">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span>Coverage</span>
            <span className="font-semibold">{coveragePct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {rollup.rooftops_relevant} of {rollup.rooftops_total} rooftops have OEM tiles
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span>P0 rooftops</span>
            <span className="font-semibold">{rollup.rooftops_high_priority}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            High-priority stores (heavy {brand} {oemLabel.split(' ').slice(1).join(' ')} mix)
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span>Group view</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Use this card to apply OEM updates across all relevant rooftops in one action.
          </p>
        </div>
      </div>

      <footer className="mt-3 flex flex-col gap-2 border-t border-slate-800/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] text-slate-500">
          Pushing MY changes group-wide keeps SRP/VDP, schema, and content aligned with OEM guidance.
        </div>
        <div className="flex gap-2">
          {onApplyAll && (
            <button
              onClick={onApplyAll}
              className="inline-flex h-8 items-center justify-center rounded-full bg-sky-500 px-3 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Apply across group
            </button>
          )}
          {onOpenDetails && (
            <button
              onClick={onOpenDetails}
              className="inline-flex h-8 items-center justify-center rounded-full border border-slate-700 px-3 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
            >
              View rooftop breakdown
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

