// Bot-Parity Monitor (SEO / AI Search Parity)
export type BotSignal = { 
  bot: 'Googlebot' | 'GPTBot' | 'PerplexityBot' | 'GeminiBot'; 
  pages: number; 
  schemaPct: number; 
};

export type ParityReport = { 
  parityPct: number; 
  weakest: string; 
  notes: string[] 
};

export function compareBots(bots: BotSignal[]): ParityReport {
  const avg = bots.reduce((s, b) => s + b.schemaPct, 0) / bots.length;
  const min = bots.reduce((m, b) => b.schemaPct < m.schemaPct ? b.schemaPct : m, bots[0].schemaPct);
  const weakest = bots.find(b => b.schemaPct === min)?.bot || 'Unknown';
  
  return {
    parityPct: +(100 - (avg - min)).toFixed(1),
    weakest,
    notes: [
      `Average schema parity ${avg.toFixed(1)}%`,
      `${weakest} trails by ${(avg - min).toFixed(1)}%`,
      'Align crawl parity: verify robots.txt & canonical coverage'
    ]
  };
}

// Get bot parity data for a domain
export async function getBotParityData(domain: string): Promise<BotSignal[]> {
  // In production, this would query actual bot crawl data
  // For now, return mock data with some variation
  const baseSchemaPct = 85 + Math.random() * 10; // 85-95%
  
  return [
    { bot: 'Googlebot', pages: 320, schemaPct: baseSchemaPct },
    { bot: 'GPTBot', pages: 318, schemaPct: baseSchemaPct - 5 + Math.random() * 10 },
    { bot: 'PerplexityBot', pages: 300, schemaPct: baseSchemaPct - 3 + Math.random() * 8 },
    { bot: 'GeminiBot', pages: 312, schemaPct: baseSchemaPct - 2 + Math.random() * 6 }
  ];
}

// Calculate parity score
export function calculateParityScore(bots: BotSignal[]): number {
  if (bots.length === 0) return 0;
  
  const avg = bots.reduce((s, b) => s + b.schemaPct, 0) / bots.length;
  const min = Math.min(...bots.map(b => b.schemaPct));
  const max = Math.max(...bots.map(b => b.schemaPct));
  
  // Parity score based on how close all bots are to each other
  const range = max - min;
  const parityScore = Math.max(0, 100 - (range * 2)); // Penalize large ranges
  
  return Math.round(parityScore * 10) / 10;
}

// Get parity recommendations
export function getParityRecommendations(bots: BotSignal[]): string[] {
  const recommendations: string[] = [];
  const avg = bots.reduce((s, b) => s + b.schemaPct, 0) / bots.length;
  const min = Math.min(...bots.map(b => b.schemaPct));
  const max = Math.max(...bots.map(b => b.schemaPct));
  const range = max - min;
  
  if (range > 10) {
    recommendations.push('Large parity gap detected - investigate bot-specific crawl issues');
  }
  
  if (avg < 80) {
    recommendations.push('Overall schema coverage below 80% - improve structured data implementation');
  }
  
  const weakestBot = bots.find(b => b.schemaPct === min);
  if (weakestBot) {
    recommendations.push(`Focus on ${weakestBot.bot} optimization - currently trailing by ${(max - min).toFixed(1)}%`);
  }
  
  if (bots.some(b => b.pages < 200)) {
    recommendations.push('Some bots crawling fewer pages - check robots.txt and internal linking');
  }
  
  return recommendations;
}
