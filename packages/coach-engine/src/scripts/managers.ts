/**
 * Manager Persona Scripts
 */

import type { CoachEvent, CoachSuggestion } from "../../../core-models/src/coach";
import { scriptRegistry } from "../triggers";

export function registerManagerScripts(): void {
  // Profit Leakage ignored
  scriptRegistry.register({
    id: "manager.profit_leakage_ignored.v1",
    persona: "manager",
    priority: 20,
    match: (e: CoachEvent) =>
      e.persona === "manager" &&
      e.kind === "metric_confusion" &&
      e.context?.metric === "profit_leakage",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "manager.profit_leakage_ignored.v1",
      eventId: e.id,
      persona: "manager",
      title: "This tile isn't abstract",
      body:
        "It's estimating how much gross walks out the door when decisions stall.\n\n" +
        "Want the one move that closes the biggest gap this week?",
      ctaLabel: "Show me",
      severity: "warning",
      estTimeSeconds: 25,
      moneyAnchor: { estLossLow: 5000, estLossHigh: 15000, currency: "USD" },
    }),
  });

  // AIM appraisal override without reason
  scriptRegistry.register({
    id: "manager.aim_override_no_reason.v1",
    persona: "manager",
    priority: 18,
    match: (e: CoachEvent) =>
      e.persona === "manager" &&
      e.kind === "override_without_reason" &&
      e.sourceAgent === "AIM" &&
      e.context?.overrideCount >= 3,
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "manager.aim_override_no_reason.v1",
      eventId: e.id,
      persona: "manager",
      title: "This VIN is at the top of market",
      body:
        "This VIN is already priced at the top of what the market clears in 7 days.\n" +
        "If we keep doing overrides like this, our wholesale exit gets uglier.\n\n" +
        "Want the 15-second rundown of why AIM set it here?",
      ctaLabel: "Show me",
      severity: "warning",
      estTimeSeconds: 15,
      moneyAnchor: { estLossLow: 2000, estLossHigh: 6000, currency: "USD" },
    }),
  });

  // Compliance block waiting
  scriptRegistry.register({
    id: "manager.compliance_block_waiting.v1",
    persona: "manager",
    priority: 25,
    match: (e: CoachEvent) =>
      e.persona === "manager" &&
      e.kind === "compliance_block_waiting",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "manager.compliance_block_waiting.v1",
      eventId: e.id,
      persona: "manager",
      title: "Compliance is waiting on your decision",
      body:
        "I can show you the one line that triggered this and your safest option.\n\n" +
        "30 seconds.",
      ctaLabel: "Show me",
      severity: "critical",
      estTimeSeconds: 30,
    }),
  });
}

