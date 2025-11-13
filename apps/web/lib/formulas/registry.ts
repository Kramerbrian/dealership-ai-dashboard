import yaml from "js-yaml";
import fs from "fs";
import path from "path";

export type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";

export type VisibilityWeights = {
  [K in EngineName]: number;
};

export type VisibilityThresholds = {
  [K in EngineName]: { warn: number; critical: number };
};

export type FormulaRegistry = {
  version: string;
  formulas?: any[];
  visibility_thresholds: VisibilityThresholds;
  visibility_weights: VisibilityWeights;
  aiv_label?: string; // e.g., "AIV – Algorithmic Visibility Index"
};

let _registry: FormulaRegistry | null = null;

/**
 * Loads configs/formulas/registry.yaml
 * Falls back to defaults if file not found
 */
export async function loadFormulaRegistry(): Promise<FormulaRegistry> {
  if (_registry) return _registry;

  try {
    // Try to load from configs/formulas/registry.yaml
    const registryPath = path.join(process.cwd(), "configs", "formulas", "registry.yaml");
    
    if (fs.existsSync(registryPath)) {
      const text = fs.readFileSync(registryPath, "utf-8");
      _registry = yaml.load(text) as FormulaRegistry;
      return _registry!;
    }
  } catch (error) {
    console.warn("[registry] Failed to load registry.yaml, using defaults:", error);
  }

  // Default fallback
  _registry = {
    version: "1.0.0",
    visibility_weights: {
      ChatGPT: 0.35,
      Perplexity: 0.25,
      Gemini: 0.25,
      Copilot: 0.15
    },
    visibility_thresholds: {
      ChatGPT: { warn: 60, critical: 40 },
      Perplexity: { warn: 50, critical: 30 },
      Gemini: { warn: 50, critical: 30 },
      Copilot: { warn: 40, critical: 20 }
    },
    aiv_label: "AIV – Algorithmic Visibility Index"
  };

  return _registry;
}

/**
 * Returns visibility weights from registry
 * Safe defaults if registry not found
 */
export async function getVisibilityWeights(): Promise<VisibilityWeights> {
  try {
    const reg = await loadFormulaRegistry();
    return reg.visibility_weights || {
      ChatGPT: 0.35,
      Perplexity: 0.25,
      Gemini: 0.25,
      Copilot: 0.15
    };
  } catch {
    return {
      ChatGPT: 0.35,
      Perplexity: 0.25,
      Gemini: 0.25,
      Copilot: 0.15
    };
  }
}

/**
 * Returns visibility thresholds from registry
 */
export async function getVisibilityThresholds(): Promise<VisibilityThresholds> {
  try {
    const reg = await loadFormulaRegistry();
    return reg.visibility_thresholds || {
      ChatGPT: { warn: 60, critical: 40 },
      Perplexity: { warn: 50, critical: 30 },
      Gemini: { warn: 50, critical: 30 },
      Copilot: { warn: 40, critical: 20 }
    };
  } catch {
    return {
      ChatGPT: { warn: 60, critical: 40 },
      Perplexity: { warn: 50, critical: 30 },
      Gemini: { warn: 50, critical: 30 },
      Copilot: { warn: 40, critical: 20 }
    };
  }
}

/**
 * Returns AIV label from registry
 */
export async function getAIVLabel(): Promise<string> {
  try {
    const reg = await loadFormulaRegistry();
    return reg.aiv_label || "AIV – Algorithmic Visibility Index";
  } catch {
    return "AIV – Algorithmic Visibility Index";
  }
}

