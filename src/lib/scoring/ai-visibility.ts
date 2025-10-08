import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIVisibilityResult {
  score: number;
  chatgptScore: number;
  claudeScore: number;
  appearsInResults: boolean;
  mentionCount: number;
}

export async function analyzeAIVisibility(domain: string): Promise<number> {
  try {
    const result = await analyzeAIVisibilityDetailed(domain);
    return result.score;
  } catch (error) {
    console.error('AI Visibility analysis failed:', error);
    return 0;
  }
}

export async function analyzeAIVisibilityDetailed(
  domain: string
): Promise<AIVisibilityResult> {
  const businessName = extractBusinessName(domain);
  const location = await extractLocation(domain);
  
  // Test with multiple query types
  const queries = [
    `best car dealership in ${location}`,
    `where to buy a car in ${location}`,
    `${businessName} reviews`,
    `reliable car dealer near ${location}`,
  ];

  // Query ChatGPT
  const chatgptResults = await Promise.all(
    queries.slice(0, 2).map(q => queryChatGPT(q, businessName))
  );
  const chatgptScore = chatgptResults.filter(Boolean).length / 2 * 100;

  // Query Claude
  const claudeResults = await Promise.all(
    queries.slice(0, 2).map(q => queryClaude(q, businessName))
  );
  const claudeScore = claudeResults.filter(Boolean).length / 2 * 100;

  // Calculate overall score (weighted average)
  const score = Math.round(
    chatgptScore * 0.5 + // ChatGPT: 50% weight
    claudeScore * 0.5     // Claude: 50% weight
  );

  const appearsInResults = score > 0;
  const mentionCount = chatgptResults.filter(Boolean).length + 
                      claudeResults.filter(Boolean).length;

  return {
    score,
    chatgptScore: Math.round(chatgptScore),
    claudeScore: Math.round(claudeScore),
    appearsInResults,
    mentionCount,
  };
}

async function queryChatGPT(query: string, businessName: string): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured, returning mock result');
    // Return mock result for development
    return Math.random() > 0.5;
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper model for testing
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Check if business name appears in response
    const lowerResponse = response.toLowerCase();
    const lowerBusinessName = businessName.toLowerCase();
    
    return lowerResponse.includes(lowerBusinessName);
  } catch (error) {
    console.error('ChatGPT query failed:', error);
    return false;
  }
}

async function queryClaude(query: string, businessName: string): Promise<boolean> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured, returning mock result');
    // Return mock result for development
    return Math.random() > 0.5;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await (anthropic as any).messages.create({
      model: 'claude-3-5-haiku-20241022', // Cheaper model
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const response = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    // Check if business name appears in response
    const lowerResponse = response.toLowerCase();
    const lowerBusinessName = businessName.toLowerCase();
    
    return lowerResponse.includes(lowerBusinessName);
  } catch (error) {
    console.error('Claude query failed:', error);
    return false;
  }
}

function extractBusinessName(domain: string): string {
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
  return cleanDomain.replace(/-/g, ' ');
}

async function extractLocation(domain: string): Promise<string> {
  // Simple heuristic - in production, extract from GMB data
  return 'Naples, FL';
}
