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
    
    // Try to use js-yaml if available (install: npm install js-yaml @types/js-yaml)
    let yaml: any = null;
    try {
      yaml = await import("js-yaml");
    } catch {
      // js-yaml not installed - will use fallback
    }
    
    if (yaml && yaml.load) {
      _registry = yaml.load(text) as FormulaRegistry;
    } else {
      // Fallback: manual YAML parsing for simple structure
      // This is a basic parser - for production, install js-yaml: npm install js-yaml @types/js-yaml
      const lines = text.split('\n');
      const result: any = { version: "2025.11.08", visibility_thresholds: {}, visibility_weights: {} };
      let currentSection: string | null = null;
      let currentEngine: string | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        if (trimmed === 'visibility_thresholds:') {
          currentSection = 'thresholds';
          currentEngine = null;
          continue;
        }
        if (trimmed === 'visibility_weights:') {
          currentSection = 'weights';
          currentEngine = null;
          continue;
        }
        
        // Check for engine name (indented with 2 spaces)
        const engineMatch = trimmed.match(/^(\w+):\s*$/);
        if (engineMatch && currentSection === 'thresholds') {
          currentEngine = engineMatch[1];
          result.visibility_thresholds[currentEngine] = {};
          continue;
        }
        
        // Check for threshold values (indented with 4 spaces)
        const thresholdMatch = trimmed.match(/^(warn|critical):\s*(\d+)$/);
        if (thresholdMatch && currentSection === 'thresholds' && currentEngine) {
          const [, key, value] = thresholdMatch;
          result.visibility_thresholds[currentEngine][key] = parseInt(value);
          continue;
        }
        
        // Check for weight values (indented with 2 spaces)
        const weightMatch = trimmed.match(/^(\w+):\s*([\d.]+)$/);
        if (weightMatch && currentSection === 'weights') {
          const [, key, value] = weightMatch;
          result.visibility_weights[key] = parseFloat(value);
          continue;
        }
      }
      
      _registry = result as FormulaRegistry;
    }
    
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

