export const ENGINES = [
  { key: 'chatgpt', weight: 0.35 },
  { key: 'gemini', weight: 0.25 },
  { key: 'perplexity', weight: 0.20 },
  { key: 'copilot', weight: 0.20 }
] as const;

export type EngineKey = typeof ENGINES[number]['key'];