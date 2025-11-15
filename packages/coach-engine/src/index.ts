/**
 * CoachEngine - Core Event Handler
 * 
 * Determines when Coach should wake up and what to say.
 */

import type { CoachEvent, CoachSuggestion, CoachDecision } from "../../core-models/src/coach";
import { registerPersonaScripts } from "./scripts";
import { checkCooldown, recordCoachActivity } from "./policies";
import { matchScripts } from "./triggers";

// Initialize scripts on module load
registerPersonaScripts();

/**
 * Main entry point: Handle a CoachEvent and decide if Coach should speak
 */
export function handleCoachEvent(event: CoachEvent): CoachDecision {
  // Check cooldown first (don't be Clippy)
  const cooldownCheck = checkCooldown(event.userId, event.persona);
  if (!cooldownCheck.allowed) {
    return {
      suggestion: null,
      reason: "cooldown",
    };
  }

  // Match event against registered scripts
  const matchedScripts = matchScripts(event);
  
  if (matchedScripts.length === 0) {
    return {
      suggestion: null,
      reason: "irrelevant",
    };
  }

  // Use first match (highest priority)
  const script = matchedScripts[0];
  const suggestion = script.generate(event);

  // Filter by severity if needed
  if (suggestion.severity === "info" && cooldownCheck.recentActivity > 2) {
    return {
      suggestion: null,
      reason: "low_severity",
    };
  }

  // Record that we're sending this
  recordCoachActivity(event.userId, event.persona, suggestion.id);

  return {
    suggestion,
    reason: "sent",
  };
}

/**
 * Register a custom coach script
 */
export function registerCoachScript(
  persona: string,
  matcher: (event: CoachEvent) => boolean,
  generator: (event: CoachEvent) => CoachSuggestion
): void {
  // Implementation in triggers.ts
  matchScripts.register({
    persona: persona as any,
    match: matcher,
    generate: generator,
  });
}

