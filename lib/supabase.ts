import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lazy initialization to avoid build-time errors
let _sbAdmin: ReturnType<typeof createClient> | null = null;

export function getSbAdmin() {
  if (_sbAdmin) return _sbAdmin;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL === '' || SUPABASE_SERVICE_KEY === '') {
    // During build, return a safe mock that won't break
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      // Build-time: return a minimal mock
      _sbAdmin = {
        from: () => ({
          insert: () => Promise.resolve({ error: null, data: null }),
          select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
        }),
      } as any;
      return _sbAdmin;
    }
    
    // Runtime: warn but don't break
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY - Supabase features disabled');
    _sbAdmin = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false }
    });
    return _sbAdmin;
  }
  
  _sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
  return _sbAdmin;
}

// Backward compatibility
export const sbAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSbAdmin()[prop as keyof ReturnType<typeof createClient>];
  }
});

