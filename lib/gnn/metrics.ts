/**
 * GNN Metrics Client
 * Convenience functions to record GNN predictions and updates
 */

import { 
  recordPrediction, 
  recordVerification, 
  updateTrainingLoss, 
  setFixConfidence 
} from '@/app/api/metrics/route';

export interface GNNPrediction {
  dealerId: string;
  intent: string;
  fix: string;
  confidence: number;
}

export interface GNNVerification extends GNNPrediction {
  arrGainUsd: number;
}

/**
 * Record a new GNN prediction
 */
export async function recordGNNPrediction(prediction: GNNPrediction) {
  recordPrediction();
  
  // Store fix confidence
  setFixConfidence(
    prediction.dealerId,
    prediction.intent,
    prediction.fix,
    prediction.confidence
  );
}

/**
 * Record a verified prediction (accepted fix)
 */
export async function recordGNNVerification(verification: GNNVerification) {
  recordVerification(
    verification.dealerId,
    verification.intent,
    verification.arrGainUsd
  );
}

/**
 * Update training loss after model training
 */
export async function updateGNNTrainingLoss(loss: number) {
  updateTrainingLoss(loss);
}

/**
 * Batch record predictions (for bulk operations)
 */
export async function recordGNNPredictions(predictions: GNNPrediction[]) {
  for (const prediction of predictions) {
    await recordGNNPrediction(prediction);
  }
}

/**
 * Batch record verifications (for bulk operations)
 */
export async function recordGNNVerifications(verifications: GNNVerification[]) {
  for (const verification of verifications) {
    await recordGNNVerification(verification);
  }
}

