/**
 * Coach Telemetry - Learning Loop
 * 
 * Tracks outcomes to improve script effectiveness
 */

import type { CoachTelemetry, CoachOutcome } from "../../core-models/src/coach";

/**
 * Record coach outcome for learning
 */
export async function recordCoachOutcome(
  telemetry: CoachTelemetry
): Promise<void> {
  // In production, send to Supabase or analytics service
  try {
    const response = await fetch("/api/coach/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telemetry),
    });

    if (!response.ok) {
      console.warn("[Coach] Failed to record telemetry:", response.statusText);
    }
  } catch (error) {
    console.error("[Coach] Telemetry error:", error);
    // Don't block user flow if telemetry fails
  }
}

/**
 * Get script effectiveness metrics
 */
export async function getScriptMetrics(scriptId: string): Promise<{
  acceptanceRate: number;
  completionRate: number;
  avgTimeToComplete: number;
}> {
  try {
    const response = await fetch(`/api/coach/metrics/${scriptId}`);
    if (!response.ok) {
      return { acceptanceRate: 0, completionRate: 0, avgTimeToComplete: 0 };
    }
    return await response.json();
  } catch (error) {
    console.error("[Coach] Metrics error:", error);
    return { acceptanceRate: 0, completionRate: 0, avgTimeToComplete: 0 };
  }
}

