import { createClient } from '@supabase/supabase-js';
import { startOfWeek } from 'date-fns';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

interface AviReportData {
  pillars: any;
  modifiers: any;
  clarity: any;
  secondary?: any;
  aivPct: number;
  atiPct: number;
  crsPct: number;
  elasticity: { usdPerPoint: number };
  r2: number;
  ci95: any;
  counterfactual?: any;
  drivers?: any;
  anomalies?: any;
  backlog?: any;
  regime: string;
  version: string;
}

// Mock implementation - replace with actual data pipeline
async function buildAviFromPipelines(tenantId: string, asOf: Date): Promise<AviReportData> {
  // This is a mock implementation
  // In production, this would pull from your actual data pipelines
  
  const baseScore = 45 + Math.random() * 30; // Random score between 45-75
  
  return {
    pillars: {
      seo_visibility: { score: baseScore, weight: 0.30 },
      aeo_visibility: { score: baseScore + 5, weight: 0.35 },
      geo_visibility: { score: baseScore - 3, weight: 0.35 }
    },
    modifiers: {
      market_size: 1.2,
      competition: 0.9,
      seasonality: 1.1
    },
    clarity: {
      scs: baseScore * 0.8, // Schema Clarity Score
      sis: baseScore * 0.9, // Schema Implementation Score
      adi: baseScore * 0.7, // AI Data Integration
      scr: baseScore * 0.85 // Schema Compliance Rate
    },
    secondary: {
      social_signals: baseScore * 0.6,
      review_velocity: baseScore * 0.8,
      content_freshness: baseScore * 0.9
    },
    aivPct: baseScore,
    atiPct: baseScore + 2,
    crsPct: baseScore - 1,
    elasticity: { usdPerPoint: 1250 + Math.random() * 500 },
    r2: 0.85 + Math.random() * 0.1,
    ci95: [baseScore - 5, baseScore + 5],
    counterfactual: {
      without_optimization: baseScore - 15,
      with_full_optimization: baseScore + 20
    },
    drivers: [
      "Local SEO optimization",
      "Review response rate",
      "Schema markup implementation"
    ],
    anomalies: [],
    backlog: [
      "Implement FAQ schema",
      "Optimize for voice search",
      "Improve local citations"
    ],
    regime: "stable",
    version: "1.0.0"
  };
}

export async function computeAviReport(tenantId: string, asOf = startOfWeek(new Date(), { weekStartsOn: 1 })) {
  try {
    console.log(`Computing AVI report for tenant ${tenantId} as of ${asOf.toISOString()}`);
    
    // Build AVI data from pipelines
    const {
      pillars,
      modifiers,
      clarity,
      secondary,
      aivPct,
      atiPct,
      crsPct,
      elasticity,
      r2,
      ci95,
      counterfactual,
      drivers,
      anomalies,
      backlog,
      regime,
      version
    } = await buildAviFromPipelines(tenantId, asOf);

    // Insert or update AVI report
    const { error } = await supabase
      .from('avi_reports')
      .upsert({
        tenant_id: tenantId,
        as_of: asOf.toISOString().split('T')[0], // Convert to date string
        window_weeks: 8,
        aiv_pct: aivPct,
        ati_pct: atiPct,
        crs_pct: crsPct,
        elasticity_usd_per_point: elasticity.usdPerPoint,
        r2: r2,
        pillars_json: pillars,
        modifiers_json: modifiers,
        clarity_json: clarity,
        secondary_json: secondary,
        ci95_json: ci95,
        counterfactual_json: counterfactual,
        drivers_json: drivers,
        anomalies_json: anomalies,
        backlog_json: backlog,
        regime_state: regime,
        version: version
      }, {
        onConflict: 'tenant_id,as_of'
      });

    if (error) {
      console.error('Error inserting AVI report:', error);
      throw error;
    }

    console.log(`Successfully computed AVI report for tenant ${tenantId}`);
    return { success: true, tenantId, asOf };
  } catch (error) {
    console.error(`Failed to compute AVI report for tenant ${tenantId}:`, error);
    throw error;
  }
}

// Helper function to list all tenant IDs
export async function listTenantIds(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('active', true);

    if (error) {
      console.error('Error fetching tenant IDs:', error);
      return [];
    }

    return data?.map(t => t.id) || [];
  } catch (error) {
    console.error('Error in listTenantIds:', error);
    return [];
  }
}
