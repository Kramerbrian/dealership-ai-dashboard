import { NextResponse } from 'next/server';

/**
 * Prometheus Metrics Endpoint
 * Exposes GNN analytics metrics in Prometheus format
 * 
 * Usage:
 * - Scrape from Prometheus: GET /api/metrics
 * - Compatible with prometheus-client format
 */

// In-memory metrics store (in production, use Redis or database)
interface GNNMetrics {
  predictionsTotal: number;
  predictionsVerified: number;
  trainingLoss: number;
  arrGainUsd: Map<string, number>; // dealer:intent -> USD
  fixConfidence: Map<string, number>; // dealer:intent:fix -> confidence
  lastUpdated: Date;
}

let metrics: GNNMetrics = {
  predictionsTotal: 0,
  predictionsVerified: 0,
  trainingLoss: 0.05,
  arrGainUsd: new Map(),
  fixConfidence: new Map(),
  lastUpdated: new Date(),
};

/**
 * Increment prediction counter
 */
export function recordPrediction() {
  metrics.predictionsTotal++;
  metrics.lastUpdated = new Date();
}

/**
 * Increment verified prediction counter
 */
export function recordVerification(dealerId?: string, intent?: string, arrGain?: number) {
  metrics.predictionsVerified++;
  metrics.lastUpdated = new Date();
  
  if (dealerId && intent && arrGain) {
    const key = `${dealerId}:${intent}`;
    const current = metrics.arrGainUsd.get(key) || 0;
    metrics.arrGainUsd.set(key, current + arrGain);
  }
}

/**
 * Update training loss
 */
export function updateTrainingLoss(loss: number) {
  metrics.trainingLoss = loss;
  metrics.lastUpdated = new Date();
}

/**
 * Set fix confidence score
 */
export function setFixConfidence(
  dealerId: string,
  intent: string,
  fix: string,
  confidence: number
) {
  const key = `${dealerId}:${intent}:${fix}`;
  metrics.fixConfidence.set(key, confidence);
  metrics.lastUpdated = new Date();
}

/**
 * Get current metrics (for debugging)
 */
export function getMetrics(): GNNMetrics {
  return { ...metrics };
}

/**
 * Prometheus metrics endpoint
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'prometheus';

  if (format === 'json') {
    return NextResponse.json({
      predictionsTotal: metrics.predictionsTotal,
      predictionsVerified: metrics.predictionsVerified,
      precision: metrics.predictionsTotal > 0
        ? (metrics.predictionsVerified / metrics.predictionsTotal) * 100
        : 0,
      trainingLoss: metrics.trainingLoss,
      arrGainUsd: Object.fromEntries(metrics.arrGainUsd),
      fixConfidence: Object.fromEntries(metrics.fixConfidence),
      lastUpdated: metrics.lastUpdated.toISOString(),
    });
  }

  // Prometheus format
  const lines: string[] = [];

  // Counter: Total predictions
  lines.push(`# HELP gnn_predictions_total Total number of GNN edge predictions`);
  lines.push(`# TYPE gnn_predictions_total counter`);
  lines.push(`gnn_predictions_total ${metrics.predictionsTotal}`);

  // Counter: Verified predictions
  lines.push(`# HELP gnn_predictions_verified Number of verified/accepted predictions`);
  lines.push(`# TYPE gnn_predictions_verified counter`);
  lines.push(`gnn_predictions_verified ${metrics.predictionsVerified}`);

  // Gauge: Training loss
  lines.push(`# HELP gnn_training_loss Current training loss value`);
  lines.push(`# TYPE gnn_training_loss gauge`);
  lines.push(`gnn_training_loss ${metrics.trainingLoss}`);

  // Counter: ARR gain (with labels)
  lines.push(`# HELP gnn_arr_gain_usd Cumulative ARR gain from verified fixes in USD`);
  lines.push(`# TYPE gnn_arr_gain_usd counter`);
  for (const [key, value] of metrics.arrGainUsd.entries()) {
    const [dealer, intent] = key.split(':');
    lines.push(`gnn_arr_gain_usd{dealer="${dealer}",intent="${intent}"} ${value}`);
  }

  // Gauge: Fix confidence (with labels)
  lines.push(`# HELP gnn_fix_confidence Confidence score per predicted fix`);
  lines.push(`# TYPE gnn_fix_confidence gauge`);
  for (const [key, value] of metrics.fixConfidence.entries()) {
    const [dealer, intent, fix] = key.split(':');
    lines.push(`gnn_fix_confidence{dealer="${dealer}",intent="${intent}",fix="${fix}"} ${value}`);
  }

  // Metadata
  lines.push(`# HELP gnn_metrics_last_updated Timestamp of last metrics update`);
  lines.push(`# TYPE gnn_metrics_last_updated gauge`);
  lines.push(`gnn_metrics_last_updated ${Math.floor(metrics.lastUpdated.getTime() / 1000)}`);

  return new NextResponse(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

