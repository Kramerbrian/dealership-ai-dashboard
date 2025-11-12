import type { NextRequest } from 'next/server';
// Simple in-memory cache with optional Upstash Redis.
// If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN exist, use Redis.
let mem = new Map<string,{v:any,exp:number}>();
const TTL = 60 * 60 * 24; // 24h

async function getRedis(){
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function cacheGet(key:string){
  const r = await getRedis();
  if (r){ return await r.get(key); }
  const hit = mem.get(key);
  if (!hit) return null; if (hit.exp < Date.now()) { mem.delete(key); return null; }
  return hit.v;
}
export async function cacheSet(key:string, value:any, ttlSec=TTL){
  const r = await getRedis();
  if (r){ await r.set(key,value,{ex:ttlSec}); return; }
  mem.set(key,{v:value,exp: Date.now()+ttlSec*1000});
}

// naive city key extractor (placeholder). In production use MaxMind/Places API.
export function cityKeyFromDomain(domain:string){
  const d = domain.toLowerCase();
  // toy mapping for demo; replace with lookup by GMB/Whois/places
  if (d.includes('naples')) return 'us_fl_naples';
  if (d.includes('miami')) return 'us_fl_miami';
  if (d.includes('orlando')) return 'us_fl_orlando';
  return 'us_generic';
}
