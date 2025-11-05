// lib/geo/types.ts

export interface GEOPrompt {
  id: string;
  prompt: string;
  city: string;
  intent: 'service' | 'sales' | 'parts' | 'finance';
  created_at: string;
}

export interface GEOTestResult {
  id: string;
  prompt_id: string;
  dealership_named: boolean;
  competitor_named?: string;
  pages_appeared?: string[];
  citations_appeared?: string[];
  surface_type: 'ai_overview' | 'maps_3pack' | 'perplexity' | 'chatgpt';
  tested_at: string;
}

export interface GEOFix {
  id: string;
  test_result_id: string;
  fix_type: 'title' | 'h1' | 'faq' | 'schema' | 'gbp_post' | 'receipts_block';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'applied' | 'verified';
  generated_content?: string;
  applied_at?: string;
  verified_at?: string;
}

export interface GEOScore {
  dealership_id: string;
  period: string;
  prompts_tested: number;
  named_count: number;
  geo_score: number; // percentage
  citation_mix: number;
  answer_surface_mix: number;
  time_to_update_days: number;
}

