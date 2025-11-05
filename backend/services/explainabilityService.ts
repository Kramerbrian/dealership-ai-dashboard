import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export interface DecisionContext {
  dealerId: string;
  schemaType: string;
  features: Record<string, number>;
  weights: { ARR: number; ATI: number; AIV: number };
  predicted: { ARR: number; ATI: number; AIV: number };
  score: number;
}

export interface FeatureImportance {
  feature: string;
  contribution: number;
}

export async function generateExplanation(ctx: DecisionContext) {
  const importance: FeatureImportance[] = Object.entries(ctx.features).map(([k, v]) => ({
    feature: k,
    contribution: v * (ctx.weights.ARR + ctx.weights.ATI + ctx.weights.AIV) / 3,
  }));

  const expected = {
    arr_gain: ctx.predicted.ARR,
    ati_gain: ctx.predicted.ATI,
    aiv_gain: ctx.predicted.AIV,
  };

  const narrative = `
Dealer ${ctx.dealerId} prioritized because
expected ARR gain = ${(ctx.predicted.ARR * 100).toFixed(1)} %,
Trust uplift = ${(ctx.predicted.ATI * 100).toFixed(1)} %,
Visibility improvement = ${(ctx.predicted.AIV * 100).toFixed(1)} %.
Weights: ARR=${ctx.weights.ARR}, ATI=${ctx.weights.ATI}, AIV=${ctx.weights.AIV}.
Top contributing features: ${importance
    .slice(0, 3)
    .map((i) => i.feature)
    .join(", ")}.
`;

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO decision_explanations
       (dealer_id, schema_type, score, weight_arr, weight_ati, weight_aiv,
        feature_importance, expected_outcomes, narrative)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        ctx.dealerId,
        ctx.schemaType,
        ctx.score,
        ctx.weights.ARR,
        ctx.weights.ATI,
        ctx.weights.AIV,
        JSON.stringify(importance),
        JSON.stringify(expected),
        narrative,
      ]
    );
  } finally {
    client.release();
  }

  return { importance, expected, narrative };
}

