/**
 * BDC Persona Scripts
 */

import type { CoachEvent, CoachSuggestion } from "../../../core-models/src/coach";
import { scriptRegistry } from "../triggers";

export function registerBDCScripts(): void {
  // ASR call script confusion
  scriptRegistry.register({
    id: "bdc.asr_script_confusion.v1",
    persona: "bdc",
    priority: 12,
    match: (e: CoachEvent) =>
      e.persona === "bdc" &&
      e.kind === "repeated_missed_step" &&
      e.context?.topic === "asr_script_edit",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "bdc.asr_script_confusion.v1",
      eventId: e.id,
      persona: "bdc",
      title: "You're editing this like a blank email",
      body:
        "This script already matches what worked with similar customers at this store.\n\n" +
        "Want the 3-line summary of why it's written this way?",
      ctaLabel: "Show me",
      severity: "nudge",
      estTimeSeconds: 15,
    }),
  });

  // Flow abandoned (lead follow-up)
  scriptRegistry.register({
    id: "bdc.flow_abandoned.v1",
    persona: "bdc",
    priority: 10,
    match: (e: CoachEvent) =>
      e.persona === "bdc" &&
      e.kind === "flow_abandoned" &&
      e.context?.flowType === "lead_followup",
    generate: (e: CoachEvent): CoachSuggestion => ({
      id: "bdc.flow_abandoned.v1",
      eventId: e.id,
      persona: "bdc",
      title: "This lead needs one more step",
      body:
        "The system prepared everything — just need your confirmation to send.\n\n" +
        "I'll highlight what's left.",
      ctaLabel: "Show me",
      severity: "nudge",
      estTimeSeconds: 10,
    }),
  });
}

