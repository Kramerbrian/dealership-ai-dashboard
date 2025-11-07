import yaml from "js-yaml";

export type VisibilityWeights = {
  ChatGPT: number;
  Perplexity: number;
  Gemini: number;
  Copilot: number;
};

export type VisibilityThresholds = {
  ChatGPT: { warn: number; critical: number };
  Perplexity: { warn: number; critical: number };
  Gemini: { warn: number; critical: number };
  Copilot: { warn: number; critical: number };
};

export type FormulaRegistry = {
  version: string;
  formulas?: any[];
  visibility_thresholds: VisibilityThresholds;
  visibility_weights: VisibilityWeights;
};

let _registry: FormulaRegistry | null = null;

/** Loads configs/formulas/registry.yaml as a string (Vite/Next ?raw import or fs) */
export async function loadFormulaRegistry(): Promise<FormulaRegistry> {
  if (_registry) return _registry;
  
  try {
    // For Next.js App Router, read from file system
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "configs", "formulas", "registry.yaml");
    const text = await fs.readFile(filePath, "utf-8");
    _registry = yaml.load(text) as FormulaRegistry;
    return _registry!;
  } catch (error) {
    // Fallback to defaults if file not found
    console.warn("Could not load registry.yaml, using defaults:", error);
    _registry = {
      version: "2025.11.08",
      visibility_thresholds: {
        ChatGPT: { warn: 80, critical: 70 },
        Perplexity: { warn: 75, critical: 65 },
        Gemini: { warn: 75, critical: 70 },
        Copilot: { warn: 72, critical: 65 },
      },
      visibility_weights: {
        ChatGPT: 0.35,
        Perplexity: 0.25,
        Gemini: 0.25,
        Copilot: 0.15,
      },
    };
    return _registry;
  }
}

/** Returns safe defaults if registry not found */
export async function getVisibilityWeights(): Promise<VisibilityWeights> {
  try {
    const reg = await loadFormulaRegistry();
    return reg.visibility_weights || { ChatGPT: 0.35, Perplexity: 0.25, Gemini: 0.25, Copilot: 0.15 };
  } catch {
    return { ChatGPT: 0.35, Perplexity: 0.25, Gemini: 0.25, Copilot: 0.15 };
  }
}

/** Returns safe defaults if registry not found */
export async function getVisibilityThresholds(): Promise<VisibilityThresholds> {
  try {
    const reg = await loadFormulaRegistry();
    return reg.visibility_thresholds || {
      ChatGPT: { warn: 80, critical: 70 },
      Perplexity: { warn: 75, critical: 65 },
      Gemini: { warn: 75, critical: 70 },
      Copilot: { warn: 72, critical: 65 },
    };
  } catch {
    return {
      ChatGPT: { warn: 80, critical: 70 },
      Perplexity: { warn: 75, critical: 65 },
      Gemini: { warn: 75, critical: 70 },
      Copilot: { warn: 72, critical: 65 },
    };
  }
}

