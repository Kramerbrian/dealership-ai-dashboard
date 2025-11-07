/**
 * Insight Synthesizer
 * 
 * AI-powered insight generation for pulse tiles
 * Uses OpenAI function calling to generate contextual insights ≤110 chars
 */

export interface InsightContext {
  metricKey: string;
  currentValue: number;
  previousValue: number;
  change: string;
  source: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

/**
 * Generate AI insight using OpenAI (placeholder - integrate with actual API)
 */
export async function generateInsight(context: InsightContext): Promise<string> {
  // TODO: Integrate with OpenAI function calling
  // For now, use template-based generation with smart formatting

  const delta = ((context.currentValue - context.previousValue) / context.previousValue) * 100;
  const direction = delta > 0 ? 'increased' : 'decreased';
  const magnitude = Math.abs(delta).toFixed(1);

  // Template-based insights (keep ≤110 chars)
  const templates: Record<string, string[]> = {
    'AIO_CTR': [
      `AIO CTR ${direction} ${magnitude}% — schema missing on SRP page.`,
      `CTR anomaly: ${direction} ${magnitude}% — check structured data.`,
      `AIO CTR ${direction} ${magnitude}% — ${context.source} signal detected.`
    ],
    'AIV_COMPOSITE': [
      `AIV ${direction} ${magnitude}% — visibility shift detected.`,
      `AIV composite ${direction} ${magnitude}% — ${context.source} anomaly.`,
      `AIV ${direction} ${magnitude}% — check AI engine presence.`
    ],
    'default': [
      `${context.metricKey} ${direction} ${magnitude}% — ${context.source} anomaly.`,
      `${context.metricKey} shift: ${context.change} — action required.`,
      `${context.metricKey} ${direction} ${magnitude}% — investigate ${context.source}.`
    ]
  };

  const templateSet = templates[context.metricKey] || templates.default;
  const insight = templateSet[Math.floor(Math.random() * templateSet.length)];

  // Ensure ≤110 chars
  return insight.length > 110 ? insight.substring(0, 107) + '...' : insight;
}

/**
 * Generate insight with OpenAI (when API key is available)
 */
export async function generateInsightWithAI(context: InsightContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    // Fallback to template-based
    return generateInsight(context);
  }

  try {
    // TODO: Implement OpenAI function calling
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [{
    //       role: 'system',
    //       content: 'Generate a concise insight (≤110 chars) for a pulse tile based on metric changes.'
    //     }, {
    //       role: 'user',
    //       content: `Metric: ${context.metricKey}, Change: ${context.change}, Source: ${context.source}, Urgency: ${context.urgency}`
    //     }],
    //     max_tokens: 50
    //   })
    // });
    
    // Fallback for now
    return generateInsight(context);
  } catch (error) {
    console.error('AI insight generation failed:', error);
    return generateInsight(context);
  }
}

