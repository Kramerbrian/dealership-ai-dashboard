import { NextRequest, NextResponse } from "next/server";
import { ValidateSchemaZ } from "@/lib/api/zod";
import { validateSchemaJSON, estimateDeltas } from "@/lib/schema/validator";
import { saveSchemaValidation } from "@/lib/schema/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ValidateSchemaZ.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { dealerId, jsonld, simulate_engines } = parsed.data;
    const result = await validateSchemaJSON(jsonld, simulate_engines);
    const deltas = estimateDeltas(result);

    await saveSchemaValidation({
      dealerId,
      page: undefined,
      richResults: result.richResults,
      gpt4Score: result.llmScores.gpt4 ?? 0,
      geminiScore: result.llmScores.gemini,
      claudeScore: result.llmScores.claude,
      deltaAIV: deltas.deltaAIV,
      deltaATI: deltas.deltaATI,
    });

    return NextResponse.json({
      ok: true,
      scores: {
        rich_results: result.richResults,
        gpt4: result.llmScores.gpt4,
        gemini: result.llmScores.gemini,
        claude: result.llmScores.claude,
      },
      deltas,
      status: "validated",
    });
  } catch (error: any) {
    console.error("Schema validate error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to validate schema" },
      { status: 500 }
    );
  }
}

