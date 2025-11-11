/**
 * Google Ads Dishonest Pricing Policy Detector
 *
 * Implements Google's advertising policies for automotive dealerships:
 * - Cross-channel price consistency (Ad → LP → VDP)
 * - Disclosure requirements (APR, terms, fees)
 * - Hidden fee detection
 * - Jaccard similarity for offer integrity
 *
 * Feeds into ATI Consistency pillar (25% weight) and VLI Offer Integrity
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES
// ============================================================================

export interface PricingData {
  price?: number;
  monthlyPayment?: number;
  apr?: number;
  term?: number;
  downPayment?: number;
  msrp?: number;
  disclosures: string[];
  fees: { name: string; amount: number }[];
}

export interface AdData extends PricingData {
  headline: string;
  description: string;
  url: string;
}

export interface LandingPageData extends PricingData {
  url: string;
  offerText: string;
  ctaText: string;
}

export interface VDPData extends PricingData {
  url: string;
  vin: string;
  year: number;
  make: string;
  model: string;
}

export interface PolicyViolation {
  type: 'critical' | 'warning' | 'info';
  rule: string;
  description: string;
  affectedChannels: string[];
  recommendation: string;
}

export interface DishonestPricingResult {
  compliant: boolean;
  riskScore: number; // 0-100, higher = more risk
  violations: PolicyViolation[];
  breakdown: {
    jaccard: number;
    priceMismatch: boolean;
    hiddenFees: boolean;
    disclosureClarity: number; // 0-100
  };
  atiImpact: {
    consistencyPenalty: number; // Points lost in ATI consistency pillar
    precisionPenalty: number;   // Points lost in ATI precision pillar
  };
}

// ============================================================================
// JACCARD SIMILARITY FOR OFFER INTEGRITY
// ============================================================================

/**
 * Calculate Jaccard similarity between two offer texts
 * Used to detect material differences between ad copy and landing page
 */
function calculateJaccard(text1: string, text2: string): number {
  const tokens1 = new Set(
    text1.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2)
  );

  const tokens2 = new Set(
    text2.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2)
  );

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

// ============================================================================
// PRICE PARITY CHECKS
// ============================================================================

interface PriceParityResult {
  match: boolean;
  discrepancies: string[];
  maxDelta: number; // Maximum price difference in dollars
}

/**
 * Check price consistency across ad, landing page, and VDP
 */
function checkPriceParity(
  ad: AdData,
  lp: LandingPageData,
  vdp: VDPData
): PriceParityResult {
  const discrepancies: string[] = [];
  const prices: number[] = [];

  // Check final price
  if (ad.price && lp.price && ad.price !== lp.price) {
    discrepancies.push(`Ad price ($${ad.price}) ≠ LP price ($${lp.price})`);
    prices.push(Math.abs(ad.price - lp.price));
  }

  if (lp.price && vdp.price && lp.price !== vdp.price) {
    discrepancies.push(`LP price ($${lp.price}) ≠ VDP price ($${vdp.price})`);
    prices.push(Math.abs(lp.price - vdp.price));
  }

  if (ad.price && vdp.price && ad.price !== vdp.price) {
    discrepancies.push(`Ad price ($${ad.price}) ≠ VDP price ($${vdp.price})`);
    prices.push(Math.abs(ad.price - vdp.price));
  }

  // Check monthly payments
  if (ad.monthlyPayment && lp.monthlyPayment && ad.monthlyPayment !== lp.monthlyPayment) {
    discrepancies.push(`Ad payment ($${ad.monthlyPayment}/mo) ≠ LP payment ($${lp.monthlyPayment}/mo)`);
    prices.push(Math.abs(ad.monthlyPayment - lp.monthlyPayment));
  }

  // Check MSRP claims
  if (ad.msrp && vdp.msrp && ad.msrp !== vdp.msrp) {
    discrepancies.push(`Ad MSRP ($${ad.msrp}) ≠ VDP MSRP ($${vdp.msrp})`);
    prices.push(Math.abs(ad.msrp - vdp.msrp));
  }

  return {
    match: discrepancies.length === 0,
    discrepancies,
    maxDelta: prices.length > 0 ? Math.max(...prices) : 0,
  };
}

// ============================================================================
// DISCLOSURE NLP DETECTOR
// ============================================================================

interface DisclosureCheck {
  score: number; // 0-100
  missing: string[];
  warnings: string[];
}

/**
 * Detect missing or insufficient disclosures using rule-based NLP
 * (In production, replace with fine-tuned DistilBERT model)
 */
function checkDisclosures(
  ad: AdData,
  lp: LandingPageData
): DisclosureCheck {
  const missing: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  const adText = `${ad.headline} ${ad.description}`.toLowerCase();
  const lpText = `${lp.offerText} ${lp.ctaText}`.toLowerCase();
  const allDisclosures = [...ad.disclosures, ...lp.disclosures].join(' ').toLowerCase();

  // Check: "As low as" requires APR + term
  if ((adText.includes('as low as') || adText.includes('starting at')) &&
      (!ad.apr || !ad.term)) {
    missing.push('APR and term disclosure required for "as low as" claims');
    score -= 30;
  }

  // Check: "$0 down" requires fee disclosure
  if ((adText.includes('$0 down') || adText.includes('zero down')) &&
      !allDisclosures.includes('fees may apply')) {
    missing.push('Fee disclosure required for "$0 down" offers');
    score -= 25;
  }

  // Check: "Lease" requires capitalized cost
  if ((adText.includes('lease') || lpText.includes('lease')) &&
      !allDisclosures.includes('capitalized cost')) {
    warnings.push('Lease offers should disclose capitalized cost');
    score -= 15;
  }

  // Check: Payment claims require full terms
  if ((ad.monthlyPayment || lp.monthlyPayment) &&
      (!ad.apr || !ad.term || !ad.downPayment)) {
    missing.push('Payment offers require APR, term, and down payment disclosure');
    score -= 35;
  }

  // Check: "Dealer discount" requires conditions
  if ((adText.includes('dealer discount') || lpText.includes('dealer discount')) &&
      !allDisclosures.includes('qualif')) {
    warnings.push('Dealer discounts should specify qualification requirements');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    missing,
    warnings,
  };
}

// ============================================================================
// HIDDEN FEE DETECTOR
// ============================================================================

/**
 * Detect undisclosed or deceptively disclosed fees
 */
function detectHiddenFees(
  ad: AdData,
  lp: LandingPageData,
  vdp: VDPData
): { detected: boolean; flags: string[] } {
  const flags: string[] = [];

  // Aggregate all fees
  const allFees = [...ad.fees, ...lp.fees, ...vdp.fees];
  const adText = `${ad.headline} ${ad.description}`.toLowerCase();
  const lpText = lp.offerText.toLowerCase();

  // Check for common hidden fees
  const commonHiddenFees = [
    'dealer prep',
    'document fee',
    'destination charge',
    'acquisition fee',
    'disposition fee',
  ];

  // Detect fees mentioned in VDP but not in ad/LP disclosures
  const vdpFeeNames = vdp.fees.map(f => f.name.toLowerCase());
  const adDisclosures = ad.disclosures.join(' ').toLowerCase();
  const lpDisclosures = lp.disclosures.join(' ').toLowerCase();

  vdpFeeNames.forEach(feeName => {
    if (!adDisclosures.includes(feeName) && !lpDisclosures.includes(feeName)) {
      flags.push(`Fee "${feeName}" on VDP but not disclosed in ad/LP`);
    }
  });

  // Check for suspiciously low prices without fee disclosure
  if (ad.price && vdp.price && (vdp.price - ad.price) > 1000) {
    const totalFees = vdp.fees.reduce((sum, f) => sum + f.amount, 0);
    if (totalFees > 500 && !adDisclosures.includes('fee')) {
      flags.push(`Price delta of $${vdp.price - ad.price} suggests hidden fees`);
    }
  }

  // Check for "plus fees" without itemization
  if ((adText.includes('plus fees') || lpText.includes('plus fees')) &&
      (ad.fees.length === 0 && lp.fees.length === 0)) {
    flags.push('"Plus fees" mentioned without itemization');
  }

  return {
    detected: flags.length > 0,
    flags,
  };
}

// ============================================================================
// COMPOSITE RISK SCORING
// ============================================================================

/**
 * Scan ad, landing page, and VDP for dishonest pricing violations
 */
export async function scanDishonestPricing(
  ad: AdData,
  lp: LandingPageData,
  vdp: VDPData
): Promise<DishonestPricingResult> {
  const violations: PolicyViolation[] = [];

  // 1. Jaccard similarity for offer integrity
  const jaccardScore = calculateJaccard(
    `${ad.headline} ${ad.description}`,
    lp.offerText
  );

  if (jaccardScore < 0.3) {
    violations.push({
      type: 'critical',
      rule: 'Offer Integrity',
      description: `Ad and landing page offers are materially different (${(jaccardScore * 100).toFixed(0)}% similarity)`,
      affectedChannels: ['ad', 'landing_page'],
      recommendation: 'Align ad copy with landing page offer text. Jaccard similarity should be >30%.',
    });
  } else if (jaccardScore < 0.5) {
    violations.push({
      type: 'warning',
      rule: 'Offer Consistency',
      description: `Ad and landing page offers have low similarity (${(jaccardScore * 100).toFixed(0)}%)`,
      affectedChannels: ['ad', 'landing_page'],
      recommendation: 'Increase offer consistency between ad and landing page. Target >50% similarity.',
    });
  }

  // 2. Price parity checks
  const parity = checkPriceParity(ad, lp, vdp);
  if (!parity.match) {
    const severity: 'critical' | 'warning' = parity.maxDelta > 500 ? 'critical' : 'warning';
    violations.push({
      type: severity,
      rule: 'Price Consistency',
      description: `Price mismatch across channels (max delta: $${parity.maxDelta})`,
      affectedChannels: ['ad', 'landing_page', 'vdp'],
      recommendation: `Ensure prices match exactly across all channels. Discrepancies: ${parity.discrepancies.join('; ')}`,
    });
  }

  // 3. Disclosure checks
  const disclosures = checkDisclosures(ad, lp);
  if (disclosures.score < 70) {
    violations.push({
      type: disclosures.missing.length > 0 ? 'critical' : 'warning',
      rule: 'Disclosure Requirements',
      description: `Disclosure score: ${disclosures.score}/100. ${disclosures.missing.length} required disclosures missing.`,
      affectedChannels: ['ad', 'landing_page'],
      recommendation: `Add missing disclosures: ${disclosures.missing.join('; ')}`,
    });
  }

  // 4. Hidden fee detection
  const hiddenFees = detectHiddenFees(ad, lp, vdp);
  if (hiddenFees.detected) {
    violations.push({
      type: 'critical',
      rule: 'Fee Transparency',
      description: `Potential hidden fees detected: ${hiddenFees.flags.join('; ')}`,
      affectedChannels: ['ad', 'landing_page', 'vdp'],
      recommendation: 'Disclose all fees prominently in ad copy and landing page.',
    });
  }

  // Calculate composite risk score (0-100)
  let riskScore = 0;
  riskScore += (1 - jaccardScore) * 30; // Jaccard contributes 30 points
  riskScore += parity.match ? 0 : Math.min(30, parity.maxDelta / 100); // Price parity: 0-30 points
  riskScore += (100 - disclosures.score) * 0.25; // Disclosures: 0-25 points
  riskScore += hiddenFees.detected ? 15 : 0; // Hidden fees: 0-15 points

  // Calculate ATI impact
  const consistencyPenalty = violations
    .filter(v => v.rule === 'Price Consistency' || v.rule === 'Offer Integrity')
    .reduce((sum, v) => sum + (v.type === 'critical' ? 15 : 5), 0);

  const precisionPenalty = violations
    .filter(v => v.rule === 'Disclosure Requirements')
    .reduce((sum, v) => sum + (v.type === 'critical' ? 10 : 3), 0);

  return {
    compliant: violations.filter(v => v.type === 'critical').length === 0,
    riskScore: Math.min(100, riskScore),
    violations,
    breakdown: {
      jaccard: jaccardScore,
      priceMismatch: !parity.match,
      hiddenFees: hiddenFees.detected,
      disclosureClarity: disclosures.score,
    },
    atiImpact: {
      consistencyPenalty: Math.min(25, consistencyPenalty), // Cap at 25 points (consistency pillar weight)
      precisionPenalty: Math.min(30, precisionPenalty),     // Cap at 30 points (precision pillar weight)
    },
  };
}

// ============================================================================
// POLICY VERSION TRACKING
// ============================================================================

export interface GooglePolicyVersion {
  version: string;
  lastUpdated: string;
  changes: string[];
}

/**
 * Check for Google Ads policy updates
 * (In production, connect to a policy monitoring service)
 */
export async function checkPolicyUpdates(): Promise<GooglePolicyVersion> {
  // Mock implementation - replace with actual policy API
  return {
    version: '2025.10.1',
    lastUpdated: '2025-10-15',
    changes: [
      'Stricter disclosure requirements for lease offers',
      'New APR display guidelines for finance offers',
      'Enhanced fee transparency requirements',
    ],
  };
}

// ============================================================================
// BATCH SCANNING
// ============================================================================

export interface BatchScanInput {
  adUrl: string;
  lpUrl: string;
  vdpUrl: string;
}

export interface BatchScanResult extends BatchScanInput {
  result: DishonestPricingResult;
  timestamp: string;
}

/**
 * Scan multiple ad/LP/VDP combinations in parallel
 * Used by audit API endpoint
 */
export async function batchScanPricing(
  inputs: BatchScanInput[]
): Promise<BatchScanResult[]> {
  const timestamp = new Date().toISOString();

  // Dynamic import to avoid circular dependencies
  const { scrapeAll } = await import('./scraper');

  const results = await Promise.all(
    inputs.map(async (input) => {
      const startTime = Date.now();

      try {
        // Scrape all three sources
        const { ad, lp, vdp } = await scrapeAll({
          adUrl: input.adUrl,
          lpUrl: input.lpUrl,
          vdpUrl: input.vdpUrl,
        });

        // Run policy scan
        const result = await scanDishonestPricing(ad, lp, vdp);

        const duration = Date.now() - startTime;
        console.log(`[Policy] Scan completed for ${input.adUrl} in ${duration}ms`);

        return {
          ...input,
          result,
          timestamp,
        };
      } catch (error) {
        console.error(`[Policy] Scan failed for ${input.adUrl}:`, error);

        // Return error result
        return {
          ...input,
          result: {
            compliant: false,
            riskScore: 100,
            violations: [{
              type: 'critical' as const,
              rule: 'Scan Error',
              description: `Failed to scan: ${error instanceof Error ? error.message : 'Unknown error'}`,
              affectedChannels: ['ad', 'landing_page', 'vdp'],
              recommendation: 'Check URL accessibility and try again',
            }],
            breakdown: {
              jaccard: 0,
              priceMismatch: true,
              hiddenFees: true,
              disclosureClarity: 0,
            },
            atiImpact: {
              consistencyPenalty: 25,
              precisionPenalty: 30,
            },
          },
          timestamp,
        };
      }
    })
  );

  return results;
}

// ============================================================================
// ANTHROPIC CLAUDE-POWERED DISCLOSURE ANALYSIS (OPTIONAL ENHANCEMENT)
// ============================================================================

/**
 * Use Claude to analyze disclosure quality and compliance
 * More nuanced than rule-based NLP
 */
export async function analyzeDisclosuresWithClaude(
  adText: string,
  lpText: string,
  disclosures: string[]
): Promise<{ score: number; analysis: string }> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are a Google Ads policy compliance expert. Analyze this automotive ad for disclosure violations.

Ad Text: "${adText}"
Landing Page: "${lpText}"
Disclosures: ${disclosures.join('; ')}

Evaluate:
1. Are all material terms disclosed (APR, term, down payment, fees)?
2. Are disclosures clear and prominent, or buried in fine print?
3. Are there any deceptive "as low as" or "$0 down" claims without proper context?
4. Rate disclosure quality 0-100 (100 = excellent, transparent; 0 = deceptive, missing)

Respond with JSON: { "score": <number>, "analysis": "<explanation>" }`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text);
      return parsed;
    }

    return { score: 50, analysis: 'Unable to parse Claude response' };
  } catch (error) {
    console.error('Claude disclosure analysis failed:', error);
    return { score: 50, analysis: 'Analysis unavailable' };
  }
}
