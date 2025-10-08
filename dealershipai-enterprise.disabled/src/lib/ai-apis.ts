import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// AI API Configuration
export interface AIConfig {
  anthropic: {
    apiKey: string | null
    model: string
    maxTokens: number
  }
  openai: {
    apiKey: string | null
    model: string
    maxTokens: number
  }
  google: {
    apiKey: string | null
    model: string
  }
  enabled: {
    anthropic: boolean
    openai: boolean
    google: boolean
  }
}

// Initialize AI clients with proper error handling
export const aiConfig: AIConfig = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || null,
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4000,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
    model: 'gpt-4o',
    maxTokens: 4000,
  },
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY || null,
    model: 'gemini-1.5-pro',
  },
  enabled: {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    google: !!process.env.GOOGLE_AI_API_KEY,
  },
}

// Initialize clients
export const anthropic = aiConfig.enabled.anthropic && aiConfig.anthropic.apiKey
  ? new Anthropic({ apiKey: aiConfig.anthropic.apiKey })
  : null

export const openai = aiConfig.enabled.openai && aiConfig.openai.apiKey
  ? new OpenAI({ apiKey: aiConfig.openai.apiKey })
  : null

// Google AI client (using fetch for now)
export const googleAI = {
  generateContent: async (prompt: string) => {
    if (!aiConfig.enabled.google || !aiConfig.google.apiKey) {
      throw new Error('Google AI API key not configured')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.google.model}:generateContent?key=${aiConfig.google.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }
}

// AI Query Interface
export interface AIQuery {
  prompt: string
  engine: 'anthropic' | 'openai' | 'google'
  context?: string
  maxTokens?: number
  temperature?: number
}

export interface AIResponse {
  text: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost: number
  latency: number
  engine: string
}

// Cost calculation (approximate)
const COST_PER_TOKEN = {
  anthropic: {
    'claude-3-5-sonnet-20241022': { input: 0.000003, output: 0.000015 },
    'claude-3-opus-20240229': { input: 0.000015, output: 0.000075 },
  },
  openai: {
    'gpt-4o': { input: 0.000005, output: 0.000015 },
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
  },
  google: {
    'gemini-1.5-pro': { input: 0.00000125, output: 0.000005 },
  },
}

function calculateCost(engine: string, model: string, inputTokens: number, outputTokens: number): number {
  const costs = COST_PER_TOKEN[engine as keyof typeof COST_PER_TOKEN]?.[model as keyof typeof COST_PER_TOKEN[typeof engine]]
  if (!costs) return 0
  
  return (inputTokens * costs.input) + (outputTokens * costs.output)
}

// Main AI query function
export async function queryAI(query: AIQuery): Promise<AIResponse> {
  const startTime = Date.now()
  
  try {
    let response: AIResponse

    switch (query.engine) {
      case 'anthropic':
        if (!anthropic) {
          throw new Error('Anthropic API not configured')
        }
        
        const anthropicResponse = await anthropic.messages.create({
          model: aiConfig.anthropic.model,
          max_tokens: query.maxTokens || aiConfig.anthropic.maxTokens,
          temperature: query.temperature || 0.7,
          messages: [{
            role: 'user',
            content: query.context ? `${query.context}\n\n${query.prompt}` : query.prompt
          }]
        })

        const anthropicText = anthropicResponse.content[0].type === 'text' 
          ? anthropicResponse.content[0].text 
          : ''

        response = {
          text: anthropicText,
          usage: {
            promptTokens: anthropicResponse.usage.input_tokens,
            completionTokens: anthropicResponse.usage.output_tokens,
            totalTokens: anthropicResponse.usage.input_tokens + anthropicResponse.usage.output_tokens,
          },
          cost: calculateCost(
            'anthropic',
            aiConfig.anthropic.model,
            anthropicResponse.usage.input_tokens,
            anthropicResponse.usage.output_tokens
          ),
          latency: Date.now() - startTime,
          engine: 'anthropic',
        }
        break

      case 'openai':
        if (!openai) {
          throw new Error('OpenAI API not configured')
        }

        const openaiResponse = await openai.chat.completions.create({
          model: aiConfig.openai.model,
          max_tokens: query.maxTokens || aiConfig.openai.maxTokens,
          temperature: query.temperature || 0.7,
          messages: [{
            role: 'user',
            content: query.context ? `${query.context}\n\n${query.prompt}` : query.prompt
          }]
        })

        const openaiText = openaiResponse.choices[0]?.message?.content || ''

        response = {
          text: openaiText,
          usage: {
            promptTokens: openaiResponse.usage?.prompt_tokens || 0,
            completionTokens: openaiResponse.usage?.completion_tokens || 0,
            totalTokens: openaiResponse.usage?.total_tokens || 0,
          },
          cost: calculateCost(
            'openai',
            aiConfig.openai.model,
            openaiResponse.usage?.prompt_tokens || 0,
            openaiResponse.usage?.completion_tokens || 0
          ),
          latency: Date.now() - startTime,
          engine: 'openai',
        }
        break

      case 'google':
        const googleText = await googleAI.generateContent(
          query.context ? `${query.context}\n\n${query.prompt}` : query.prompt
        )

        // Estimate token usage for Google (rough approximation)
        const estimatedTokens = Math.ceil(query.prompt.length / 4) + Math.ceil(googleText.length / 4)

        response = {
          text: googleText,
          usage: {
            promptTokens: Math.ceil(query.prompt.length / 4),
            completionTokens: Math.ceil(googleText.length / 4),
            totalTokens: estimatedTokens,
          },
          cost: calculateCost(
            'google',
            aiConfig.google.model,
            Math.ceil(query.prompt.length / 4),
            Math.ceil(googleText.length / 4)
          ),
          latency: Date.now() - startTime,
          engine: 'google',
        }
        break

      default:
        throw new Error(`Unsupported AI engine: ${query.engine}`)
    }

    return response
  } catch (error) {
    console.error(`AI query failed (${query.engine}):`, error)
    throw new Error(`AI query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Batch AI queries for efficiency
export async function queryAIBatch(queries: AIQuery[]): Promise<AIResponse[]> {
  const promises = queries.map(query => queryAI(query))
  return Promise.allSettled(promises).then(results =>
    results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Query ${index} failed:`, result.reason)
        return {
          text: '',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: 0,
          latency: 0,
          engine: queries[index].engine,
        }
      }
    })
  )
}

// AI scoring queries for dealership visibility
export const DEALERSHIP_QUERIES = {
  visibility: {
    prompt: 'Find the top 5 car dealerships in {location} for {brand} vehicles. Include their names, addresses, and what makes them stand out.',
    engines: ['anthropic', 'openai', 'google'] as const,
  },
  reviews: {
    prompt: 'What are customers saying about {dealership} in {location}? Summarize the key themes in their reviews.',
    engines: ['anthropic', 'openai'] as const,
  },
  services: {
    prompt: 'What services does {dealership} offer? List their main services and specialties.',
    engines: ['anthropic', 'openai', 'google'] as const,
  },
  competition: {
    prompt: 'Who are the main competitors of {dealership} in {location}? How do they compare?',
    engines: ['anthropic', 'openai'] as const,
  },
}

// Helper function to test AI API connectivity
export async function testAIConnectivity(): Promise<{
  anthropic: boolean
  openai: boolean
  google: boolean
}> {
  const results = {
    anthropic: false,
    openai: false,
    google: false,
  }

  // Test Anthropic
  if (aiConfig.enabled.anthropic) {
    try {
      await queryAI({
        prompt: 'Hello, this is a test.',
        engine: 'anthropic',
        maxTokens: 10,
      })
      results.anthropic = true
    } catch (error) {
      console.error('Anthropic test failed:', error)
    }
  }

  // Test OpenAI
  if (aiConfig.enabled.openai) {
    try {
      await queryAI({
        prompt: 'Hello, this is a test.',
        engine: 'openai',
        maxTokens: 10,
      })
      results.openai = true
    } catch (error) {
      console.error('OpenAI test failed:', error)
    }
  }

  // Test Google
  if (aiConfig.enabled.google) {
    try {
      await queryAI({
        prompt: 'Hello, this is a test.',
        engine: 'google',
        maxTokens: 10,
      })
      results.google = true
    } catch (error) {
      console.error('Google AI test failed:', error)
    }
  }

  return results
}

// Get API status and costs
export function getAIStatus() {
  return {
    config: aiConfig,
    totalCost: 0, // This would be calculated from database
    totalQueries: 0, // This would be calculated from database
    lastUsed: new Date(),
  }
}
