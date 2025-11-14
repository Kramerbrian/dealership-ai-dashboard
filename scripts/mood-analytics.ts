#!/usr/bin/env ts-node

/**
 * Daily Mood Analytics
 * Aggregates Copilot mood and feedback data, generates insights
 */

import * as fs from 'fs';
import * as path from 'path';

interface CopilotEvent {
  timestamp: string;
  mood?: string;
  feedback?: 'thumbsUp' | 'thumbsDown' | null;
  tone?: string;
  dealerId?: string;
}

interface MoodReport {
  date: string;
  totalEvents: number;
  moods: {
    [mood: string]: {
      count: number;
      positiveRatio: number;
      negativeRatio: number;
    };
  };
  overallSentiment: number;
  topPerformingMood: string;
  recommendations: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'copilot-events.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'mood-report.json');

function loadEvents(): CopilotEvent[] {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      console.warn(`[mood-analytics] Events file not found: ${EVENTS_FILE}`);
      return [];
    }
    const content = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[mood-analytics] Failed to load events:', error);
    return [];
  }
}

function generateMoodReport(events: CopilotEvent[]): MoodReport {
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.timestamp.startsWith(today));

  const moodStats: Record<string, { count: number; up: number; down: number }> = {};

  todayEvents.forEach((event) => {
    const mood = event.mood || 'neutral';
    if (!moodStats[mood]) {
      moodStats[mood] = { count: 0, up: 0, down: 0 };
    }
    moodStats[mood].count++;
    if (event.feedback === 'thumbsUp') moodStats[mood].up++;
    if (event.feedback === 'thumbsDown') moodStats[mood].down++;
  });

  const moods: MoodReport['moods'] = {};
  let totalPositive = 0;
  let totalNegative = 0;

  Object.keys(moodStats).forEach((mood) => {
    const { count, up, down } = moodStats[mood];
    const positiveRatio = count > 0 ? up / count : 0;
    const negativeRatio = count > 0 ? down / count : 0;

    moods[mood] = {
      count,
      positiveRatio,
      negativeRatio,
    };

    totalPositive += up;
    totalNegative += down;
  });

  const overallSentiment =
    todayEvents.length > 0 ? (totalPositive - totalNegative) / todayEvents.length : 0;

  // Find top performing mood
  const topMood = Object.keys(moods).reduce((best, current) => {
    return moods[current].positiveRatio > moods[best].positiveRatio ? current : best;
  }, Object.keys(moods)[0] || 'neutral');

  // Generate recommendations
  const recommendations: string[] = [];
  if (overallSentiment < 0) {
    recommendations.push('⚠️ Overall sentiment is negative. Consider adjusting tone weights.');
  }
  if (moods[topMood] && moods[topMood].positiveRatio > 0.7) {
    recommendations.push(`✅ "${topMood}" mood is performing well. Consider increasing its frequency.`);
  }
  if (Object.keys(moods).length === 0) {
    recommendations.push('📊 No mood data available. Ensure Copilot events are being logged.');
  }

  return {
    date: today,
    totalEvents: todayEvents.length,
    moods,
    overallSentiment,
    topPerformingMood: topMood,
    recommendations,
  };
}

function saveReport(report: MoodReport): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.log(`[mood-analytics] ✅ Mood report saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('[mood-analytics] Failed to save report:', error);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log('[mood-analytics] 🧠 Computing daily mood analytics...');

  const events = loadEvents();
  console.log(`[mood-analytics] Loaded ${events.length} total events`);

  const report = generateMoodReport(events);
  saveReport(report);

  console.log(`[mood-analytics] 📊 Report generated:`);
  console.log(`  - Total events today: ${report.totalEvents}`);
  console.log(`  - Overall sentiment: ${report.overallSentiment.toFixed(2)}`);
  console.log(`  - Top performing mood: ${report.topPerformingMood}`);
  console.log(`  - Recommendations: ${report.recommendations.length}`);

  if (report.recommendations.length > 0) {
    console.log('\n  Recommendations:');
    report.recommendations.forEach((rec) => console.log(`    ${rec}`));
  }

  console.log('[mood-analytics] ✅ Analytics complete');
}

if (require.main === module) {
  main();
}

export { generateMoodReport, loadEvents };

