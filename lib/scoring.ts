/**
 * DealershipAI Scoring Module
 * Final formulas, consensus rules, and revenue calculations
 */

export type MetricBlock = {
  mentions: number;
  citations: number;
  sentiment: number;
  shareOfVoice: number;
};

export type EngineCoverage = {
  perplexity: number;
  chatgpt: number;
  gemini: number;
}; // 0–100

export type WebVitals = {
  lcp: number; // seconds
  inp: number; // milliseconds
  cls: number; // unitless
};

export type IssueHit = {
  id: string;
  engine: 'perplexity' | 'chatgpt' | 'gemini';
};

export type ConsensusResult = {
  id: string;
  engines: string[];
  unanimous: boolean;
  majority: boolean;
  weak: boolean;
  weight: number;
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const w = {
  seo: [0.2, 0.25, 0.15, 0.4],
  aeo: [0.3, 0.35, 0.1, 0.25],
  geo: [0.25, 0.3, 0.2, 0.25],
  ai: { pplx: 0.25, gpt: 0.4, gem: 0.35 },
  overall: { seo: 0.2, aeo: 0.25, geo: 0.15, ai: 0.2, wh: 0.1, mystery: 0.1 },
};

/**
 * Calculate SEO score (0-100)
 * Formula: 0.20*mentions + 0.25*citations + 0.15*sentiment + 0.40*shareOfVoice
 */
export const scoreComposite = (m: MetricBlock, key: 'seo' | 'aeo' | 'geo'): number => {
  const [wm, wc, ws, wo] = w[key];
  const s = m.mentions * wm + m.citations * wc + m.sentiment * ws + m.shareOfVoice * wo;
  return clamp(+s.toFixed(1));
};

/**
 * Calculate AI Visibility score (0-100)
 * Formula: 0.25*Perplexity + 0.40*ChatGPT + 0.35*Gemini
 */
export const scoreAIVisibility = (c: EngineCoverage): number => {
  const s = c.perplexity * w.ai.pplx + c.chatgpt * w.ai.gpt + c.gemini * w.ai.gem;
  return clamp(+s.toFixed(1));
};

/**
 * Map LCP to 0-100 score
 * Good: ≤2.5s = 100, Poor: ≥4s = 0
 */
const mapLCP = (lcp: number): number => {
  if (lcp <= 2.5) return 100;
  if (lcp >= 4) return 0;
  return Math.round(100 - ((lcp - 2.5) / (4 - 2.5)) * 100);
};

/**
 * Map INP to 0-100 score
 * Good: ≤200ms = 100, Poor: ≥500ms = 0
 */
const mapINP = (inp: number): number => {
  if (inp <= 200) return 100;
  if (inp >= 500) return 0;
  return Math.round(100 - ((inp - 200) / (500 - 200)) * 100);
};

/**
 * Map CLS to 0-100 score
 * Good: ≤0.1 = 100, Poor: ≥0.25 = 0
 */
const mapCLS = (cls: number): number => {
  if (cls <= 0.1) return 100;
  if (cls >= 0.25) return 0;
  return Math.round(100 - ((cls - 0.1) / (0.25 - 0.1)) * 100);
};

/**
 * Calculate Website Health score (0-100)
 * Formula: 0.70*CWV + 0.20*Meta + 0.10*Indexation
 */
export const scoreWebsiteHealth = (
  vitals: WebVitals,
  meta: { title: number; description: number; h1: number }, // 0–1 each
  indexation: { indexed: number; excluded: number }
): number => {
  const cwv = (mapLCP(vitals.lcp) + mapINP(vitals.inp) + mapCLS(vitals.cls)) / 3;
  const metaPct = ((meta.title + meta.description + meta.h1) / 3) * 100;
  const total = indexation.indexed + indexation.excluded || 1;
  const idx = (indexation.indexed / total) * 100;
  const wh = 0.7 * cwv + 0.2 * metaPct + 0.1 * idx;
  return clamp(Math.round(wh));
};

/**
 * Calculate E-E-A-T score (0-100)
 * Formula: (# of satisfied signals) ÷ 4
 */
export const scoreEEAT = (flags: {
  exp: boolean;
  expx: boolean;
  auth: boolean;
  trust: boolean;
}): number => {
  const k = [flags.exp, flags.expx, flags.auth, flags.trust].filter(Boolean).length;
  return (k / 4) * 100;
};

/**
 * Calculate Overall score (0-100)
 * Formula: 20% SEO + 25% AEO + 15% GEO + 20% AI Visibility + 10% Website Health + 10% Mystery
 */
export const scoreOverall = (parts: {
  seo: number;
  aeo: number;
  geo: number;
  ai: number;
  wh: number;
  mystery: number;
}): number => {
  const s =
    parts.seo * w.overall.seo +
    parts.aeo * w.overall.aeo +
    parts.geo * w.overall.geo +
    parts.ai * w.overall.ai +
    parts.wh * w.overall.wh +
    parts.mystery * w.overall.mystery;
  return clamp(Math.round(s));
};

/**
 * Calculate Mystery Score (0-100)
 * Formula: 25% Speed-to-lead + 25% Quote transparency + 15% Phone etiquette + 15% Chat responsiveness + 10% Appt set rate + 10% Follow-up
 */
export const scoreMystery = (metrics: {
  speedToLead: number; // 0-100
  quoteTransparency: number; // 0-100
  phoneEtiquette: number; // 0-100
  chatResponsiveness: number; // 0-100
  apptSetRate: number; // 0-100
  followUp: number; // 0-100
}): number => {
  const s =
    0.25 * metrics.speedToLead +
    0.25 * metrics.quoteTransparency +
    0.15 * metrics.phoneEtiquette +
    0.15 * metrics.chatResponsiveness +
    0.1 * metrics.apptSetRate +
    0.1 * metrics.followUp;
  return clamp(Math.round(s));
};

/**
 * Calculate Zero-click inclusion rate
 * Formula: included_intents ÷ tested_intents (7-day rolling window, min 10 intents)
 */
export const scoreZeroClickInclusion = (
  included: number,
  tested: number,
  minSampleSize = 10
): number | null => {
  if (tested < minSampleSize) return null;
  return clamp((included / tested) * 100);
};

/**
 * Consensus calculation for issues
 * Returns: unanimous (3/3), majority (2/3), weak (1/3)
 * Weights: Perplexity 0.25, ChatGPT 0.40, Gemini 0.35
 */
export const consensus = (hits: IssueHit[]): ConsensusResult[] => {
  const by = hits.reduce<Record<string, Set<string>>>(
    (m, h) => {
      m[h.id] ??= new Set();
      m[h.id].add(h.engine);
      return m;
    },
    {}
  );

  return Object.entries(by).map(([id, set]) => {
    const n = set.size;
    const unanimous = n === 3;
    const majority = n === 2;
    const weak = n === 1;
    const weight =
      (set.has('chatgpt') ? w.ai.gpt : 0) +
      (set.has('gemini') ? w.ai.gem : 0) +
      (set.has('perplexity') ? w.ai.pplx : 0);
    return {
      id,
      engines: [...set],
      unanimous,
      majority,
      weak,
      weight: +weight.toFixed(2),
    };
  });
};

/**
 * Revenue at Risk - CPC Proxy method
 * Formula: Σ_intent (missed_clicks_intent × CPC_proxy_intent)
 * Default CPC: Buy=$14, Sell=$12, Service=$8, Trade=$10
 */
export const rarCPC = (
  missedClicksByIntent: Record<string, number>,
  cpc: Record<string, number> = {
    buy: 14,
    sell: 12,
    service: 8,
    trade: 10,
  }
): number => {
  return Object.entries(missedClicksByIntent).reduce(
    (s, [k, v]) => s + v * (cpc[k.toLowerCase()] ?? 10),
    0
  );
};

/**
 * Revenue at Risk - Value-per-click from CPL
 * Formula: VPC = (lead_conv_rate) × (CPL) → RAR = Σ_intent (missed_clicks_intent × VPC_intent)
 * Defaults: CPL=$50, Sales 6%, Service 12%, Trade 8% → VPC ≈ $3.00 / $6.00 / $4.00
 */
export const rarVPC = (
  missedClicksByIntent: Record<string, number>,
  vpc: Record<string, number> = {
    buy: 3.0,
    sell: 3.0,
    service: 6.0,
    trade: 4.0,
  }
): number => {
  return Object.entries(missedClicksByIntent).reduce(
    (s, [k, v]) => s + v * (vpc[k.toLowerCase()] ?? 5),
    0
  );
};

/**
 * Calculate missed clicks for an intent
 * Formula: (target_inclusion_rate - actual_inclusion_rate) × estimated_clicks_intent (clamped ≥0)
 */
export const calculateMissedClicks = (
  targetInclusionRate: number, // e.g., 0.75 (75%)
  actualInclusionRate: number,
  estimatedClicks: number
): number => {
  const missedRate = Math.max(0, targetInclusionRate - actualInclusionRate);
  return missedRate * estimatedClicks;
};

/**
 * Alert band classification
 * Returns: 'green' | 'yellow' | 'red'
 */
export type AlertBand = 'green' | 'yellow' | 'red';

export const getAlertBand = (
  value: number,
  thresholds: { green: number; yellow: number }
): AlertBand => {
  if (value >= thresholds.green) return 'green';
  if (value >= thresholds.yellow) return 'yellow';
  return 'red';
};

/**
 * Standard thresholds for all metrics
 */
export const THRESHOLDS = {
  seo: { green: 85, yellow: 70 },
  aeo: { green: 80, yellow: 65 },
  geo: { green: 85, yellow: 70 },
  aiVisibility: { green: 85, yellow: 70 },
  websiteHealth: { green: 90, yellow: 75 },
  mystery: { green: 80, yellow: 65 },
  zeroClick: { green: 75, yellow: 50 }, // percentage
  eeat: { green: 4, yellow: 3 }, // signals (out of 4)
} as const;

/**
 * Get alert band for a metric
 */
export const getMetricAlert = (
  metric: keyof typeof THRESHOLDS,
  value: number
): AlertBand => {
  const thresholds = THRESHOLDS[metric];
  if (metric === 'eeat') {
    // E-E-A-T is signals count, not percentage
    if (value >= thresholds.green) return 'green';
    if (value >= thresholds.yellow) return 'yellow';
    return 'red';
  }
  return getAlertBand(value, thresholds as { green: number; yellow: number });
};
