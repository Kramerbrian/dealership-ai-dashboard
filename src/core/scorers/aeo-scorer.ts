import { Dealer, AEOScore } from '../types';

export class AEOScorer {
  async calculateScore(dealer: Dealer): Promise<AEOScore> {
    // Simulate AI platform querying and analysis
    const queries = this.getMarketQueries(dealer.city, dealer.state);
    const platforms = ['chatgpt', 'claude', 'perplexity', 'gemini'];
    
    let totalMentions = 0;
    let totalQueries = 0;
    let positionSum = 0;
    let completenessSum = 0;
    let sentimentSum = 0;
    let platformMentions = new Set<string>();

    // Simulate query execution across platforms
    for (const query of queries.slice(0, 5)) { // Limit to 5 queries for simulation
      for (const platform of platforms) {
        const response = this.simulateAIResponse(query, dealer, platform);
        const analysis = this.analyzeResponse(response, dealer);
        
        totalQueries++;
        
        if (analysis.mentioned) {
          totalMentions++;
          positionSum += (4 - analysis.position); // 1st=3pts, 2nd=2pts, 3rd=1pt
          completenessSum += analysis.completeness;
          sentimentSum += analysis.sentiment;
          platformMentions.add(platform);
        }
      }
    }

    const mentionRate = totalMentions / totalQueries;

    const components = {
      citation_frequency: mentionRate * 100,
      source_authority: totalMentions > 0 ? (positionSum / totalMentions) * 33.3 : 0,
      answer_completeness: totalMentions > 0 ? completenessSum / totalMentions : 0,
      multi_platform_presence: (platformMentions.size / 4) * 100,
      sentiment_quality: totalMentions > 0 ? ((sentimentSum / totalMentions) + 1) * 50 : 0
    };

    const score = (
      components.citation_frequency * 0.35 +
      components.source_authority * 0.25 +
      components.answer_completeness * 0.20 +
      components.multi_platform_presence * 0.15 +
      components.sentiment_quality * 0.05
    );

    return {
      score: Math.round(score),
      components,
      mentions: totalMentions,
      queries: totalQueries,
      mention_rate: (mentionRate * 100).toFixed(1) + '%'
    };
  }

  private getMarketQueries(city: string, state: string): string[] {
    const marketQueries: Record<string, string[]> = {
      'Naples, FL': [
        'best Honda dealer in Naples Florida',
        'where to buy Toyota in Naples',
        'most trustworthy car dealership Naples FL',
        'Honda CR-V inventory Naples',
        'car dealerships with best service Naples',
        'trade in value Naples FL',
        'certified pre-owned vehicles Naples',
        'new Honda Accord price Naples'
      ],
      'Fort Myers, FL': [
        'best car dealer Fort Myers',
        'Toyota dealership near Fort Myers',
        'Honda dealer Fort Myers FL',
        'car dealerships Fort Myers',
        'new car prices Fort Myers'
      ]
    };

    const key = `${city}, ${state}`;
    return marketQueries[key] || [
      `best car dealer in ${city}`,
      `car dealerships ${city} ${state}`,
      `new car prices ${city}`
    ];
  }

  private simulateAIResponse(query: string, dealer: Dealer, platform: string): string {
    // Simulate AI platform responses with realistic patterns
    const dealerName = dealer.name.toLowerCase();
    const city = dealer.city.toLowerCase();
    
    // Higher tier dealers more likely to be mentioned
    const mentionProbability = dealer.tier === 1 ? 0.7 : dealer.tier === 2 ? 0.4 : 0.2;
    
    if (Math.random() < mentionProbability) {
      const responses = [
        `${dealer.name} is one of the top-rated dealerships in ${dealer.city}`,
        `For reliable service, consider ${dealer.name} in ${dealer.city}`,
        `${dealer.name} has excellent reviews and competitive pricing`,
        `I recommend ${dealer.name} for their customer service in ${dealer.city}`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    return `There are several car dealerships in ${dealer.city} to consider.`;
  }

  private analyzeResponse(response: string, dealer: Dealer): {
    mentioned: boolean;
    position: number;
    completeness: number;
    sentiment: number;
  } {
    const dealerName = dealer.name.toLowerCase();
    const mentioned = response.toLowerCase().includes(dealerName);
    
    if (!mentioned) {
      return { mentioned: false, position: 0, completeness: 0, sentiment: 0 };
    }

    // Simulate position in response (1-3)
    const position = Math.floor(Math.random() * 3) + 1;
    
    // Simulate completeness (0-100)
    const completeness = 60 + Math.random() * 40;
    
    // Simulate sentiment (-1 to 1)
    const sentiment = -0.2 + Math.random() * 1.4; // Slightly positive bias

    return {
      mentioned: true,
      position,
      completeness,
      sentiment
    };
  }
}
