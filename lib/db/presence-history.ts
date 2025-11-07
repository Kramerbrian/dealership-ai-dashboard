/**
 * Presence History Database Operations
 * 
 * Handles storage and retrieval of AIV presence history with tenant isolation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Presence history will use synthetic data.');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface PresenceSnapshot {
  id: string;
  tenant_id: string;
  domain: string;
  date: string; // YYYY-MM-DD
  aiv_composite: number; // Overall AIV score
  engines: {
    ChatGPT?: number;
    Perplexity?: number;
    Gemini?: number;
    Copilot?: number;
  };
  created_at: string;
}

/**
 * Insert or update a daily presence snapshot
 */
export async function upsertPresenceSnapshot(data: {
  tenant_id: string;
  domain: string;
  date: string;
  aiv_composite: number;
  engines: {
    ChatGPT?: number;
    Perplexity?: number;
    Gemini?: number;
    Copilot?: number;
  };
}): Promise<PresenceSnapshot> {
  if (!supabase) {
    // Fallback for development
    return {
      id: `snapshot-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
  }

  const { data: snapshot, error } = await supabase
    .from('presence_history')
    .upsert({
      tenant_id: data.tenant_id,
      domain: data.domain,
      date: data.date,
      aiv_composite: data.aiv_composite,
      engines: data.engines
    }, {
      onConflict: 'tenant_id,domain,date'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert presence snapshot: ${error.message}`);
  }

  return snapshot as PresenceSnapshot;
}

/**
 * Get presence history for a domain (last N days)
 */
export async function getPresenceHistory(
  tenantId: string,
  domain: string,
  days: number = 7
): Promise<PresenceSnapshot[]> {
  if (!supabase) {
    // Return synthetic data for development
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today.getTime() - (days - 1 - i) * 24 * 3600 * 1000);
      const base = 86;
      const wiggle = Math.round(Math.sin(i) * 4);
      return {
        id: `snapshot-${i}`,
        tenant_id: tenantId,
        domain,
        date: date.toISOString().slice(0, 10),
        aiv_composite: base + wiggle,
        engines: {
          ChatGPT: base + wiggle + 2,
          Perplexity: base + wiggle - 1,
          Gemini: base + wiggle - 3,
          Copilot: base + wiggle - 5
        },
        created_at: date.toISOString()
      };
    });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data, error } = await supabase
    .from('presence_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('domain', domain)
    .gte('date', cutoffDate.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as PresenceSnapshot[];
}

/**
 * Get AIV composite series for sparkline
 */
export async function getAIVSeries(
  tenantId: string,
  domain: string,
  days: number = 7
): Promise<number[]> {
  const history = await getPresenceHistory(tenantId, domain, days);
  return history.map(s => s.aiv_composite);
}

/**
 * Get per-engine series for sparklines
 */
export async function getEngineSeries(
  tenantId: string,
  domain: string,
  engine: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Copilot',
  days: number = 7
): Promise<number[]> {
  const history = await getPresenceHistory(tenantId, domain, days);
  return history.map(s => s.engines[engine] || 0);
}

