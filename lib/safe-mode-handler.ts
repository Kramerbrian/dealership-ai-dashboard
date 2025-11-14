/**
 * Safe Mode Handler
 * Manages system safe mode state and recovery
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const SAFE_FILE = path.join(ROOT, 'data', 'system-safe-mode.json');
const HISTORY_FILE = path.join(ROOT, 'data', 'safe-mode-history.json');

interface SafeModeRecord {
  activatedAt: string;
  reason: string;
  status: 'active' | 'cleared';
  clearedAt?: string;
  clearedBy?: string;
}

function log(msg: string) {
  console.log(`[Safe-Mode-Handler] ${msg}`);
}

export function triggerSafeMode(reason?: string) {
  const record: SafeModeRecord = {
    activatedAt: new Date().toISOString(),
    reason: reason || 'Unknown trigger',
    status: 'active',
  };

  // Ensure data directory exists
  const dataDir = path.dirname(SAFE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(SAFE_FILE, JSON.stringify(record, null, 2));
  log('🛑 System entered SAFE MODE');

  // Record in history
  let history: SafeModeRecord[] = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
      history = [];
    }
  }
  history.push(record);
  // Keep last 100 entries
  if (history.length > 100) {
    history = history.slice(-100);
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

  // Notify Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const msg = `⚠️ *DealershipAI entered SAFE MODE*\nReason: ${reason || 'Unknown'}\nTime: ${record.activatedAt}`;
      execSync(
        `curl -X POST -H 'Content-type: application/json' --data '{"text": "${msg.replace(/'/g, "\\'")}"}' ${process.env.SLACK_WEBHOOK_URL}`,
        { stdio: 'ignore' }
      );
    } catch (error) {
      log(`⚠️  Slack notification failed: ${error}`);
    }
  }
}

export function clearSafeMode(clearedBy?: string) {
  if (!fs.existsSync(SAFE_FILE)) {
    log('✅ Safe mode not active');
    return;
  }

  const record: SafeModeRecord = JSON.parse(fs.readFileSync(SAFE_FILE, 'utf8'));
  record.status = 'cleared';
  record.clearedAt = new Date().toISOString();
  record.clearedBy = clearedBy || 'system';

  // Update history
  let history: SafeModeRecord[] = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
      history = [];
    }
  }
  // Update last entry
  if (history.length > 0) {
    history[history.length - 1] = record;
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

  fs.unlinkSync(SAFE_FILE);
  log('✅ Safe mode cleared; normal operations resumed');

  // Notify Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const duration = record.clearedAt && record.activatedAt
        ? Math.round((new Date(record.clearedAt).getTime() - new Date(record.activatedAt).getTime()) / 1000 / 60)
        : 0;
      const msg = `✅ *DealershipAI Safe Mode Cleared*\nDuration: ${duration} minutes\nCleared by: ${clearedBy || 'system'}`;
      execSync(
        `curl -X POST -H 'Content-type: application/json' --data '{"text": "${msg.replace(/'/g, "\\'")}"}' ${process.env.SLACK_WEBHOOK_URL}`,
        { stdio: 'ignore' }
      );
    } catch (error) {
      log(`⚠️  Slack notification failed: ${error}`);
    }
  }
}

export function isSafeMode(): boolean {
  return fs.existsSync(SAFE_FILE);
}

export function getSafeModeStatus(): SafeModeRecord | null {
  if (!fs.existsSync(SAFE_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(SAFE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export function getSafeModeHistory(): SafeModeRecord[] {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// CLI entry
if (require.main === module) {
  const command = process.argv[2];
  if (command === 'clear') {
    clearSafeMode('cli');
  } else if (command === 'status') {
    const status = getSafeModeStatus();
    if (status) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log('Safe mode not active');
    }
  } else {
    console.log('Usage: node lib/safe-mode-handler.ts [clear|status]');
  }
}

