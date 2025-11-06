import { NextRequest, NextResponse } from "next/server";
import { AUTONOMIC_ORCHESTRATOR_CONFIG } from "@/lib/orchestrator/autonomic-config";

export const dynamic = "force-dynamic";

/**
 * GET /api/orchestrator/status
 * 
 * Returns current status of all orchestrator components
 */
export async function GET(req: NextRequest) {
  try {
    const config = AUTONOMIC_ORCHESTRATOR_CONFIG;

    // In production, this would query actual orchestrator state from Redis/DB
    // For now, return configuration with simulated status
    const status = {
      phase: "operational",
      components: [
        {
          name: "adaptive-weight-learner",
          status: "scheduled",
          lastRun: getLastRunTime("02:00Z"),
          nextRun: getNextRunTime("02:00Z"),
          version: config.controllers.AdaptiveWeightLearner.version,
        },
        {
          name: "drift-sentinel",
          status: "active",
          lastCheck: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
          version: config.controllers.DriftSentinel.version,
        },
        {
          name: "rl-controller",
          status: "active",
          lastPolicyUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          confidence: 0.87,
          version: config.controllers.RLController.version,
        },
        {
          name: "auto-fix-agents",
          status: "active",
          activeAgents: config.controllers.AutoFixAgents.agents.length,
          lastFix: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          version: config.controllers.AutoFixAgents.bundle_version,
        },
      ],
      governance: {
        apiCostRemaining: config.governance.ethics_guardrail.max_api_cost_per_dealer_month_usd,
        rewardThreshold: config.governance.ethics_guardrail.min_reward_threshold,
        rollbackEnabled: config.governance.rollback_policy.auto_rollback,
      },
      telemetry: {
        metricsStore: config.telemetry.metrics_store,
        auditTrailEnabled: config.telemetry.audit_trail.enabled,
        retentionDays: config.telemetry.retention_days,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("Orchestrator status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orchestrator status" },
      { status: 500 }
    );
  }
}

/**
 * Calculate last run time based on cron schedule
 */
function getLastRunTime(cronSchedule: string): string {
  // Parse "0 2 * * *" format (hour at position 1)
  const hour = parseInt(cronSchedule.split(" ")[1] || "2");
  const now = new Date();
  const lastRun = new Date();
  lastRun.setUTCHours(hour, 0, 0, 0);
  
  // If current time is before today's scheduled time, use yesterday
  if (now.getTime() < lastRun.getTime()) {
    lastRun.setUTCDate(lastRun.getUTCDate() - 1);
  }
  
  return lastRun.toISOString();
}

/**
 * Calculate next run time based on cron schedule
 */
function getNextRunTime(cronSchedule: string): string {
  const hour = parseInt(cronSchedule.split(" ")[1] || "2");
  const now = new Date();
  const nextRun = new Date();
  nextRun.setUTCHours(hour, 0, 0, 0);
  
  // If current time is past today's scheduled time, use tomorrow
  if (now.getTime() >= nextRun.getTime()) {
    nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  }
  
  return nextRun.toISOString();
}

