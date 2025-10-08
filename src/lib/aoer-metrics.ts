// aoer-metrics.ts — Drop-in module for DealershipAI
// Computes AOER, AI Claim Score, Click-Loss, and Priority ranking.
// Includes a tiny demo dataset and example usage at the bottom.

// ---------- Types ----------
export type Intent = 'local'|'inventory'|'finance'|'trade'|'info'|'service'|'brand';
export type AIPOS = 'top'|'mid'|'bottom'|'none';

export interface QueryCheck {
  query: string;
  intent: Intent;
  volume: number;                 // monthly searches
  serp_position?: number;         // 1..10 (optional)
  ai_present: boolean;            // AI Overview present
  ai_pos: AIPOS;                  // AI Overview position
  has_our_citation: boolean;      // whether our domain cited in the AI box
  ai_tokens?: number;             // proxy for answer depth (0..∞)
}

export interface AOERRollup {
  aoer: number;       // unweighted
  aoer_w: number;     // volume-weighted
  aoer_pos: number;   // prominence-weighted
  aoer_pos_w: number; // prominence & volume-weighted
}

export interface PriorityRow {
  query: string;
  intent: Intent;
  ACS: number;        // 0..100 risk score
  loss: number;       // expected monthly clicks lost
  Priority: number;   // 0..100 ranking score
}

// ---------- Tunables ----------
const PROM_MAP: Record<AIPOS, number> = { top:100, mid:60, bottom:30, none:0 };
const DAMPEN:   Record<AIPOS, number> = { top:0.55, mid:0.70, bottom:0.85, none:1.00 };
const CTR_BASE: Record<number, number> = {1:0.28, 2:0.16, 3:0.11, 4:0.08, 5:0.06};

const W_present=45, W_prom=25, W_noCite=20, W_depth=10; // weights sum to 100

// ---------- Helpers ----------
function ctrBase(rank?: number){
  if(!rank) return 0.03;
  if(rank>=6) return 0.03;
  return CTR_BASE[rank] ?? 0.03;
}

function depthScaler(tokens?: number){
  const t = Math.max(0, tokens ?? 0);
  return Math.min(1, t / 600); // 600 tokens ~= fully confident answer depth
}

// ---------- Core per-query metrics ----------
export function aiClaimScore(q: QueryCheck){
  const present = q.ai_present ? 100 : 0;
  const prom    = PROM_MAP[q.ai_pos];
  const noCite  = q.has_our_citation ? 0 : 100;
  const depth   = depthScaler(q.ai_tokens) * 100;
  const raw = (W_present*present + W_prom*prom + W_noCite*noCite + W_depth*depth)/100;
  return Math.max(0, Math.min(100, raw));
}

export function clickLoss(q: QueryCheck){
  const base   = ctrBase(q.serp_position);
  const withAI = base * DAMPEN[q.ai_pos];
  const clicksNoAI = q.volume * base;
  const clicksAI   = q.volume * (q.ai_present ? withAI : base);
  return Math.max(0, clicksNoAI - clicksAI);
}

// ---------- Dataset rollups ----------
export function computeAOER(set: QueryCheck[]): AOERRollup {
  const N = Math.max(1, set.length);
  const sumVol = set.reduce((s,x)=>s+x.volume,0) || 1;
  const present = set.filter(x=>x.ai_present).length;
  const presentVol = set.filter(x=>x.ai_present).reduce((s,x)=>s+x.volume,0);

  const posUnit = (x: QueryCheck)=> x.ai_present ? (x.ai_pos==='top'?1:x.ai_pos==='mid'?0.6:x.ai_pos==='bottom'?0.3:0) : 0;
  const posSum   = set.reduce((s,x)=>s+posUnit(x),0);
  const posSumVol= set.reduce((s,x)=>s+posUnit(x)*x.volume,0);

  return {
    aoer: present/N,
    aoer_w: presentVol/sumVol,
    aoer_pos: posSum/N,
    aoer_pos_w: posSumVol/sumVol
  };
}

export function priorityScores(set: QueryCheck[]): PriorityRow[] {
  const losses = set.map(clickLoss).sort((a,b)=>a-b);
  const p95loss = losses[Math.floor(0.95*(losses.length-1))] || 1;
  const vols = set.map(q=>q.volume).sort((a,b)=>a-b);
  const p95vol = vols[Math.floor(0.95*(vols.length-1))] || 1;

  return set.map(q=>{
    const ACS = aiClaimScore(q);
    const loss = clickLoss(q);
    const VolumeNorm = Math.min(1, q.volume / p95vol);
    const ImpactNorm = Math.min(1, loss / p95loss);
    const RiskNorm   = ACS / 100;
    const Priority   = 100 * (0.5*ImpactNorm + 0.5*RiskNorm) * (0.6*VolumeNorm + 0.4);
    return { query:q.query, intent:q.intent, ACS, loss, Priority };
  }).sort((a,b)=> b.Priority - a.Priority);
}

// ---------- Segment rollup convenience ----------
export function aoerByIntent(set: QueryCheck[]): Record<Intent, AOERRollup> {
  const intents: Intent[] = ['local','inventory','finance','trade','info','service','brand'];
  const out: any = {};
  intents.forEach(intent => {
    const subset = set.filter(x=>x.intent===intent);
    out[intent] = subset.length ? computeAOER(subset) : {aoer:0, aoer_w:0, aoer_pos:0, aoer_pos_w:0};
  });
  return out as Record<Intent, AOERRollup>;
}

// ---------- Dashboard tiles convenience ----------
export function dashboardTiles(set: QueryCheck[]){
  const roll = computeAOER(set);
  const rows = priorityScores(set);
  const top10 = rows.slice(0,10);
  const estMonthlyClickLoss = rows.reduce((s,r)=>s+r.loss,0);
  const citedShare = (set.filter(q=>q.ai_present && q.has_our_citation).length) / Math.max(1, set.filter(q=>q.ai_present).length);
  return {
    tiles: {
      AOER: roll.aoer,
      AOER_weighted: roll.aoer_w,
      AOER_prominence_weighted: roll.aoer_pos_w,
      Avg_ACS: rows.reduce((s,r)=>s+r.ACS,0)/Math.max(1, rows.length),
      Cited_In_AI_Share: citedShare,
      Estimated_Monthly_Click_Loss: estMonthlyClickLoss
    },
    topQueries: top10
  };
}

// ---------- Tiny demo dataset (Dealership vertical) ----------
export const DEMO_SET: QueryCheck[] = [
  { query:'hybrid vs gas car cost', intent:'info', volume:5400, serp_position:3, ai_present:true,  ai_pos:'top',    has_our_citation:false, ai_tokens:850 },
  { query:'what\'s my car worth trade-in', intent:'trade', volume:8100, serp_position:5, ai_present:true,  ai_pos:'mid',    has_our_citation:false, ai_tokens:500 },
  { query:'toyota dealer near me', intent:'local', volume:12100, serp_position:2, ai_present:true,  ai_pos:'bottom', has_our_citation:true,  ai_tokens:260 },
  { query:'2025 corolla lease deal', intent:'finance', volume:4400, serp_position:4, ai_present:true,  ai_pos:'top',    has_our_citation:false, ai_tokens:700 },
  { query:'brake replacement cost', intent:'service', volume:9900, serp_position:6, ai_present:false, ai_pos:'none',   has_our_citation:false, ai_tokens:0 },
  { query:'used honda civic for sale', intent:'inventory', volume:6600, serp_position:1, ai_present:false, ai_pos:'none',   has_our_citation:false, ai_tokens:0 },
  { query:'abc motors reviews', intent:'brand', volume:1600, serp_position:1, ai_present:false, ai_pos:'none',   has_our_citation:false, ai_tokens:0 },
];

// ---------- Example usage ----------
// (Uncomment for quick test in node/ts-node)
// const roll = computeAOER(DEMO_SET);
// const byIntent = aoerByIntent(DEMO_SET);
// const ranked = priorityScores(DEMO_SET);
// const tiles = dashboardTiles(DEMO_SET);
// console.log({ roll, byIntent, rankedTop5: ranked.slice(0,5), tiles });
