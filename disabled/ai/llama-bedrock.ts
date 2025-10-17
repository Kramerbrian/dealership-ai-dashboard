/**
 * Llama 3.1 Integration via AWS Bedrock
 * Provides RAG capabilities for DealershipAI community intelligence
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { createClient } from '@supabase/supabase-js';

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RAGQuery {
  query: string;
  dealershipId: string;
  context?: string;
  maxResults?: number;
}

interface RAGResult {
  answer: string;
  sources: Array<{
    id: string;
    content: string;
    score: number;
    metadata: any;
  }>;
  confidence: number;
  model: string;
}

interface CommunityInsight {
  type: 'sentiment' | 'trend' | 'recommendation' | 'concern';
  title: string;
  description: string;
  confidence: number;
  sources: string[];
  actionable: boolean;
}

/**
 * Generate text using Llama 3.1 via Bedrock
 */
export async function generateWithLlama(
  prompt: string,
  model: string = 'meta.llama-3-1-8b-instruct-v1:0',
  maxTokens: number = 2048,
  temperature: number = 0.7
): Promise<string> {
  try {
    const input = {
      modelId: model,
      body: JSON.stringify({
        prompt: prompt,
        max_gen_len: maxTokens,
        temperature: temperature,
        top_p: 0.9,
      }),
      contentType: 'application/json',
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.generation || '';
  } catch (error) {
    console.error('Error generating with Llama:', error);
    throw error;
  }
}

/**
 * Perform RAG query over community content
 */
export async function performRAGQuery(query: RAGQuery): Promise<RAGResult> {
  try {
    // 1. Retrieve relevant content from vector database
    const relevantContent = await retrieveRelevantContent(query);
    
    // 2. Build context for Llama
    const context = buildContext(relevantContent);
    
    // 3. Generate answer using Llama
    const prompt = buildRAGPrompt(query.query, context);
    const answer = await generateWithLlama(prompt);
    
    // 4. Calculate confidence based on source relevance
    const confidence = calculateConfidence(relevantContent);
    
    return {
      answer,
      sources: relevantContent.map(item => ({
        id: item.id,
        content: item.content_text,
        score: item.similarity_score,
        metadata: {
          author: item.author,
          timestamp: item.created_at,
          type: item.content_type,
        },
      })),
      confidence,
      model: 'meta.llama-3-1-8b-instruct-v1:0',
    };
  } catch (error) {
    console.error('Error performing RAG query:', error);
    throw error;
  }
}

/**
 * Retrieve relevant content using vector similarity search
 */
async function retrieveRelevantContent(query: RAGQuery): Promise<any[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query.query);
    
    // Search for similar content in the database
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: query.maxResults || 5,
      filter: { dealership_id: query.dealershipId },
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error retrieving relevant content:', error);
    return [];
  }
}

/**
 * Generate embedding for text (using OpenAI or similar)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Build context from retrieved content
 */
function buildContext(content: any[]): string {
  return content
    .map((item, index) => {
      return `Source ${index + 1} (${item.content_type} by ${item.author}):
${item.content_text}

Relevance Score: ${item.similarity_score}
Timestamp: ${item.created_at}
---`;
    })
    .join('\n\n');
}

/**
 * Build RAG prompt for Llama
 */
function buildRAGPrompt(query: string, context: string): string {
  return `You are DealershipAI, an expert automotive community intelligence assistant. 
Your role is to analyze community feedback and provide actionable insights for car dealerships.

CONTEXT (Community Feedback):
${context}

QUESTION: ${query}

INSTRUCTIONS:
1. Analyze the provided community feedback to answer the question
2. Focus on actionable insights that can help improve dealership operations
3. Cite specific sources when making claims
4. Be concise but comprehensive
5. If the context doesn't contain enough information, say so clearly

ANSWER:`;
}

/**
 * Calculate confidence score based on source relevance
 */
function calculateConfidence(sources: any[]): number {
  if (sources.length === 0) return 0;
  
  const avgRelevance = sources.reduce((sum, s) => sum + s.similarity_score, 0) / sources.length;
  const sourceCount = Math.min(sources.length / 5, 1); // More sources = higher confidence
  
  return Math.round((avgRelevance * 0.7 + sourceCount * 0.3) * 100);
}

/**
 * Generate community insights using Llama
 */
export async function generateCommunityInsights(dealershipId: string): Promise<CommunityInsight[]> {
  try {
    // Get recent community content
    const { data: content, error } = await supabase
      .from('ugc_content')
      .select('*')
      .eq('dealership_id', dealershipId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    if (!content || content.length === 0) {
      return [];
    }
    
    // Build context for analysis
    const context = content
      .map(item => `${item.content_type} by ${item.author}: ${item.content_text}`)
      .join('\n\n');
    
    // Generate insights using Llama
    const prompt = `Analyze the following community feedback for a car dealership and identify key insights:

${context}

Please identify:
1. Overall sentiment trends
2. Common concerns or complaints
3. Positive feedback patterns
4. Actionable recommendations
5. Emerging topics or trends

Format your response as JSON with this structure:
[
  {
    "type": "sentiment|trend|recommendation|concern",
    "title": "Brief title",
    "description": "Detailed description",
    "confidence": 0.85,
    "sources": ["source1", "source2"],
    "actionable": true
  }
]`;

    const response = await generateWithLlama(prompt, 'meta.llama-3-1-8b-instruct-v1:0', 2048, 0.3);
    
    try {
      const insights = JSON.parse(response);
      return insights;
    } catch (parseError) {
      console.error('Error parsing insights JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating community insights:', error);
    return [];
  }
}

/**
 * Answer inventory questions using RAG
 */
export async function answerInventoryQuestion(
  question: string,
  dealershipId: string,
  inventoryData: any[]
): Promise<RAGResult> {
  try {
    // Combine community insights with inventory data
    const communityContext = await retrieveRelevantContent({
      query: question,
      dealershipId,
      maxResults: 3,
    });
    
    const inventoryContext = inventoryData
      .map(item => `${item.make} ${item.model} ${item.year} - $${item.price} - ${item.mileage} miles`)
      .join('\n');
    
    const combinedContext = `
COMMUNITY FEEDBACK:
${communityContext.map(c => c.content_text).join('\n\n')}

CURRENT INVENTORY:
${inventoryContext}
`;
    
    const prompt = `You are DealershipAI, helping a customer with inventory questions.

CONTEXT:
${combinedContext}

CUSTOMER QUESTION: ${question}

INSTRUCTIONS:
1. Use both community feedback and current inventory to answer
2. Recommend specific vehicles when appropriate
3. Address any concerns mentioned in community feedback
4. Be helpful and informative

ANSWER:`;
    
    const answer = await generateWithLlama(prompt);
    
    return {
      answer,
      sources: communityContext.map(item => ({
        id: item.id,
        content: item.content_text,
        score: item.similarity_score,
        metadata: {
          author: item.author,
          timestamp: item.created_at,
          type: item.content_type,
        },
      })),
      confidence: 0.8,
      model: 'meta.llama-3-1-8b-instruct-v1:0',
    };
  } catch (error) {
    console.error('Error answering inventory question:', error);
    throw error;
  }
}

/**
 * Moderate content using Llama
 */
export async function moderateContent(content: string): Promise<{
  isAppropriate: boolean;
  confidence: number;
  reasons: string[];
}> {
  try {
    const prompt = `Analyze the following content for appropriateness in a professional automotive dealership context:

CONTENT: "${content}"

Check for:
1. Profanity or offensive language
2. Spam or promotional content
3. Personal information (PII)
4. Inappropriate topics
5. Misleading information

Respond with JSON:
{
  "isAppropriate": true/false,
  "confidence": 0.95,
  "reasons": ["reason1", "reason2"]
}`;

    const response = await generateWithLlama(prompt, 'meta.llama-3-1-8b-instruct-v1:0', 512, 0.1);
    
    try {
      const moderation = JSON.parse(response);
      return moderation;
    } catch (parseError) {
      console.error('Error parsing moderation JSON:', parseError);
      return {
        isAppropriate: true,
        confidence: 0.5,
        reasons: ['Unable to parse moderation result'],
      };
    }
  } catch (error) {
    console.error('Error moderating content:', error);
    return {
      isAppropriate: true,
      confidence: 0.5,
      reasons: ['Moderation service unavailable'],
    };
  }
}
