/**
 * Database Connection Pooling
 * Singleton Supabase client with connection pooling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client with connection pooling
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // Server-side doesn't need session persistence
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'dealership-ai-dashboard@1.0.0',
      },
    },
  });

  return supabaseClient;
}

/**
 * Get or create Supabase admin client (bypasses RLS)
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key are required for admin client');
  }

  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'dealership-ai-dashboard-admin@1.0.0',
      },
    },
  });

  return supabaseAdminClient;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('dealerships').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      return { healthy: false, error: error.message };
    }
    
    return { healthy: true };
  } catch (error: any) {
    return { healthy: false, error: error.message };
  }
}

