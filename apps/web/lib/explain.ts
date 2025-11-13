export type Anomaly = { 
  metric: string; 
  delta: number; 
  dir: 'up' | 'down'; 
  week: number 
};

export type Explanation = { 
  summary: string; 
  causes: string[]; 
  playbook: { id: string; title: string } 
};

export function explain(an: Anomaly): Explanation {
  const { metric, dir, delta } = an;
  
  // ultra-light rules
  if (metric === 'AI Visibility' && dir === 'down') {
    return {
      summary: `AI Visibility dropped ${Math.abs(delta)}%. Primary drivers likely: loss of Featured Snippets and fewer Gemini citations.`,
      causes: [
        'Schema coverage dipped on key pages (FAQ/Vehicle schema missing)',
        'Recent content lacks 40–60 word summary or table near top',
        'Competitor captured People Also Ask questions'
      ],
      playbook: { id: 'pb_recover_ai_citations', title: 'Recover AI Citations' }
    };
  }
  
  if (metric === 'AEMD' && dir === 'down') {
    return {
      summary: `Answer Engine dominance fell ${Math.abs(delta)} pts. You're losing snippets and PAA ownership.`,
      causes: [
        'Comparison pages lack table schema',
        'Outdated bylines / missing updated dates',
        'Thin answers (>2 scrolls from top)'
      ],
      playbook: { id: 'pb_zero_click_win', title: 'Zero-Click Win' }
    };
  }
  
  if (metric === 'Organic Traffic' && dir === 'down') {
    return {
      summary: `Organic traffic declined ${Math.abs(delta)}%. Core pages losing visibility.`,
      causes: [
        'Core pages dropped in rankings',
        'Technical SEO issues (Core Web Vitals, mobile)',
        'Content freshness issues or thin content'
      ],
      playbook: { id: 'pb_traffic_recovery', title: 'Traffic Recovery' }
    };
  }
  
  if (metric === 'Conversion Rate' && dir === 'down') {
    return {
      summary: `Conversion rate fell ${Math.abs(delta)}%. User experience or targeting issues.`,
      causes: [
        'Page load speed degradation',
        'Mobile experience problems',
        'Call-to-action clarity issues'
      ],
      playbook: { id: 'pb_conversion_optimization', title: 'Conversion Optimization' }
    };
  }
  
  if (metric === 'Zero-Click Siphon' && dir === 'up') {
    return {
      summary: `Zero-click siphon increased ${Math.abs(delta)}%. AI answers stealing your traffic.`,
      causes: [
        'AI answers appearing for your target keywords',
        'Competitors getting featured in AI responses',
        'Lack of structured data for AI consumption'
      ],
      playbook: { id: 'pb_ai_visibility_protection', title: 'AI Visibility Protection' }
    };
  }
  
  if (metric === 'Local Pack Visibility' && dir === 'down') {
    return {
      summary: `Local pack visibility dropped ${Math.abs(delta)}%. Local SEO issues.`,
      causes: [
        'Google My Business profile issues',
        'Local citation inconsistencies',
        'Review score or quantity decline'
      ],
      playbook: { id: 'pb_local_seo_recovery', title: 'Local SEO Recovery' }
    };
  }
  
  // Default fallback
  return {
    summary: `${metric} changed ${dir === 'up' ? '↑' : '↓'} ${Math.abs(delta)}%.`,
    causes: [
      'Check recent schema/content changes',
      'Review competitor movements', 
      'Re-run Content Optimizer'
    ],
    playbook: { id: 'pb_diagnostic', title: 'Diagnostic Sweep' }
  };
}