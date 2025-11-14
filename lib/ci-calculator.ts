import { db } from '@/db';
import { sql } from 'drizzle-orm';

export interface ConfidenceInterval {
  low: number;
  high: number;
  width: number;
  stable: boolean;
  inputs: number;
}

/**
 * Calculate 95% confidence interval for a metric
 */
export function calculateCI95(values: number[]): ConfidenceInterval {
  if (values.length < 2) {
    return { low: 0, high: 0, width: 0, stable: false, inputs: values.length };
  }

  const n = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  
  // t-distribution critical value for 95% CI
  const tCritical = n > 30 ? 1.96 : n > 20 ? 2.042 : 2.228; // More precise t-values
  const marginOfError = tCritical * (stdDev / Math.sqrt(n));
  
  const low = Math.max(0, mean - marginOfError);
  const high = Math.min(100, mean + marginOfError);
  const width = high - low;
  const stable = width <= 8; // Stable if CI width <= 8 points
  
  return { low, high, width, stable, inputs: n };
}

/**
 * Calculate CI bands for KPI history with detailed inputs
 */
export async function calculateKPICIs(tenantId: string, weeks: number = 12): Promise<{
  aiv_ci: ConfidenceInterval;
  ati_ci: ConfidenceInterval;
  crs_ci: ConfidenceInterval;
  lastUpdated: string;
}> {
  const result = await db.execute(sql`
    SELECT aiv_pct, ati_pct, crs_pct, as_of
    FROM kpi_history
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY as_of DESC
    LIMIT ${weeks}
  `);

  const aivValues = (result as any).rows.map((r: any) => Number(r.aiv_pct || 0));
  const atiValues = (result as any).rows.map((r: any) => Number(r.ati_pct || 0));
  const crsValues = (result as any).rows.map((r: any) => Number(r.crs_pct || 0));
  const lastUpdated = (result as any).rows[0]?.as_of || new Date().toISOString();

  return {
    aiv_ci: calculateCI95(aivValues),
    ati_ci: calculateCI95(atiValues),
    crs_ci: calculateCI95(crsValues),
    lastUpdated,
  };
}

/**
 * Update KPI history with CI bands
 */
export async function updateKPICIs(tenantId: string, asOf: string): Promise<void> {
  const cis = await calculateKPICIs(tenantId);
  
  await db.execute(sql`
    UPDATE kpi_history
    SET aiv_ci = ${JSON.stringify(cis.aiv_ci)}::jsonb,
        ati_ci = ${JSON.stringify(cis.ati_ci)}::jsonb,
        crs_ci = ${JSON.stringify(cis.crs_ci)}::jsonb
    WHERE tenant_id = ${tenantId}::uuid
      AND as_of = ${asOf}::date
  `);
}

/**
 * Get CI status for display
 */
export function getCIStatus(ci: ConfidenceInterval): {
  status: 'stable' | 'unstable' | 'insufficient';
  color: string;
  message: string;
} {
  if (ci.inputs < 3) {
    return {
      status: 'insufficient',
      color: 'gray',
      message: `Insufficient data (${ci.inputs} points)`
    };
  }
  
  if (ci.stable) {
    return {
      status: 'stable',
      color: 'green',
      message: `Stable (${ci.width.toFixed(1)} pts)`
    };
  }
  
  return {
    status: 'unstable',
    color: 'red',
    message: `Unstable (${ci.width.toFixed(1)} pts)`
  };
}