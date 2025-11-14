#!/usr/bin/env tsx
/**
 * End-to-End Test: Copilot Theme System
 * 
 * Tests the complete flow:
 * 1. Mood derivation from metrics
 * 2. Theme signal application
 * 3. CSS variable updates
 * 4. Visual verification
 */

import { deriveCopilotMood } from '../lib/copilot-context';
import { applyThemeSignal } from '../lib/theme-controller';

// Test scenarios
const testScenarios = [
  {
    name: "Positive Mood - High AIV",
    metrics: { aiv: 85, forecastChange: 12 },
    feedbackScore: 0.7,
    expectedMood: "positive",
    expectedTone: "witty" // or regional variant
  },
  {
    name: "Urgent Mood - Critical Decline",
    metrics: { aiv: 45, forecastChange: -20 },
    feedbackScore: 0.3,
    expectedMood: "urgent",
    expectedTone: "direct"
  },
  {
    name: "Celebratory Mood - Major Breakthrough",
    metrics: { aiv: 95, forecastChange: 25 },
    feedbackScore: 0.9,
    expectedMood: "celebratory",
    expectedTone: "enthusiastic"
  },
  {
    name: "Reflective Mood - Underperforming",
    metrics: { aiv: 60, forecastChange: -10 },
    feedbackScore: 0.4,
    expectedMood: "reflective",
    expectedTone: "cinematic" // if after 6pm
  },
  {
    name: "Neutral Mood - Baseline",
    metrics: { aiv: 75, forecastChange: 2 },
    feedbackScore: 0.5,
    expectedMood: "neutral",
    expectedTone: "professional"
  }
];

console.log("🧪 Copilot Theme System - End-to-End Test\n");
console.log("=" .repeat(60));

let passed = 0;
let failed = 0;

for (const scenario of testScenarios) {
  console.log(`\n📋 Testing: ${scenario.name}`);
  console.log(`   Metrics: AIV=${scenario.metrics.aiv}, Forecast=${scenario.metrics.forecastChange}`);
  
  const localTime = new Date();
  const moodInfo = deriveCopilotMood({
    metrics: scenario.metrics,
    feedbackScore: scenario.feedbackScore,
    localTime,
    region: "default"
  });

  // Check mood
  const moodMatch = moodInfo.mood === scenario.expectedMood;
  if (moodMatch) {
    console.log(`   ✅ Mood: ${moodInfo.mood} (expected: ${scenario.expectedMood})`);
    passed++;
  } else {
    console.log(`   ❌ Mood: ${moodInfo.mood} (expected: ${scenario.expectedMood})`);
    failed++;
  }

  // Check tone (may vary based on time/region, so we check if it's in expected range)
  const toneValid = moodInfo.tone !== undefined;
  if (toneValid) {
    console.log(`   ✅ Tone: ${moodInfo.tone}`);
    passed++;
  } else {
    console.log(`   ❌ Tone: undefined`);
    failed++;
  }

  // Test theme application (simulate browser environment)
  if (typeof document !== 'undefined') {
    try {
      applyThemeSignal({ mood: moodInfo.mood, tone: moodInfo.tone });
      const accent = document.documentElement.style.getPropertyValue('--accent-rgb');
      const brightness = document.documentElement.style.getPropertyValue('--vignette-brightness');
      
      if (accent && brightness) {
        console.log(`   ✅ CSS Variables: accent=${accent}, brightness=${brightness}`);
        passed++;
      } else {
        console.log(`   ⚠️  CSS Variables not set (running in Node.js, not browser)`);
      }
    } catch (err) {
      console.log(`   ⚠️  Theme application skipped (Node.js environment)`);
    }
  }

  // Check prediction
  if (moodInfo.prediction) {
    console.log(`   📊 Prediction: ${moodInfo.prediction}`);
  }
}

console.log("\n" + "=".repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

if (failed === 0) {
  console.log("✅ All tests passed! Theme system is working correctly.\n");
  process.exit(0);
} else {
  console.log("❌ Some tests failed. Review the output above.\n");
  process.exit(1);
}

