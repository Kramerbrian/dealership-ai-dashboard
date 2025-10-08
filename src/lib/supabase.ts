import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          type: 'enterprise' | 'dealership' | 'single';
          parent_id: string | null;
          domain: string | null;
          city: string | null;
          state: string | null;
          established_date: string | null;
          tier: number | null;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'enterprise' | 'dealership' | 'single';
          parent_id?: string | null;
          domain?: string | null;
          city?: string | null;
          state?: string | null;
          established_date?: string | null;
          tier?: number | null;
          settings?: Record<string, any>;
        };
        Update: {
          name?: string;
          type?: 'enterprise' | 'dealership' | 'single';
          parent_id?: string | null;
          domain?: string | null;
          city?: string | null;
          state?: string | null;
          established_date?: string | null;
          tier?: number | null;
          settings?: Record<string, any>;
        };
      };
      users: {
        Row: {
          id: string;
          clerk_id: string;
          tenant_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';
          permissions: Record<string, any>;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          tenant_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role: 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';
          permissions?: Record<string, any>;
          last_login?: string | null;
        };
        Update: {
          clerk_id?: string;
          tenant_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';
          permissions?: Record<string, any>;
          last_login?: string | null;
        };
      };
      dealership_data: {
        Row: {
          id: string;
          tenant_id: string;
          domain: string;
          business_name: string;
          seo_score: number | null;
          aeo_score: number | null;
          geo_score: number | null;
          overall_score: number | null;
          seo_components: Record<string, any>;
          seo_confidence: number | null;
          aeo_components: Record<string, any>;
          aeo_mentions: number;
          aeo_queries: number;
          aeo_mention_rate: string | null;
          geo_components: Record<string, any>;
          sge_appearance_rate: string | null;
          eeat_experience: number | null;
          eeat_expertise: number | null;
          eeat_authoritativeness: number | null;
          eeat_trustworthiness: number | null;
          eeat_overall: number | null;
          eeat_confidence: number | null;
          raw_data: Record<string, any>;
          last_analyzed: string;
          analysis_version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          domain: string;
          business_name: string;
          seo_score?: number | null;
          aeo_score?: number | null;
          geo_score?: number | null;
          overall_score?: number | null;
          seo_components?: Record<string, any>;
          seo_confidence?: number | null;
          aeo_components?: Record<string, any>;
          aeo_mentions?: number;
          aeo_queries?: number;
          aeo_mention_rate?: string | null;
          geo_components?: Record<string, any>;
          sge_appearance_rate?: string | null;
          eeat_experience?: number | null;
          eeat_expertise?: number | null;
          eeat_authoritativeness?: number | null;
          eeat_trustworthiness?: number | null;
          eeat_overall?: number | null;
          eeat_confidence?: number | null;
          raw_data?: Record<string, any>;
          analysis_version?: string;
        };
        Update: {
          tenant_id?: string;
          domain?: string;
          business_name?: string;
          seo_score?: number | null;
          aeo_score?: number | null;
          geo_score?: number | null;
          overall_score?: number | null;
          seo_components?: Record<string, any>;
          seo_confidence?: number | null;
          aeo_components?: Record<string, any>;
          aeo_mentions?: number;
          aeo_queries?: number;
          aeo_mention_rate?: string | null;
          geo_components?: Record<string, any>;
          sge_appearance_rate?: string | null;
          eeat_experience?: number | null;
          eeat_expertise?: number | null;
          eeat_authoritativeness?: number | null;
          eeat_trustworthiness?: number | null;
          eeat_overall?: number | null;
          eeat_confidence?: number | null;
          raw_data?: Record<string, any>;
          analysis_version?: string;
        };
      };
    };
  };
}

// Helper functions
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  // Get user details from our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      tenant:tenants(*)
    `)
    .eq('clerk_id', user.id)
    .single();
    
  if (userError || !userData) return null;
  
  return {
    ...user,
    ...userData,
    tenant: userData.tenant
  };
}

export async function getDealershipData(tenantId: string) {
  const { data, error } = await supabase
    .from('dealership_data')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function saveDealershipScores(tenantId: string, scores: any) {
  const { data, error } = await supabase
    .from('dealership_data')
    .upsert({
      tenant_id: tenantId,
      domain: scores.domain,
      business_name: scores.business_name,
      seo_score: scores.seo.score,
      aeo_score: scores.aeo.score,
      geo_score: scores.geo.score,
      overall_score: scores.overall,
      seo_components: scores.seo.components,
      seo_confidence: scores.seo.confidence,
      aeo_components: scores.aeo.components,
      aeo_mentions: scores.aeo.mentions,
      aeo_queries: scores.aeo.queries,
      aeo_mention_rate: scores.aeo.mention_rate,
      geo_components: scores.geo.components,
      sge_appearance_rate: scores.geo.sge_appearance_rate,
      eeat_experience: scores.eeat.experience,
      eeat_expertise: scores.eeat.expertise,
      eeat_authoritativeness: scores.eeat.authoritativeness,
      eeat_trustworthiness: scores.eeat.trustworthiness,
      eeat_overall: scores.eeat.overall,
      eeat_confidence: scores.eeat.confidence,
      raw_data: scores,
      last_analyzed: new Date().toISOString(),
      analysis_version: '1.0.0'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
