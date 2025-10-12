#!/usr/bin/env tsx
/**
 * Seed AVI Reports Database
 * Generates realistic AVI reports for testing and demo purposes
 */

import { createClient } from '@supabase/supabase-js';
import { AviReport } from '../src/types/avi-report';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Demo tenant IDs (replace with actual tenant IDs from your database)
const DEMO_TENANTS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Naples Ford' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Miami Toyota' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Orlando Honda' },
];

/**
 * Generate realistic AVI report for a specific week
 */
function generateAviReport(tenantId: string, weeksAgo: number): Omit<AviReport, 'id'> {
  // Base metrics with slight variation
  const baseAIV = 75 + Math.sin(weeksAgo * 0.5) * 8 + Math.random() * 10;
  const baseATI = 70 + Math.sin(weeksAgo * 0.3) * 6 + Math.random() * 8;
  const baseCRS = (baseAIV + baseATI) / 2 + Math.random() * 5;

  // Calculate report date (Monday of the week)
  const date = new Date();
  date.setDate(date.getDate() - (weeksAgo * 7));
  const dayOfWeek = date.getDay();
  const daysToMonday = (dayOfWeek + 6) % 7;
  date.setDate(date.getDate() - daysToMonday);
  const asOf = date.toISOString().split('T')[0];

  return {
    tenantId,
    version: '1.3.0',
    asOf,
    windowWeeks: 8,
    aivPct: Math.round(baseAIV * 100) / 100,
    atiPct: Math.round(baseATI * 100) / 100,
    crsPct: Math.round(baseCRS * 100) / 100,
    elasticity: {
      usdPerPoint: Math.round((150 + Math.random() * 100) * 100) / 100,
      r2: Math.round((0.75 + Math.random() * 0.20) * 1000) / 1000
    },
    pillars: {
      seo: Math.round((70 + Math.random() * 25) * 100) / 100,
      aeo: Math.round((65 + Math.random() * 28) * 100) / 100,
      geo: Math.round((78 + Math.random() * 18) * 100) / 100,
      ugc: Math.round((68 + Math.random() * 22) * 100) / 100,
      geoLocal: Math.round((82 + Math.random() * 15) * 100) / 100
    },
    modifiers: {
      temporalWeight: Math.round((0.95 + Math.random() * 0.5) * 100) / 100,
      entityConfidence: Math.round((0.78 + Math.random() * 0.18) * 100) / 100,
      crawlBudgetMult: Math.round((1.0 + Math.random() * 0.6) * 100) / 100,
      inventoryTruthMult: Math.round((1.1 + Math.random() * 0.5) * 100) / 100
    },
    clarity: {
      scs: Math.round((0.82 + Math.random() * 0.15) * 100) / 100,
      sis: Math.round((0.75 + Math.random() * 0.18) * 100) / 100,
      adi: Math.round((0.85 + Math.random() * 0.12) * 100) / 100,
      scr: Math.round((0.79 + Math.random() * 0.16) * 100) / 100,
      selComposite: Math.round((0.80 + Math.random() * 0.15) * 100) / 100
    },
    secondarySignals: {
      engagementDepth: Math.round((68 + Math.random() * 25) * 100) / 100,
      technicalHealth: Math.round((85 + Math.random() * 12) * 100) / 100,
      localEntityAccuracy: Math.round((88 + Math.random() * 10) * 100) / 100,
      brandSemanticFootprint: Math.round((72 + Math.random() * 18) * 100) / 100
    },
    ci95: {
      aiv: {
        low: Math.round((baseAIV - 3.8) * 100) / 100,
        high: Math.round((baseAIV + 3.8) * 100) / 100
      },
      ati: {
        low: Math.round((baseATI - 3.4) * 100) / 100,
        high: Math.round((baseATI + 3.4) * 100) / 100
      },
      crs: {
        low: Math.round((baseCRS - 3.0) * 100) / 100,
        high: Math.round((baseCRS + 3.0) * 100) / 100
      },
      elasticity: {
        low: Math.round(120 * 100) / 100,
        high: Math.round(280 * 100) / 100
      }
    },
    regimeState: weeksAgo === 2 ? 'ShiftDetected' : 'Normal',
    counterfactual: {
      rarObservedUsd: Math.round((240000 + Math.random() * 60000) * 100) / 100,
      rarCounterfactualUsd: Math.round((200000 + Math.random() * 50000) * 100) / 100,
      deltaUsd: Math.round((30000 + Math.random() * 15000) * 100) / 100
    },
    drivers: [
      { metric: 'AIV', name: 'Schema Markup Coverage', contribution: Math.round((10 + Math.random() * 8) * 10) / 10 },
      { metric: 'AIV', name: 'Entity Recognition', contribution: Math.round((7 + Math.random() * 6) * 10) / 10 },
      { metric: 'ATI', name: 'Local Pack Presence', contribution: Math.round((13 + Math.random() * 9) * 10) / 10 },
      { metric: 'ATI', name: 'Review Velocity', contribution: Math.round((9 + Math.random() * 7) * 10) / 10 },
      { metric: 'AIV', name: 'Inventory Freshness', contribution: Math.round((5 + Math.random() * 5) * 10) / 10 }
    ],
    anomalies: weeksAgo === 2 ? [
      {
        signal: 'SEO Score',
        zScore: Math.round((2.5 + Math.random() * 1.2) * 10) / 10,
        note: 'Significant improvement detected in organic visibility'
      }
    ] : undefined,
    backlogSummary: [
      {
        taskId: `TASK-${weeksAgo}01`,
        title: 'Implement FAQ schema on inventory pages',
        estDeltaAivLow: 2.2 + Math.random() * 0.8,
        estDeltaAivHigh: 4.5 + Math.random() * 1.0,
        projectedImpactLowUsd: 4500 + Math.random() * 1500,
        projectedImpactHighUsd: 11000 + Math.random() * 3000,
        effortPoints: 3,
        banditScore: 0.84 + Math.random() * 0.08
      },
      {
        taskId: `TASK-${weeksAgo}02`,
        title: 'Optimize local business entity markup',
        estDeltaAivLow: 1.5 + Math.random() * 0.6,
        estDeltaAivHigh: 3.0 + Math.random() * 0.8,
        projectedImpactLowUsd: 3200 + Math.random() * 800,
        projectedImpactHighUsd: 7500 + Math.random() * 1500,
        effortPoints: 2,
        banditScore: 0.79 + Math.random() * 0.07
      },
      {
        taskId: `TASK-${weeksAgo}03`,
        title: 'Add video content to service pages',
        estDeltaAivLow: 2.8 + Math.random() * 1.0,
        estDeltaAivHigh: 5.8 + Math.random() * 1.2,
        projectedImpactLowUsd: 7200 + Math.random() * 1800,
        projectedImpactHighUsd: 14000 + Math.random() * 3000,
        effortPoints: 5,
        banditScore: 0.74 + Math.random() * 0.09
      }
    ]
  };
}

/**
 * Transform TypeScript camelCase to database snake_case
 */
function transformForDatabase(report: Omit<AviReport, 'id'>) {
  return {
    tenant_id: report.tenantId,
    version: report.version,
    as_of: report.asOf,
    window_weeks: report.windowWeeks,
    aiv_pct: report.aivPct,
    ati_pct: report.atiPct,
    crs_pct: report.crsPct,
    elasticity: report.elasticity,
    pillars: report.pillars,
    modifiers: report.modifiers,
    clarity: report.clarity,
    secondary_signals: report.secondarySignals,
    ci95: report.ci95,
    regime_state: report.regimeState,
    counterfactual: report.counterfactual,
    drivers: report.drivers,
    anomalies: report.anomalies,
    backlog_summary: report.backlogSummary,
  };
}

/**
 * Main seeding function
 */
async function seedAviReports() {
  console.log('🌱 Seeding AVI Reports...\n');

  let totalInserted = 0;
  let totalErrors = 0;

  for (const tenant of DEMO_TENANTS) {
    console.log(`📊 Generating reports for ${tenant.name} (${tenant.id})`);

    // Generate 12 weeks of historical data
    const reports = [];
    for (let week = 0; week < 12; week++) {
      const report = generateAviReport(tenant.id, week);
      reports.push(transformForDatabase(report));
    }

    // Insert reports
    const { data, error } = await supabase
      .from('avi_reports')
      .insert(reports)
      .select();

    if (error) {
      console.error(`   ❌ Error inserting reports:`, error.message);
      totalErrors++;
    } else {
      console.log(`   ✅ Inserted ${data?.length || 0} reports`);
      totalInserted += data?.length || 0;
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Total inserted: ${totalInserted}`);
  console.log(`   Total errors: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log('\n✅ Seeding completed successfully!');
  } else {
    console.log('\n⚠️  Seeding completed with errors');
  }
}

// Run seeding
seedAviReports()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
