/**
 * RaR Pressure Integration into AI Scoring
 * Applies rar_pressure as a negative weight to AIV, ATI, and QAI
 */

import { prisma } from '@/lib/prisma';

export interface RaRPressureResult {
  pressure: number; // 0..1
  rarUsd: number;
  recoverableUsd: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // Percentage change
}

/**
 * Get RaR pressure for a dealer
 */
export async function getRaRPressure(dealerId: string): Promise<RaRPressureResult> {
  // Get current pressure from secondaryMetrics
  const currentPressure = await prisma.secondaryMetrics.findFirst({
    where: {
      dealerId,
      key: 'rar_pressure',
    } as any,
  });

  const pressure = currentPressure?.valueNum ?? 0;

  // Get current and previous month RaR for trend
  const currentMonth = await prisma.raRMonthly.findFirst({
    where: { dealerId },
    orderBy: { month: 'desc' },
  });

  const previousMonth = await prisma.raRMonthly.findFirst({
    where: { dealerId },
    orderBy: { month: 'desc' },
    skip: 1,
  });

  const rarUsd = currentMonth?.rar ?? 0;
  const recoverableUsd = currentMonth?.recoverable ?? 0;

  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendValue = 0;

  if (previousMonth && currentMonth && previousMonth.rar > 0) {
    trendValue = ((currentMonth.rar - previousMonth.rar) / previousMonth.rar) * 100;
    if (trendValue > 5) trend = 'up';
    else if (trendValue < -5) trend = 'down';
    else trend = 'stable';
  }

  return {
    pressure,
    rarUsd,
    recoverableUsd,
    trend,
    trendValue: Math.round(trendValue * 100) / 100,
  };
}

/**
 * Apply RaR pressure penalty to AIV (AI Visibility Index)
 * Formula: AIV' = AIV × (1 - 0.04 × rar_pressure)
 * Max penalty: 4% when rar_pressure = 1.0
 */
export function applyRaRToAIV(aiv: number, rarPressure: number): number {
  const penaltyMultiplier = 0.04; // 4% max penalty
  const adjustedAIV = aiv * (1 - penaltyMultiplier * rarPressure);
  return Math.max(0, Math.min(100, adjustedAIV));
}

/**
 * Apply RaR pressure penalty to ATI (Algorithmic Trust Index)
 * Formula: ATI' = ATI × (1 - 0.03 × rar_pressure)
 * Max penalty: 3% when rar_pressure = 1.0
 */
export function applyRaRToATI(ati: number, rarPressure: number): number {
  const penaltyMultiplier = 0.03; // 3% max penalty
  const adjustedATI = ati * (1 - penaltyMultiplier * rarPressure);
  return Math.max(0, Math.min(100, adjustedATI));
}

/**
 * Apply RaR trend penalty to QAI (Quality AI Index)
 * Formula: QAI' = QAI × (1 - 0.02 × trend_up_flag)
 * Penalizes when RaR trend is increasing over 2+ cycles
 */
export function applyRaRTrendToQAI(qai: number, trend: 'up' | 'down' | 'stable'): number {
  const penaltyMultiplier = 0.02; // 2% penalty when trend is up
  if (trend === 'up') {
    const adjustedQAI = qai * (1 - penaltyMultiplier);
    return Math.max(0, Math.min(100, adjustedQAI));
  }
  return qai;
}

/**
 * Calculate score deltas due to RaR pressure
 */
export function calculateRaRScoreDeltas(
  baseAIV: number,
  baseATI: number,
  baseQAI: number,
  rarPressure: number,
  trend: 'up' | 'down' | 'stable'
): {
  aivDelta: number;
  atiDelta: number;
  qaiDelta: number;
  aivAdjusted: number;
  atiAdjusted: number;
  qaiAdjusted: number;
} {
  const aivAdjusted = applyRaRToAIV(baseAIV, rarPressure);
  const atiAdjusted = applyRaRToATI(baseATI, rarPressure);
  const qaiAdjusted = applyRaRTrendToQAI(baseQAI, trend);

  return {
    aivDelta: aivAdjusted - baseAIV,
    atiDelta: atiAdjusted - baseATI,
    qaiDelta: qaiAdjusted - baseQAI,
    aivAdjusted,
    atiAdjusted,
    qaiAdjusted,
  };
}

