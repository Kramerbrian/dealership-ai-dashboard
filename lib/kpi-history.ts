/**
 * KPI History Utilities
 * Helper functions for KPI data collection and management
 */

import { sql } from '@vercel/postgres';

export async function insert_kpi_history(
  tenantId: string,
  aivPct: number,
  atiPct: number,
  vliIntegrityPct: number,
  clarityJson: any = {}
): Promise<string> {
  try {
    const result = await sql`
      INSERT INTO kpi_history (
        tenant_id, as_of, aiv_pct, ati_pct, vli_integrity_pct, clarity_json
      ) VALUES (
        ${tenantId}::uuid, 
        now(), 
        ${aivPct}, 
        ${atiPct}, 
        ${vliIntegrityPct}, 
        ${JSON.stringify(clarityJson)}::jsonb
      )
      RETURNING id
    `;
    
    return result.rows[0]?.id || '';
  } catch (error) {
    console.error('Failed to insert KPI history:', error);
    throw error;
  }
}

export async function getLatestKPIs(tenantId: string, limit: number = 30) {
  try {
    const result = await sql`
      SELECT 
        id, as_of, aiv_pct, ati_pct, vli_integrity_pct, clarity_json, created_at
      FROM kpi_history 
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY as_of DESC 
      LIMIT ${limit}
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch latest KPIs:', error);
    return [];
  }
}

export async function getKPITrends(tenantId: string, days: number = 30) {
  try {
    const result = await sql`
      SELECT 
        DATE(as_of) as date,
        AVG(aiv_pct) as avg_aiv,
        AVG(ati_pct) as avg_ati,
        AVG(vli_integrity_pct) as avg_vli,
        AVG((clarity_json->>'hrp')::numeric) as avg_hrp,
        COUNT(*) as data_points
      FROM kpi_history 
      WHERE tenant_id = ${tenantId}::uuid
        AND as_of >= now() - interval '${days} days'
      GROUP BY DATE(as_of)
      ORDER BY date DESC
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch KPI trends:', error);
    return [];
  }
}

export async function calculateKPIVariance(tenantId: string, days: number = 30) {
  try {
    const result = await sql`
      SELECT 
        STDDEV(aiv_pct) as aiv_variance,
        STDDEV(ati_pct) as ati_variance,
        STDDEV(vli_integrity_pct) as vli_variance,
        STDDEV((clarity_json->>'hrp')::numeric) as hrp_variance,
        COUNT(*) as data_points
      FROM kpi_history 
      WHERE tenant_id = ${tenantId}::uuid
        AND as_of >= now() - interval '${days} days'
    `;
    
    return result.rows[0] || {};
  } catch (error) {
    console.error('Failed to calculate KPI variance:', error);
    return {};
  }
}
