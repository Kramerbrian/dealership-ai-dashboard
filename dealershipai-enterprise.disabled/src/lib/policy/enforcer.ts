import crypto from "node:crypto";
import type { AgentContract } from "./agentContract";
import { redactPII } from "./redact";

type WriteIntent = {
  dest: string;
  payload: Record<string, unknown>;
  action_type: string;      // e.g., "create_task"
  entity_type: string;      // e.g., "crm.task"
  entity_id: string;        // e.g., taskId or composite key
  confidence: number;       // 0..1
  rationale?: string;
};

export type PolicyResult = {
  pass: boolean;
  violations: string[];
  mode: "HUMAN_REVIEW" | "LIMITED_WRITE" | "FULL_AUTO";
};

export function preflight(contract: AgentContract, intent: WriteIntent): PolicyResult {
  const violations: string[] = [];

  // 1) Guardrails
  if (contract.guardrails.prohibited_actions.includes(intent.action_type)) {
    violations.push(`prohibited_action:${intent.action_type}`);
  }

  // 2) Field-level writes
  const keys = Object.keys(intent.payload ?? {});
  const denied = keys.filter(k => contract.permissions.writes.denied_fields.includes(k));
  if (denied.length) violations.push(`denied_fields:${denied.join(',')}`);

  const notAllowed = keys.filter(k => !contract.permissions.writes.allowed_fields.includes(k));
  if (notAllowed.length) violations.push(`not_allowed_fields:${notAllowed.join(',')}`);

  // 3) PII linter (basic demonstration)
  const joined = JSON.stringify(intent.payload || {});
  const hasPII = /@|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(joined);
  if (hasPII && !contract.permissions.pii.allowed.includes("email") && !contract.permissions.pii.allowed.includes("phone")) {
    violations.push("pii_out_of_scope");
  }

  // 4) Confidence gates
  let mode: PolicyResult["mode"] = "FULL_AUTO";
  const { human_review, limited_write } = contract.escalation.confidence_thresholds;
  if (intent.confidence < human_review) mode = "HUMAN_REVIEW";
  else if (intent.confidence < limited_write) mode = "LIMITED_WRITE";

  return { pass: violations.length === 0, violations, mode };
}

export function hashPromptTemplate(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0,16);
}
