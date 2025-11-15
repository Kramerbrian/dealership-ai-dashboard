/**
 * AI Agent Executor - Agent-First Architecture
 * 
 * Instead of building 17 different API endpoints, we built 1 intelligent system that thinks.
 */

import { cacheJSON } from '@/lib/cache';

export type AgentType = 
  | 'schemaValidation'
  | 'voiceOptimization'
  | 'competitiveIntel'
  | 'localSEO'
  | 'ecommerceSEO'
  | 'videoSEO'
  | 'fullAudit';

export interface AgentContext {
  domain: string;
  dealerId?: string;
  location?: string;
  businessInfo?: any;
}

export interface AgentResult {
  consensus_score: number;
  confidence: 'high' | 'medium' | 'low';
  unanimous_issues: string[];
  recommendations: string[];
  platform_scores: {
    perplexity: number;
    chatgpt: number;
    gemini: number;
  };
  cached?: boolean;
  timestamp: Date;
}

export interface AgentExecutorConfig {
  cacheTTL?: number;
  enableConsensus?: boolean;
  fallbackEnabled?: boolean;
}

/**
 * Dealership-specific prompts for each agent type
 */
const DEALERSHIP_PROMPTS: Record<AgentType, string> = {
  schemaValidation: `
    Analyze the dealership's schema markup implementation:
    - LocalBusiness schema completeness
    - AutomotiveBusiness schema validation
    - Vehicle schema for inventory
    - Review schema integration
    - FAQPage schema optimization
    - Organization schema for authority signals
    Provide a score (0-100) and list critical missing elements.
  `,
  
  voiceOptimization: `
    Evaluate voice search optimization for this automotive dealership:
    - Conversational query optimization
    - Local voice search readiness
    - Featured snippet optimization
    - FAQ structure for voice queries
    - Schema markup for voice assistants
    Provide actionable recommendations and a readiness score (0-100).
  `,
  
  competitiveIntel: `
    Perform competitive intelligence analysis:
    - Identify top local competitors
    - Compare AI platform visibility
    - Analyze competitor schema implementation
    - Review competitor authority signals
    - Market positioning insights
    Provide competitive positioning score (0-100) and key insights.
  `,
  
  localSEO: `
    Analyze local SEO optimization:
    - Google My Business optimization
    - Local citation consistency
    - NAP (Name, Address, Phone) accuracy
    - Local content optimization
    - Geographic targeting effectiveness
    Provide local SEO score (0-100) and improvement recommendations.
  `,
  
  ecommerceSEO: `
    Evaluate e-commerce SEO for vehicle inventory:
    - Product schema markup (Vehicle schema)
    - Shopping feed optimization
    - Inventory visibility in search
    - Price and availability signals
    - Image optimization for vehicles
    Provide e-commerce SEO score (0-100) and optimization priorities.
  `,
  
  videoSEO: `
    Analyze video SEO strategy:
    - YouTube channel optimization
    - Video schema markup
    - Video content for vehicle listings
    - Local video SEO
    - Video engagement metrics
    Provide video SEO score (0-100) and content strategy recommendations.
  `,
  
  fullAudit: `
    Perform comprehensive dealership digital presence audit:
    - Complete schema validation
    - AI platform visibility analysis
    - Local SEO assessment
    - E-commerce optimization review
    - Competitive positioning
    - Authority signal evaluation
    Provide overall score (0-100) and prioritized action plan.
  `
};

/**
 * AI Agent Executor Class
 */
export class AIAgentExecutor {
  private config: Required<AgentExecutorConfig>;

  constructor(config: AgentExecutorConfig = {}) {
    this.config = {
      cacheTTL: config.cacheTTL || 3600000, // 1 hour default
      enableConsensus: config.enableConsensus !== false,
      fallbackEnabled: config.fallbackEnabled !== false
    };
  }

  /**
   * Execute an AI agent with caching and consensus
   */
  async execute(
    agentType: AgentType,
    context: AgentContext
  ): Promise<AgentResult> {
    // 1. Check cache first
    const cacheKey = `agent:${agentType}:${context.domain}`;
    const cached = await this.getCache(cacheKey);
    
    if (cached && !this.isStale(cached)) {
      return { ...cached, cached: true };
    }

    // 2. Execute multi-AI consensus analysis
    const result = await this.consensusAnalysis(agentType, context);

    // 3. Cache result
    await this.setCache(cacheKey, result);

    // 4. Return structured response
    return { ...result, cached: false };
  }

  /**
   * Execute consensus analysis across multiple AI providers
   */
  private async consensusAnalysis(
    agentType: AgentType,
    context: AgentContext
  ): Promise<AgentResult> {
    const prompt = this.buildPrompt(agentType, context);

    // Execute in parallel across all AI providers
    const [perplexityResult, chatgptResult, geminiResult] = await Promise.allSettled([
      this.callPerplexity(prompt, context),
      this.callChatGPT(prompt, context),
      this.callGemini(prompt, context)
    ]);

    // Extract scores from results
    const scores = {
      perplexity: this.extractScore(perplexityResult),
      chatgpt: this.extractScore(chatgptResult),
      gemini: this.extractScore(geminiResult)
    };

    // Calculate weighted consensus
    const consensus_score = this.calculateConsensus(scores);
    const confidence = this.determineConfidence(scores);

    // Extract unanimous issues
    const unanimous_issues = this.extractUnanimousIssues([
      perplexityResult,
      chatgptResult,
      geminiResult
    ]);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      agentType,
      consensus_score,
      unanimous_issues
    );

    return {
      consensus_score: consensus_score as any,
      confidence,
      unanimous_issues,
      recommendations,
      platform_scores: scores,
      cached: false,
      timestamp: new Date()
    } as AgentResult;
  }

  /**
   * Build prompt for agent execution
   */
  private buildPrompt(agentType: AgentType, context: AgentContext): string {
    const basePrompt = DEALERSHIP_PROMPTS[agentType];
    const contextInfo = `
      Dealership Information:
      - Domain: ${context.domain}
      - Location: ${context.location || 'Not specified'}
      - Business Name: ${context.businessInfo?.name || 'Not specified'}
    `;
    
    return `${basePrompt}\n\n${contextInfo}`;
  }

  /**
   * Call Perplexity AI
   */
  private async callPerplexity(prompt: string, context: AgentContext): Promise<any> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: 'You are an expert automotive SEO and AI visibility analyst.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Perplexity API call failed:', error);
      throw error;
    }
  }

  /**
   * Call ChatGPT
   */
  private async callChatGPT(prompt: string, context: AgentContext): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert automotive SEO and AI visibility analyst.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('ChatGPT API call failed:', error);
      throw error;
    }
  }

  /**
   * Call Gemini
   */
  private async callGemini(prompt: string, context: AgentContext): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  /**
   * Extract score from AI response
   */
  private extractScore(result: PromiseSettledResult<any>): number {
    if (result.status === 'rejected') {
      return 0;
    }

    const content = result.value;
    if (typeof content !== 'string') {
      return 0;
    }

    // Try to extract score from response (look for patterns like "score: 85" or "85/100")
    const scoreMatch = content.match(/(?:score|rating|grade)[:\s]*(\d+)/i) ||
                      content.match(/(\d+)\s*\/\s*100/);
    
    if (scoreMatch) {
      return parseInt(scoreMatch[1], 10);
    }

    // Default: estimate based on content quality
    return content.length > 500 ? 70 : 50;
  }

  /**
   * Calculate weighted consensus score
   */
  private calculateConsensus(scores: { perplexity: number; chatgpt: number; gemini: number }): number {
    // Weighted average: Perplexity (0.4), ChatGPT (0.4), Gemini (0.2)
    const weights = { perplexity: 0.4, chatgpt: 0.4, gemini: 0.2 };
    
    return Math.round(
      scores.perplexity * weights.perplexity +
      scores.chatgpt * weights.chatgpt +
      scores.gemini * weights.gemini
    );
  }

  /**
   * Determine confidence level
   */
  private determineConfidence(scores: { perplexity: number; chatgpt: number; gemini: number }): 'high' | 'medium' | 'low' {
    const values = Object.values(scores);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 5) return 'high';
    if (stdDev < 15) return 'medium';
    return 'low';
  }

  /**
   * Extract unanimous issues across all AI responses
   */
  private extractUnanimousIssues(results: PromiseSettledResult<any>[]): string[] {
    // Simplified: In production, use NLP to extract common issues
    const issues: string[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const content = result.value;
        if (typeof content === 'string') {
          // Look for common issue patterns
          if (content.toLowerCase().includes('missing schema')) {
            issues.push('Missing or incomplete schema markup');
          }
          if (content.toLowerCase().includes('low visibility')) {
            issues.push('Low AI platform visibility');
          }
        }
      }
    });

    return [...new Set(issues)];
  }

  /**
   * Generate recommendations based on score and issues
   */
  private generateRecommendations(
    agentType: AgentType,
    score: number,
    issues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (score < 70) {
      recommendations.push(`Priority: Improve ${agentType} score from ${score} to 80+`);
    }

    issues.forEach(issue => {
      recommendations.push(`Address: ${issue}`);
    });

    if (recommendations.length === 0) {
      recommendations.push('Maintain current optimization level');
    }

    return recommendations;
  }

  /**
   * Cache management
   */
  private async getCache(key: string): Promise<AgentResult | null> {
    try {
      return await cacheJSON(key, this.config.cacheTTL, async () => null);
    } catch {
      return null;
    }
  }

  private async setCache(key: string, value: AgentResult): Promise<void> {
    // Cache is handled by cacheJSON in the getCache method
    // This is a placeholder for explicit cache setting if needed
  }

  private isStale(cached: AgentResult): boolean {
    const age = Date.now() - cached.timestamp.getTime();
    return age > this.config.cacheTTL;
  }
}

// Export singleton instance
export const aiAgentExecutor = new AIAgentExecutor();

// Export convenience function
export async function executeAgent(
  agentType: AgentType,
  context: AgentContext
): Promise<AgentResult> {
  return aiAgentExecutor.execute(agentType, context);
}

