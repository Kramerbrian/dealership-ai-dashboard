import client from "prom-client";

export const schemaValidationSuccess = new client.Counter({
  name: "schema_validation_success_total",
  help: "Count of successful schema validations",
  labelNames: ["event_type"],
});

export const schemaValidationFailure = new client.Counter({
  name: "schema_validation_failure_total",
  help: "Count of failed schema validations",
  labelNames: ["event_type", "reason"],
});

export const schemaValidationLatency = new client.Histogram({
  name: "schema_validation_duration_seconds",
  help: "Duration of schema validation per event type",
  labelNames: ["event_type"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const schemaAutoHealTotal = new client.Counter({
  name: "schema_autoheal_total",
  help: "Count of automated schema refreshes triggered by alerts",
  labelNames: ["severity"],
});

export const adaptiveRemediationCount = new client.Counter({
  name: "schema_adaptive_remediation_total",
  help: "Count of targeted schema fixes launched by adaptive engine",
  labelNames: ["schema_type"],
});

export const adaptiveReward = new client.Gauge({
  name: "schema_adaptive_reward",
  help: "Average RL reward from adaptive schema fixes",
  labelNames: ["schema_type"],
});

export const rlPolicyScores = new client.Summary({
  name: "rl_policy_score_distribution",
  help: "Distribution of predicted RL scores by schema type",
  labelNames: ["schema_type"],
});

export const rlPolicyDecisions = new client.Counter({
  name: "rl_policy_decisions_total",
  help: "Count of tasks prioritized by RL policy",
  labelNames: ["priority_band"],
});

export const explanationsCreated = new client.Counter({
  name: "decision_explanations_generated_total",
  help: "Total SHAP charts generated",
});

export function registerSchemaMetrics(app: any) {
  app.get("/metrics/schema", async (_req: any, res: any) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });
}
