import { createClient, SupabaseClient } from '@supabase/supabase-js';

let sbAdminInstance: SupabaseClient | null = null;

export function getSbAdmin(): SupabaseClient | null {
  // Return cached instance if available
  if (sbAdminInstance) {
    return sbAdminInstance;
  }

  // Check for environment variables
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time, env vars may not be available - return null gracefully
  if (!url || !serviceKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    }
    return null;
  }

  // Create and cache client
  try {
    sbAdminInstance = createClient(url, serviceKey, {
      auth: { persistSession: false }
    });
    return sbAdminInstance;
  } catch (error) {
    console.error('[supabase] Failed to create client:', error);
    return null;
  }
}

// Legacy export for backward compatibility
export const sbAdmin = getSbAdmin();
