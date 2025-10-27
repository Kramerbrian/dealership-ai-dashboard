// AI Query Transparency Engine
// Shows dealers exactly what AIs say about them

export interface AIQueryResult {
  platform: 'ChatGPT' | 'Perplexity' | 'Claude' | 'Gemini' | 'Copilot';
  query: string;
  response: string;
  mentioned: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  competitors_mentioned: string[];
  timestamp: Date;
  confidence: number; // 0-1
  excerpt: string; // Key excerpt from response
}

export interface AIQueryAnalysis {
  id: string;
  query: string;
  platforms: AIQueryResult[];
  overall_mentioned: boolean;
  mention_rate: number; // % of platforms that mentioned
  sentiment_score: number; // -1 to 1
  competitor_analysis: {
    most_mentioned: string[];
    competitive_landscape: string[];
  };
  actionable_insights: string[];
}

export class AITransparencyEngine {
  private openaiApiKey: string;
  private anthropicApiKey: string;
  private perplexityApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY!;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY!;
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY!;
  }

  async queryAllPlatforms(dealerName: string, location: string): Promise<AIQueryAnalysis[]> {
    const queries = [
      `Best ${location} car dealerships`,
      `Where to buy a car in ${location}`,
      `Most trusted dealership near ${location}`,
      `${dealerName} reviews and reputation`,
      `Top rated car dealers in ${location}`,
      `Best customer service at ${location} dealerships`,
      `Most reliable car dealership in ${location}`,
      `Where to get the best car deals in ${location}`
    ];

    const results = await Promise.all(
      queries.map(query => 
        this.analyzeQuery(query, dealerName, location)
      )
    );

    return results;
  }

  private async analyzeQuery(query: string, dealerName: string, location: string): Promise<AIQueryAnalysis> {
    const platforms = await Promise.all([
      this.queryChatGPT(query),
      this.queryPerplexity(query),
      this.queryClaude(query),
      this.queryGemini(query),
      this.queryCopilot(query)
    ]);

    const mentioned = platforms.filter(p => p.mentioned).length;
    const mentionRate = mentioned / platforms.length;
    const sentimentScore = this.calculateSentimentScore(platforms);
    const competitors = this.extractCompetitors(platforms);

    return {
      id: this.generateId(),
      query,
      platforms,
      overall_mentioned: mentionRate > 0.5,
      mention_rate: mentionRate,
      sentiment_score: sentimentScore,
      competitor_analysis: {
        most_mentioned: this.getMostMentioned(competitors),
        competitive_landscape: competitors
      },
      actionable_insights: this.generateInsights(platforms, dealerName, mentionRate)
    };
  }

  private async queryChatGPT(query: string): Promise<AIQueryResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const responseText = data.choices[0].message.content;

      return {
        platform: 'ChatGPT',
        query,
        response: responseText,
        mentioned: false, // Will be calculated
        sentiment: 'neutral', // Will be calculated
        competitors_mentioned: [], // Will be calculated
        timestamp: new Date(),
        confidence: 0.9,
        excerpt: this.extractExcerpt(responseText, 150)
      };
    } catch (error) {
      console.error('ChatGPT query failed:', error);
      return this.createErrorResult('ChatGPT', query);
    }
  }

  private async queryPerplexity(query: string): Promise<AIQueryResult> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 500
        })
      });

      const data = await response.json();
      const responseText = data.choices[0].message.content;

      return {
        platform: 'Perplexity',
        query,
        response: responseText,
        mentioned: false,
        sentiment: 'neutral',
        competitors_mentioned: [],
        timestamp: new Date(),
        confidence: 0.95, // Perplexity has real-time data
        excerpt: this.extractExcerpt(responseText, 150)
      };
    } catch (error) {
      console.error('Perplexity query failed:', error);
      return this.createErrorResult('Perplexity', query);
    }
  }

  private async queryClaude(query: string): Promise<AIQueryResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      const data = await response.json();
      const responseText = data.content[0].text;

      return {
        platform: 'Claude',
        query,
        response: responseText,
        mentioned: false,
        sentiment: 'neutral',
        competitors_mentioned: [],
        timestamp: new Date(),
        confidence: 0.9,
        excerpt: this.extractExcerpt(responseText, 150)
      };
    } catch (error) {
      console.error('Claude query failed:', error);
      return this.createErrorResult('Claude', query);
    }
  }

  private async queryGemini(query: string): Promise<AIQueryResult> {
    try {
      // Gemini API implementation
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: query
            }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        })
      });

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;

      return {
        platform: 'Gemini',
        query,
        response: responseText,
        mentioned: false,
        sentiment: 'neutral',
        competitors_mentioned: [],
        timestamp: new Date(),
        confidence: 0.85,
        excerpt: this.extractExcerpt(responseText, 150)
      };
    } catch (error) {
      console.error('Gemini query failed:', error);
      return this.createErrorResult('Gemini', query);
    }
  }

  private async queryCopilot(query: string): Promise<AIQueryResult> {
    try {
      // Microsoft Copilot API (simulated)
      // In reality, this would require Microsoft Graph API or similar
      const response = await this.simulateCopilotResponse(query);

      return {
        platform: 'Copilot',
        query,
        response: response,
        mentioned: false,
        sentiment: 'neutral',
        competitors_mentioned: [],
        timestamp: new Date(),
        confidence: 0.8,
        excerpt: this.extractExcerpt(response, 150)
      };
    } catch (error) {
      console.error('Copilot query failed:', error);
      return this.createErrorResult('Copilot', query);
    }
  }

  private async simulateCopilotResponse(query: string): Promise<string> {
    // Simulate Copilot response for demo purposes
    const responses = [
      "Based on recent reviews and ratings, here are the top car dealerships in the area...",
      "For the best car buying experience, I recommend checking out these highly-rated dealerships...",
      "Customer reviews suggest these dealerships offer excellent service and competitive pricing...",
      "When looking for a reliable car dealership, consider these top-rated options..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private analyzeMention(text: string, dealerName: string): boolean {
    const nameVariations = this.generateNameVariations(dealerName);
    return nameVariations.some(variation => 
      text.toLowerCase().includes(variation.toLowerCase())
    );
  }

  private analyzeSentiment(text: string, dealerName: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['excellent', 'great', 'best', 'outstanding', 'recommend', 'trusted', 'reliable'];
    const negativeWords = ['poor', 'bad', 'terrible', 'avoid', 'worst', 'unreliable', 'disappointing'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractCompetitors(text: string): string[] {
    // Extract competitor names using NLP
    const competitorPatterns = [
      /(?:dealership|dealer|auto|car|motors|honda|toyota|ford|chevrolet|bmw|mercedes|audi|nissan|hyundai|kia|mazda|subaru|volkswagen|acura|lexus|infiniti|cadillac|lincoln|buick|gmc|chrysler|dodge|jeep|ram)/gi
    ];
    
    const competitors: string[] = [];
    competitorPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        competitors.push(...matches.map(m => m.trim()));
      }
    });
    
    return [...new Set(competitors)]; // Remove duplicates
  }

  private calculateSentimentScore(platforms: AIQueryResult[]): number {
    const sentiments = platforms.map(p => {
      switch (p.sentiment) {
        case 'positive': return 1;
        case 'negative': return -1;
        default: return 0;
      }
    });
    
    return sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
  }

  private getMostMentioned(competitors: string[]): string[] {
    const counts = competitors.reduce((acc, competitor) => {
      acc[competitor] = (acc[competitor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);
  }

  private generateInsights(platforms: AIQueryResult[], dealerName: string, mentionRate: number): string[] {
    const insights: string[] = [];
    
    if (mentionRate === 0) {
      insights.push(`Not mentioned in any AI responses. Consider improving your online presence.`);
    } else if (mentionRate < 0.5) {
      insights.push(`Only mentioned in ${Math.round(mentionRate * 100)}% of AI responses. Room for improvement.`);
    } else {
      insights.push(`Well represented in AI responses (${Math.round(mentionRate * 100)}% mention rate).`);
    }
    
    const positiveSentiment = platforms.filter(p => p.sentiment === 'positive').length;
    if (positiveSentiment > 0) {
      insights.push(`Positive sentiment detected in ${positiveSentiment} platforms.`);
    }
    
    const competitors = platforms.flatMap(p => p.competitors_mentioned);
    if (competitors.length > 0) {
      insights.push(`Competitors mentioned: ${competitors.slice(0, 3).join(', ')}`);
    }
    
    return insights;
  }

  private generateNameVariations(name: string): string[] {
    // Generate variations of the dealership name
    const variations = [name];
    
    // Remove common suffixes
    const withoutSuffix = name.replace(/\s+(dealership|auto|motors|cars|honda|toyota|ford|chevrolet|bmw|mercedes|audi|nissan|hyundai|kia|mazda|subaru|volkswagen|acura|lexus|infiniti|cadillac|lincoln|buick|gmc|chrysler|dodge|jeep|ram)$/i, '');
    if (withoutSuffix !== name) {
      variations.push(withoutSuffix);
    }
    
    // Add common suffixes
    variations.push(`${name} dealership`);
    variations.push(`${name} auto`);
    
    return variations;
  }

  private extractExcerpt(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private createErrorResult(platform: string, query: string): AIQueryResult {
    return {
      platform: platform as any,
      query,
      response: 'Error: Unable to query this platform',
      mentioned: false,
      sentiment: 'neutral',
      competitors_mentioned: [],
      timestamp: new Date(),
      confidence: 0,
      excerpt: 'Error occurred'
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
