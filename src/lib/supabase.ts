import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for development
const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
    eq: () => ({ data: [], error: null }),
    single: () => ({ data: null, error: null }),
  }),
  auth: {
    getUser: () => ({ data: { user: null }, error: null }),
    signIn: () => ({ data: { user: null }, error: null }),
    signOut: () => ({ error: null }),
  },
});

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase environment variables not set, using mock client');
    return createMockClient() as any;
  }
  
  return createBrowserClient(url, key);
};

export const supabaseServer = (cookies: any) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase environment variables not set, using mock client');
    return createMockClient() as any;
  }
  
  return createServerClient(url, key, { cookies });
};

// Create admin client with fallback
let supabaseAdmin: any = null;
try {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (url && key) {
    supabaseAdmin = createClient(url, key);
  } else {
    console.warn('Supabase admin environment variables not set, using mock client');
    supabaseAdmin = createMockClient();
  }
} catch (error) {
  console.warn('Supabase admin client creation failed:', error);
  supabaseAdmin = createMockClient();
}

export { supabaseAdmin };