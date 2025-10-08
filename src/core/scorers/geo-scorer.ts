import { Dealer, GEOScore } from '../types';

export class GEOScorer {
  async calculateScore(dealer: Dealer): Promise<GEOScore> {
    // Simulate Google Search Generative Experience and local data
    const [sge, gsc, gmb, kg] = await Promise.all([
      this.simulateSGE(dealer),
      this.simulateGSC(dealer),
      this.simulateGMB(dealer),
      this.simulateKnowledgeGraph(dealer)
    ]);

    const components = {
      ai_overview_presence: (sge.appearances / sge.total_queries) * 100,
      featured_snippet_rate: (gsc.featured_snippets / gsc.total_keywords) * 100,
      knowledge_panel_complete: this.assessPanelCompleteness(gmb.knowledge_panel),
      zero_click_dominance: this.calculateZeroClick(gsc),
      entity_recognition: kg.entity_verified ? 100 : 0
    };

    const score = (
      components.ai_overview_presence * 0.30 +
      components.featured_snippet_rate * 0.25 +
      components.knowledge_panel_complete * 0.20 +
      components.zero_click_dominance * 0.15 +
      components.entity_recognition * 0.10
    );

    return {
      score: Math.round(score),
      components,
      sge_appearance_rate: components.ai_overview_presence.toFixed(1) + '%'
    };
  }

  private async simulateSGE(dealer: Dealer) {
    // Simulate Google Search Generative Experience data
    const baseAppearances = dealer.tier === 1 ? 45 : dealer.tier === 2 ? 28 : 15;
    const randomVariance = Math.floor(Math.random() * 20);
    
    return {
      appearances: baseAppearances + randomVariance,
      total_queries: 100 // Simulate 100 queries tested
    };
  }

  private async simulateGSC(dealer: Dealer) {
    // Simulate Google Search Console data
    const baseKeywords = dealer.tier === 1 ? 2500 : dealer.tier === 2 ? 1800 : 1200;
    const baseSnippets = dealer.tier === 1 ? 180 : dealer.tier === 2 ? 95 : 45;
    
    return {
      featured_snippets: baseSnippets + Math.floor(Math.random() * 30),
      total_keywords: baseKeywords + Math.floor(Math.random() * 200),
      impressions: 50000 + Math.floor(Math.random() * 20000),
      clicks: 2500 + Math.floor(Math.random() * 1000)
    };
  }

  private async simulateGMB(dealer: Dealer) {
    // Simulate Google My Business data
    const completeness = dealer.tier === 1 ? 92 : dealer.tier === 2 ? 78 : 65;
    
    return {
      knowledge_panel: {
        name: true,
        address: true,
        phone: true,
        hours: Math.random() > 0.3,
        website: true,
        photos: Math.random() > 0.2,
        description: Math.random() > 0.4
      }
    };
  }

  private async simulateKnowledgeGraph(dealer: Dealer) {
    // Simulate Knowledge Graph entity verification
    const verificationProbability = dealer.tier === 1 ? 0.85 : dealer.tier === 2 ? 0.65 : 0.35;
    
    return {
      entity_verified: Math.random() < verificationProbability
    };
  }

  private assessPanelCompleteness(panel: any): number {
    const fields = ['name', 'address', 'phone', 'hours', 'website', 'photos', 'description'];
    const completed = fields.filter(f => panel[f]).length;
    return (completed / fields.length) * 100;
  }

  private calculateZeroClick(gsc: any): number {
    const totalImpressions = gsc.impressions;
    const totalClicks = gsc.clicks;
    const zeroClickRate = 1 - (totalClicks / totalImpressions);
    // Higher zero-click = worse for traditional SEO but better for AI visibility
    return zeroClickRate * 100;
  }
}
