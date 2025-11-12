import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET: Fetch custom scenarios
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId required' },
        { status: 400 }
      );
    }

    // Get custom scenarios from PulseScenario table
    const scenarios = await db.pulseScenario.findMany({
      where: {
        dealerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({
      scenarios: scenarios.map((s) => ({
        id: s.id,
        name: s.scenarioName,
        description: s.description,
        actions: s.actions,
        baselineScore: s.baselineScore,
        projectedScore: s.projectedScore,
        improvement: s.improvement,
        confidence: s.confidence,
        monteCarlo: s.monteCarlo,
        roi: s.roi,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get scenarios error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create custom scenario
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dealerId, scenarioName, description, actions } = body;

    if (!dealerId || !scenarioName || !actions) {
      return NextResponse.json(
        { error: 'dealerId, scenarioName, and actions are required' },
        { status: 400 }
      );
    }

    // Get current baseline score
    const latestScore = await db.score.findFirst({
      where: { dealerId },
      orderBy: { analyzedAt: 'desc' },
    });

    const baselineScore = latestScore?.qaiScore || 75;

    // Calculate projected score and improvement
    const projectedScore = calculateProjectedScore(baselineScore, actions);
    const improvement = projectedScore - baselineScore;

    // Calculate confidence based on action types
    const confidence = calculateConfidence(actions);

    // Run Monte Carlo simulation
    const monteCarlo = runMonteCarlo(baselineScore, actions, 1000);

    // Calculate ROI
    const roi = calculateROI(actions, improvement);

    // Save scenario
    const scenario = await db.pulseScenario.create({
      data: {
        dealerId,
        scenarioName,
        description: description || null,
        actions: actions as any,
        baselineScore,
        projectedScore,
        improvement,
        confidence,
        monteCarlo: monteCarlo as any,
        roi: roi as any,
      },
    });

    return NextResponse.json({
      success: true,
      scenario: {
        id: scenario.id,
        name: scenario.scenarioName,
        baselineScore: scenario.baselineScore,
        projectedScore: scenario.projectedScore,
        improvement: scenario.improvement,
        confidence: scenario.confidence,
        monteCarlo: scenario.monteCarlo,
        roi: scenario.roi,
      },
    });
  } catch (error: any) {
    console.error('Create scenario error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateProjectedScore(baseline: number, actions: any[]): number {
  let projected = baseline;
  
  for (const action of actions) {
    if (action.type === 'improve_signal') {
      projected += action.delta * (action.confidence || 0.8);
    } else if (action.type === 'fix_issue') {
      projected += action.impact * 0.9; // 90% confidence for fixes
    }
  }

  return Math.min(100, Math.max(0, Math.round(projected * 100) / 100));
}

function calculateConfidence(actions: any[]): number {
  // Average confidence of all actions
  const confidences = actions.map((a) => a.confidence || 0.8);
  const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  
  // Reduce confidence if many actions (more uncertainty)
  const penalty = actions.length > 5 ? 0.1 : 0;
  
  return Math.max(0.5, Math.min(0.95, avg - penalty));
}

function runMonteCarlo(baseline: number, actions: any[], iterations: number) {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    let projected = baseline;
    
    for (const action of actions) {
      const variance = (action.confidence || 0.8) * 0.2; // 20% variance
      const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
      
      if (action.type === 'improve_signal') {
        projected += action.delta * randomFactor;
      } else if (action.type === 'fix_issue') {
        projected += action.impact * randomFactor * 0.9;
      }
    }
    
    results.push(Math.min(100, Math.max(0, projected)));
  }
  
  results.sort((a, b) => a - b);
  
  return {
    mean: Math.round(results.reduce((a, b) => a + b, 0) / results.length * 100) / 100,
    median: Math.round(results[Math.floor(results.length / 2)] * 100) / 100,
    p10: Math.round(results[Math.floor(results.length * 0.1)] * 100) / 100,
    p90: Math.round(results[Math.floor(results.length * 0.9)] * 100) / 100,
    stdDev: calculateStdDev(results),
  };
}

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

function calculateROI(actions: any[], improvement: number): any {
  // Estimate cost and value
  const cost = actions.reduce((sum, a) => sum + (a.cost || 0), 0);
  const value = improvement * 400; // $400 per point improvement (estimated monthly revenue)
  const netValue = value - cost;
  const roiPercent = cost > 0 ? (netValue / cost) * 100 : 0;

  return {
    cost: Math.round(cost * 100) / 100,
    value: Math.round(value * 100) / 100,
    netValue: Math.round(netValue * 100) / 100,
    roiPercent: Math.round(roiPercent * 100) / 100,
  };
}

