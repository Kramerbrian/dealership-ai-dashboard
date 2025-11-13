/**
 * Real-time Citation Tracking Service
 * 
 * Monitors and tracks citations across AI engines (ChatGPT, Perplexity, Gemini, Google AI)
 * and SERP features (Featured Snippets, People Also Ask, Knowledge Panels)
 * 
 * @version 1.0.0
 * @author DealershipAI Team
 */

import { CitationMetrics } from '../scoring/enhanced-dai-engine';

export interface CitationEvent {
  id: string;
  timestamp: Date;
  source: 'chatgpt' | 'perplexity' | 'gemini' | 'google_ai' | 'featured_snippet' | 'people_also_ask' | 'knowledge_panel';
  url: string;
  domain: string;
  query: string;
  position: number;
  context: string;
  relevance: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-100
}

export interface CitationTrend {
  period: '7d' | '30d' | '90d';
  totalMentions: number;
  averagePosition: number;
  averageRelevance: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topQueries: Array<{
    query: string;
    mentions: number;
    averagePosition: number;
  }>;
  sourceBreakdown: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
    google_ai: number;
    featured_snippet: number;
    people_also_ask: number;
    knowledge_panel: number;
  };
}

export interface CompetitiveCitationAnalysis {
  dealer: {
    totalMentions: number;
    averagePosition: number;
    shareOfVoice: number;
  };
  competitors: Array<{
    domain: string;
    totalMentions: number;
    averagePosition: number;
    shareOfVoice: number;
    displacementRisk: number; // 0-100
  }>;
  marketTrends: {
    totalMarketMentions: number;
    marketGrowth: number; // percentage
    emergingQueries: string[];
    decliningQueries: string[];
  };
}

export class CitationTracker {
  private citationEvents: CitationEvent[] = [];
  private readonly maxEvents = 10000; // Keep last 10k events
  
  /**
   * Add a new citation event
   */
  addCitationEvent(event: Omit<CitationEvent, 'id' | 'timestamp'>): void {
    const citationEvent: CitationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    };
    
    this.citationEvents.unshift(citationEvent);
    
    // Keep only the most recent events
    if (this.citationEvents.length > this.maxEvents) {
      this.citationEvents = this.citationEvents.slice(0, this.maxEvents);
    }
  }
  
  /**
   * Get citation metrics for a specific domain
   */
  getCitationMetrics(domain: string, days: number = 30): CitationMetrics {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    const domainEvents = this.citationEvents.filter(
      event => event.domain === domain && event.timestamp >= cutoffDate
    );
    
    return {
      chatgptMentions: this.countMentionsBySource(domainEvents, 'chatgpt'),
      perplexityMentions: this.countMentionsBySource(domainEvents, 'perplexity'),
      geminiMentions: this.countMentionsBySource(domainEvents, 'gemini'),
      googleAIMentions: this.countMentionsBySource(domainEvents, 'google_ai'),
      featuredSnippets: this.countMentionsBySource(domainEvents, 'featured_snippet'),
      peopleAlsoAsk: this.countMentionsBySource(domainEvents, 'people_also_ask'),
      knowledgePanels: this.countMentionsBySource(domainEvents, 'knowledge_panel'),
      citationStability: this.calculateCitationStability(domainEvents),
      citationPosition: this.calculateAveragePosition(domainEvents),
      citationContext: this.calculateAverageRelevance(domainEvents),
    };
  }
  
  /**
   * Get citation trends for a domain
   */
  getCitationTrends(domain: string, period: '7d' | '30d' | '90d' = '30d'): CitationTrend {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    const domainEvents = this.citationEvents.filter(
      event => event.domain === domain && event.timestamp >= cutoffDate
    );
    
    return {
      period,
      totalMentions: domainEvents.length,
      averagePosition: this.calculateAveragePosition(domainEvents),
      averageRelevance: this.calculateAverageRelevance(domainEvents),
      sentimentBreakdown: this.calculateSentimentBreakdown(domainEvents),
      topQueries: this.getTopQueries(domainEvents),
      sourceBreakdown: this.getSourceBreakdown(domainEvents),
    };
  }
  
  /**
   * Get competitive citation analysis
   */
  getCompetitiveAnalysis(domain: string, competitorDomains: string[]): CompetitiveCitationAnalysis {
    const last30Days = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    const allEvents = this.citationEvents.filter(event => event.timestamp >= last30Days);
    
    const dealerEvents = allEvents.filter(event => event.domain === domain);
    const competitorEvents = allEvents.filter(event => competitorDomains.includes(event.domain));
    
    const totalMarketMentions = allEvents.length;
    const dealerMentions = dealerEvents.length;
    
    return {
      dealer: {
        totalMentions: dealerMentions,
        averagePosition: this.calculateAveragePosition(dealerEvents),
        shareOfVoice: totalMarketMentions > 0 ? (dealerMentions / totalMarketMentions) * 100 : 0,
      },
      competitors: competitorDomains.map(compDomain => {
        const compEvents = allEvents.filter(event => event.domain === compDomain);
        return {
          domain: compDomain,
          totalMentions: compEvents.length,
          averagePosition: this.calculateAveragePosition(compEvents),
          shareOfVoice: totalMarketMentions > 0 ? (compEvents.length / totalMarketMentions) * 100 : 0,
          displacementRisk: this.calculateDisplacementRisk(dealerEvents, compEvents),
        };
      }),
      marketTrends: {
        totalMarketMentions,
        marketGrowth: this.calculateMarketGrowth(allEvents),
        emergingQueries: this.getEmergingQueries(allEvents),
        decliningQueries: this.getDecliningQueries(allEvents),
      },
    };
  }
  
  /**
   * Simulate real-time citation monitoring
   */
  simulateCitationMonitoring(domain: string): void {
    // Simulate ChatGPT mentions
    if (Math.random() < 0.1) {
      this.addCitationEvent({
        source: 'chatgpt',
        url: `https://${domain}/inventory`,
        domain,
        query: 'best car dealership near me',
        position: Math.floor(Math.random() * 5) + 1,
        context: 'This dealership has excellent reviews and a wide selection of vehicles',
        relevance: 85 + Math.random() * 15,
        sentiment: 'positive',
        confidence: 90 + Math.random() * 10,
      });
    }
    
    // Simulate Perplexity mentions
    if (Math.random() < 0.08) {
      this.addCitationEvent({
        source: 'perplexity',
        url: `https://${domain}/service`,
        domain,
        query: 'car service center recommendations',
        position: Math.floor(Math.random() * 3) + 1,
        context: 'Known for reliable service and certified technicians',
        relevance: 80 + Math.random() * 20,
        sentiment: 'positive',
        confidence: 85 + Math.random() * 15,
      });
    }
    
    // Simulate Google AI mentions
    if (Math.random() < 0.12) {
      this.addCitationEvent({
        source: 'google_ai',
        url: `https://${domain}/`,
        domain,
        query: 'local car dealership',
        position: Math.floor(Math.random() * 4) + 1,
        context: 'Highly rated dealership with competitive pricing',
        relevance: 90 + Math.random() * 10,
        sentiment: 'positive',
        confidence: 95 + Math.random() * 5,
      });
    }
    
    // Simulate Featured Snippet appearances
    if (Math.random() < 0.05) {
      this.addCitationEvent({
        source: 'featured_snippet',
        url: `https://${domain}/faq`,
        domain,
        query: 'what is the best time to buy a car',
        position: 1,
        context: 'Featured snippet with expert advice',
        relevance: 95,
        sentiment: 'neutral',
        confidence: 98,
      });
    }
  }
  
  // Private helper methods
  private generateEventId(): string {
    return `citation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private countMentionsBySource(events: CitationEvent[], source: CitationEvent['source']): number {
    return events.filter(event => event.source === source).length;
  }
  
  private calculateCitationStability(events: CitationEvent[]): number {
    if (events.length === 0) return 0;
    
    // Calculate stability based on consistent mentions over time
    const weeklyMentions = this.groupEventsByWeek(events);
    const averageMentions = weeklyMentions.reduce((sum, count) => sum + count, 0) / weeklyMentions.length;
    const variance = weeklyMentions.reduce((sum, count) => sum + Math.pow(count - averageMentions, 2), 0) / weeklyMentions.length;
    const stability = Math.max(0, 100 - (variance / averageMentions) * 100);
    
    return Math.round(stability);
  }
  
  private calculateAveragePosition(events: CitationEvent[]): number {
    if (events.length === 0) return 0;
    return Math.round(events.reduce((sum, event) => sum + event.position, 0) / events.length);
  }
  
  private calculateAverageRelevance(events: CitationEvent[]): number {
    if (events.length === 0) return 0;
    return Math.round(events.reduce((sum, event) => sum + event.relevance, 0) / events.length);
  }
  
  private calculateSentimentBreakdown(events: CitationEvent[]) {
    const breakdown = { positive: 0, neutral: 0, negative: 0 };
    events.forEach(event => {
      breakdown[event.sentiment]++;
    });
    return breakdown;
  }
  
  private getTopQueries(events: CitationEvent[], limit: number = 10) {
    const queryCounts = new Map<string, { mentions: number; positions: number[] }>();
    
    events.forEach(event => {
      const existing = queryCounts.get(event.query) || { mentions: 0, positions: [] };
      existing.mentions++;
      existing.positions.push(event.position);
      queryCounts.set(event.query, existing);
    });
    
    return Array.from(queryCounts.entries())
      .map(([query, data]) => ({
        query,
        mentions: data.mentions,
        averagePosition: data.positions.reduce((sum, pos) => sum + pos, 0) / data.positions.length,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, limit);
  }
  
  private getSourceBreakdown(events: CitationEvent[]) {
    const breakdown = {
      chatgpt: 0,
      perplexity: 0,
      gemini: 0,
      google_ai: 0,
      featured_snippet: 0,
      people_also_ask: 0,
      knowledge_panel: 0,
    };
    
    events.forEach(event => {
      breakdown[event.source]++;
    });
    
    return breakdown;
  }
  
  private groupEventsByWeek(events: CitationEvent[]): number[] {
    const weeks = new Map<string, number>();
    
    events.forEach(event => {
      const weekKey = this.getWeekKey(event.timestamp);
      weeks.set(weekKey, (weeks.get(weekKey) || 0) + 1);
    });
    
    return Array.from(weeks.values());
  }
  
  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }
  
  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }
  
  private calculateDisplacementRisk(dealerEvents: CitationEvent[], competitorEvents: CitationEvent[]): number {
    if (dealerEvents.length === 0) return 100;
    
    const dealerAvgPosition = this.calculateAveragePosition(dealerEvents);
    const competitorAvgPosition = this.calculateAveragePosition(competitorEvents);
    
    if (competitorAvgPosition === 0) return 0;
    
    const positionRatio = competitorAvgPosition / dealerAvgPosition;
    const risk = Math.max(0, Math.min(100, (1 - positionRatio) * 100));
    
    return Math.round(risk);
  }
  
  private calculateMarketGrowth(events: CitationEvent[]): number {
    if (events.length < 14) return 0;
    
    const firstHalf = events.slice(0, Math.floor(events.length / 2));
    const secondHalf = events.slice(Math.floor(events.length / 2));
    
    const firstHalfCount = firstHalf.length;
    const secondHalfCount = secondHalf.length;
    
    if (firstHalfCount === 0) return 0;
    
    return Math.round(((secondHalfCount - firstHalfCount) / firstHalfCount) * 100);
  }
  
  private getEmergingQueries(events: CitationEvent[]): string[] {
    // Simple implementation - in reality, this would use more sophisticated analysis
    const recentEvents = events.filter(event => 
      event.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    const queryCounts = new Map<string, number>();
    recentEvents.forEach(event => {
      queryCounts.set(event.query, (queryCounts.get(event.query) || 0) + 1);
    });
    
    return Array.from(queryCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([query, _]) => query)
      .slice(0, 5);
  }
  
  private getDecliningQueries(events: CitationEvent[]): string[] {
    // Simple implementation - in reality, this would use more sophisticated analysis
    const olderEvents = events.filter(event => 
      event.timestamp < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    );
    
    const queryCounts = new Map<string, number>();
    olderEvents.forEach(event => {
      queryCounts.set(event.query, (queryCounts.get(event.query) || 0) + 1);
    });
    
    return Array.from(queryCounts.entries())
      .filter(([_, count]) => count >= 3)
      .map(([query, _]) => query)
      .slice(0, 5);
  }
}

export default CitationTracker;
