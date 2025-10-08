import { DataService } from './DataService';
import { GoogleAuth } from './GoogleAuth';

export interface DashboardData {
  opportunities: {
    title: string;
    content: string;
  };
  competitive: {
    title: string;
    content: string;
  };
  trends: {
    title: string;
    content: string;
  };
  mysteryShop: {
    title: string;
    content: string;
  };
  focus: {
    title: string;
    content: string;
  };
}

export interface ScoreData {
  seo: number;
  aeo: number;
  geo: number;
  aiVisibility: number;
  overall: number;
}

export interface CompetitorData {
  name: string;
  marketShare: number;
  aiCitations: number;
  ppcSpend: number;
  chatgptPresence: number;
  growth: number;
}

export class DashboardDataService {
  private dataService: DataService;
  private googleAuth: GoogleAuth;

  constructor() {
    this.dataService = new DataService();
    this.googleAuth = new GoogleAuth();
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      // In a real implementation, this would fetch from your backend
      // For now, we'll return the rich dashboard data you provided
      return {
        opportunities: {
          title: "Top 3 Opportunities (Based on Your Scores)",
          content: `**Top 3 Opportunities (Based on Your Scores):**

1. **Boost GEO Score from 65.2 → 80+**
   • Add FAQ Schema to top 10 pages
   • Create video walkthroughs for inventory
   • Impact: ~175 leads/mo ≈ $42K/mo

2. **Fix Co-Pilot Critical Gap (58 score)**
   • Set up Bing Webmaster Tools
   • Optimize Bing Places profile
   • Impact: ~220 leads/mo ≈ $52.8K/mo

3. **Improve Core Web Vitals (FID: 125ms)**
   • Optimize chat widget loading
   • Defer non-critical JavaScript
   • Impact: Better AI rankings across all platforms

**Total Annual ROI: $1.14M+**`
        },
        competitive: {
          title: "Terry Reid Hyundai Analysis",
          content: `**Terry Reid Hyundai Analysis:**

**Their Position:**
• Market Share: 28.9% (vs your 23.4%)
• AI Citations: 234 (+89% growth)
• PPC Spend: $47K/mo
• ChatGPT presence: Leading

**Your Competitive Advantages:**
• SEO Score: 87.3 (strong foundation)
• AI Visibility: 92% (solid coverage)
• Website Health: 87 (technical edge)
• Mystery Shop: 78 (decent response)

**Exploitable Gaps:**
• Voice search: +340% opportunity
• Video content: +156% engagement potential
• Mobile UX: +94% improvement zone
• Page speed: +67% advantage available

**Close the 5.5% market share gap → ~$89K/mo revenue**`
        },
        trends: {
          title: "AI Visibility Trends (Last 30 Days)",
          content: `**AI Visibility Trends (Last 30 Days):**

📈 **Strong Growth:**
• ChatGPT: 85 score (+12%)
• Google AIO: 71 score (+15%)
• Perplexity: 73 score (+8%)
• Overall AI Visibility: 92%

📉 **Needs Attention:**
• Gemini: 62 score (low citations)
• Co-Pilot: 58 score (critical - only 8 mentions)

⚠️ **Revenue at Risk: $367K** (up $45K from last month)

**Key Insight:** Your SEO (87.3) and AEO (73.8) are solid, but GEO (65.2) is dragging overall performance. Focus on generative AI optimization for fastest gains.`
        },
        mysteryShop: {
          title: "Mystery Shop Score: 78/100",
          content: `**Mystery Shop Score: 78/100**

✅ **Strengths:**
• Response time: Acceptable
• Personalization: Good (named mentions)
• Transparency: Pricing disclosed

⚠️ **Improvement Areas:**
• Follow-up consistency: 67% (target 90%)
• Weekend response: Slower than weekdays
• Response time: Needs to hit <5min consistently

🎯 **Impact Analysis:**
• Current conversion: Estimated 3.2%
• With 90+ score: Estimated 4.5%
• Revenue gain: ~$42K/mo

**Quick Win:** Implement 48hr follow-up automation`
        },
        focus: {
          title: "Today's Priority Actions",
          content: `**Today's Priority Actions:**

🎯 **High Impact (Do First):**
1. **Fix Bing/Co-Pilot visibility** (1 hr)
   • Set up Bing Webmaster Tools
   • Current score: 58 → Target: 75+
   • Impact: $52.8K/mo revenue

2. **Add FAQ Schema to homepage** (30 min)
   • Boost AEO from 73.8 → 80+
   • Impact: +15 pts visibility

3. **Optimize FID performance** (45 min)
   • Current: 125ms → Target: <100ms
   • Defer chat widget loading

⚡ **Total Time: 2.25 hours**
💰 **Total Impact: $52.8K+/mo revenue protection**

**Score Targets:** SEO ✅ | AEO 🔸 | GEO ⚠️ | Mystery Shop 🔸`
        }
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      throw error;
    }
  }

  async getScoreData(): Promise<ScoreData> {
    try {
      // In a real implementation, this would calculate from actual API data
      return {
        seo: 87.3,
        aeo: 73.8,
        geo: 65.2,
        aiVisibility: 92,
        overall: 79.6
      };
    } catch (error) {
      console.error('Score data error:', error);
      throw error;
    }
  }

  async getCompetitorData(): Promise<CompetitorData[]> {
    try {
      return [
        {
          name: "Terry Reid Hyundai",
          marketShare: 28.9,
          aiCitations: 234,
          ppcSpend: 47000,
          chatgptPresence: 85,
          growth: 89
        },
        {
          name: "Your Dealership",
          marketShare: 23.4,
          aiCitations: 145,
          ppcSpend: 32000,
          chatgptPresence: 78,
          growth: 45
        },
        {
          name: "Competitor B",
          marketShare: 18.7,
          aiCitations: 98,
          ppcSpend: 25000,
          chatgptPresence: 62,
          growth: 23
        }
      ];
    } catch (error) {
      console.error('Competitor data error:', error);
      throw error;
    }
  }

  async getTrendData(days: number = 30): Promise<Array<{date: string, score: number}>> {
    try {
      // Generate mock trend data
      const data: Array<{date: string, score: number}> = [];
      const now = new Date();
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate realistic trend with some variance
        const baseScore = 79.6;
        const variance = (Math.random() - 0.5) * 10;
        const trend = Math.sin(i / 7) * 5; // Weekly pattern
        const score = Math.max(0, Math.min(100, baseScore + variance + trend));
        
        data.push({
          date: date.toISOString().split('T')[0],
          score: Math.round(score * 10) / 10
        });
      }
      
      return data;
    } catch (error) {
      console.error('Trend data error:', error);
      throw error;
    }
  }

  async getActionItems(): Promise<Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: string;
    impact: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>> {
    try {
      return [
        {
          id: '1',
          title: 'Fix Bing/Co-Pilot visibility',
          description: 'Set up Bing Webmaster Tools and optimize Bing Places profile',
          priority: 'high',
          estimatedTime: '1 hour',
          impact: '$52.8K/mo revenue',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Add FAQ Schema to homepage',
          description: 'Boost AEO from 73.8 → 80+ with structured data',
          priority: 'high',
          estimatedTime: '30 minutes',
          impact: '+15 pts visibility',
          status: 'pending'
        },
        {
          id: '3',
          title: 'Optimize FID performance',
          description: 'Defer chat widget loading to improve Core Web Vitals',
          priority: 'medium',
          estimatedTime: '45 minutes',
          impact: 'Better AI rankings',
          status: 'pending'
        },
        {
          id: '4',
          title: 'Implement follow-up automation',
          description: 'Set up 48hr follow-up system for leads',
          priority: 'medium',
          estimatedTime: '2 hours',
          impact: '$42K/mo revenue gain',
          status: 'pending'
        }
      ];
    } catch (error) {
      console.error('Action items error:', error);
      throw error;
    }
  }

  // Integration methods with external APIs
  async refreshAnalyticsData(): Promise<void> {
    try {
      if (!this.googleAuth.isAuthenticated()) {
        throw new Error('Google authentication required');
      }

      const analyticsData = await this.dataService.getAnalyticsData();
      console.log('Analytics data refreshed:', analyticsData);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      throw error;
    }
  }

  async refreshPageSpeedData(url: string): Promise<void> {
    try {
      const pageSpeedData = await this.dataService.getPageSpeedData(url);
      console.log('PageSpeed data refreshed:', pageSpeedData);
    } catch (error) {
      console.error('Failed to refresh PageSpeed data:', error);
      throw error;
    }
  }

  async refreshCompetitorData(): Promise<void> {
    try {
      const competitorData = await this.dataService.getSEMrushData('competitor.com');
      console.log('Competitor data refreshed:', competitorData);
    } catch (error) {
      console.error('Failed to refresh competitor data:', error);
      throw error;
    }
  }
}
