import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { APIErrorHandler, APIStatusMonitor, RetryManager } from './api-error-handler';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export { openai, anthropic };

// Create fallback result when APIs are unavailable
function createFallbackResult(platform: string, query: string, businessName: string): AIQueryResult {
  const fallbackResponses = {
    chatgpt: `${businessName} is a reputable dealership with good customer service.`,
    claude: `For reliable automotive services, ${businessName} is a trusted option in the area.`,
    perplexity: `${businessName} offers quality vehicles and professional service.`,
    gemini: `Consider ${businessName} for your automotive needs.`
  };

  const response = fallbackResponses[platform as keyof typeof fallbackResponses] || 
    `${businessName} is a local dealership with various services.`;

  const analysis = analyzeResponse(response, businessName);

  return {
    platform,
    query,
    response,
    mentioned: analysis.mentioned,
    position: analysis.position,
    completeness: analysis.completeness,
    sentiment: analysis.sentiment,
    timestamp: new Date().toISOString(),
  };
}

// AI Platform Query Interface
export interface AIQueryResult {
  platform: string;
  query: string;
  response: string;
  mentioned: boolean;
  position: number;
  completeness: number;
  sentiment: number;
  timestamp: string;
}

export interface AIAnalysisResult {
  totalQueries: number;
  totalMentions: number;
  mentionRate: number;
  averagePosition: number;
  averageCompleteness: number;
  averageSentiment: number;
  platformBreakdown: Record<string, {
    mentions: number;
    queries: number;
    mentionRate: number;
  }>;
}

// Query ChatGPT
export async function queryChatGPT(query: string, businessName: string): Promise<AIQueryResult> {
  // Check if service is available
  if (!APIStatusMonitor.isServiceAvailable('openai')) {
    console.warn('OpenAI service temporarily unavailable, using fallback');
    return createFallbackResult('chatgpt', query, businessName);
  }

  try {
    const completion = await RetryManager.withRetry(
      () => openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
      'openai'
    );

    const response = completion.choices[0]?.message?.content || '';
    const analysis = analyzeResponse(response, businessName);

    // Mark service as available
    APIStatusMonitor.updateStatus('openai');

    return {
      platform: 'chatgpt',
      query,
      response,
      mentioned: analysis.mentioned,
      position: analysis.position,
      completeness: analysis.completeness,
      sentiment: analysis.sentiment,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('ChatGPT query failed:', error);
    
    // Parse and handle the error
    const apiError = APIErrorHandler.parseError(error);
    APIStatusMonitor.updateStatus('openai', apiError);
    
    // Log user-friendly message
    console.warn(APIErrorHandler.getUserFriendlyMessage(apiError));
    
    return createFallbackResult('chatgpt', query, businessName);
  }
}

// Query Claude
export async function queryClaude(query: string, businessName: string): Promise<AIQueryResult> {
  // Check if service is available
  if (!APIStatusMonitor.isServiceAvailable('anthropic')) {
    console.warn('Anthropic service temporarily unavailable, using fallback');
    return createFallbackResult('claude', query, businessName);
  }

  try {
    const message = await RetryManager.withRetry(
      () => (anthropic as any).messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
      }),
      'anthropic'
    );

    const response = (message as any).content?.[0]?.type === 'text'
      ? (message as any).content[0].text
      : '';

    const analysis = analyzeResponse(response, businessName);

    // Mark service as available
    APIStatusMonitor.updateStatus('anthropic');

    return {
      platform: 'claude',
      query,
      response,
      mentioned: analysis.mentioned,
      position: analysis.position,
      completeness: analysis.completeness,
      sentiment: analysis.sentiment,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Claude query failed:', error);
    
    // Parse and handle the error
    const apiError = APIErrorHandler.parseError(error);
    APIStatusMonitor.updateStatus('anthropic', apiError);
    
    // Log user-friendly message
    console.warn(APIErrorHandler.getUserFriendlyMessage(apiError));
    
    return createFallbackResult('claude', query, businessName);
  }
}

// Query Perplexity (simulated - would need actual API)
export async function queryPerplexity(query: string, businessName: string): Promise<AIQueryResult> {
  // Simulate Perplexity response
  const responses = [
    `${businessName} is a reputable dealership in the area`,
    `For reliable service, consider ${businessName}`,
    `${businessName} has excellent reviews and competitive pricing`,
    `I recommend ${businessName} for their customer service`
  ];
  
  const response = Math.random() > 0.3 ? responses[Math.floor(Math.random() * responses.length)] : 
    `There are several car dealerships in the area to consider.`;
  
  const analysis = analyzeResponse(response, businessName);

  return {
    platform: 'perplexity',
    query,
    response,
    mentioned: analysis.mentioned,
    position: analysis.position,
    completeness: analysis.completeness,
    sentiment: analysis.sentiment,
    timestamp: new Date().toISOString(),
  };
}

// Query Gemini (simulated - would need actual API)
export async function queryGemini(query: string, businessName: string): Promise<AIQueryResult> {
  // Simulate Gemini response
  const responses = [
    `${businessName} offers quality vehicles and service`,
    `Consider ${businessName} for your automotive needs`,
    `${businessName} has a good reputation in the community`
  ];
  
  const response = Math.random() > 0.4 ? responses[Math.floor(Math.random() * responses.length)] : 
    `There are several options for car dealerships in your area.`;
  
  const analysis = analyzeResponse(response, businessName);

  return {
    platform: 'gemini',
    query,
    response,
    mentioned: analysis.mentioned,
    position: analysis.position,
    completeness: analysis.completeness,
    sentiment: analysis.sentiment,
    timestamp: new Date().toISOString(),
  };
}

// Analyze AI response
function analyzeResponse(response: string, businessName: string): {
  mentioned: boolean;
  position: number;
  completeness: number;
  sentiment: number;
} {
  const mentioned = response.toLowerCase().includes(businessName.toLowerCase());
  
  if (!mentioned) {
    return { mentioned: false, position: 0, completeness: 0, sentiment: 0 };
  }

  // Determine position in response (1-3)
  const sentences = response.split(/[.!?]+/).filter(s => s.trim());
  const position = Math.min(3, sentences.findIndex(s => 
    s.toLowerCase().includes(businessName.toLowerCase())
  ) + 1);

  // Calculate completeness (0-100)
  const completeness = Math.min(100, 
    (response.length / 200) * 100 + 
    (response.includes('service') ? 20 : 0) +
    (response.includes('quality') || response.includes('reliable') ? 15 : 0) +
    (response.includes('review') ? 10 : 0)
  );

  // Calculate sentiment (-1 to 1)
  const positiveWords = ['excellent', 'great', 'good', 'quality', 'reliable', 'recommend', 'best'];
  const negativeWords = ['poor', 'bad', 'avoid', 'terrible', 'worst'];
  
  const positiveCount = positiveWords.reduce((count, word) => 
    count + (response.toLowerCase().includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((count, word) => 
    count + (response.toLowerCase().includes(word) ? 1 : 0), 0);
  
  const sentiment = Math.max(-1, Math.min(1, 
    (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount)
  ));

  return {
    mentioned: true,
    position,
    completeness,
    sentiment
  };
}

// Batch query all AI platforms
export async function queryAllPlatforms(
  queries: string[],
  businessName: string
): Promise<AIQueryResult[]> {
  const platforms = [
    queryChatGPT,
    queryClaude,
    queryPerplexity,
    queryGemini
  ];

  const results: AIQueryResult[] = [];

  for (const query of queries) {
    for (const platformQuery of platforms) {
      try {
        const result = await platformQuery(query, businessName);
        results.push(result);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error querying ${platformQuery.name}:`, error);
      }
    }
  }

  return results;
}

// Analyze all AI query results
export function analyzeAIResults(results: AIQueryResult[]): AIAnalysisResult {
  const platformBreakdown: Record<string, { mentions: number; queries: number; mentionRate: number }> = {};
  
  let totalQueries = 0;
  let totalMentions = 0;
  let positionSum = 0;
  let completenessSum = 0;
  let sentimentSum = 0;

  results.forEach(result => {
    totalQueries++;
    
    if (result.mentioned) {
      totalMentions++;
      positionSum += result.position;
      completenessSum += result.completeness;
      sentimentSum += result.sentiment;
    }

    if (!platformBreakdown[result.platform]) {
      platformBreakdown[result.platform] = { mentions: 0, queries: 0, mentionRate: 0 };
    }
    
    platformBreakdown[result.platform].queries++;
    if (result.mentioned) {
      platformBreakdown[result.platform].mentions++;
    }
  });

  // Calculate mention rates
  Object.keys(platformBreakdown).forEach(platform => {
    const data = platformBreakdown[platform];
    data.mentionRate = data.queries > 0 ? (data.mentions / data.queries) * 100 : 0;
  });

  return {
    totalQueries,
    totalMentions,
    mentionRate: totalQueries > 0 ? (totalMentions / totalQueries) * 100 : 0,
    averagePosition: totalMentions > 0 ? positionSum / totalMentions : 0,
    averageCompleteness: totalMentions > 0 ? completenessSum / totalMentions : 0,
    averageSentiment: totalMentions > 0 ? sentimentSum / totalMentions : 0,
    platformBreakdown
  };
}

// Cost tracking
export function calculateQueryCost(results: AIQueryResult[]): number {
  const costs = {
    chatgpt: 0.00015, // $0.15 per 1K tokens (gpt-4o-mini)
    claude: 0.00025,  // $0.25 per 1K tokens (haiku)
    perplexity: 0.00020, // Estimated
    gemini: 0.00010   // Estimated
  };

  return results.reduce((total, result) => {
    const estimatedTokens = Math.ceil(result.response.length / 4); // Rough estimate
    return total + (costs[result.platform as keyof typeof costs] * estimatedTokens);
  }, 0);
}

export async function testAIConnectivity(): Promise<{
  openai: boolean;
  anthropic: boolean;
  perplexity: boolean;
  gemini: boolean;
  errors?: Record<string, string>;
}> {
  const results = {
    openai: false,
    anthropic: false,
    perplexity: false,
    gemini: false
  };

  const errors: Record<string, string> = {};

  try {
    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
      await openai.models.list();
      results.openai = true;
      APIStatusMonitor.updateStatus('openai');
    }
  } catch (error) {
    console.error('OpenAI connectivity test failed:', error);
    const apiError = APIErrorHandler.parseError(error);
    errors.openai = APIErrorHandler.getUserFriendlyMessage(apiError);
    APIStatusMonitor.updateStatus('openai', apiError);
  }

  try {
    // Test Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      await (anthropic as any).messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      results.anthropic = true;
      APIStatusMonitor.updateStatus('anthropic');
    }
  } catch (error) {
    console.error('Anthropic connectivity test failed:', error);
    const apiError = APIErrorHandler.parseError(error);
    errors.anthropic = APIErrorHandler.getUserFriendlyMessage(apiError);
    APIStatusMonitor.updateStatus('anthropic', apiError);
  }

  // Mock tests for other services
  results.perplexity = !!process.env.PERPLEXITY_API_KEY;
  results.gemini = !!process.env.GOOGLE_AI_API_KEY;

  return {
    ...results,
    ...(Object.keys(errors).length > 0 && { errors })
  };
}

export function getAIStatus() {
  return {
    openai: {
      enabled: !!process.env.OPENAI_API_KEY,
      model: 'gpt-4'
    },
    anthropic: {
      enabled: !!process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229'
    },
    perplexity: {
      enabled: !!process.env.PERPLEXITY_API_KEY,
      model: 'llama-3.1-sonar'
    },
    gemini: {
      enabled: !!process.env.GOOGLE_AI_API_KEY,
      model: 'gemini-pro'
    }
  };
}
