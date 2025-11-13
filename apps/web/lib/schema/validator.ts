type Engine = "gpt4" | "gemini" | "claude";

export interface ValidationResult {
  richResults: boolean;
  llmScores: Partial<Record<Engine, number>>;
}

/**
 * Minimal JSON-LD sanity check + simple rich-result eligibility heuristic.
 * Replace with a remote Rich Results Test call when you're ready.
 */
export function runRichResultsTest(jsonld: string): boolean {
  try {
    const obj = JSON.parse(jsonld);
    // Must have @context and @type; reward Vehicle/Offer/AutoDealer combos
    const ctxOk = !!obj["@context"];
    const typeOk = !!obj["@type"];
    const types = new Set<string | string[]>(
      Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]]
    );
    const vehicleish =
      types.has("Vehicle") || JSON.stringify(obj).includes('"Vehicle"');
    const dealerish =
      types.has("AutoDealer") || JSON.stringify(obj).includes('"AutoDealer"');
    const hasOffer = JSON.stringify(obj).includes('"Offer"');
    return ctxOk && typeOk && (vehicleish || dealerish) && hasOffer;
  } catch {
    return false;
  }
}

/**
 * Adapter interfaces – swap with real providers later
 */
async function scoreWithGPT4(jsonld: string): Promise<number> {
  // TODO: call your LLM scoring action; return 0..1 confidence
  // Heuristic: more fields → higher score, bounded.
  const len = Math.min(jsonld.length, 40000);
  const richness = (jsonld.match(/":/g) ?? []).length;
  return Math.max(0.6, Math.min(1.0, 0.55 + richness / 800)); // tame
}

async function scoreWithGemini(jsonld: string): Promise<number> {
  const richness = (jsonld.match(/"@type"/g) ?? []).length;
  return Math.max(0.5, Math.min(0.97, 0.5 + richness / 40));
}

async function scoreWithClaude(jsonld: string): Promise<number> {
  const hasFAQ = /"FAQPage"/.test(jsonld);
  const hasService = /"Service"/.test(jsonld);
  const base = 0.58 + (hasFAQ ? 0.07 : 0) + (hasService ? 0.05 : 0);
  return Math.min(0.95, base);
}

/**
 * Orchestrates the full validation run
 */
export async function validateSchemaJSON(
  jsonld: string,
  engines: Engine[] = ["gpt4", "gemini", "claude"]
): Promise<ValidationResult> {
  const rich = runRichResultsTest(jsonld);

  const scores: Partial<Record<Engine, number>> = {};
  await Promise.all(
    engines.map(async (e) => {
      if (e === "gpt4") scores.gpt4 = await scoreWithGPT4(jsonld);
      if (e === "gemini") scores.gemini = await scoreWithGemini(jsonld);
      if (e === "claude") scores.claude = await scoreWithClaude(jsonld);
    })
  );

  return { richResults: rich, llmScores: scores };
}

/**
 * Simple delta estimation (tune w/ your model later)
 */
export function estimateDeltas(input: ValidationResult) {
  const llmAvg =
    (input.llmScores.gpt4 ?? 0) * 0.5 +
    (input.llmScores.gemini ?? 0) * 0.3 +
    (input.llmScores.claude ?? 0) * 0.2;

  const deltaAIV = (input.richResults ? 0.03 : 0) + (llmAvg - 0.6) * 0.2; // cap small
  const deltaATI = (input.richResults ? 0.02 : 0) + (llmAvg - 0.6) * 0.15;

  return {
    deltaAIV: Number(Math.max(0, deltaAIV).toFixed(3)),
    deltaATI: Number(Math.max(0, deltaATI).toFixed(3)),
  };
}
