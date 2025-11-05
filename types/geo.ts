export type GeoTestPrompt = {
  id: string;
  query: string;
  city: string;
  intent: 'service' | 'sales' | 'parts' | 'finance';
};

export type GeoResult = {
  promptId: string;
  ai_engine: 'google_ai' | 'perplexity' | 'chatgpt_browse' | 'gemini';
  mentioned: boolean; // did our rooftop get named
  our_name?: string; // normalized rooftop name
  citations: string[]; // external domains quoted in the answer
  competitor_mentions: string[]; // rooftops/brands named
  winning_phrase?: string; // snippet that won (for mirroring)
  url?: string; // our page if present
  ts: string;
};

export type GeoSnapshot = {
  score_0_100: number;
  prompts_total: number;
  prompts_won: number;
  citations_unique: number;
  engines_coverage: Record<string, number>; // engine -> % coverage
  trend_7d: number; // +/-
};

export type FixSuggestion = {
  id: string;
  query: string;
  city: string;
  intent: string;
  winning_phrase: string;
  recommended_slug: string;
  title: string;
  h1: string;
  faqs: { q: string; a: string }[];
  schema: { type: 'FAQPage' | 'Service' | 'LocalBusiness'; jsonld: any }[];
  receipts: { updated: string; author: string; references: { name: string; url: string }[]; policy: string };
};

