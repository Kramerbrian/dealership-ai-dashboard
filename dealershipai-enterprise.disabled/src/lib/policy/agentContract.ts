import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const ContractSchema = z.object({
  version: z.union([z.number(), z.string()]),
  id: z.string(),
  purpose: z.string(),
  scope: z.object({
    inputs: z.array(z.object({ source: z.string(), fields: z.array(z.string()) })),
    outputs: z.array(z.object({ dest: z.string(), fields: z.array(z.string()) })),
  }),
  permissions: z.object({
    pii: z.object({ allowed: z.array(z.string()).default([]), denied: z.array(z.string()).default([]) }),
    writes: z.object({ allowed_fields: z.array(z.string()).default([]), denied_fields: z.array(z.string()).default([]) }),
  }),
  retention: z.object({ class: z.enum(["A","B","C"]), keep_for: z.string(), redact_after: z.string().optional() }),
  escalation: z.object({
    confidence_thresholds: z.object({ human_review: z.number(), limited_write: z.number() }),
    on_violation: z.string().default("queue:compliance"),
  }),
  guardrails: z.object({ prohibited_actions: z.array(z.string()).default([]) }),
});
export type AgentContract = z.infer<typeof ContractSchema>;

export function loadContract(agentId: string): AgentContract {
  const p = path.join(process.cwd(), "contracts", "agents", `${agentId}.yml`);
  const raw = fs.readFileSync(p, "utf8");
  const data = YAML.parse(raw);
  return ContractSchema.parse(data);
}
