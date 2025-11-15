/**
 * Service Persona Scripts
 */

import type { CoachEvent, CoachSuggestion } from "../../../core-models/src/coach";
import { scriptRegistry } from "../triggers";

export function registerServiceScripts(): void {
  // RO-based acquisition prompt skipped
  scriptRegistry.register({
    id: "service.ro_trade_skipped.v1",
    persona: "service",
    priority: 10,
    match: (e: CoachEvent) =>
      e.persona === "service" &&
      e.kind === "agent_recommendation_ignored" &&
      e.context?.topic === "ro_trade_candidate",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "service.ro_trade_skipped.v1",
      eventId: e.id,
      persona: "service",
      title: "This RO is a trade-in candidate",
      body:
        "Every time we skip this step, the store loses one shot at acquiring clean, local inventory.\n" +
        "Most of these cars never hit the open market again.\n\n" +
        "I'll show you how to make this take under 15 seconds.",
      ctaLabel: "Show me",
      severity: "nudge",
      estTimeSeconds: 15,
      moneyAnchor: { estLossLow: 800, estLossHigh: 2500, currency: "USD" },
    }),
  });

  // Service flow abandoned
  scriptRegistry.register({
    id: "service.flow_abandoned.v1",
    persona: "service",
    priority: 8,
    match: (e: CoachEvent) =>
      e.persona === "service" &&
      e.kind === "flow_abandoned",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "service.flow_abandoned.v1",
      eventId: e.id,
      persona: "service",
      title: "Want to finish this?",
      body:
        "You're one step away from completing this workflow.\n" +
        "The system has everything ready — just need your confirmation.",
      ctaLabel: "Show me",
      severity: "info",
      estTimeSeconds: 10,
    }),
  });
}

