/**
 * GNN Engine API Client
 * Helper functions for calling the GNN prediction engine
 */

const GNN_ENGINE_URL = process.env.GNN_ENGINE_URL || 'http://localhost:8080';

export interface GNNPrediction {
  intent: string;
  fix: string;
  confidence: number;
  dealerId?: string;
  topFeatures?: string[];
}

export interface GNNTrainResponse {
  status: string;
  modelVersion: string;
  loss: number;
  precision: number;
}

export interface GNNMetrics {
  predictionsTotal: number;
  predictionsVerified: number;
  precision: number;
  trainingLoss: number;
  arrGain: number;
  roi: number;
}

/**
 * Get GNN model health status
 */
export async function getGNNHealth(): Promise<{ status: string } | null> {
  try {
    const response = await fetch(`${GNN_ENGINE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking GNN health:', error);
    return null;
  }
}

/**
 * Get GNN predictions for a dealer or all dealers
 * @param dealerId - Optional dealer ID to filter predictions
 * @param threshold - Confidence threshold (default: 0.85)
 */
export async function getGNNPredictions(
  dealerId?: string,
  threshold = 0.85
): Promise<GNNPrediction[]> {
  try {
    const params = new URLSearchParams();
    if (dealerId) params.set('dealerId', dealerId);
    params.set('threshold', threshold.toString());

    const response = await fetch(`${GNN_ENGINE_URL}/predict?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('GNN prediction failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting GNN predictions:', error);
    return [];
  }
}

/**
 * Trigger GNN model retraining
 */
export async function triggerGNNTraining(): Promise<GNNTrainResponse | null> {
  try {
    const response = await fetch(`${GNN_ENGINE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(300000), // 5 minutes for training
    });

    if (!response.ok) {
      console.error('GNN training failed:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering GNN training:', error);
    return null;
  }
}

/**
 * Get GNN metrics
 */
export async function getGNNMetrics(): Promise<GNNMetrics | null> {
  try {
    const response = await fetch(`${GNN_ENGINE_URL}/metrics`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    // Parse Prometheus format
    const text = await response.text();
    const lines = text.split('\n').filter((line) => line && !line.startsWith('#'));

    const metrics: Partial<GNNMetrics> = {};

    lines.forEach((line) => {
      if (line.startsWith('gnn_predictions_total')) {
        const match = line.match(/gnn_predictions_total\s+(\d+)/);
        if (match) metrics.predictionsTotal = parseInt(match[1], 10);
      } else if (line.startsWith('gnn_predictions_verified')) {
        const match = line.match(/gnn_predictions_verified\s+(\d+)/);
        if (match) metrics.predictionsVerified = parseInt(match[1], 10);
      } else if (line.startsWith('gnn_precision')) {
        const match = line.match(/gnn_precision\s+([\d.]+)/);
        if (match) metrics.precision = parseFloat(match[1]);
      } else if (line.startsWith('gnn_training_loss')) {
        const match = line.match(/gnn_training_loss\s+([\d.]+)/);
        if (match) metrics.trainingLoss = parseFloat(match[1]);
      } else if (line.startsWith('gnn_arr_gain_usd')) {
        const match = line.match(/gnn_arr_gain_usd\s+([\d.]+)/);
        if (match) metrics.arrGain = parseFloat(match[1]);
      }
    });

    // Calculate ROI if we have both metrics
    if (metrics.arrGain !== undefined && metrics.trainingLoss !== undefined) {
      metrics.roi = metrics.arrGain / (metrics.trainingLoss + 1); // Avoid division by zero
    }

    return metrics as GNNMetrics;
  } catch (error) {
    console.error('Error getting GNN metrics:', error);
    return null;
  }
}

/**
 * Reload GNN model
 */
export async function reloadGNNModel(): Promise<{ status: string } | null> {
  try {
    const response = await fetch(`${GNN_ENGINE_URL}/reload-model`, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error reloading GNN model:', error);
    return null;
  }
}

