/**
 * Sentinel Governance System
 * Automated monitoring with β-calibration coupling
 */

import { sql } from '@vercel/postgres';
import { THRESH, SENTINEL_KINDS, SENTINEL_SEVERITY, type SentinelKind, type SentinelSeverity } from './policy';

type KpiRow = { 
  as_of: string; 
  aiv_pct: number; 
  ati_pct: number; 
  vli_integrity_pct: number; 
  hrp: number 
};

type SentinelEvent = {
  kind: SentinelKind;
  severity: SentinelSeverity;
  metric: any;
  note?: string;
};

export async function runSentinel(tenantId: string): Promise<SentinelEvent[]> {
  try {
    // Get last 8 KPI data points
    const q = await sql`
      SELECT as_of, aiv_pct, ati_pct, vli_integrity_pct,
             (clarity_json->>'hrp')::numeric as hrp
      FROM kpi_history 
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY as_of DESC 
      LIMIT 8
    `;
    
    const rows = (q.rows as KpiRow[]) || [];
    if (!rows.length) return [];

    const latest = rows[0];
    const weekAgo = rows[1] ?? latest;
    const sevenAgo = rows[Math.min(7, rows.length - 1)] ?? latest;

    const events: SentinelEvent[] = [];

    // 1) VLI degrade
    if (latest.vli_integrity_pct < THRESH.VLI_MIN) {
      events.push(evt(
        SENTINEL_KINDS.VLI_DEGRADE,
        SENTINEL_SEVERITY.WARNING,
        { name: "VLI", cur: latest.vli_integrity_pct },
        `VLI integrity ${latest.vli_integrity_pct}% below threshold ${THRESH.VLI_MIN}%`
      ));
    }

    // 2) ATI drop 7d
    const atiDrop = (sevenAgo.ati_pct ?? latest.ati_pct) - latest.ati_pct;
    if (atiDrop >= THRESH.ATI_DROP_7D) {
      events.push(evt(
        SENTINEL_KINDS.ATI_DROP,
        SENTINEL_SEVERITY.CRITICAL,
        { name: "ATI", cur: latest.ati_pct, prev: sevenAgo.ati_pct, delta: -atiDrop },
        `ATI dropped ${atiDrop.toFixed(1)} points in 7 days`
      ));
    }

    // 3) AIV stall 3w
    const aivFlat = rows.slice(0, THRESH.AIV_FLAT_WEEKS).every((r, i, arr) => 
      Math.abs(r.aiv_pct - arr[0].aiv_pct) < 0.25
    );
    if (aivFlat) {
      events.push(evt(
        SENTINEL_KINDS.AIV_STALL,
        SENTINEL_SEVERITY.WARNING,
        { name: "AIV", cur: latest.aiv_pct },
        `AIV growth stalled for ${THRESH.AIV_FLAT_WEEKS} weeks`
      ));
    }

    // 4) HRP breach
    if (latest.hrp >= THRESH.HRP_CRIT) {
      events.push(evt(
        SENTINEL_KINDS.HRP_CRIT,
        SENTINEL_SEVERITY.CRITICAL,
        { name: "HRP", cur: latest.hrp },
        `HRP critical threshold breached: ${(latest.hrp * 100).toFixed(1)}%`
      ));
    } else if (latest.hrp >= THRESH.HRP_WARN) {
      events.push(evt(
        SENTINEL_KINDS.HRP_WARN,
        SENTINEL_SEVERITY.WARNING,
        { name: "HRP", cur: latest.hrp },
        `HRP warning threshold: ${(latest.hrp * 100).toFixed(1)}%`
      ));
    }

    // Persist events and trigger coupling actions
    for (const e of events) {
      await sql`
        INSERT INTO sentinel_events (tenant_id, kind, severity, metric, note)
        VALUES (${tenantId}::uuid, ${e.kind}, ${e.severity}, ${JSON.stringify(e.metric)}::jsonb, ${e.note || null})
      `;
      
      await couple(tenantId, e); // Auto-responses
    }

    return events;
  } catch (error) {
    console.error('Sentinel evaluation failed:', error);
    return [];
  }
}

const evt = (
  kind: SentinelKind, 
  severity: SentinelSeverity, 
  metric: any, 
  note?: string
): SentinelEvent => ({ kind, severity, metric, note });

async function couple(tenantId: string, e: SentinelEvent): Promise<void> {
  try {
    // β-calibration on large trust/visibility shocks
    if (e.kind === SENTINEL_KINDS.ATI_DROP || e.kind === SENTINEL_KINDS.AIV_STALL) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/beta/recalibrate`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, trigger: e.kind })
      });
    }

    // Quarantine auto-content when HRP critical
    if (e.kind === SENTINEL_KINDS.HRP_CRIT) {
      await sql`
        UPDATE avi_reports 
        SET regime_state = 'Quarantine'
        WHERE tenant_id = ${tenantId}::uuid 
          AND as_of = (
            SELECT max(as_of) 
            FROM avi_reports 
            WHERE tenant_id = ${tenantId}::uuid
          )
      `;
    }

    // Log beta calibration
    if (e.kind === SENTINEL_KINDS.ATI_DROP || e.kind === SENTINEL_KINDS.AIV_STALL) {
      await sql`
        INSERT INTO beta_calibrations (tenant_id, trigger_event, old_weights, new_weights, confidence_score)
        VALUES (
          ${tenantId}::uuid, 
          ${e.kind}, 
          '{}'::jsonb, 
          '{}'::jsonb, 
          0.85
        )
      `;
    }
  } catch (error) {
    console.error('Sentinel coupling failed:', error);
  }
}

export async function getLatestAlerts(tenantId: string, limit: number = 50) {
  try {
    const result = await sql`
      SELECT kind, severity, metric, note, created_at
      FROM sentinel_events 
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return [];
  }
}