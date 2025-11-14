#!/usr/bin/env ts-node

/**
 * Nightly Tone Model Training
 * Reads copilot-events.json, analyzes feedback patterns, and updates tone weights
 */

import * as fs from 'fs';
import * as path from 'path';

interface CopilotEvent {
  timestamp: string;
  tone: string;
  feedback?: 'thumbsUp' | 'thumbsDown' | null;
  mood?: string;
  dealerId?: string;
}

interface ToneWeights {
  [tone: string]: number;
  witty: number;
  professional: number;
  cinematic: number;
  supportive: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'copilot-events.json');
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'agent', 'tone-weights.json');

function loadEvents(): CopilotEvent[] {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      console.warn(`[train-tone-model] Events file not found: ${EVENTS_FILE}`);
      return [];
    }
    const content = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[train-tone-model] Failed to load events:', error);
    return [];
  }
}

function calculateToneWeights(events: CopilotEvent[]): ToneWeights {
  // Default weights
  const weights: ToneWeights = {
    witty: 0.25,
    professional: 0.30,
    cinematic: 0.25,
    supportive: 0.20,
  };

  if (events.length === 0) {
    console.log('[train-tone-model] No events found, using default weights');
    return weights;
  }

  // Count feedback per tone
  const toneFeedback: Record<string, { up: number; down: number; total: number }> = {};

  events.forEach((event) => {
    if (!event.tone || !event.feedback) return;

    if (!toneFeedback[event.tone]) {
      toneFeedback[event.tone] = { up: 0, down: 0, total: 0 };
    }

    toneFeedback[event.tone].total++;
    if (event.feedback === 'thumbsUp') toneFeedback[event.tone].up++;
    if (event.feedback === 'thumbsDown') toneFeedback[event.tone].down++;
  });

  // Calculate sentiment scores (Bayesian re-weighting)
  const toneScores: Record<string, number> = {};
  Object.keys(toneFeedback).forEach((tone) => {
    const { up, down, total } = toneFeedback[tone];
    // Simple sentiment: (up - down) / total, normalized
    const sentiment = total > 0 ? (up - down) / total : 0;
    toneScores[tone] = sentiment;
  });

  // Redistribute weights based on sentiment
  const totalSentiment = Object.values(toneScores).reduce((a, b) => a + Math.max(0, b), 0);
  if (totalSentiment > 0) {
    Object.keys(weights).forEach((tone) => {
      const sentiment = toneScores[tone] || 0;
      // Increase weight for positive sentiment tones
      weights[tone as keyof ToneWeights] = Math.max(0.1, Math.min(0.5, weights[tone as keyof ToneWeights] + sentiment * 0.1));
    });

    // Normalize to sum to 1.0
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.keys(weights).forEach((tone) => {
      weights[tone as keyof ToneWeights] = weights[tone as keyof ToneWeights] / sum;
    });
  }

  return weights;
}

function saveWeights(weights: ToneWeights): void {
  try {
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const output = {
      version: new Date().toISOString(),
      weights,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`[train-tone-model] ✅ Tone weights saved to ${OUTPUT_FILE}`);
    console.log('[train-tone-model] Weights:', weights);
  } catch (error) {
    console.error('[train-tone-model] Failed to save weights:', error);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log('[train-tone-model] 🔁 Starting tone model training...');

  const events = loadEvents();
  console.log(`[train-tone-model] Loaded ${events.length} events`);

  const weights = calculateToneWeights(events);
  saveWeights(weights);

  console.log('[train-tone-model] ✅ Training complete');
}

if (require.main === module) {
  main();
}

export { calculateToneWeights, loadEvents };

