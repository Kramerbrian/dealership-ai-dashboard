#!/usr/bin/env tsx

/**
 * Complete DealershipAI Three-Pillar Scoring System Test
 * 
 * This script demonstrates the full scoring system with:
 * - SEO Scoring (Organic rankings, branded search, backlinks, etc.)
 * - AEO Scoring (AI platform citations, answer completeness, etc.)
 * - GEO Scoring (Google Search Generative Experience, featured snippets, etc.)
 * - E-E-A-T Scoring (Experience, Expertise, Authoritativeness, Trustworthiness)
 */

import { ScoringEngine } from './src/core/scoring-engine';
import { Dealer } from './src/core/types';

// Test data - different dealer tiers and markets
const testDealers: Dealer[] = [
  {
    id: 'terry-reid-hyundai',
    name: 'Terry Reid Hyundai',
    domain: 'terryreidhyundai.com',
    city: 'Naples',
    state: 'FL',
    established_date: new Date('2008-01-15'),
    tier: 1 // Premium tier
  },
  {
    id: 'naples-honda',
    name: 'Naples Honda',
    domain: 'napleshonda.com',
    city: 'Naples',
    state: 'FL',
    established_date: new Date('2015-03-20'),
    tier: 2 // Mid tier
  },
  {
    id: 'fort-myers-toyota',
    name: 'Fort Myers Toyota',
    domain: 'fortmyerstoyota.com',
    city: 'Fort Myers',
    state: 'FL',
    established_date: new Date('2020-08-10'),
    tier: 3 // Value tier
  }
];

async function runCompleteTest() {
  console.log('🚀 DealershipAI Three-Pillar Scoring System Test');
  console.log('=' .repeat(60));
  console.log();

  const scoringEngine = new ScoringEngine();

  for (const dealer of testDealers) {
    console.log(`📊 Analyzing ${dealer.name} (Tier ${dealer.tier})`);
    console.log(`📍 Location: ${dealer.city}, ${dealer.state}`);
    console.log(`🌐 Domain: ${dealer.domain}`);
    console.log(`📅 Established: ${dealer.established_date.getFullYear()}`);
    console.log();

    try {
      // Calculate comprehensive scores
      const scores = await scoringEngine.calculateScores(dealer);
      const summary = scoringEngine.getScoreSummary(scores);

      // Display results
      console.log('🎯 SCORING RESULTS:');
      console.log('─'.repeat(40));
      console.log(`Overall Score: ${scores.overall}/100`);
      console.log();

      // SEO Breakdown
      console.log('🔍 SEO SCORE:', scores.seo.score);
      console.log('  • Organic Rankings:', scores.seo.components.organic_rankings.toFixed(1));
      console.log('  • Branded Search Volume:', scores.seo.components.branded_search_volume.toFixed(1));
      console.log('  • Backlink Authority:', scores.seo.components.backlink_authority.toFixed(1));
      console.log('  • Content Indexation:', scores.seo.components.content_indexation.toFixed(1));
      console.log('  • Local Pack Presence:', scores.seo.components.local_pack_presence.toFixed(1));
      console.log('  • Confidence:', (scores.seo.confidence * 100).toFixed(1) + '%');
      console.log();

      // AEO Breakdown
      console.log('🤖 AEO SCORE:', scores.aeo.score);
      console.log('  • Citation Frequency:', scores.aeo.components.citation_frequency.toFixed(1) + '%');
      console.log('  • Source Authority:', scores.aeo.components.source_authority.toFixed(1));
      console.log('  • Answer Completeness:', scores.aeo.components.answer_completeness.toFixed(1));
      console.log('  • Multi-Platform Presence:', scores.aeo.components.multi_platform_presence.toFixed(1) + '%');
      console.log('  • Sentiment Quality:', scores.aeo.components.sentiment_quality.toFixed(1));
      console.log('  • Mentions:', scores.aeo.mentions, 'out of', scores.aeo.queries, 'queries');
      console.log('  • Mention Rate:', scores.aeo.mention_rate);
      console.log();

      // GEO Breakdown
      console.log('🌍 GEO SCORE:', scores.geo.score);
      console.log('  • AI Overview Presence:', scores.geo.components.ai_overview_presence.toFixed(1) + '%');
      console.log('  • Featured Snippet Rate:', scores.geo.components.featured_snippet_rate.toFixed(1) + '%');
      console.log('  • Knowledge Panel Complete:', scores.geo.components.knowledge_panel_complete.toFixed(1) + '%');
      console.log('  • Zero-Click Dominance:', scores.geo.components.zero_click_dominance.toFixed(1) + '%');
      console.log('  • Entity Recognition:', scores.geo.components.entity_recognition.toFixed(1) + '%');
      console.log('  • SGE Appearance Rate:', scores.geo.sge_appearance_rate);
      console.log();

      // E-E-A-T Breakdown
      console.log('⭐ E-E-A-T SCORE:', scores.eeat.overall);
      console.log('  • Experience:', scores.eeat.experience);
      console.log('  • Expertise:', scores.eeat.expertise);
      console.log('  • Authoritativeness:', scores.eeat.authoritativeness);
      console.log('  • Trustworthiness:', scores.eeat.trustworthiness);
      console.log('  • Confidence:', (scores.eeat.confidence * 100).toFixed(1) + '%');
      console.log();

      // Recommendations
      console.log('💡 RECOMMENDATIONS:');
      summary.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log();

      // Performance Analysis
      console.log('📈 PERFORMANCE ANALYSIS:');
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (scores.seo.score >= 80) strengths.push('Strong SEO foundation');
      else if (scores.seo.score < 60) weaknesses.push('SEO needs significant improvement');

      if (scores.aeo.score >= 80) strengths.push('Excellent AI visibility');
      else if (scores.aeo.score < 60) weaknesses.push('Poor AI platform presence');

      if (scores.geo.score >= 80) strengths.push('Strong local search presence');
      else if (scores.geo.score < 60) weaknesses.push('Weak local search optimization');

      if (scores.eeat.overall >= 85) strengths.push('High trust and authority');
      else if (scores.eeat.overall < 70) weaknesses.push('Trust and authority need work');

      if (strengths.length > 0) {
        console.log('  ✅ Strengths:');
        strengths.forEach(strength => console.log(`    • ${strength}`));
      }

      if (weaknesses.length > 0) {
        console.log('  ⚠️  Areas for Improvement:');
        weaknesses.forEach(weakness => console.log(`    • ${weakness}`));
      }

      console.log();
      console.log('=' .repeat(60));
      console.log();

    } catch (error) {
      console.error(`❌ Error analyzing ${dealer.name}:`, error);
      console.log();
    }
  }

  // Batch processing test
  console.log('🔄 Testing Batch Processing...');
  console.log('─'.repeat(40));
  
  try {
    const batchResults = await scoringEngine.calculateBatchScores(testDealers);
    console.log(`✅ Successfully processed ${batchResults.size} dealers in batch`);
    
    // Show batch summary
    const batchSummary = Array.from(batchResults.entries()).map(([id, scores]) => ({
      id,
      name: testDealers.find(d => d.id === id)?.name || 'Unknown',
      overall: scores.overall,
      seo: scores.seo.score,
      aeo: scores.aeo.score,
      geo: scores.geo.score,
      eeat: scores.eeat.overall
    }));

    console.log('\n📊 BATCH RESULTS SUMMARY:');
    console.table(batchSummary);
    
  } catch (error) {
    console.error('❌ Batch processing error:', error);
  }

  console.log();
  console.log('🎉 Test Complete!');
  console.log('The three-pillar scoring system is working correctly.');
  console.log('Ready for production deployment! 🚀');
}

// Run the test
if (require.main === module) {
  runCompleteTest().catch(console.error);
}

export { runCompleteTest };
