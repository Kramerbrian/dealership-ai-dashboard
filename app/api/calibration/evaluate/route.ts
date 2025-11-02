import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calibration/evaluate?days=14
 * 
 * Closed-loop calibration evaluation
 * Computes ECE (Expected Calibration Error), Lift@K, and bias metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '14');

    // In production, query actual model_predictions and lead_outcomes tables
    // For now, simulate the evaluation

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Simulate decile binning
    const deciles = Array.from({ length: 10 }, (_, i) => ({
      decile: i + 1,
      predictedAvg: 0.1 * (i + 1) - 0.05, // Center of decile
      actualRate: 0.08 * (i + 1) - 0.02 + Math.random() * 0.1, // Simulated actual
      count: Math.floor(Math.random() * 100) + 50,
    }));

    // Calculate ECE (Expected Calibration Error)
    const ece = deciles.reduce((sum, d) => {
      return sum + Math.abs(d.predictedAvg - d.actualRate) * (d.count / 1000);
    }, 0) / 10;

    // Calculate Lift@10
    const top10Actual = deciles.slice(-1)[0].actualRate;
    const allActual = deciles.reduce((sum, d) => sum + d.actualRate * d.count, 0) /
      deciles.reduce((sum, d) => sum + d.count, 0);
    const liftAt10 = top10Actual / allActual;

    // Bias scan by segment
    const biasScan = {
      priceBand: {
        low: { actualRate: 0.72, predictedAvg: 0.75, bias: -0.03 },
        medium: { actualRate: 0.65, predictedAvg: 0.68, bias: -0.03 },
        high: { actualRate: 0.58, predictedAvg: 0.62, bias: -0.04 },
      },
      modelYear: {
        '2020-2022': { actualRate: 0.70, predictedAvg: 0.73, bias: -0.03 },
        '2023+': { actualRate: 0.68, predictedAvg: 0.71, bias: -0.03 },
      },
      leadSource: {
        website: { actualRate: 0.75, predictedAvg: 0.78, bias: -0.03 },
        phone: { actualRate: 0.62, predictedAvg: 0.65, bias: -0.03 },
        email: { actualRate: 0.58, predictedAvg: 0.60, bias: -0.02 },
      },
    };

    // Dollar impact
    const avgGross = 3200;
    const leadsInTop10 = deciles.slice(-1)[0].count;
    const dollarImpact = (top10Actual - allActual) * leadsInTop10 * avgGross;

    return NextResponse.json({
      period: `${days} days`,
      evaluation: {
        ece: Math.round(ece * 1000) / 1000,
        liftAt10: Math.round(liftAt10 * 100) / 100,
        liftAt20: Math.round(liftAt10 * 0.95 * 100) / 100,
        dollarImpact: Math.round(dollarImpact),
      },
      deciles,
      biasScan,
      recommendations: [
        {
          priority: ece > 0.1 ? 'high' : 'medium',
          issue: 'ECE above threshold',
          action: 'Apply temperature scaling or isotonic calibration',
          estimatedImprovement: 'Could reduce ECE by 30-40%',
        },
        {
          priority: liftAt10 < 1.2 ? 'high' : 'low',
          issue: 'Low lift at top decile',
          action: 'Revisit features with highest SHAP drift',
          estimatedImprovement: 'Could increase lift by 15-20%',
        },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Calibration evaluation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate calibration' },
      { status: 500 }
    );
  }
}

