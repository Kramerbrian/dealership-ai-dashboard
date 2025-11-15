import { sbAdmin } from '@/lib/supabase';

export type Flag = { enabled: boolean; rollout?: number; notes?: string };
export type Flags = Record<string, Flag>;

let _cache: { ts: number; flags: Flags } | null = null;
const TTL = 60 * 1000; // 60s cache

export async function getFlags(): Promise<Flags> {
  const now = Date.now();
  if (_cache && now - _cache.ts < TTL) return _cache.flags;
  if (!sbAdmin) return {};
  const { data, error } = await sbAdmin.from('feature_flags').select('key,value');
  if (error) throw error;
  const flags: Flags = {};
  (data || []).forEach((r: any) => { flags[r.key] = r.value; });
  _cache = { ts: now, flags };
  return flags;
}

export async function setFlag(key: string, value: Flag) {
  if (!sbAdmin) return;
  await sbAdmin.from('feature_flags').upsert({ key, value } as any);
  _cache = null;
}
