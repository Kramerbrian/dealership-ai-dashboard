/**
 * Receipts Database Operations
 * 
 * Handles storage and retrieval of fix receipts with tenant isolation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Receipts will use in-memory storage.');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface Receipt {
  id: string;
  tenant_id: string;
  pulse_id?: string;
  tier: 'apply' | 'autopilot';
  actor: 'human' | 'agent';
  summary: string;
  delta_usd?: number; // undefined = pending
  projected_delta_usd?: number;
  undoable: boolean;
  undone: boolean;
  undo_deadline?: string;
  finalized: boolean;
  context?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Insert a new receipt
 */
export async function insertReceipt(data: {
  tenant_id: string;
  pulse_id?: string;
  tier: 'apply' | 'autopilot';
  actor?: 'human' | 'agent';
  summary: string;
  projected_delta_usd?: number;
  undoable?: boolean;
  undo_deadline?: string;
  context?: any;
}): Promise<Receipt> {
  if (!supabase) {
    // Fallback to in-memory for development
    const receipt: Receipt = {
      id: `receipt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      tenant_id: data.tenant_id,
      pulse_id: data.pulse_id,
      tier: data.tier,
      actor: data.actor || 'human',
      summary: data.summary,
      delta_usd: undefined,
      projected_delta_usd: data.projected_delta_usd,
      undoable: data.undoable ?? true,
      undone: false,
      undo_deadline: data.undo_deadline,
      finalized: false,
      context: data.context,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return receipt;
  }

  const { data: receipt, error } = await supabase
    .from('receipts')
    .insert({
      tenant_id: data.tenant_id,
      pulse_id: data.pulse_id,
      tier: data.tier,
      actor: data.actor || 'human',
      summary: data.summary,
      projected_delta_usd: data.projected_delta_usd,
      undoable: data.undoable ?? true,
      undone: false,
      undo_deadline: data.undo_deadline,
      finalized: false,
      context: data.context
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert receipt: ${error.message}`);
  }

  return receipt as Receipt;
}

/**
 * Get receipt by ID (with tenant isolation)
 */
export async function getReceipt(id: string, tenantId: string): Promise<Receipt | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Receipt;
}

/**
 * Update receipt (for finalizing delta, undoing, etc.)
 */
export async function updateReceipt(
  id: string,
  tenantId: string,
  updates: Partial<Receipt>
): Promise<Receipt | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('receipts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as Receipt;
}

/**
 * Get all receipts for a tenant
 */
export async function getReceipts(tenantId: string, limit = 50): Promise<Receipt[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as Receipt[];
}

