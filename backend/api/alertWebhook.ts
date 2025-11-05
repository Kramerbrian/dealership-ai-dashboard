import express from "express";
import fetch from "node-fetch";
import { adaptiveRemediate } from "../services/adaptiveRemediation";
import { schemaAutoHealTotal } from "../services/schemaMetrics";

const router = express.Router();
const ORCH_URL = process.env.ORCHESTRATOR_URL || "http://orchestrator:3001";

/**
 * Receives Alertmanager JSON payloads.
 * Triggers a self-healing task when schema-validation alerts fire.
 */
router.post("/", async (req, res) => {
  const alerts = req.body.alerts || [];

  for (const alert of alerts) {
    const name = alert.labels?.alertname;
    const severity = alert.labels?.severity;

    if (name?.startsWith("SchemaValidation") && alert.status === "firing") {
      console.log(`[Webhook] Self-heal triggered from ${name} (${severity})`);

      // 1️⃣ Create orchestrator job for schema validation refresh
      try {
        await fetch(`${ORCH_URL}/api/orchestrate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "schema_refresh",
            payload: {
              reason: name,
              severity,
              source: "alertmanager",
            },
          }),
        });

        // 2️⃣ Adaptive remediation for targeted fixes
        const fixes = await adaptiveRemediate();
        schemaAutoHealTotal.labels(severity).inc(fixes);

        console.log(`[Webhook] Adaptive remediation completed: ${fixes} clusters fixed`);
      } catch (error) {
        console.error(`[Webhook] Error during remediation:`, error);
      }
    }
  }

  res.json({ received: alerts.length });
});

export default router;

