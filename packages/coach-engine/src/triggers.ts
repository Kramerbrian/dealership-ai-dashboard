/**
 * Coach Triggers - Script Matching System
 */

import type { CoachEvent, CoachSuggestion } from "../../core-models/src/coach";

export interface CoachScript {
  id: string;
  persona: string;
  match: (event: CoachEvent) => boolean;
  generate: (event: CoachEvent) => CoachSuggestion;
  priority?: number; // Higher = more important
}

class ScriptRegistry {
  private scripts: CoachScript[] = [];

  register(script: CoachScript): void {
    this.scripts.push(script);
    // Sort by priority (highest first)
    this.scripts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  match(event: CoachEvent): CoachScript[] {
    return this.scripts.filter((script) => {
      // Check persona match
      if (script.persona !== event.persona) {
        return false;
      }
      // Run matcher
      return script.match(event);
    });
  }

  getAll(): CoachScript[] {
    return [...this.scripts];
  }
}

export const scriptRegistry = new ScriptRegistry();

/**
 * Match event against all registered scripts
 */
export function matchScripts(event: CoachEvent): CoachScript[] {
  return scriptRegistry.match(event);
}

// Export registry for external registration
(matchScripts as any).register = (script: CoachScript) => {
  scriptRegistry.register(script);
};

