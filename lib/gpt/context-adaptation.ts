/**
 * Context Adaptation System
 * 
 * Dynamically adapts GPT prompts based on retrieval context, user history, and error patterns
 */

import { ChatRequest } from '@/app/api/gpt/chat/route';

export interface RetrievalContext {
  marketData?: string[];
  vehicleHistory?: string[];
  userPreferences?: Record<string, any>;
  errorPatterns?: string[];
}

export interface ContextAdaptationConfig {
  basePrompt: string;
  retrievalContext?: RetrievalContext;
  userHistory?: Array<{ query: string; response: string; feedback?: string }>;
  errorClusters?: Array<{ pattern: string; weight: number }>;
}

/**
 * Build adapted system prompt with context
 */
export function buildAdaptedPrompt(config: ContextAdaptationConfig): string {
  let prompt = config.basePrompt;

  // Add retrieval context
  if (config.retrievalContext?.marketData && config.retrievalContext.marketData.length > 0) {
    prompt += `\n\nRecent market data:\n${config.retrievalContext.marketData.join('\n')}`;
  }

  if (config.retrievalContext?.vehicleHistory && config.retrievalContext.vehicleHistory.length > 0) {
    prompt += `\n\nUser's vehicle history:\n${config.retrievalContext.vehicleHistory.join('\n')}`;
  }

  if (config.retrievalContext?.userPreferences) {
    prompt += `\n\nUser preferences: ${JSON.stringify(config.retrievalContext.userPreferences)}`;
  }

  // Add error pattern corrections
  if (config.errorClusters && config.errorClusters.length > 0) {
    prompt += `\n\nImportant corrections based on feedback:\n`;
    config.errorClusters.forEach(cluster => {
      prompt += `- ${cluster.pattern} (weight: ${cluster.weight})\n`;
    });
  }

  // Add user history context (last 3 interactions)
  if (config.userHistory && config.userHistory.length > 0) {
    const recentHistory = config.userHistory.slice(-3);
    prompt += `\n\nRecent conversation context:\n`;
    recentHistory.forEach((h, i) => {
      prompt += `${i + 1}. User: ${h.query}\n   Assistant: ${h.response}\n`;
      if (h.feedback) {
        prompt += `   Feedback: ${h.feedback}\n`;
      }
    });
  }

  return prompt;
}

/**
 * Analyze error patterns from feedback logs
 */
export async function analyzeErrorPatterns(
  logs: Array<{ userQuery: string; botResponse: string; userFeedback?: string; outcome?: string }>
): Promise<Array<{ pattern: string; weight: number }>> {
  // In production, use ML/NLP to identify error patterns
  // For now, return common patterns

  const errorLogs = logs.filter(log => 
    log.userFeedback === 'bad' || log.outcome === 'error'
  );

  const patterns: Record<string, number> = {};

  errorLogs.forEach(log => {
    // Simple pattern detection (in production, use more sophisticated NLP)
    if (log.botResponse.toLowerCase().includes('sorry') || log.botResponse.toLowerCase().includes('error')) {
      patterns['apologetic_responses'] = (patterns['apologetic_responses'] || 0) + 1;
    }
    if (log.userQuery.toLowerCase().includes('price') && !log.botResponse.toLowerCase().includes('$')) {
      patterns['missing_price_information'] = (patterns['missing_price_information'] || 0) + 1;
    }
    if (log.userQuery.toLowerCase().includes('schedule') && !log.botResponse.toLowerCase().includes('date')) {
      patterns['incomplete_scheduling'] = (patterns['incomplete_scheduling'] || 0) + 1;
    }
  });

  return Object.entries(patterns)
    .map(([pattern, count]) => ({
      pattern,
      weight: count / errorLogs.length
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5); // Top 5 patterns
}

/**
 * Get retrieval context for user query
 */
export async function getRetrievalContext(
  userQuery: string,
  userId?: string
): Promise<RetrievalContext> {
  // In production, query:
  // - Market data from recent appraisals
  // - User's vehicle history from database
  // - User preferences from profile
  // - Similar queries and their outcomes

  return {
    marketData: [
      `Recent market prices for similar vehicles range from $23,400 - $25,900.`,
      `Inventory levels are normal for this segment.`
    ],
    vehicleHistory: userId ? [
      `User previously inquired about 2020 Toyota Camry.`
    ] : undefined,
    userPreferences: {
      preferredPriceRange: '$20,000 - $30,000',
      preferredBodyType: 'sedan'
    }
  };
}

