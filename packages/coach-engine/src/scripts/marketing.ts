/**
 * Marketing Persona Scripts
 */

import type { CoachEvent, CoachSuggestion } from "../../../core-models/src/coach";
import { scriptRegistry } from "../triggers";

export function registerMarketingScripts(): void {
  // Schema fix ignored
  scriptRegistry.register({
    id: "marketing.schema_fix_ignored.v1",
    persona: "marketing",
    priority: 10,
    match: (e: CoachEvent) =>
      e.persona === "marketing" &&
      e.kind === "agent_recommendation_ignored" &&
      e.sourceAgent === "SchemaKing",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "marketing.schema_fix_ignored.v1",
      eventId: e.id,
      persona: "marketing",
      title: "You don't need to understand schema",
      body:
        "You just need to know this fix makes it easier for AI platforms to trust and show your inventory.\n\n" +
        "Tap once, I'll handle the rest and tell you when it's live.",
      ctaLabel: "Fix this",
      severity: "nudge",
      estTimeSeconds: 10,
      moneyAnchor: { estLossLow: 300, estLossHigh: 1200, currency: "USD" },
    }),
  });

  // Metric confusion (DSS, DTS, etc.)
  scriptRegistry.register({
    id: "marketing.metric_confusion.v1",
    persona: "marketing",
    priority: 8,
    match: (e: CoachEvent) =>
      e.persona === "marketing" &&
      e.kind === "metric_confusion",
    generate: (e: CoachEvent): CoachSuggestion => {
      const metric = e.context?.metric || "this metric";
      return {
        id: "marketing.metric_confusion.v1",
        eventId: e.id,
        persona: "marketing",
        title: `Want a quick explainer on ${metric}?`,
        body:
          "I can break down what this means and why it matters for your store.\n\n" +
          "20 seconds.",
        ctaLabel: "Show me",
        severity: "info",
        estTimeSeconds: 20,
      };
    },
  });
}

