/**
 * Autopilot Rules for AI Intro Generation
 * Canonized PLG pattern for generating and refreshing improved AI descriptions
 */

export interface AutopilotAIIntroConfig {
  triggers: {
    name: string;
    schedule?: string; // Cron expression
    condition?: string; // JavaScript expression
  }[];
  input_signals: string[];
  system_prompt: string;
  output_fields: string[];
  write_back: {
    table: string;
    columns: string[];
  };
}

export const AUTOPILOT_AI_INTRO_CONFIG: AutopilotAIIntroConfig = {
  triggers: [
    {
      name: 'weekly_refresh',
      schedule: '0 3 * * 1', // Mondays 03:00
    },
    {
      name: 'metric_jump',
      condition: 'geo_delta >= 10 OR schema_health_delta >= 15 OR ugc_score_delta >= 15',
    },
    {
      name: 'autopilot_run',
      condition: "autopilot_job in ['schema_pack','faq_deploy','gbp_photo_refresh']",
    },
  ],
  input_signals: [
    'clarity_stack.scores',
    'clarity_stack.gbp',
    'clarity_stack.ugc',
    'clarity_stack.schema',
    'clarity_stack.competitive',
    'recent_autopilot_actions',
  ],
  system_prompt: `You write one short description (1–2 sentences) that sounds like how AI should describe this dealership once these improvements are live. Be honest, clear, and specific. Mention one strength and one customer-facing benefit. Reading level: 11th grade.`,
  output_fields: ['ai_intro_improved'],
  write_back: {
    table: 'ai_intros',
    columns: ['tenant_id', 'type', 'text', 'created_at', 'source_meta'],
  },
};

/**
 * Generate improved AI intro based on clarity stack data
 */
export async function generateImprovedIntro(
  domain: string,
  clarityStack: {
    scores: { seo: number; aeo: number; geo: number; avi: number };
    gbp?: { health_score: number; rating?: number };
    ugc?: { score: number };
    schema?: { score: number };
    competitive?: { rank: number; total: number };
  }
): Promise<string> {
  // Use Orchestrator 3.0 to generate improved intro
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orchestrator/v3/generate-intro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        clarity_stack: clarityStack,
        prompt: AUTOPILOT_AI_INTRO_CONFIG.system_prompt,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.intro || generateFallbackIntro(domain, clarityStack);
    }
  } catch (error) {
    console.error('Failed to generate improved intro via Orchestrator:', error);
  }

  return generateFallbackIntro(domain, clarityStack);
}

function generateFallbackIntro(
  domain: string,
  clarityStack: any
): string {
  const dealerName = domain.split('.')[0].replace(/\b\w/g, (l) => l.toUpperCase()));
  const strengths: string[] = [];

  if (clarityStack.gbp?.rating && clarityStack.gbp.rating >= 4.5) {
    strengths.push('highly rated');
  }
  if (clarityStack.schema?.score && clarityStack.schema.score >= 70) {
    strengths.push('clear online information');
  }
  if (clarityStack.ugc?.score && clarityStack.ugc.score >= 70) {
    strengths.push('strong customer reviews');
  }

  const strengthText = strengths.length > 0 ? strengths[0] : 'reliable service';

  return `${dealerName} is a trusted dealership known for ${strengthText} and helping customers find the right vehicle.`;
}

