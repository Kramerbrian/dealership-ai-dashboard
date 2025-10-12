/**
 * HeaderTiles Component
 * Displays key KPI metrics at the top of the dashboard
 * Part of DealershipAI Command Center
 */

import { KPI_LABELS } from '@/lib/labels';

interface HeaderTilesProps {
  tenantId: string;
}

export default async function HeaderTiles({ tenantId }: HeaderTilesProps) {
  // Fetch AIV (Algorithmic Visibility Index) and ATI (Algorithmic Trust Index) in parallel
  const [aivResponse, atiResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tenants/${tenantId}/avi/latest`, {
      cache: 'no-store',
    }).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tenants/${tenantId}/ati/latest`, {
      cache: 'no-store',
    }).then((r) => r.json()),
  ]);

  // If no AIV data, don't render tiles
  if (!aivResponse?.data) return null;

  const aiv = aivResponse.data;
  const ati = atiResponse?.data;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {/* AIV - Algorithmic Visibility Index */}
      <Tile
        title={KPI_LABELS.aiv}
        value={`${Number(aiv.aiv_pct).toFixed(1)} / 100`}
        hint="SERP+Answer fusion · temporal decay"
      />

      {/* ATI - Algorithmic Trust Index */}
      <Tile
        title={KPI_LABELS.trust}
        value={ati ? `${Number(ati.ati_pct).toFixed(1)} / 100` : '—'}
        hint="precision, consistency, recency, authenticity, alignment"
      />

      {/* CRS - Composite Reputation Score */}
      <Tile
        title={KPI_LABELS.reputation}
        value={`${Number(aiv.crs_pct).toFixed(1)} / 100`}
        hint="Bayesian fusion AIV↔ATI"
      />

      {/* Elasticity - Revenue impact per AIV point */}
      <Tile
        title={KPI_LABELS.elasticity}
        value={`$${Number(aiv.elasticity_usd_per_point).toLocaleString()}`}
        hint={`R² ${Number(aiv.r2).toFixed(2)} · window ${aiv.window_weeks}w`}
      />
    </div>
  );
}

interface TileProps {
  title: string;
  value: string;
  hint: string;
}

function Tile({ title, value, hint }: TileProps) {
  return (
    <div className="rounded-2xl border border-border-soft bg-bg-glass backdrop-blur-glass p-4 hover:border-border-hover transition-colors">
      {/* Title */}
      <div className="text-xs text-text-secondary uppercase tracking-wider">
        {title}
      </div>

      {/* Value */}
      <div className="mt-1 text-3xl font-light text-text-primary tabular-nums">
        {value}
      </div>

      {/* Hint/Description */}
      <div className="mt-2 text-xs text-text-secondary leading-relaxed">
        {hint}
      </div>
    </div>
  );
}
