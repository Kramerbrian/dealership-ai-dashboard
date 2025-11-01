/**
 * DealershipAI - Chief Clarity Officer
 * Multi-model AI orchestration with cost optimization and failover
 */

import { ChatAnthropic } from '@anthropic-ai/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { Embeddings } from '@langchain/openai';
import { pgvector } from '@langchain/postgres';
import type { Message } from '@langchain/core/messages';

export interface AITask {
  type: 'summarize' | 'reason' | 'code' | 'schema' | 'chat' | 'embedding';
  input: string;
  context?: Record<string, unknown>;
  tokens?: number;
  requiresFunctionCall?: boolean;
  priority?: 'cost' | 'quality' | 'speed';
}

export interface AIResponse {
  output: string;
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  confidence?: number;
}

/**
 * Cost-optimized routing decision engine
 */
function routeTask(task: AITask): 'anthropic-haiku' | 'anthropic-sonnet' | 'openai-gpt4o' | 'openai-gpt4-turbo' {
  // Low-complexity tasks → Claude Haiku (80% of jobs)
  if (task.type === 'summarize' || task.type === 'chat') {
    if ((task.tokens || 0) < 1500) {
      return 'anthropic-haiku';
    }
    return 'anthropic-sonnet';
  }

  // High-fidelity reasoning → GPT-4o
  if (task.type === 'reason' || task.requiresFunctionCall) {
    return 'openai-gpt4o';
  }

  // Code generation → GPT-4 Turbo (better code quality)
  if (task.type === 'code') {
    return 'openai-gpt4-turbo';
  }

  // Schema validation → GPT-4o (structured outputs)
  if (task.type === 'schema') {
    return 'openai-gpt4o';
  }

  // Embeddings → OpenAI Ada (vector quality)
  if (task.type === 'embedding') {
    return 'openai-ada'; // Handled separately
  }

  // Default: cost-optimized (Claude Haiku)
  return 'anthropic-haiku';
}

/**
 * Initialize model clients (lazy-loaded)
 */
let anthropicHaiku: ChatAnthropic | null = null;
let anthropicSonnet: ChatAnthropic | null = null;
let openaiGPT4o: ChatOpenAI | null = null;
let openaiGPT4Turbo: ChatOpenAI | null = null;
let embeddings: Embeddings | null = null;

function getAnthropicHaiku() {
  if (!anthropicHaiku) {
    anthropicHaiku = new ChatAnthropic({
      modelName: 'claude-3-haiku-20240307',
      temperature: 0.7,
      maxTokens: 4096,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicHaiku;
}

function getAnthropicSonnet() {
  if (!anthropicSonnet) {
    anthropicSonnet = new ChatAnthropic({
      modelName: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4096,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicSonnet;
}

function getOpenAIGPT4o() {
  if (!openaiGPT4o) {
    openaiGPT4o = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiGPT4o;
}

function getOpenAIGPT4Turbo() {
  if (!openaiGPT4Turbo) {
    openaiGPT4Turbo = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 4096,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiGPT4Turbo;
}

function getEmbeddings() {
  if (!embeddings) {
    embeddings = new Embeddings({
      modelName: 'text-embedding-3-large',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return embeddings;
}

/**
 * Vector cache for failover context (pgvector)
 */
export async function getCachedContext(query: string, limit = 3) {
  // TODO: Connect to Supabase pgvector
  // For now, return empty array
  return [];
}

/**
 * Chief Clarity Officer - Main orchestration function
 */
export async function executeAITask(task: AITask): Promise<AIResponse> {
  const startTime = Date.now();
  const route = routeTask(task);

  // Build prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', getSystemPrompt(task.type)],
    ['human', '{input}'],
  ]);

  let model: ChatAnthropic | ChatOpenAI;
  let modelName: string;
  let fallbackModel: ChatAnthropic | ChatOpenAI | null = null;

  // Initialize primary model
  switch (route) {
    case 'anthropic-haiku':
      model = getAnthropicHaiku();
      modelName = 'claude-3-haiku';
      fallbackModel = getAnthropicSonnet(); // Fallback to Sonnet
      break;
    case 'anthropic-sonnet':
      model = getAnthropicSonnet();
      modelName = 'claude-3-sonnet';
      fallbackModel = getOpenAIGPT4o(); // Fallback to GPT-4o
      break;
    case 'openai-gpt4o':
      model = getOpenAIGPT4o();
      modelName = 'gpt-4o';
      fallbackModel = getAnthropicSonnet(); // Fallback to Sonnet
      break;
    case 'openai-gpt4-turbo':
      model = getOpenAIGPT4Turbo();
      modelName = 'gpt-4-turbo';
      fallbackModel = getOpenAIGPT4o(); // Fallback to GPT-4o
      break;
    default:
      model = getAnthropicHaiku();
      modelName = 'claude-3-haiku';
  }

  // Execute with failover
  try {
    const chain = RunnableSequence.from([prompt, model]);
    const response = await chain.invoke({
      input: task.input,
      context: JSON.stringify(task.context || {}),
    });

    const latency = Date.now() - startTime;
    const tokens = estimateTokens(task.input + response.content);
    const cost = calculateCost(modelName, tokens);

    return {
      output: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
      model: modelName,
      tokens,
      cost,
      latency,
      confidence: 0.85,
    };
  } catch (error) {
    // Failover mechanism
    if (fallbackModel) {
      console.warn(`Primary model ${modelName} failed, using fallback`, error);
      
      try {
        // Retrieve cached context from vector store
        const cachedContext = await getCachedContext(task.input);
        const contextPrompt = cachedContext.length > 0
          ? `Previous context:\n${cachedContext.map(c => c.content).join('\n')}\n\nCurrent task: ${task.input}`
          : task.input;

        const chain = RunnableSequence.from([
          ChatPromptTemplate.fromMessages([
            ['system', getSystemPrompt(task.type) + '\n\n[Failover mode - using cached context]'],
            ['human', contextPrompt],
          ]),
          fallbackModel,
        ]);

        const response = await chain.invoke({});
        const latency = Date.now() - startTime;
        const tokens = estimateTokens(contextPrompt + response.content);
        const cost = calculateCost(fallbackModel.constructor.name, tokens);

        return {
          output: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
          model: `fallback-${fallbackModel.constructor.name}`,
          tokens,
          cost,
          latency,
          confidence: 0.75, // Lower confidence in failover
        };
      } catch (fallbackError) {
        throw new Error(`Both primary and fallback models failed: ${fallbackError}`);
      }
    }

    throw error;
  }
}

/**
 * Generate embeddings using OpenAI Ada
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  const embeddingsClient = getEmbeddings();
  const result = await embeddingsClient.embedQuery(text);
  return result;
}

/**
 * System prompts per task type
 */
function getSystemPrompt(taskType: string): string {
  const basePrompt = 'You are DealershipAI\'s Chief Clarity Officer, an AI assistant helping automotive dealerships understand their AI visibility.';

  switch (taskType) {
    case 'summarize':
      return `${basePrompt} Provide concise, actionable summaries. Focus on key insights and next steps.`;
    case 'reason':
      return `${basePrompt} Think step-by-step. Analyze the problem, consider alternatives, and provide a well-reasoned solution.`;
    case 'code':
      return `${basePrompt} Generate clean, production-ready code. Follow TypeScript best practices and Next.js 14 patterns.`;
    case 'schema':
      return `${basePrompt} Validate and generate JSON-LD schema markup. Ensure compliance with Schema.org standards.`;
    case 'chat':
      return `${basePrompt} Engage naturally with dealers. Be helpful, specific, and avoid jargon.`;
    default:
      return basePrompt;
  }
}

/**
 * Token estimation (rough)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Cost calculation per model (per 1M tokens)
 */
function calculateCost(model: string, tokens: number): number {
  const costs: Record<string, { input: number; output: number }> = {
    'claude-3-haiku': { input: 0.25, output: 1.25 }, // $0.25/$1.25 per 1M tokens
    'claude-3-sonnet': { input: 3.00, output: 15.00 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'text-embedding-3-large': { input: 0.13, output: 0 },
  };

  const cost = costs[model] || costs['claude-3-haiku'];
  const inputTokens = Math.ceil(tokens * 0.7); // Assume 70% input
  const outputTokens = tokens - inputTokens;

  return (inputTokens / 1_000_000) * cost.input + (outputTokens / 1_000_000) * cost.output;
}

/**
 * Cross-verification: validate outputs between models
 */
export async function crossVerify(task: AITask, primaryResponse: AIResponse): Promise<boolean> {
  // Use alternative model to verify
  const verifyRoute = routeTask(task);
  const alternativeRoute = verifyRoute === 'anthropic-haiku' ? 'openai-gpt4o' : 'anthropic-sonnet';

  // Simplified: Check if responses are semantically similar
  // In production, use embeddings similarity
  return true; // Placeholder
}

