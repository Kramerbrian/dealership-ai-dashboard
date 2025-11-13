/**
 * DealershipAI Scoring Formulas
 * Minimal, explicit math with no ambiguity
 */

export type Scalars01 = number; // 0..1
export type Currency = number;  // USD
export type Fraction = number;  // 0..1

export type SEOInputs = {
  cwv: Scalars01;            // Core Web Vitals composite 0..1
  crawlIndex: Scalars01;     // index coverage/health 0..1
  contentQuality: Scalars01; // 0..1
};

export type AEOInputs = {
  paaShare: Scalars01;       // presence & rank in PAA 0..1
  faqSchema: Scalars01;      // coverage + validity 0..1
  localCitations: Scalars01; // count×authority normalized 0..1
};

export type GEOInputs = {
  csgv: Scalars01;           // citation strength in generative visibility
  hallucinationRisk: Scalars01; // conflict/false rate 0..1
  lambdaHRP?: Scalars01;     // penalty weight default 1.0
};

export type QAIInputs = {
  lambdaPIQR: number;        // 0.8..1.2 (multiplier)
  vdpQuality: Scalars01;     // 0..1
};

export type EEATInputs = {
  eeatMultiplier: Scalars01; // 0..1 (composite)
};

export type FinancialInputs = {
  deltaLeadsPotential: number;  // monthly additional leads if fixed
  avgGPPUOrg: Currency;         // avg gross per unit
  riskAdjFactor: number;        // 0.7..1.0
  touchpoints?: Array<{ value: Scalars01; proximity: Scalars01 }>;
  closingRate?: Fraction;
  cacIncrease?: Currency;       // $/lead increase from decay
  monthlyLeadVolume?: number;
  tsm?: number;                 // Trust Sensitivity Multiplier
};

/**
 * SEO Score: 0.4*CWV + 0.3*CrawlIndex + 0.3*ContentQuality
 */
export const seoScore = ({ cwv, crawlIndex, contentQuality }: SEOInputs) =>
  0.4 * cwv + 0.3 * crawlIndex + 0.3 * contentQuality;

/**
 * AEO Score: 0.35*PAA_Share + 0.35*FAQ_Schema + 0.3*Local_Citations
 */
export const aeoScore = ({ paaShare, faqSchema, localCitations }: AEOInputs) =>
  0.35 * paaShare + 0.35 * faqSchema + 0.3 * localCitations;

/**
 * GEO Score: CSGV - λ_HRP*Hallucination_Risk (capped to [0,1])
 */
export const geoScore = ({ csgv, hallucinationRisk, lambdaHRP = 1.0 }: GEOInputs) => {
  const s = csgv - lambdaHRP * hallucinationRisk;
  return Math.max(0, Math.min(1, s));
};

/**
 * QAI Score: λ_PIQR * (SEO + AEO + GEO) * VDP_Quality
 */
export const qaiScore = (
  seo: number,
  aeo: number,
  geo: number,
  { lambdaPIQR, vdpQuality }: QAIInputs
) => lambdaPIQR * (seo + aeo + geo) * vdpQuality;

/**
 * Normalize QAI to [0,1] using soft cap
 */
export const normalizeQAI = (qai: number, cap = 3.0) => Math.min(1, Math.max(0, qai / cap));

/**
 * Trust Score: 100 * (0.60*normalize(QAI) + 0.40*EEAT_Multiplier)
 */
export const trustScore = (
  qai: number,
  { eeatMultiplier }: EEATInputs,
  cap = 3.0
) => {
  const q = normalizeQAI(qai, cap);
  const trust0to1 = 0.60 * q + 0.40 * eeatMultiplier;
  return Math.round(100 * Math.max(0, Math.min(1, trust0to1)));
};

/**
 * OCI: (ΔLeads_Potential * AvgGPPU_Org) / Risk_Adjustment_Factor
 */
export const ociMonthly = ({ deltaLeadsPotential, avgGPPUOrg, riskAdjFactor }: FinancialInputs) =>
  (deltaLeadsPotential * avgGPPUOrg) / Math.max(0.1, riskAdjFactor);

/**
 * AIA Attribution: (Σ(TouchpointValue_i * Proximity_i)) * ClosingRate
 */
export const aiaAttribution = ({ touchpoints = [], closingRate = 0.2 }: FinancialInputs) => {
  const pathValue = touchpoints.reduce((s, t) => s + (t.value * t.proximity), 0);
  return pathValue * closingRate; // fraction of deals with AI influence
};

/**
 * Decay Tax: CAC_Increase * Monthly_Lead_Volume * TSM
 */
export const decayTax = ({ cacIncrease = 0, monthlyLeadVolume = 0, tsm = 1.0 }: FinancialInputs) =>
  cacIncrease * monthlyLeadVolume * tsm;

