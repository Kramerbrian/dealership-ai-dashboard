import { supabase } from '../database/supabase';
import { config } from '../config/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: config.ai.openaiApiKey,
});

export interface AnalysisResult {
  id: string;
  dealershipUrl: string;
  aiVisibilityScore: number;
  results: {
    seo: any;
    performance: any;
    accessibility: any;
    recommendations: string[];
  };
  isPremium: boolean;
  createdAt: string;
}

export class AnalyticsService {
  async analyzeDealership(dealershipUrl: string, userId: string): Promise<AnalysisResult> {
    try {
      // Check if user has active subscription for premium features
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .single();

      const isPremium = subscription?.status === 'active';

      // Perform basic analysis (always available)
      const basicAnalysis = await this.performBasicAnalysis(dealershipUrl);
      
      // Perform premium analysis if user has active subscription
      let premiumAnalysis: any = null;
      if (isPremium) {
        premiumAnalysis = await this.performPremiumAnalysis(dealershipUrl);
      }

      // Save analysis to database
      const { data: analysis, error } = await supabase
        .from('analyses')
        .insert({
          user_id: userId,
          dealership_url: dealershipUrl,
          ai_visibility_score: basicAnalysis.visibilityScore,
          results: {
            basic: basicAnalysis,
            premium: premiumAnalysis,
          },
          is_premium: isPremium,
          unlocked_at: isPremium ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: analysis.id,
        dealershipUrl: analysis.dealership_url,
        aiVisibilityScore: analysis.ai_visibility_score || 0,
        results: {
          seo: basicAnalysis.seo,
          performance: basicAnalysis.performance,
          accessibility: basicAnalysis.accessibility,
          recommendations: basicAnalysis.recommendations,
        },
        isPremium: analysis.is_premium,
        createdAt: analysis.created_at,
      };
    } catch (error) {
      console.error('Error analyzing dealership:', error);
      throw new Error('Failed to analyze dealership');
    }
  }

  private async performBasicAnalysis(dealershipUrl: string) {
    // This would integrate with actual analysis tools
    // For now, returning mock data
    return {
      visibilityScore: Math.floor(Math.random() * 100),
      seo: {
        title: 'Good',
        metaDescription: 'Needs improvement',
        headings: 'Excellent',
      },
      performance: {
        loadTime: '2.3s',
        score: 85,
      },
      accessibility: {
        score: 78,
        issues: ['Missing alt text on 3 images'],
      },
      recommendations: [
        'Improve meta descriptions',
        'Add alt text to images',
        'Optimize images for faster loading',
      ],
    };
  }

  private async performPremiumAnalysis(dealershipUrl: string) {
    // This would perform more detailed analysis using AI
    try {
      const prompt = `Analyze the dealership website at ${dealershipUrl} and provide detailed insights about:
      1. SEO optimization opportunities
      2. User experience improvements
      3. Conversion optimization suggestions
      4. Competitive advantages
      5. Technical recommendations

      Provide specific, actionable recommendations.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert digital marketing consultant specializing in automotive dealership websites.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
      });

      return {
        aiInsights: completion.choices[0]?.message?.content || 'Analysis unavailable',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error performing premium analysis:', error);
      return {
        aiInsights: 'Premium analysis temporarily unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAnalysisHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting analysis history:', error);
      throw new Error('Failed to get analysis history');
    }
  }

  async getAnalysis(analysisId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting analysis:', error);
      throw new Error('Failed to get analysis');
    }
  }

  async getMonthlyScan(scanId: string, userId: string) {
    // Implementation for monthly scan functionality
    // This would be similar to regular analysis but with different scheduling
    throw new Error('Monthly scan functionality not yet implemented');
  }

  async triggerMonthlyScan(dealershipUrl: string, userId: string) {
    // Implementation for triggering monthly scans
    // This would schedule a recurring analysis
    throw new Error('Monthly scan functionality not yet implemented');
  }
}

export const analyticsService = new AnalyticsService();
