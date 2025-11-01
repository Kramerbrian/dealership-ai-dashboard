/**
 * GNN Delegate - Integration layer for GNN Engine predictions
 * Connects the Next.js orchestrator to the Python GNN microservice
 */

interface GNNPrediction {
  intent_id: string;
  intent_name: string;
  fix_id: string;
  fix_name: string;
  confidence: number;
  prediction_id: string;
}

interface GNNExplanation {
  prediction_id: string;
  confidence: number;
  top_features: string[];
  top_intent_features?: Array<{ index: number; name: string; contribution: number }>;
  top_fix_features?: Array<{ index: number; name: string; contribution: number }>;
}

interface PredictionRequest {
  dealer_id?: string;
  threshold?: number;
  max_predictions?: number;
}

const GNN_ENGINE_URL = process.env.GNN_ENGINE_URL || 'http://gnn-engine:8080';
const GNN_ENGINE_ENABLED = process.env.NEXT_PUBLIC_GNN_ENABLED === 'true';

/**
 * Run GNN prediction for optimal fixes
 */
export async function runGNNPrediction(
  dealerId?: string,
  threshold: number = 0.85,
  maxPredictions: number = 50
): Promise<GNNPrediction[]> {
  if (!GNN_ENGINE_ENABLED) {
    console.warn('GNN Engine is disabled');
    return [];
  }

  try {
    const response = await fetch(`${GNN_ENGINE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dealer_id: dealerId,
        threshold,
        max_predictions: maxPredictions,
      }),
    });

    if (!response.ok) {
      throw new Error(`GNN prediction failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error('GNN prediction error:', error);
    throw error;
  }
}

/**
 * Forward predictions to orchestrator for execution
 */
export async function forwardPredictionsToOrchestrator(
  predictions: GNNPrediction[],
  dealerId: string
): Promise<void> {
  try {
    for (const prediction of predictions) {
      await fetch('/api/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'schema_fix',
          payload: {
            dealerId: dealerId || 'auto',
            intent: prediction.intent_name,
            fix: prediction.fix_name,
            confidence: prediction.confidence,
            prediction_id: prediction.prediction_id,
          },
        }),
      });
    }
  } catch (error) {
    console.error('Error forwarding predictions to orchestrator:', error);
    throw error;
  }
}

/**
 * Verify a prediction (mark as verified or rejected)
 */
export async function verifyPrediction(
  dealerId: string,
  intent: string,
  fix: string,
  verified: boolean,
  confidence: number
): Promise<void> {
  if (!GNN_ENGINE_ENABLED) {
    return;
  }

  try {
    await fetch(`${GNN_ENGINE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dealer_id: dealerId,
        intent,
        fix,
        verified,
        confidence,
      }),
    });
  } catch (error) {
    console.error('GNN verification error:', error);
    // Don't throw - verification failures shouldn't break the flow
  }
}

/**
 * Get explanation for a specific prediction
 */
export async function getPredictionExplanation(
  predictionId: string,
  dealerId: string
): Promise<GNNExplanation | null> {
  if (!GNN_ENGINE_ENABLED) {
    return null;
  }

  try {
    const response = await fetch(
      `${GNN_ENGINE_URL}/explain?prediction_id=${predictionId}&dealer_id=${dealerId}`
    );

    if (!response.ok) {
      throw new Error(`GNN explanation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GNN explanation error:', error);
    return null;
  }
}

/**
 * Check GNN engine health
 */
export async function checkGNNHealth(): Promise<boolean> {
  if (!GNN_ENGINE_ENABLED) {
    return false;
  }

  try {
    const response = await fetch(`${GNN_ENGINE_URL}/health`, {
      method: 'GET',
    });

    const data = await response.json();
    return data.status === 'ok' && data.model_loaded === true;
  } catch (error) {
    console.error('GNN health check error:', error);
    return false;
  }
}

