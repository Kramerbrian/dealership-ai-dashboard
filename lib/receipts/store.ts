import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

export type FixReceipt = {
  id: string;
  tenant_id: string;
  pulse_id: string;
  tier: "preview" | "apply" | "autopilot";
  actor: "human" | "agent";
  summary: string;
  delta_usd: number;
  undoable: boolean;
  undo_deadline: string | null;
  undone: boolean;
  context: any | null;
  created_at: string;
  updated_at: string;
};

export async function insertReceipt(
  row: Omit<FixReceipt, "id" | "created_at" | "updated_at">
) {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAdmin
    .from("fix_receipts")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as FixReceipt;
}

export async function markUndone(tenantId: string, id: string) {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAdmin
    .from("fix_receipts")
    .update({
      undone: true,
      undoable: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .eq("undone", false)
    .lte("undo_deadline", new Date(new Date().getTime() + 1).toISOString()) // noop guard
    .select("*")
    .single();
  if (error) throw error;
  return data as FixReceipt;
}

export async function loadReceipt(tenantId: string, id: string) {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAdmin
    .from("fix_receipts")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();
  if (error) throw error;
  return data as FixReceipt;
}

export async function updateReceiptFinalDelta(
  tenantId: string,
  id: string,
  finalDeltaUSD: number,
  contextPatch?: any
) {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const updateData: any = {
    delta_usd: finalDeltaUSD,
    updated_at: new Date().toISOString(),
  };
  
  if (contextPatch) {
    // Try to merge context if possible, otherwise replace
    const existing = await loadReceipt(tenantId, id).catch(() => null);
    if (existing?.context) {
      updateData.context = { ...existing.context, ...contextPatch };
    } else {
      updateData.context = contextPatch;
    }
  }
  
  const { data, error } = await supabaseAdmin
    .from("fix_receipts")
    .update(updateData)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select("*")
    .single();
  if (error) throw error;
  return data as FixReceipt;
}

export async function listReceiptsSince(tenantId: string, sinceISO: string) {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAdmin
    .from("fix_receipts")
    .select("*")
    .eq("tenant_id", tenantId)
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as FixReceipt[];
}

