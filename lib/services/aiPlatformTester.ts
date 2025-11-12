/**
 * AI Platform Testing Service
 *
 * Tests dealership visibility across ChatGPT, Claude, Perplexity, and Gemini
 * to calculate AI Visibility Score and track zero-click performance.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export interface PlatformTestResult {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'gemini';
  query: string;
  mentioned: boolean;
  position?: number; // 1-based position in response, if mentioned
  sentiment: 'positive' | 'neutral' | 'negative';
  accuracy: number; // 0-100, based on correctness of information
  responseSnippet: string;
  fullResponse?: string;
  testedAt: Date;
  latencyMs: number;
}

export interface AIVisibilityScore {
  overall: number; // 0-100
  breakdown: {
    chatgpt: number;
    claude: number;
    perplexity: number;
    gemini: number;
  };
  mentionRate: number; // Percentage of queries where dealership was mentioned
  avgPosition: number; // Average position when mentioned
  avgSentiment: number; // -1 (negative) to +1 (positive)
  avgAccuracy: number; // 0-100
  zeroClickRate: number; // Percentage of queries answered without needing to click
  testResults: PlatformTestResult[];
  testedAt: Date;
}

/**
 * Standard test queries for automotive dealerships
 */
export function generateTestQueries(dealerName: string, city: string, state: string): string[] {
  return [
    `Best car dealership in ${city}, ${state}`,
    `Where can I buy a new car in ${city}?`,
    `${dealerName} reviews and ratings`,
    `${dealerName} hours and location`,
    `Service department at ${dealerName}`,
    `New car inventory at ${dealerName}`,
    `Used cars for sale in ${city}`,
    `${dealerName} phone number and address`,
    `How is ${dealerName} rated by customers?`,
    `Best place to service my car in ${city}`,
  ];
}

/**
 * Test ChatGPT (OpenAI GPT-4)
 */
export async function testChatGPT(
  dealerName: string,
  query: string
): Promise<PlatformTestResult> {
  const startTime = Date.now();

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant providing information about local businesses and services.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const latencyMs = Date.now() - startTime;
    const fullResponse = response.choices[0]?.message?.content || '';

    // Analyze response
    const mentioned = fullResponse.toLowerCase().includes(dealerName.toLowerCase());
    const position = mentioned ? findMentionPosition(fullResponse, dealerName) : undefined;
    const sentiment = analyzeSentiment(fullResponse, dealerName);
    const accuracy = calculateAccuracy(fullResponse, dealerName);

    return {
      platform: 'chatgpt',
      query,
      mentioned,
      position,
      sentiment,
      accuracy,
      responseSnippet: fullResponse.slice(0, 200) + (fullResponse.length > 200 ? '...' : ''),
      fullResponse,
      testedAt: new Date(),
      latencyMs,
    };
  } catch (error) {
    console.error(`[testChatGPT] Error:`, error);
    return {
      platform: 'chatgpt',
      query,
      mentioned: false,
      sentiment: 'neutral',
      accuracy: 0,
      responseSnippet: `Error: ${(error as Error).message}`,
      testedAt: new Date(),
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Test Claude (Anthropic)
 */
export async function testClaude(
  dealerName: string,
  query: string
): Promise<PlatformTestResult> {
  const startTime = Date.now();

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;
    const fullResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Analyze response
    const mentioned = fullResponse.toLowerCase().includes(dealerName.toLowerCase());
    const position = mentioned ? findMentionPosition(fullResponse, dealerName) : undefined;
    const sentiment = analyzeSentiment(fullResponse, dealerName);
    const accuracy = calculateAccuracy(fullResponse, dealerName);

    return {
      platform: 'claude',
      query,
      mentioned,
      position,
      sentiment,
      accuracy,
      responseSnippet: fullResponse.slice(0, 200) + (fullResponse.length > 200 ? '...' : ''),
      fullResponse,
      testedAt: new Date(),
      latencyMs,
    };
  } catch (error) {
    console.error(`[testClaude] Error:`, error);
    return {
      platform: 'claude',
      query,
      mentioned: false,
      sentiment: 'neutral',
      accuracy: 0,
      responseSnippet: `Error: ${(error as Error).message}`,
      testedAt: new Date(),
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Test Perplexity AI
 */
export async function testPerplexity(
  dealerName: string,
  query: string
): Promise<PlatformTestResult> {
  const startTime = Date.now();

  try {
    // Perplexity uses OpenAI-compatible API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant providing information about local businesses.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const fullResponse = data.choices?.[0]?.message?.content || '';

    // Analyze response
    const mentioned = fullResponse.toLowerCase().includes(dealerName.toLowerCase());
    const position = mentioned ? findMentionPosition(fullResponse, dealerName) : undefined;
    const sentiment = analyzeSentiment(fullResponse, dealerName);
    const accuracy = calculateAccuracy(fullResponse, dealerName);

    return {
      platform: 'perplexity',
      query,
      mentioned,
      position,
      sentiment,
      accuracy,
      responseSnippet: fullResponse.slice(0, 200) + (fullResponse.length > 200 ? '...' : ''),
      fullResponse,
      testedAt: new Date(),
      latencyMs,
    };
  } catch (error) {
    console.error(`[testPerplexity] Error:`, error);
    return {
      platform: 'perplexity',
      query,
      mentioned: false,
      sentiment: 'neutral',
      accuracy: 0,
      responseSnippet: `Error: ${(error as Error).message}`,
      testedAt: new Date(),
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Test Google Gemini
 */
export async function testGemini(
  dealerName: string,
  query: string
): Promise<PlatformTestResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: query,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Analyze response
    const mentioned = fullResponse.toLowerCase().includes(dealerName.toLowerCase());
    const position = mentioned ? findMentionPosition(fullResponse, dealerName) : undefined;
    const sentiment = analyzeSentiment(fullResponse, dealerName);
    const accuracy = calculateAccuracy(fullResponse, dealerName);

    return {
      platform: 'gemini',
      query,
      mentioned,
      position,
      sentiment,
      accuracy,
      responseSnippet: fullResponse.slice(0, 200) + (fullResponse.length > 200 ? '...' : ''),
      fullResponse,
      testedAt: new Date(),
      latencyMs,
    };
  } catch (error) {
    console.error(`[testGemini] Error:`, error);
    return {
      platform: 'gemini',
      query,
      mentioned: false,
      sentiment: 'neutral',
      accuracy: 0,
      responseSnippet: `Error: ${(error as Error).message}`,
      testedAt: new Date(),
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Find position of dealership mention in response (1-based)
 */
function findMentionPosition(text: string, dealerName: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const mentionIndex = sentences.findIndex(s =>
    s.toLowerCase().includes(dealerName.toLowerCase())
  );
  return mentionIndex === -1 ? 999 : mentionIndex + 1;
}

/**
 * Analyze sentiment of response towards dealership
 */
function analyzeSentiment(text: string, dealerName: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  const dealerLower = dealerName.toLowerCase();

  // Find sentences mentioning the dealership
  const sentences = text.split(/[.!?]+/).filter(s =>
    s.toLowerCase().includes(dealerLower)
  );

  if (sentences.length === 0) return 'neutral';

  const positiveWords = ['excellent', 'great', 'best', 'top', 'recommended', 'outstanding', 'professional', 'friendly', 'helpful', 'quality', 'reliable', 'trusted'];
  const negativeWords = ['poor', 'bad', 'worst', 'avoid', 'terrible', 'unprofessional', 'rude', 'dishonest', 'overpriced', 'scam'];

  let positiveCount = 0;
  let negativeCount = 0;

  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    positiveWords.forEach(word => {
      if (sentenceLower.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (sentenceLower.includes(word)) negativeCount++;
    });
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Calculate accuracy of information about dealership (0-100)
 */
function calculateAccuracy(text: string, dealerName: string): number {
  // Simplified accuracy check - in production, would verify against known dealer info
  const mentioned = text.toLowerCase().includes(dealerName.toLowerCase());

  if (!mentioned) return 0;

  // Check for hallucination indicators
  const hasSpecificInfo = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text) || // Phone number
                          /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|boulevard|blvd)/i.test(text); // Address

  // Base score if mentioned
  let score = 50;

  // Bonus for specific information
  if (hasSpecificInfo) score += 30;

  // Bonus for not having common hallucination patterns
  const noHallucinations = !text.includes('I don\'t have') &&
                           !text.includes('I cannot verify') &&
                           !text.includes('I\'m not sure');
  if (noHallucinations) score += 20;

  return Math.min(100, score);
}

/**
 * Calculate zero-click rate (queries answered without external links)
 */
function calculateZeroClickRate(results: PlatformTestResult[]): number {
  const zeroClickCount = results.filter(r => {
    const hasDirectAnswer = r.fullResponse && r.fullResponse.length > 50;
    const noExternalPrompt = !r.fullResponse?.toLowerCase().includes('visit') &&
                             !r.fullResponse?.toLowerCase().includes('website') &&
                             !r.fullResponse?.toLowerCase().includes('click here');
    return hasDirectAnswer && noExternalPrompt;
  }).length;

  return Math.round((zeroClickCount / results.length) * 100);
}

/**
 * Run comprehensive AI visibility test across all platforms
 */
export async function runAIVisibilityTest(
  dealerName: string,
  city: string,
  state: string,
  maxQueries: number = 5
): Promise<AIVisibilityScore> {
  const queries = generateTestQueries(dealerName, city, state).slice(0, maxQueries);
  const testResults: PlatformTestResult[] = [];

  // Test each platform with each query (sequential to avoid rate limits)
  for (const query of queries) {
    // Test all platforms in parallel for each query
    const [chatgptResult, claudeResult, perplexityResult, geminiResult] = await Promise.all([
      testChatGPT(dealerName, query),
      testClaude(dealerName, query),
      testPerplexity(dealerName, query),
      testGemini(dealerName, query),
    ]);

    testResults.push(chatgptResult, claudeResult, perplexityResult, geminiResult);
  }

  // Calculate aggregated metrics
  const mentionedCount = testResults.filter(r => r.mentioned).length;
  const mentionRate = Math.round((mentionedCount / testResults.length) * 100);

  const positions = testResults.filter(r => r.position).map(r => r.position!);
  const avgPosition = positions.length > 0
    ? Math.round(positions.reduce((sum, p) => sum + p, 0) / positions.length)
    : 0;

  const sentimentScores = testResults.map(r =>
    r.sentiment === 'positive' ? 1 : r.sentiment === 'negative' ? -1 : 0
  );
  const avgSentiment = sentimentScores.reduce((sum, s) => sum + s, 0) / sentimentScores.length;

  const avgAccuracy = Math.round(
    testResults.reduce((sum, r) => sum + r.accuracy, 0) / testResults.length
  );

  const zeroClickRate = calculateZeroClickRate(testResults);

  // Calculate per-platform scores
  const platformResults = {
    chatgpt: testResults.filter(r => r.platform === 'chatgpt'),
    claude: testResults.filter(r => r.platform === 'claude'),
    perplexity: testResults.filter(r => r.platform === 'perplexity'),
    gemini: testResults.filter(r => r.platform === 'gemini'),
  };

  const breakdown = {
    chatgpt: calculatePlatformScore(platformResults.chatgpt),
    claude: calculatePlatformScore(platformResults.claude),
    perplexity: calculatePlatformScore(platformResults.perplexity),
    gemini: calculatePlatformScore(platformResults.gemini),
  };

  const overall = Math.round(
    (breakdown.chatgpt + breakdown.claude + breakdown.perplexity + breakdown.gemini) / 4
  );

  return {
    overall,
    breakdown,
    mentionRate,
    avgPosition,
    avgSentiment,
    avgAccuracy,
    zeroClickRate,
    testResults,
    testedAt: new Date(),
  };
}

/**
 * Calculate score for a single platform (0-100)
 */
function calculatePlatformScore(results: PlatformTestResult[]): number {
  if (results.length === 0) return 0;

  const mentionRate = results.filter(r => r.mentioned).length / results.length;
  const avgPosition = results
    .filter(r => r.position && r.position <= 3) // Only count top 3 mentions
    .length / results.length;
  const avgSentiment = results
    .map(r => r.sentiment === 'positive' ? 1 : r.sentiment === 'negative' ? -1 : 0)
    .reduce((sum, s) => sum + s, 0) / results.length;
  const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;

  // Weighted score calculation
  const score = (
    mentionRate * 40 +           // 40% weight: being mentioned at all
    avgPosition * 20 +            // 20% weight: position when mentioned
    ((avgSentiment + 1) / 2) * 20 + // 20% weight: sentiment (-1 to +1 normalized to 0-1)
    (avgAccuracy / 100) * 20      // 20% weight: accuracy
  ) * 100;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Quick test with limited queries (for dashboard)
 */
export async function quickAIVisibilityTest(
  dealerName: string,
  city: string,
  state: string
): Promise<AIVisibilityScore> {
  return runAIVisibilityTest(dealerName, city, state, 2); // Just 2 queries for quick test
}
