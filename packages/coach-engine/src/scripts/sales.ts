/**
 * Sales Persona Scripts
 */

import type { CoachEvent, CoachSuggestion } from "../../../core-models/src/coach";
import { scriptRegistry } from "../triggers";

export function registerSalesScripts(): void {
  // Pulse card ignored
  scriptRegistry.register({
    id: "sales.trade_reco_ignored.v1",
    persona: "sales",
    priority: 10,
    match: (e: CoachEvent) =>
      e.persona === "sales" &&
      e.kind === "agent_recommendation_ignored" &&
      e.context?.topic === "trade_followup",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "sales.trade_reco_ignored.v1",
      eventId: e.id,
      persona: "sales",
      title: "Want the 10-second version of what you're skipping?",
      body:
        "The system flagged this customer because they're 3× more likely to trade out in the next 30 days.\n" +
        "If this step gets skipped, your store gives away an average of $450–$900 in front-end and F&I.\n\n" +
        "Tap 'Show me' and I'll walk you through the fastest version of this follow-up.",
      ctaLabel: "Show me",
      severity: "nudge",
      estTimeSeconds: 20,
      moneyAnchor: { estLossLow: 450, estLossHigh: 900, currency: "USD" },
    }),
  });

  // High intent lead ignored
  scriptRegistry.register({
    id: "sales.high_intent_lead_ignored.v1",
    persona: "sales",
    priority: 15,
    match: (e: CoachEvent) =>
      e.persona === "sales" &&
      e.kind === "agent_recommendation_ignored" &&
      e.sourceAgent === "Pulse" &&
      e.context?.cardType === "high_intent_lead",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "sales.high_intent_lead_ignored.v1",
      eventId: e.id,
      persona: "sales",
      title: "This lead is about to buy somewhere else",
      body:
        "This lead was auto-upgraded because they hit 3 high-intent signals in the last 24 hours.\n" +
        "When these sit, they usually buy somewhere else in under 48 hours.\n\n" +
        "I'll show you the exact 30-second play this OS assumes you'll run next.",
      ctaLabel: "Show me",
      severity: "warning",
      estTimeSeconds: 30,
      moneyAnchor: { estLossLow: 1200, estLossHigh: 3500, currency: "USD" },
    }),
  });

  // Flow abandoned (appraisal, pricing)
  scriptRegistry.register({
    id: "sales.flow_abandoned.v1",
    persona: "sales",
    priority: 12,
    match: (e: CoachEvent) =>
      e.persona === "sales" &&
      e.kind === "flow_abandoned" &&
      (e.context?.flowType === "appraisal" || e.context?.flowType === "pricing"),
    generate: (e: CoachEvent): CoachSuggestion => {
      const flowType = e.context?.flowType || "this";
      return {
        id: "sales.flow_abandoned.v1",
        eventId: e.id,
        persona: "sales",
        title: "Almost there — want to finish this?",
        body:
          `You started a ${flowType} flow but didn't complete the key step.\n` +
          "The system already has everything it needs — just one more click.\n\n" +
          "I'll highlight exactly what's left.",
        ctaLabel: "Show me",
        severity: "nudge",
        estTimeSeconds: 15,
      };
    },
  });
}

