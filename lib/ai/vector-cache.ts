/**
 * Vector Cache for Failover Context
 * Uses Supabase pgvector for semantic search and context retrieval
 */

// OpenAIEmbeddings - optional, fallback if not installed
let OpenAIEmbeddings: any = null;
try {
  OpenAIEmbeddings = require('@langchain/openai').OpenAIEmbeddings;
} catch {
  // LangChain is optional
}
import { createClient } from '@supabase/supabase-js';

interface CachedContext {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

let supabaseClient: ReturnType<typeof createClient> | null = null;
let embeddingsClient: OpenAIEmbeddings | null = null;

/**
 * Initialize Supabase client (lazy-loaded)
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured. Vector cache disabled.');
      return null;
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

/**
 * Initialize embeddings client
 */
function getEmbeddingsClient() {
  if (!embeddingsClient) {
    embeddingsClient = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-large',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return embeddingsClient;
}

/**
 * Store context in vector cache
 */
export async function storeContext(
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const embeddings = getEmbeddingsClient();

  if (!supabase || !embeddings) {
    return null;
  }

  try {
    // Generate embedding
    const embedding = await embeddings.embedQuery(content);

    // Store in pgvector table
    const { data, error } = await supabase
      .from('ai_context_cache')
      .insert({
        content,
        embedding: JSON.stringify(embedding),
        metadata: JSON.stringify(metadata),
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error storing context:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in storeContext:', error);
    return null;
  }
}

/**
 * Retrieve cached context using semantic search
 */
export async function getCachedContext(
  query: string,
  limit = 3,
  similarityThreshold = 0.7
): Promise<CachedContext[]> {
  const supabase = getSupabaseClient();
  const embeddings = getEmbeddingsClient();

  if (!supabase || !embeddings) {
    return [];
  }

  try {
    // Generate query embedding
    const queryEmbedding = await embeddings.embedQuery(query);

    // Search using pgvector cosine similarity
    const { data, error } = await supabase.rpc('match_ai_context', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: similarityThreshold,
      match_count: limit,
    });

    if (error) {
      console.error('Error retrieving context:', error);
      return [];
    }

    // Transform results
    return (data || []).map((item: any) => ({
      id: item.id,
      content: item.content,
      embedding: JSON.parse(item.embedding),
      metadata: JSON.parse(item.metadata || '{}'),
      createdAt: new Date(item.created_at),
    }));
  } catch (error) {
    console.error('Error in getCachedContext:', error);
    return [];
  }
}

/**
 * Initialize vector cache table (run once via migration)
 */
export async function initializeVectorCache() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  // This should be run via Supabase migration, but we provide the SQL here
  const migrationSQL = `
    -- Create extension if not exists
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Create table
    CREATE TABLE IF NOT EXISTS ai_context_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      embedding vector(3072), -- text-embedding-3-large dimension
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create index for similarity search
    CREATE INDEX IF NOT EXISTS ai_context_cache_embedding_idx
      ON ai_context_cache
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);

    -- Create function for similarity search
    CREATE OR REPLACE FUNCTION match_ai_context(
      query_embedding vector(3072),
      match_threshold float,
      match_count int
    )
    RETURNS TABLE (
      id UUID,
      content TEXT,
      embedding vector(3072),
      metadata JSONB,
      created_at TIMESTAMPTZ,
      similarity float
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        ai_context_cache.id,
        ai_context_cache.content,
        ai_context_cache.embedding,
        ai_context_cache.metadata,
        ai_context_cache.created_at,
        1 - (ai_context_cache.embedding <=> query_embedding) AS similarity
      FROM ai_context_cache
      WHERE 1 - (ai_context_cache.embedding <=> query_embedding) > match_threshold
      ORDER BY ai_context_cache.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$;
  `;

  console.log('Run this SQL in Supabase SQL Editor to initialize vector cache:');
  console.log(migrationSQL);

  return true;
}

