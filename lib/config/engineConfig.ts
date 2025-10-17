// DealershipAI Search Engine Configuration
// Supported AI engines with capabilities and rate limits

export type EngineId = 'chatgpt' | 'gemini' | 'perplexity' | 'copilot'

export interface EngineConfig {
  id: EngineId
  name: string
  displayName: string
  provider: string
  capabilities: {
    textGeneration: boolean
    codeGeneration: boolean
    imageAnalysis: boolean
    webSearch: boolean
    realTimeData: boolean
  }
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
    maxTokensPerRequest: number
  }
  pricing: {
    inputTokensPerDollar: number
    outputTokensPerDollar: number
    baseCostPerRequest: number
  }
  reliability: {
    uptime: number // percentage
    avgResponseTime: number // milliseconds
    errorRate: number // percentage
  }
  features: {
    streaming: boolean
    functionCalling: boolean
    contextWindow: number
    supportsImages: boolean
  }
}

export const ENGINE_CONFIGS: Record<EngineId, EngineConfig> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    displayName: 'ChatGPT-4',
    provider: 'OpenAI',
    capabilities: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: true,
      webSearch: false,
      realTimeData: false
    },
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 150000,
      maxTokensPerRequest: 8000
    },
    pricing: {
      inputTokensPerDollar: 500000, // $0.002 per 1K tokens
      outputTokensPerDollar: 1500000, // $0.006 per 1K tokens
      baseCostPerRequest: 0.01
    },
    reliability: {
      uptime: 99.9,
      avgResponseTime: 1200,
      errorRate: 0.1
    },
    features: {
      streaming: true,
      functionCalling: true,
      contextWindow: 128000,
      supportsImages: true
    }
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    displayName: 'Gemini Pro',
    provider: 'Google',
    capabilities: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: true,
      webSearch: true,
      realTimeData: true
    },
    rateLimits: {
      requestsPerMinute: 100,
      tokensPerMinute: 200000,
      maxTokensPerRequest: 10000
    },
    pricing: {
      inputTokensPerDollar: 1000000, // $0.001 per 1K tokens
      outputTokensPerDollar: 2000000, // $0.0005 per 1K tokens
      baseCostPerRequest: 0.005
    },
    reliability: {
      uptime: 99.5,
      avgResponseTime: 800,
      errorRate: 0.2
    },
    features: {
      streaming: true,
      functionCalling: true,
      contextWindow: 1000000,
      supportsImages: true
    }
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    displayName: 'Perplexity Pro',
    provider: 'Perplexity AI',
    capabilities: {
      textGeneration: true,
      codeGeneration: false,
      imageAnalysis: false,
      webSearch: true,
      realTimeData: true
    },
    rateLimits: {
      requestsPerMinute: 20,
      tokensPerMinute: 50000,
      maxTokensPerRequest: 4000
    },
    pricing: {
      inputTokensPerDollar: 200000, // $0.005 per 1K tokens
      outputTokensPerDollar: 400000, // $0.0025 per 1K tokens
      baseCostPerRequest: 0.02
    },
    reliability: {
      uptime: 99.0,
      avgResponseTime: 2000,
      errorRate: 0.5
    },
    features: {
      streaming: true,
      functionCalling: false,
      contextWindow: 8000,
      supportsImages: false
    }
  },
  copilot: {
    id: 'copilot',
    name: 'Copilot',
    displayName: 'GitHub Copilot',
    provider: 'Microsoft',
    capabilities: {
      textGeneration: true,
      codeGeneration: true,
      imageAnalysis: false,
      webSearch: false,
      realTimeData: false
    },
    rateLimits: {
      requestsPerMinute: 30,
      tokensPerMinute: 75000,
      maxTokensPerRequest: 6000
    },
    pricing: {
      inputTokensPerDollar: 300000, // $0.003 per 1K tokens
      outputTokensPerDollar: 600000, // $0.0015 per 1K tokens
      baseCostPerRequest: 0.015
    },
    reliability: {
      uptime: 99.7,
      avgResponseTime: 1500,
      errorRate: 0.3
    },
    features: {
      streaming: false,
      functionCalling: false,
      contextWindow: 32000,
      supportsImages: false
    }
  }
}

export function getEngineConfig(engineId: EngineId): EngineConfig {
  return ENGINE_CONFIGS[engineId]
}

export function getAllEngines(): EngineConfig[] {
  return Object.values(ENGINE_CONFIGS)
}

export function getEnginesByCapability(capability: keyof EngineConfig['capabilities']): EngineConfig[] {
  return Object.values(ENGINE_CONFIGS).filter(engine => engine.capabilities[capability])
}

export function calculateCost(engineId: EngineId, inputTokens: number, outputTokens: number): number {
  const config = getEngineConfig(engineId)
  const inputCost = inputTokens / config.pricing.inputTokensPerDollar
  const outputCost = outputTokens / config.pricing.outputTokensPerDollar
  return config.pricing.baseCostPerRequest + inputCost + outputCost
}
