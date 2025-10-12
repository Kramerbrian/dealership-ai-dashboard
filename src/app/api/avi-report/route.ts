import { NextRequest, NextResponse } from 'next/server';
import { AviReport, AviReportZ } from '@/types/avi-report';
import { supabaseAdmin } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';
import { getAviReportCacheKey, getAviReportCacheTags, logCacheAccess } from '@/lib/utils/avi-cache';

export const dynamic = 'force-dynamic';

// Feature flag for mock data fallback
const USE_MOCK_FALLBACK = process.env.AVI_USE_MOCK_FALLBACK !== 'false';

/**
 * Transform database row to AviReport type
 */
function transformDatabaseRow(row: any): AviReport {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    version: row.version,
    asOf: row.as_of,
    windowWeeks: row.window_weeks,
    aivPct: parseFloat(row.aiv_pct),
    atiPct: parseFloat(row.ati_pct),
    crsPct: parseFloat(row.crs_pct),
    elasticity: row.elasticity,
    pillars: row.pillars,
    modifiers: row.modifiers,
    clarity: row.clarity,
    secondarySignals: row.secondary_signals,
    ci95: row.ci95,
    regimeState: row.regime_state,
    counterfactual: row.counterfactual,
    drivers: row.drivers,
    anomalies: row.anomalies,
    backlogSummary: row.backlog_summary,
  };
}

/**
 * Fetch AVI report from database with enhanced metrics
 */
async function fetchAviReportFromDatabase(tenantId: string): Promise<AviReport | null> {
  try {
    // Fetch main AVI report
    const { data, error } = await supabaseAdmin
      .from('avi_reports')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('as_of', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    // Fetch AEMD metrics for the same date
    const { data: aemdData } = await supabaseAdmin
      .from('aemd_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('report_date', data.as_of)
      .single();

    // Fetch accuracy monitoring for the same date
    const { data: accuracyData } = await supabaseAdmin
      .from('accuracy_monitoring')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('measurement_date', data.as_of)
      .lte('measurement_date', new Date(new Date(data.as_of).getTime() + 86400000).toISOString())
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    const report = transformDatabaseRow(data);

    // Add AEMD metrics to report
    if (aemdData) {
      (report as any).aemdMetrics = {
        aemdFinal: parseFloat(aemdData.aemd_final),
        fsScore: parseFloat(aemdData.fs_score),
        aioScore: parseFloat(aemdData.aio_score),
        paaScore: parseFloat(aemdData.paa_score),
        omegaFs: parseFloat(aemdData.omega_fs),
        omegaAio: parseFloat(aemdData.omega_aio),
        omegaPaa: parseFloat(aemdData.omega_paa),
      };
    }

    // Add accuracy metrics to report
    if (accuracyData) {
      (report as any).accuracyMetrics = {
        issueDetectionAccuracy: parseFloat(accuracyData.issue_detection_accuracy),
        rankingCorrelation: parseFloat(accuracyData.ranking_correlation),
        consensusReliability: parseFloat(accuracyData.consensus_reliability),
        variance: parseFloat(accuracyData.variance),
        confidenceLevel: accuracyData.confidence_level,
        isBelowThreshold: accuracyData.is_below_threshold,
      };
    }

    return report;
  } catch (error) {
    console.error('[AVI Report API] Database fetch error:', error);
    throw error;
  }
}

/**
 * Mock data generator for AVI Report (fallback)
 */
function generateMockAviReport(tenantId: string): AviReport {
  const baseAIV = 78 + Math.random() * 15;
  const baseATI = 72 + Math.random() * 12;
  const baseCRS = (baseAIV + baseATI) / 2 + Math.random() * 5;

  return {
    id: crypto.randomUUID(),
    tenantId,
    version: '1.3.0',
    asOf: new Date().toISOString().split('T')[0],
    windowWeeks: 8,
    aivPct: Math.round(baseAIV * 100) / 100,
    atiPct: Math.round(baseATI * 100) / 100,
    crsPct: Math.round(baseCRS * 100) / 100,
    elasticity: {
      usdPerPoint: Math.round((150 + Math.random() * 100) * 100) / 100,
      r2: Math.round((0.78 + Math.random() * 0.15) * 1000) / 1000
    },
    pillars: {
      seo: Math.round((75 + Math.random() * 20) * 100) / 100,
      aeo: Math.round((68 + Math.random() * 25) * 100) / 100,
      geo: Math.round((82 + Math.random() * 15) * 100) / 100,
      ugc: Math.round((71 + Math.random() * 18) * 100) / 100,
      geoLocal: Math.round((85 + Math.random() * 12) * 100) / 100
    },
    modifiers: {
      temporalWeight: Math.round((1.0 + Math.random() * 0.4) * 100) / 100,
      entityConfidence: Math.round((0.82 + Math.random() * 0.15) * 100) / 100,
      crawlBudgetMult: Math.round((1.1 + Math.random() * 0.5) * 100) / 100,
      inventoryTruthMult: Math.round((1.2 + Math.random() * 0.4) * 100) / 100
    },
    clarity: {
      scs: Math.round((0.85 + Math.random() * 0.12) * 100) / 100,
      sis: Math.round((0.78 + Math.random() * 0.15) * 100) / 100,
      adi: Math.round((0.88 + Math.random() * 0.10) * 100) / 100,
      scr: Math.round((0.82 + Math.random() * 0.13) * 100) / 100,
      selComposite: Math.round((0.83 + Math.random() * 0.12) * 100) / 100
    },
    secondarySignals: {
      engagementDepth: Math.round((72 + Math.random() * 20) * 100) / 100,
      technicalHealth: Math.round((88 + Math.random() * 10) * 100) / 100,
      localEntityAccuracy: Math.round((91 + Math.random() * 8) * 100) / 100,
      brandSemanticFootprint: Math.round((76 + Math.random() * 15) * 100) / 100
    },
    ci95: {
      aiv: {
        low: Math.round((baseAIV - 3.5) * 100) / 100,
        high: Math.round((baseAIV + 3.5) * 100) / 100
      },
      ati: {
        low: Math.round((baseATI - 3.2) * 100) / 100,
        high: Math.round((baseATI + 3.2) * 100) / 100
      },
      crs: {
        low: Math.round((baseCRS - 2.8) * 100) / 100,
        high: Math.round((baseCRS + 2.8) * 100) / 100
      },
      elasticity: {
        low: Math.round(130 * 100) / 100,
        high: Math.round(270 * 100) / 100
      }
    },
    regimeState: Math.random() > 0.8 ? 'ShiftDetected' : 'Normal',
    counterfactual: {
      rarObservedUsd: Math.round((245000 + Math.random() * 50000) * 100) / 100,
      rarCounterfactualUsd: Math.round((210000 + Math.random() * 40000) * 100) / 100,
      deltaUsd: Math.round((35000 + Math.random() * 10000) * 100) / 100
    },
    drivers: [
      { metric: 'AIV', name: 'Schema Markup Coverage', contribution: Math.round((12.5 + Math.random() * 5) * 10) / 10 },
      { metric: 'AIV', name: 'Entity Recognition', contribution: Math.round((8.3 + Math.random() * 4) * 10) / 10 },
      { metric: 'ATI', name: 'Local Pack Presence', contribution: Math.round((15.2 + Math.random() * 6) * 10) / 10 },
      { metric: 'ATI', name: 'Review Velocity', contribution: Math.round((10.8 + Math.random() * 5) * 10) / 10 },
      { metric: 'AIV', name: 'Inventory Freshness', contribution: Math.round((6.5 + Math.random() * 3) * 10) / 10 }
    ],
    anomalies: Math.random() > 0.6 ? [
      {
        signal: 'SEO Score',
        zScore: Math.round((2.3 + Math.random() * 1.5) * 10) / 10,
        note: 'Significant improvement detected in organic visibility'
      }
    ] : undefined,
    backlogSummary: [
      {
        taskId: 'TASK-001',
        title: 'Implement FAQ schema on inventory pages',
        estDeltaAivLow: 2.5,
        estDeltaAivHigh: 4.8,
        projectedImpactLowUsd: 5000,
        projectedImpactHighUsd: 12000,
        effortPoints: 3,
        banditScore: 0.87
      },
      {
        taskId: 'TASK-002',
        title: 'Optimize local business entity markup',
        estDeltaAivLow: 1.8,
        estDeltaAivHigh: 3.2,
        projectedImpactLowUsd: 3500,
        projectedImpactHighUsd: 8000,
        effortPoints: 2,
        banditScore: 0.82
      },
      {
        taskId: 'TASK-003',
        title: 'Add video content to service pages',
        estDeltaAivLow: 3.2,
        estDeltaAivHigh: 6.1,
        projectedImpactLowUsd: 8000,
        projectedImpactHighUsd: 15000,
        effortPoints: 5,
        banditScore: 0.78
      },
      {
        taskId: 'TASK-004',
        title: 'Improve review response time',
        estDeltaAivLow: 1.2,
        estDeltaAivHigh: 2.5,
        projectedImpactLowUsd: 2500,
        projectedImpactHighUsd: 6000,
        effortPoints: 2,
        banditScore: 0.75
      }
    ]
  };
}

/**
 * Cached AVI report fetcher with fallback
 */
async function getCachedAviReport(tenantId: string): Promise<AviReport> {
  const cacheKey = getAviReportCacheKey(tenantId);
  const cacheTags = getAviReportCacheTags(tenantId);

  // Create cached fetcher
  const cachedFetch = unstable_cache(
    async () => {
      try {
        // Try database first
        const report = await fetchAviReportFromDatabase(tenantId);

        if (report) {
          logCacheAccess({ hit: false, key: cacheKey, timestamp: Date.now() });

          // Validate with Zod
          const validatedReport = AviReportZ.parse(report);
          return { source: 'database', report: validatedReport };
        }

        // Fall back to mock data if enabled
        if (USE_MOCK_FALLBACK) {
          console.log(`[AVI Report API] No database record found for tenant ${tenantId}, using mock data`);
          const mockReport = generateMockAviReport(tenantId);
          return { source: 'mock', report: mockReport };
        }

        // No data available
        throw new Error('No AVI report found and mock fallback is disabled');

      } catch (error) {
        console.error('[AVI Report API] Error in cached fetch:', error);

        // Fall back to mock on error if enabled
        if (USE_MOCK_FALLBACK) {
          console.log('[AVI Report API] Falling back to mock data due to error');
          const mockReport = generateMockAviReport(tenantId);
          return { source: 'mock', report: mockReport };
        }

        throw error;
      }
    },
    [cacheKey],
    {
      revalidate: parseInt(process.env.AVI_CACHE_TTL || '300', 10), // 5 minutes default
      tags: cacheTags,
    }
  );

  const result = await cachedFetch();
  return result.report;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || crypto.randomUUID();

    // Get AVI report with caching
    const aviReport = await getCachedAviReport(tenantId);

    return NextResponse.json(aviReport);

  } catch (error) {
    console.error('[AVI Report API] Request failed:', error);

    // Return appropriate error
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch AVI report';

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
