/**
 * AIV Error Handler
 * 
 * Centralized error handling for AIV calculations
 */

import { logger } from '@/lib/logger';

export class AIVCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public dealerId?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AIVCalculationError';
  }
}

export interface AIVErrorContext {
  dealerId?: string;
  inputs?: Record<string, unknown>;
  calculation?: string;
  step?: string;
}

/**
 * Handle AIV calculation errors with logging and context
 */
export async function handleAIVError(
  error: unknown,
  context: AIVErrorContext = {}
): Promise<never> {
  const errorContext = {
    ...context,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  // Log error
  await logger.error('AIV calculation error', errorContext);

  // Determine error code
  let code = 'AIV_CALCULATION_ERROR';
  let message = 'Failed to calculate AIV scores';

  if (error instanceof AIVCalculationError) {
    code = error.code;
    message = error.message;
  } else if (error instanceof Error) {
    if (error.message.includes('validation')) {
      code = 'AIV_VALIDATION_ERROR';
      message = 'Invalid input data for AIV calculation';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      code = 'AIV_NETWORK_ERROR';
      message = 'Network error while fetching AIV data';
    } else if (error.message.includes('timeout')) {
      code = 'AIV_TIMEOUT_ERROR';
      message = 'AIV calculation timed out';
    }
  }

  throw new AIVCalculationError(message, code, context.dealerId, errorContext);
}

/**
 * Validate AIV score bounds
 */
export function validateAIVScore(score: number, label: string): number {
  if (isNaN(score) || !isFinite(score)) {
    throw new AIVCalculationError(
      `${label} is not a valid number`,
      'AIV_INVALID_SCORE',
      undefined,
      { score, label }
    );
  }

  if (label.includes('AIV_sel') || label.includes('AIV')) {
    if (score < 0 || score > 1) {
      console.warn(`AIV score ${label} out of bounds: ${score}, clamping to [0,1]`);
      return Math.max(0, Math.min(1, score));
    }
  }

  if (label.includes('AIVR')) {
    if (score < 0 || score > 2) {
      console.warn(`AIVR score out of bounds: ${score}, clamping to [0,2]`);
      return Math.max(0, Math.min(2, score));
    }
  }

  return score;
}

/**
 * Sanitize AIV inputs
 */
export function sanitizeAIVInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'number') {
      // Replace NaN and Infinity with 0
      if (isNaN(value) || !isFinite(value)) {
        sanitized[key] = 0;
      } else {
        sanitized[key] = value;
      }
    } else if (typeof value === 'string') {
      // Basic sanitization for strings
      sanitized[key] = value.trim().slice(0, 1000); // Limit length
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

