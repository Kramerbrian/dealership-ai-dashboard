import express from "express";
import { Pool } from "pg";
import { generateExplanation } from "../services/explainabilityService";

const router = express.Router();
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

router.post("/generate", async (req, res) => {
  try {
    const explanation = await generateExplanation(req.body);
    res.json(explanation);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/recent", async (_req, res) => {
  const client = await pool.connect();
  try {
    const rows = await client.query(
      "SELECT * FROM decision_explanations ORDER BY decision_time DESC LIMIT 100;"
    );
    res.json(rows.rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

router.get("/compare", async (req, res) => {
  const { id1, id2 } = req.query;
  const client = await pool.connect();
  try {
    const rows = await client.query(
      `SELECT * FROM decision_explanations WHERE id IN ($1, $2)`,
      [id1, id2]
    );
    res.json(rows.rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

export default router;

