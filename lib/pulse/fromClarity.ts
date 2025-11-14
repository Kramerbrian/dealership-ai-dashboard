/**
 * Build Pulse Cards from Clarity Stack Response
 * 
 * Translates `/api/clarity/stack` data into actionable Pulse cards
 * that dealers can understand and act on.
 */

import type { PulseCard } from '@/types/pulse';

export type ClarityStackResponse = {
  domain: string;
  scores: { seo: number; aeo: number; geo: number; avi: number };
  gbp: { 
    health_score: number; 
    rating?: number;
    average_rating?: number;
    review_count?: number;
    issues?: string[];
  };
  ugc: { 
    score: number; 
    recent_reviews_90d: number; 
    issues: string[];
  };
  schema: { 
    score: number; 
    coverage?: Record<string, number>;
    coverage_by_template?: Record<string, number>;
    issues?: string[];
  };
  competitive: { 
    rank: number; 
    total: number; 
    leaders?: { name: string; avi: number }[]; 
    gap_to_leader?: number;
    top_competitors?: { name: string; avi: number }[];
    avi_gap?: number;
  };
  revenue_at_risk: { monthly: number; annual: number };
  ai_intro_current: string;
  ai_intro_improved: string;
};

/**
 * Map numeric score to severity level
 */
function severityFromScore(score: number): PulseCard['severity'] {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'high';
  return 'critical';
}

/**
 * Generate Pulse cards from Clarity Stack API response
 */
export function buildPulseCardsFromClarity(data: ClarityStackResponse): PulseCard[] {
  const cards: PulseCard[] = [];

  // 1) AVI / overall visibility
  const aviScore = data.scores.avi;
  const aviSummary = aviScore >= 80
    ? `Your overall AI visibility score is ${aviScore}/100. You're doing well, but there's still room to improve.`
    : aviScore >= 60
    ? `Your overall AI visibility score is ${aviScore}/100. AI knows you exist, but you're not standing out.`
    : aviScore >= 40
    ? `Your overall AI visibility score is ${aviScore}/100. AI knows you exist, but you are easy to skip.`
    : `Your overall AI visibility score is ${aviScore}/100. AI barely knows you exist. This is costing you customers.`;
  
  const aviCard: PulseCard = {
    key: 'avi',
    title: 'AI Visibility Index',
    severity: severityFromScore(aviScore),
    summary: aviSummary,
    whyItMatters: 'Higher visibility means more shoppers see you in AI answers instead of your competitors.',
    recommendedAction: aviScore < 60
      ? 'Improve schema on VDPs and add clear answers on service pages. Focus on structured data first.'
      : 'Fine-tune your content to answer common questions shoppers ask AI. Add FAQ sections to key pages.',
    estimatedImpact: `$${data.revenue_at_risk.monthly.toLocaleString()}/month at risk`,
    category: 'Visibility'
  };
  cards.push(aviCard);

  // 2) Schema
  const schemaScore = data.schema.score;
  const schemaIssue = data.schema.issues?.[0] || 'Some key pages are missing structured data.';
  const schemaSummary = schemaScore >= 80
    ? `Your schema coverage is ${schemaScore}/100. Most pages have structured data, but a few gaps remain.`
    : schemaScore >= 60
    ? `Your schema coverage is ${schemaScore}/100. ${schemaIssue}`
    : `Your schema coverage is ${schemaScore}/100. ${schemaIssue} This is hurting your AI visibility.`;
  
  cards.push({
    key: 'schema_health',
    title: 'Schema Coverage',
    severity: severityFromScore(schemaScore),
    summary: schemaSummary,
    whyItMatters: 'Without clear structured data, AI cannot reliably understand your inventory and services.',
    recommendedAction: schemaScore < 60
      ? 'Generate schema for all VDPs and service pages immediately. This is your highest-impact fix.'
      : 'Add schema to remaining pages. Focus on VDPs and service pages first.',
    estimatedImpact: schemaScore < 60 
      ? 'Could add +8–12 points to AI visibility.'
      : 'Could add +4–8 points to AI visibility.',
    category: 'Schema'
  });

  // 3) GBP
  const gbpRating = data.gbp.rating ?? data.gbp.average_rating ?? '–';
  const gbpReviews = data.gbp.review_count ?? 0;
  cards.push({
    key: 'gbp_health',
    title: 'Google Business Profile',
    severity: severityFromScore(data.gbp.health_score),
    summary: `Your GBP score is ${data.gbp.health_score}/100 with a rating of ${gbpRating} from ${gbpReviews} reviews.`,
    whyItMatters: 'AI leans heavily on GBP for local trust signals, hours, and reviews.',
    recommendedAction: 'Refresh photos and tighten profile details so you stay ahead locally.',
    estimatedImpact: 'Improves local trust and click-through rates.',
    category: 'GBP'
  });

  // 4) UGC
  cards.push({
    key: 'ugc_health',
    title: 'UGC & Reviews',
    severity: severityFromScore(data.ugc.score),
    summary: `Your review and UGC score is ${data.ugc.score}/100 with ${data.ugc.recent_reviews_90d} new reviews in the last 90 days.`,
    whyItMatters: 'Fresh review content helps AI and shoppers trust you more than nearby dealers.',
    recommendedAction: 'Add selected review quotes to SRPs, VDPs, and service pages.',
    estimatedImpact: 'Improves trust and AI answer quality.',
    category: 'UGC'
  });

  // 5) Competitive
  const leaders = data.competitive.leaders || data.competitive.top_competitors || [];
  const leaderName = leaders[0]?.name || 'A competitor';
  const gapToLeader = data.competitive.gap_to_leader ?? data.competitive.avi_gap ?? 0;
  cards.push({
    key: 'competitive_position',
    title: 'Competitive Position',
    severity: data.competitive.rank <= 3 ? 'medium' : 'high',
    summary: `You are #${data.competitive.rank} of ${data.competitive.total} dealers in local AI visibility. ${leaderName} is in the lead.`,
    whyItMatters: 'Small improvements can move you into the top 2, where most shoppers stop.',
    recommendedAction: 'Focus on schema and service FAQs to close the gap with the leaders.',
    estimatedImpact: gapToLeader > 0 
      ? `You are about ${gapToLeader} AVI points behind the top dealer.`
      : 'Focus on improving your visibility to move up in rankings.',
    category: 'Competitive'
  });

  // 6) AI narrative
  cards.push({
    key: 'ai_intro',
    title: 'How AI Describes You',
    severity: 'medium',
    summary: `Today AI would describe you like this: "${data.ai_intro_current}"`,
    whyItMatters: 'This is close to how AI talks about your store when shoppers ask for dealers like you.',
    recommendedAction: `Move toward: "${data.ai_intro_improved}" using schema, FAQs, and better content.`,
    estimatedImpact: 'Improves your narrative in AI answers compared to nearby dealers.',
    category: 'Narrative'
  });

  return cards;
}

