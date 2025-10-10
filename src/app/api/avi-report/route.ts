import { NextRequest, NextResponse } from 'next/server';
import { AviReport } from '@/types/avi-report';

export const dynamic = 'force-dynamic';

// Mock data generator for AVI Report
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || crypto.randomUUID();

    const aviReport = generateMockAviReport(tenantId);

    return NextResponse.json(aviReport);
  } catch (error) {
    console.error('Error generating AVI report:', error);
    return NextResponse.json(
      { error: 'Failed to generate AVI report' },
      { status: 500 }
    );
  }
}
