/**
 * CoachAgent_v1 - Core Types
 * 
 * Shared types for the CoachAgent system that monitors agent→human handoffs
 * and provides micro-coaching at the exact moment of need.
 */

export type CoachPersona =
  | "sales"
  | "service"
  | "parts"
  | "marketing"
  | "manager"
  | "bdc";

export type CoachEventKind =
  | "agent_handoff_pending"
  | "agent_recommendation_ignored"
  | "flow_abandoned"
  | "error_loop"
  | "override_without_reason"
  | "compliance_block_waiting"
  | "metric_confusion"
  | "repeated_missed_step"
  | "ui_deadend";

export type CoachApp = "dash" | "orchestrator" | "store";

export interface CoachEvent {
  id: string;
  dealerId: string;
  userId: string;
  persona: CoachPersona;
  app: CoachApp;
  sourceAgent?: string; // "Pulse", "AIM", "SchemaKing", "Compliance", "UXNUI", etc.
  kind: CoachEventKind;
  context: Record<string, any>; // Flexible payload
  occurredAt: string; // ISO timestamp
}

export interface CoachSuggestion {
  id: string;
  eventId: string;
  persona: CoachPersona;
  title: string; // "Want the 10-second version?"
  body: string; // Micro-coaching content
  ctaLabel?: string; // "Show me" / "Do it with me"
  severity: "info" | "nudge" | "warning" | "critical";
  estTimeSeconds: number; // 10–45
  moneyAnchor?: {
    estLossLow?: number;
    estLossHigh?: number;
    currency?: "USD";
  };
}

export interface CoachDecision {
  suggestion: CoachSuggestion | null;
  reason: "irrelevant" | "cooldown" | "low_severity" | "sent";
}

export type CoachOutcome =
  | "accepted"
  | "dismissed"
  | "ignored"
  | "completed_flow"
  | "abandoned_flow";

export interface CoachTelemetry {
  suggestionId: string;
  eventId: string;
  userId: string;
  dealerId: string;
  outcome: CoachOutcome;
  occurredAt: string;
  metadata?: Record<string, any>;
}

/**
 * Agent-Human Handoff Protocol States
 */
export type HandoffState =
  | "AGENT_PREPARED" // Agent has data, recommendation, NBA ready
  | "HUMAN_REQUIRED" // OS requires judgment, approval, exception handling
  | "HUMAN_CONFIRMED" // Human accepts/rejects, optionally annotates
  | "AGENT_EXECUTED" // Agent executes, updates logs, feeds Pulse/DTS/DSS
  | "COACH_REINFORCE"; // Coach clarifies "why this mattered"

export interface HandoffContext {
  state: HandoffState;
  agentId: string;
  flowId: string;
  recommendation?: any;
  humanAction?: "accepted" | "rejected" | "modified";
  timestamp: string;
}

