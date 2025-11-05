import { Pool } from "pg";
import fetch from "node-fetch";
import { adaptiveRemediationCount, adaptiveReward } from "./schemaMetrics";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const ENGINE = process.env.SCHEMA_ENGINE_URL ||
  "https://chat.openai.com/g/g-68cf0309aaa08191b390fbd277335d28";

export interface FailureCluster {
  schema_type: string;
  dealer_id: string;
  failure_count: number;
}

export async function analyzeFailures(threshold = 5): Promise<FailureCluster[]> {
  const client = await pool.connect();
  try {
    const sql = `
      SELECT schema_type, dealer_id, COUNT(*) AS c
      FROM validation_failures
      WHERE occurred_at > NOW() - INTERVAL '1 day'
      GROUP BY schema_type, dealer_id
      HAVING COUNT(*) >= $1
    `;
    const res = await client.query(sql, [threshold]);
    return res.rows.map(row => ({
      schema_type: row.schema_type,
      dealer_id: row.dealer_id,
      failure_count: row.c,
    }));
  } finally {
    client.release();
  }
}

export async function adaptiveRemediate(): Promise<number> {
  const clusters = await analyzeFailures();
  const client = await pool.connect();

  try {
    for (const cluster of clusters) {
      // Call Schema Engineer with adaptive fix
      const response = await fetch(ENGINE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adaptive_fix",
          schema_type: cluster.schema_type,
          dealer: cluster.dealer_id,
          mode: "rl_feedback",
        }),
      });

      if (response.ok) {
        // Log to failure clusters table
        await client.query(
          `INSERT INTO schema_failure_clusters(schema_type, dealer_id, failure_count, status)
           VALUES($1, $2, $3, 'queued')
           ON CONFLICT (schema_type, dealer_id) DO UPDATE
           SET failure_count = $3, status = 'queued', last_seen = NOW()`,
          [cluster.schema_type, cluster.dealer_id, cluster.failure_count]
        );

        adaptiveRemediationCount.labels(cluster.schema_type).inc();
      }
    }
  } finally {
    client.release();
  }

  return clusters.length;
}

