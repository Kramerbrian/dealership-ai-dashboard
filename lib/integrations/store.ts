import {supabaseAdmin} from '@/lib/db/supabaseAdmin';

export type IntegrationRow = {
  id: string;
  tenant_id: string;
  kind: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
};

export async function getIntegration(tenantId: string, kind: string) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');
  
  const {data, error} = await supabaseAdmin
    .from('integrations')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('kind', kind)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return (data as IntegrationRow) || null;
}

export async function upsertIntegration(params: {
  tenantId: string;
  kind: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: string | null;
  metadata?: any;
}) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');
  
  const {tenantId, kind, accessToken, refreshToken, expiresAt, metadata} = params;
  
  const {error} = await supabaseAdmin
    .from('integrations')
    .upsert({
      tenant_id: tenantId,
      kind,
      access_token: accessToken ?? null,
      refresh_token: refreshToken ?? null,
      expires_at: expiresAt ?? null,
      metadata: metadata ?? null,
    }, {onConflict: 'tenant_id,kind'});
  
  if (error) throw error;
}

export async function setReviewsPlaceId(
  tenantId: string,
  placeId: string,
  provider: 'google' = 'google'
) {
  const existing = await getIntegration(tenantId, 'reviews');
  const metadata = {
    ...(existing?.metadata || {}),
    place_id: placeId,
    provider
  };
  await upsertIntegration({tenantId, kind: 'reviews', metadata});
}

export async function setVisibilityEngines(
  tenantId: string,
  engines: Partial<Record<'ChatGPT' | 'Perplexity' | 'Gemini' | 'Copilot', boolean>>
) {
  const existing = await getIntegration(tenantId, 'visibility');
  const merged = {
    ...(existing?.metadata || {}),
    engines: {
      ...(existing?.metadata?.engines || {}),
      ...engines
    }
  };
  await upsertIntegration({tenantId, kind: 'visibility', metadata: merged});
}

