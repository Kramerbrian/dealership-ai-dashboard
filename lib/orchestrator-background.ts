/**
 * DealershipAI – Vercel Background Orchestrator
 * ----------------------------------------------------------
 * Executes nightly at 01:00 UTC (Vercel cron).
 * - Runs the Meta-Orchestrator
 * - Validates governance policies
 * - Posts results to Slack
 * - Triggers rollback if any failure detected
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { validateGovernance } from "./governance-validator";
import { triggerSafeMode } from "./safe-mode-handler";

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL!;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const ROOT = process.cwd();

async function postSlack(message: string) {
  try {
    execSync(
      `curl -X POST -H 'Content-type: application/json' --data '{"text":"${message}"}' ${SLACK_WEBHOOK}`
    );
  } catch {
    console.warn("⚠️ Slack post failed");
  }
}

export default async function handler() {
  const start = Date.now();
  console.log("🚀 Starting background orchestrator...");

  let orchestrationSuccess = false;
  let governanceSuccess = false;
  let lighthouseScore = 0;

  try {
    // --- Run Meta-Orchestrator ---
    const orchestratorPath = path.join(ROOT, "lib/meta-orchestrator.ts");
    execSync(`node ${orchestratorPath}`, { stdio: "inherit" });
    orchestrationSuccess = true;
  } catch (err) {
    console.error("❌ Orchestrator failed:", (err as Error).message);
  }

  // --- Governance Validation ---
  try {
    const metrics = { lighthouse: 95, https: true, humorFrequency: 0.05 }; // placeholder
    const result = validateGovernance(metrics);
    governanceSuccess = result.passed;
    if (!result.passed) triggerSafeMode(result.reasons.join("; "));
  } catch (err) {
    console.error("Governance validation error:", (err as Error).message);
  }

  // --- Lighthouse Check ---
  try {
    const lighthouseFile = path.join(ROOT, ".lighthouseci/manifest.json");
    if (fs.existsSync(lighthouseFile)) {
      const data = JSON.parse(fs.readFileSync(lighthouseFile, "utf8"));
      lighthouseScore = Math.round(data[0].summary.performance * 100);
    }
  } catch {
    lighthouseScore = 0;
  }

  // --- Auto-Rollback if Failing ---
  if (!orchestrationSuccess || !governanceSuccess || lighthouseScore < 90) {
    console.warn("⚠️ Threshold failed, initiating rollback...");
    try {
      execSync(`npx vercel rollback --token=${VERCEL_TOKEN}`, { stdio: "inherit" });
      await postSlack(
        `⚠️ *DealershipAI Auto-Rollback Executed*\nOrchestrator:${orchestrationSuccess}\nGovernance:${governanceSuccess}\nLighthouse:${lighthouseScore}`
      );
    } catch (err) {
      console.error("Rollback failed:", (err as Error).message);
    }
  } else {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    await postSlack(
      `✅ *DealershipAI Nightly Orchestration Complete* (${duration}s)\n• Orchestrator: ✅\n• Governance: ✅\n• Lighthouse: ${lighthouseScore}`
    );
  }

  return new Response("OK", { status: 200 });
}

// Note: This runs in Node.js runtime (not Edge) due to execSync and file system access
// The route handler sets runtime appropriately

