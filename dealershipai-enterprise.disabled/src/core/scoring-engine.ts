import { Dealer, ThreePillarScores } from './types';
import { SEOScorer } from './scorers/seo-scorer';
import { AEOScorer } from './scorers/aeo-scorer';
import { GEOScorer } from './scorers/geo-scorer';
import { EEATModel } from './scorers/eeat-model';

export class ScoringEngine {
  private seoScorer: SEOScorer;
  private aeoScorer: AEOScorer;
  private geoScorer: GEOScorer;
  private eeatModel: EEATModel;

  constructor() {
    this.seoScorer = new SEOScorer();
    this.aeoScorer = new AEOScorer();
    this.geoScorer = new GEOScorer();
    this.eeatModel = new EEATModel();
  }

  async calculateScores(dealer: Dealer): Promise<ThreePillarScores> {
    console.log(`🔍 Calculating scores for ${dealer.name}...`);

    // Run all scoring modules in parallel for efficiency
    const [seo, aeo, geo, eeat] = await Promise.all([
      this.seoScorer.calculateScore(dealer),
      this.aeoScorer.calculateScore(dealer),
      this.geoScorer.calculateScore(dealer),
      this.eeatModel.calculateScores(dealer)
    ]);

    // Calculate weighted overall score
    // SEO: 30%, AEO: 35%, GEO: 35% (as per your specification)
    const overall = (
      seo.score * 0.30 +
      aeo.score * 0.35 +
      geo.score * 0.35
    );

    const scores: ThreePillarScores = {
      seo,
      aeo,
      geo,
      eeat,
      overall: Math.round(overall),
      last_updated: new Date()
    };

    console.log(`✅ Scores calculated for ${dealer.name}:`, {
      overall: scores.overall,
      seo: seo.score,
      aeo: aeo.score,
      geo: geo.score,
      eeat: eeat.overall
    });

    return scores;
  }

  async calculateBatchScores(dealers: Dealer[]): Promise<Map<string, ThreePillarScores>> {
    console.log(`🚀 Calculating batch scores for ${dealers.length} dealers...`);
    
    const results = new Map<string, ThreePillarScores>();
    
    // Process in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < dealers.length; i += batchSize) {
      const batch = dealers.slice(i, i + batchSize);
      const batchPromises = batch.map(async (dealer) => {
        try {
          const scores = await this.calculateScores(dealer);
          return { dealerId: dealer.id, scores };
        } catch (error) {
          console.error(`❌ Failed to calculate scores for ${dealer.name}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result) {
          results.set(result.dealerId, result.scores);
        }
      });

      // Add delay between batches to be respectful to APIs
      if (i + batchSize < dealers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Batch scoring complete: ${results.size}/${dealers.length} successful`);
    return results;
  }

  // Utility method to get score summary
  getScoreSummary(scores: ThreePillarScores): {
    overall: number;
    breakdown: {
      seo: { score: number; grade: string };
      aeo: { score: number; grade: string };
      geo: { score: number; grade: string };
      eeat: { score: number; grade: string };
    };
    recommendations: string[];
  } {
    const getGrade = (score: number): string => {
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C+';
      return 'C';
    };

    const breakdown = {
      seo: { score: scores.seo.score, grade: getGrade(scores.seo.score) },
      aeo: { score: scores.aeo.score, grade: getGrade(scores.aeo.score) },
      geo: { score: scores.geo.score, grade: getGrade(scores.geo.score) },
      eeat: { score: scores.eeat.overall, grade: getGrade(scores.eeat.overall) }
    };

    const recommendations = this.generateRecommendations(scores);

    return {
      overall: scores.overall,
      breakdown,
      recommendations
    };
  }

  private generateRecommendations(scores: ThreePillarScores): string[] {
    const recommendations: string[] = [];

    if (scores.seo.score < 70) {
      recommendations.push('Improve SEO: Focus on organic rankings and local pack presence');
    }

    if (scores.aeo.score < 70) {
      recommendations.push('Boost AEO: Increase AI platform citations and improve answer completeness');
    }

    if (scores.geo.score < 70) {
      recommendations.push('Enhance GEO: Optimize for Google Search Generative Experience and featured snippets');
    }

    if (scores.eeat.overall < 70) {
      recommendations.push('Strengthen E-E-A-T: Build authority through reviews, certifications, and content');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent performance across all pillars! Maintain current strategies.');
    }

    return recommendations;
  }
}
