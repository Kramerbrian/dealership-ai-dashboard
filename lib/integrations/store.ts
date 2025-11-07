import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

export type IntegrationRow = {
  id: string;
  tenant_id: string;
  kind: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;   // ISO string
  metadata: any | null;        // JSON
  created_at: string;
  updated_at: string;
};

export async function getIntegration(tenantId: string, kind: string): Promise<IntegrationRow | null> {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAdmin
    .from("integrations")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("kind", kind)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as IntegrationRow) || null;
}

export async function upsertIntegration(params: {
  tenantId: string;
  kind: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: string | null;
  metadata?: any;
}): Promise<void> {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { tenantId, kind, accessToken, refreshToken, expiresAt, metadata } = params;

  const { error } = await supabaseAdmin
    .from("integrations")
    .upsert({
      tenant_id: tenantId,
      kind,
      access_token: accessToken ?? null,
      refresh_token: refreshToken ?? null,
      expires_at: expiresAt ?? null,
      metadata: metadata ?? null
    }, { onConflict: "tenant_id,kind" });

  if (error) throw error;
}
