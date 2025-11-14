import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Minimal registry adapter:
 * - Prefers a code registry (lib/pulse/registry)
 * - Falls back to reading a JSON module if present
 */
async function loadRegistry() {
  try {
    const mod = await import('@/lib/pulse/registry'); // e.g., export const REGISTRY = {…}
    return (mod as any).REGISTRY;
  } catch {
    // Optional: dynamic JSON (if you keep it under configs/pulse.registry.json and bundle it)
    try {
      const mod = await import('../../../../configs/pulse.registry.json', { with: { type: 'json' } } as any);
      return (mod as any).default;
    } catch {
      return {
        version: '1.0',
        roleOrders: { default: ['rar','oci','refund_delta','freshness','cache_hit','triangulation'] },
        tiles: {
          rar: { label: 'Revenue at Risk', units: 'usd', thresholds: { green: 10000, yellow: 50000 } },
          oci: { label: 'Opportunity Cost', units: 'usd', thresholds: { green: 5000, yellow: 20000 } },
          refund_delta: { label: 'Refund Δ', units: 'pp', thresholds: { green: 0.2, yellow: 0.5 } },
          freshness: { label: 'Freshness', units: 'days', thresholds: { green: 2, yellow: 5 } },
          cache_hit: { label: 'Cache Hit %', units: 'pct', thresholds: { green: 0.85, yellow: 0.70 } },
          triangulation: { label: 'Triangulation', units: 'score', thresholds: { green: 0.75, yellow: 0.60 } },
        }
      };
    }
  }
}

function asNumber(v: any, d = 0) {
  return Number.isFinite(+v) ? +v : d;
}

function statusFor(units: string, value: number, thr: any) {
  // Inverse/normalized statuses can be adapted; keep simple thresholds
  if (units === 'days') return value <= thr.green ? 'green' : value <= thr.yellow ? 'yellow' : 'red';
  if (units === 'usd' || units === 'pp') return value <= thr.green ? 'green' : value <= thr.yellow ? 'yellow' : 'red';
  if (units === 'pct' || units === 'score') return value >= thr.green ? 'green' : value >= thr.yellow ? 'yellow' : 'red';
  return 'yellow';
}

/**
 * Build baseline tiles from registry + (optional) warehouse snapshot.
 * Replace the mocked "values" map with your warehouse lookups if needed.
 */
async function buildBaselineTiles(registry: any, role: string) {
  const order: string[] = registry.roleOrders[role] || registry.roleOrders.default || Object.keys(registry.tiles);
  // TODO: replace "values" with real metrics
  const values: Record<string, any> = {
    rar: { value_usd: 61200 },
    oci: { value_usd: 18450 },
    refund_delta: { value_pp: 0.36 },
    freshness: { value_days: 2 },
    cache_hit: { value: 0.83 },
    triangulation: { value: 0.71 },
  };

  const tiles = order
    .filter((k) => registry.tiles[k])
    .map((k) => {
      const def = registry.tiles[k];
      const v = values[k] || {};

      // Determine status by units + thresholds
      let rawVal = 0;
      if ('value_usd' in v) rawVal = asNumber(v.value_usd);
      else if ('value_pp' in v) rawVal = asNumber(v.value_pp);
      else if ('value_days' in v) rawVal = asNumber(v.value_days);
      else if ('value' in v) rawVal = asNumber(v.value);

      const status = statusFor(def.units, rawVal, def.thresholds || { green: 0, yellow: 0 });

      return {
        key: k,
        label: def.label,
        ...v,
        status,
      };
    });

  return tiles;
}

/**
 * Read agent-proposed tiles from inbox in Redis.
 * Key: pulse:inbox:${tenant}
 * Each inbox item should be a JSON string representing:
 *   { key?:string, title:string, kpi?:string, delta?:string, actions?:string[], ts?:number }
 * We adapt them into "tiles" the UI already renders.
 */
async function readInboxTiles(tenant: string) {
  const key = `pulse:inbox:${tenant}`;
  const raw = await redis.lrange<string>(key, 0, 30).catch(() => []);
  const now = Date.now();
  const mapped = raw
    .map((s) => { try { return JSON.parse(s); } catch { return undefined; } })
    .filter(Boolean)
    .map((t: any) => {
      // Use Web Crypto API for Edge runtime compatibility
      const generateId = () => {
        if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
          return globalThis.crypto.randomUUID().slice(0, 8);
        }
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      };
      const k = t.key || `inbox_${generateId()}`;
      return {
        key: k,
        label: t.title || 'Agent Proposal',
        value_text: t.kpi || undefined,
        delta_text: t.delta || undefined,
        status: 'yellow',
        actions: t.actions || [],
        ts: t.ts || now
      };
    });

  return mapped;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tenant = url.searchParams.get('tenant') || 'default';
  const role = url.searchParams.get('role') || 'default';

  const registry = await loadRegistry();

  // 1) Build your baseline tiles from registry + warehouse (or mocked values)
  const baseTiles = await buildBaselineTiles(registry, role);

  // 2) Read agent inbox tiles and append (or prepend) them
  const inboxTiles = await readInboxTiles(tenant);

  // Merge policy:
  // - Prepend agentic tiles so they are seen first; you can gate by rank/score if needed.
  const tiles = [...inboxTiles, ...baseTiles];

  const header = {
    saved_month_usd: 34800,             // stub value; replace from warehouse
    risk_usd: asNumber(baseTiles.find((t) => t.key === 'rar')?.value_usd, 0),
    model: 'ayv-2025.11.1',             // keep provenance coherent with your UI
    last_update: new Date().toISOString()
  };

  const res = NextResponse.json({
    header,
    tiles,
    registry_version: registry.version || '1.0'
  });

  // Reasonable CDN hint for a dynamic-but-fast endpoint
  res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
  return res;
}
