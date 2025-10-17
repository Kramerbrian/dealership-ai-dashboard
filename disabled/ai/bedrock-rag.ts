/**
 * Amazon Bedrock RAG Integration for DealershipAI
 * Processes social media posts and provides AI-powered insights
 */

import { z } from 'zod';

// Types for social media events
export interface SocialMediaEvent {
  source: 'facebook' | 'instagram' | 'twitter' | 'google_reviews' | 'yelp';
  pageId: string;
  postId: string;
  time: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: 'pricing' | 'service' | 'sales' | 'general';
}

export interface Chunk {
  id: string;
  idx: number;
  text: string;
  vec: number[];
  source: string;
  postId: string;
  timestamp: string;
}

export interface RAGResponse {
  answer: string;
  sources: Chunk[];
  confidence: number;
  recommendations: string[];
}

export interface BedrockConfig {
  region: string;
  llmModelId: string;
  embedModelId: string;
  accessKeyId: string;
  secretAccessKey: string;
}

// Validation schemas
const SocialMediaEventSchema = z.object({
  source: z.enum(['facebook', 'instagram', 'twitter', 'google_reviews', 'yelp']),
  pageId: z.string(),
  postId: z.string(),
  time: z.string(),
  message: z.string(),
  from: z.object({
    id: z.string(),
    name: z.string(),
  }),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  category: z.enum(['pricing', 'service', 'sales', 'general']).optional(),
});

export class DealershipAIRAG {
  private config: BedrockConfig;
  private chunks: Chunk[] = [];
  private rawEvents: Map<string, SocialMediaEvent> = new Map();

  constructor(config: BedrockConfig) {
    this.config = config;
  }

  /**
   * Process and embed social media events
   */
  async ingestEvents(events: SocialMediaEvent[]): Promise<void> {
    console.log(`Processing ${events.length} social media events...`);

    // Validate and deduplicate events
    const validEvents = events
      .map(event => {
        try {
          return SocialMediaEventSchema.parse(event);
        } catch (error) {
          console.warn('Invalid event:', error);
          return null;
        }
      })
      .filter((event): event is SocialMediaEvent => event !== null);

    // Deduplicate by content hash
    const uniqueEvents = new Map<string, SocialMediaEvent>();
    for (const event of validEvents) {
      const hash = this.generateHash(event);
      if (!uniqueEvents.has(hash)) {
        uniqueEvents.set(hash, event);
        this.rawEvents.set(hash, event);
      }
    }

    // Chunk and embed messages
    const newChunks: Chunk[] = [];
    for (const [hash, event] of uniqueEvents) {
      const chunks = this.chunkText(event.message);
      for (let i = 0; i < chunks.length; i++) {
        newChunks.push({
          id: hash,
          idx: i,
          text: chunks[i],
          vec: [], // Will be filled after embedding
          source: event.source,
          postId: event.postId,
          timestamp: event.time,
        });
      }
    }

    // Embed all chunks
    if (newChunks.length > 0) {
      const texts = newChunks.map(chunk => chunk.text);
      const embeddings = await this.embedTexts(texts);
      
      for (let i = 0; i < newChunks.length; i++) {
        newChunks[i].vec = embeddings[i];
      }

      this.chunks.push(...newChunks);
    }

    console.log(`Ingested ${uniqueEvents.size} unique events, ${newChunks.length} chunks embedded`);
  }

  /**
   * Query the RAG system for insights
   */
  async query(question: string, k: number = 4): Promise<RAGResponse> {
    if (this.chunks.length === 0) {
      return {
        answer: "No data available. Please ingest some social media events first.",
        sources: [],
        confidence: 0,
        recommendations: [],
      };
    }

    // Get query embedding
    const queryEmbedding = await this.embedTexts([question]);
    const queryVec = queryEmbedding[0];

    // Find most similar chunks
    const scoredChunks = this.chunks.map(chunk => ({
      chunk,
      score: this.cosineSimilarity(queryVec, chunk.vec),
    }));

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, k).map(item => item.chunk);

    // Generate answer using LLM
    const context = topChunks
      .map(chunk => `- ${chunk.text} (${chunk.source}, ${new Date(chunk.timestamp).toLocaleDateString()})`)
      .join('\n');

    const systemPrompt = `You are a dealership AI assistant analyzing customer feedback and social media posts. 
    Provide actionable insights for dealership management. Be concise and specific.`;

    const userPrompt = `
Context snippets from customers/community:
${context}

Question: ${question}

Instructions:
- Provide 3-6 bullet points with specific insights
- Include actionable recommendations
- End with a "What to do next" step
- If pricing or policy is uncertain, state what information is needed
`;

    const answer = await this.generateAnswer(systemPrompt, userPrompt);
    
    // Generate recommendations based on the context
    const recommendations = this.generateRecommendations(topChunks, question);

    return {
      answer,
      sources: topChunks,
      confidence: scoredChunks[0]?.score || 0,
      recommendations,
    };
  }

  /**
   * Get insights for common dealership questions
   */
  async getCommonInsights(): Promise<{
    pricingQuestions: RAGResponse;
    serviceIssues: RAGResponse;
    salesConcerns: RAGResponse;
  }> {
    const pricingQuestions = await this.query(
      "What are customers asking about pricing and how can we improve transparency?"
    );

    const serviceIssues = await this.query(
      "What service-related issues or complaints are customers mentioning?"
    );

    const salesConcerns = await this.query(
      "What concerns do customers have about the sales process or trade-ins?"
    );

    return {
      pricingQuestions,
      serviceIssues,
      salesConcerns,
    };
  }

  /**
   * Get sentiment analysis summary
   */
  async getSentimentSummary(): Promise<{
    positive: number;
    negative: number;
    neutral: number;
    trends: string[];
  }> {
    const events = Array.from(this.rawEvents.values());
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    for (const event of events) {
      if (event.sentiment) {
        sentimentCounts[event.sentiment]++;
      }
    }

    // Generate trend insights
    const trends = await this.query(
      "What are the main positive and negative trends in customer feedback?"
    );

    return {
      ...sentimentCounts,
      trends: trends.recommendations,
    };
  }

  // Private helper methods
  private generateHash(event: SocialMediaEvent): string {
    const content = `${event.source}|${event.postId}|${event.message}`;
    return this.sha256(content);
  }

  private sha256(str: string): string {
    // Simple hash function - in production, use crypto.subtle.digest
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private chunkText(text: string, maxChars: number = 900, overlap: number = 90): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk = '';
    let i = 0;

    while (i < words.length) {
      const word = words[i];
      if (currentChunk.length + word.length + 1 <= maxChars) {
        currentChunk += (currentChunk ? ' ' : '') + word;
        i++;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          // Start new chunk with overlap
          const overlapWords = currentChunk.split(/\s+/).slice(-Math.floor(overlap / 10));
          currentChunk = overlapWords.join(' ');
        } else {
          // Single word is too long, force it
          chunks.push(word);
          i++;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
  }

  private async embedTexts(texts: string[]): Promise<number[][]> {
    // In a real implementation, this would call Amazon Bedrock
    // For now, return mock embeddings
    return texts.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
  }

  private async generateAnswer(systemPrompt: string, userPrompt: string): Promise<string> {
    // In a real implementation, this would call Amazon Bedrock LLM
    // For now, return a mock response
    return `Based on the customer feedback analysis:

• Customers frequently ask about oil change pricing and service costs
• Trade-in appraisals are a common concern, with questions about accuracy
• Service communication could be improved - customers want better updates
• Pricing transparency is a key area for improvement

What to do next: Create a comprehensive pricing guide and implement better service communication protocols.`;
  }

  private generateRecommendations(chunks: Chunk[], question: string): string[] {
    const recommendations: string[] = [];
    
    // Analyze chunks for common themes
    const sources = new Set(chunks.map(c => c.source));
    const categories = new Set(chunks.map(c => c.text.toLowerCase()));

    if (categories.has('pricing') || question.includes('price')) {
      recommendations.push('Create transparent pricing guides for common services');
    }

    if (categories.has('service') || question.includes('service')) {
      recommendations.push('Implement better service communication protocols');
    }

    if (categories.has('trade') || question.includes('trade')) {
      recommendations.push('Develop clear trade-in appraisal process documentation');
    }

    if (sources.size > 1) {
      recommendations.push('Monitor multiple social media platforms consistently');
    }

    return recommendations;
  }

  /**
   * Get statistics about ingested data
   */
  getStats(): {
    totalEvents: number;
    totalChunks: number;
    sources: Record<string, number>;
    dateRange: { start: string; end: string };
  } {
    const events = Array.from(this.rawEvents.values());
    const sources: Record<string, number> = {};
    
    let startDate = new Date();
    let endDate = new Date(0);

    for (const event of events) {
      sources[event.source] = (sources[event.source] || 0) + 1;
      const eventDate = new Date(event.time);
      if (eventDate < startDate) startDate = eventDate;
      if (eventDate > endDate) endDate = eventDate;
    }

    return {
      totalEvents: events.length,
      totalChunks: this.chunks.length,
      sources,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };
  }
}

// Export singleton instance
export const dealershipAIRAG = new DealershipAIRAG({
  region: process.env.AWS_REGION || 'us-east-1',
  llmModelId: process.env.BEDROCK_LLM_MODEL_ID || 'meta.llama3-8b-instruct-v1:0',
  embedModelId: process.env.BEDROCK_EMBED_MODEL_ID || 'amazon.titan-embed-text-v2:0',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
});
