// lib/geo/fix-generator.ts

import { GEOTestResult, GEOFix } from './types';

export class GEOFixGenerator {
  /**
   * Generate fixes based on test results
   */
  static generateFixes(
    results: GEOTestResult[],
    winningPhrases: string[]
  ): GEOFix[] {
    const fixes: GEOFix[] = [];
    const notNamedResults = results.filter(r => !r.dealership_named);

    // Group by fix type
    const needsTitle = notNamedResults.filter(r => 
      r.prompt.includes('best') || r.prompt.includes('near')
    );
    const needsFAQ = notNamedResults.filter(r =>
      r.prompt.includes('how') || r.prompt.includes('what') || r.prompt.includes('when')
    );
    const needsSchema = notNamedResults.filter(r =>
      r.surface_type === 'ai_overview'
    );
    const needsGBPPost = notNamedResults.filter(r =>
      r.surface_type === 'maps_3pack'
    );

    // Generate title fixes
    if (needsTitle.length > 0 && winningPhrases.length > 0) {
      const winningPhrase = winningPhrases[0];
      fixes.push({
        id: `fix_${Date.now()}_title`,
        test_result_id: needsTitle[0].id,
        fix_type: 'title',
        priority: needsTitle.length >= 5 ? 'high' : 'medium',
        status: 'pending' as const,
        generated_content: `Title: "${winningPhrase} - Your Dealership Name"`,
      });
    }

    // Generate H1 fixes
    if (needsTitle.length > 0) {
      fixes.push({
        id: `fix_${Date.now()}_h1`,
        test_result_id: needsTitle[0].id,
        fix_type: 'h1',
        priority: 'medium',
        status: 'pending' as const,
        generated_content: `H1: Mirror the winning phrasing: "${winningPhrases[0] || 'Service in City'}"`,
      });
    }

    // Generate FAQ fixes
    if (needsFAQ.length > 0) {
      const faqPrompts = needsFAQ.map(r => r.prompt);
      fixes.push({
        id: `fix_${Date.now()}_faq`,
        test_result_id: needsFAQ[0].id,
        fix_type: 'faq',
        priority: 'high',
        status: 'pending' as const,
        generated_content: `FAQs: ${faqPrompts.slice(0, 3).map(p => `"${p}"`).join(', ')}`,
      });
    }

    // Generate schema fixes
    if (needsSchema.length > 0) {
      fixes.push({
        id: `fix_${Date.now()}_schema`,
        test_result_id: needsSchema[0].id,
        fix_type: 'schema',
        priority: 'high',
        status: 'pending' as const,
        generated_content: 'Add LocalBusiness schema with service areas and hours',
      });
    }

    // Generate GBP post fixes
    if (needsGBPPost.length > 0) {
      fixes.push({
        id: `fix_${Date.now()}_gbp_post`,
        test_result_id: needsGBPPost[0].id,
        fix_type: 'gbp_post',
        priority: 'medium',
        status: 'pending' as const,
        generated_content: `Create GBP post: "${winningPhrases[0] || 'Special offer this week'}"`,
      });
    }

    // Generate receipts block fix
    if (notNamedResults.length >= 3) {
      fixes.push({
        id: `fix_${Date.now()}_receipts`,
        test_result_id: notNamedResults[0].id,
        fix_type: 'receipts_block',
        priority: 'low',
        status: 'pending' as const,
        generated_content: 'Add Receipts block: Last updated, author credentials, references',
      });
    }

    return fixes;
  }

  /**
   * Extract winning phrases from competitor results
   */
  static extractWinningPhrases(results: GEOTestResult[]): string[] {
    const competitorPhrases: string[] = [];
    
    results.forEach(result => {
      if (result.competitor_named && result.prompt) {
        // Extract key phrases from prompts where competitors won
        const words = result.prompt.split(' ');
        competitorPhrases.push(words.slice(0, 3).join(' ')); // First 3 words
      }
    });

    // Return unique phrases
    return Array.from(new Set(competitorPhrases));
  }
}
