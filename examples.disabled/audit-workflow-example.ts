/**
 * COMPLETE AUDIT WORKFLOW EXAMPLE
 *
 * This file demonstrates the exact 4-step workflow you requested.
 * Copy this code into your components to run the complete audit process.
 */

import { trpc } from '@/lib/trpc-client';

/**
 * Example 1: Run complete workflow in a React component
 */
export function useCompleteAuditWorkflow() {
  const runCompleteWorkflow = async (dealershipId: string, website: string) => {
    console.log('🚀 Starting Complete Audit Workflow...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // ============================================
      // STEP 1: Run Audit (uses real scoring engine)
      // ============================================
      console.log('\n🔍 STEP 1: Running AI Visibility Audit...');
      console.log('   → Calling scoring engine with 5 modules:');
      console.log('     • AI Visibility (ChatGPT, Claude, etc.)');
      console.log('     • SGP Integrity (Schema markup)');
      console.log('     • Zero-Click (Featured snippets)');
      console.log('     • UGC Health (Reviews, ratings)');
      console.log('     • Geo Trust (Local SEO signals)');

      const audit = await trpc.audit.generate.mutate({
        dealershipId,
        website,
        detailed: true
      });

      console.log('   ✅ Audit Complete!');
      console.log('   → Results:', {
        overall: audit.audit.scores.overall,
        ai_visibility: audit.audit.scores.ai_visibility,
        sgp_integrity: audit.audit.scores.sgp_integrity,
        zero_click: audit.audit.scores.zero_click,
        ugc_health: audit.audit.scores.ugc_health,
        geo_trust: audit.audit.scores.geo_trust,
      });
      console.log('   → Stored in database:');
      console.log('     • audits table (id:', audit.audit.id + ')');
      console.log('     • score_history table');
      console.log('     • api_usage table (cost tracking)');

      // ============================================
      // STEP 2: Generate Recommendations
      // ============================================
      console.log('\n💡 STEP 2: Generating Recommendations...');
      console.log('   → Analyzing scores to identify improvement areas');

      const recs = await trpc.recommendation.generate.mutate({
        dealershipId,
        auditId: audit.audit.id
      });

      console.log(`   ✅ Generated ${recs.length} recommendations`);
      recs.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.title}`);
        console.log(`      Impact: ${rec.impact_score}/10 | Effort: ${rec.effort_level}/10`);
      });
      console.log('   → Stored in recommendations table');

      // ============================================
      // STEP 3: Add Competitors
      // ============================================
      console.log('\n🏆 STEP 3: Analyzing Competitors...');
      console.log('   → Example: Adding a competitor');

      // Example of adding a competitor
      // Uncomment and customize for your use case:
      /*
      const newCompetitor = await trpc.competitor.add.mutate({
        dealershipId,
        competitorName: 'Rival Auto Dealership',
        competitorWebsite: 'https://rivaldealer.com',
        location: 'Naples, FL'
      });
      console.log('   ✅ Competitor added and scored:', newCompetitor.name);
      console.log('      Their score:', newCompetitor.last_score);
      */

      // Get existing competitors
      const competitors = await trpc.competitor.list.query({
        dealershipId
      });

      console.log(`   ✅ Currently tracking ${competitors.length} competitors`);
      competitors.forEach((comp, idx) => {
        console.log(`   ${idx + 1}. ${comp.name} - Score: ${comp.last_score}`);
      });
      console.log('   → Stored in competitors table');

      // ============================================
      // STEP 4: Get Competitive Matrix
      // ============================================
      console.log('\n📊 STEP 4: Building Competitive Matrix...');
      console.log('   → Comparing you vs competitors across all metrics');

      const matrix = await trpc.competitor.getMatrix.query({
        dealershipId
      });

      console.log('   ✅ Competitive Analysis Complete!');
      console.log(`   → Your Rank: #${matrix.yourRank} out of ${matrix.totalCompetitors + 1}`);
      console.log('   → Comparison Matrix:');

      // Display matrix as table
      console.table(
        matrix.matrix.map(d => ({
          Dealership: d.name,
          Type: d.type === 'yours' ? '⭐ YOU' : 'Competitor',
          Overall: d.overall,
          'AI Visibility': d.ai_visibility,
          'Zero-Click': d.zero_click,
          'UGC Health': d.ugc_health,
        }))
      );

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 WORKFLOW COMPLETE!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return {
        audit,
        recommendations: recs,
        competitors,
        matrix
      };

    } catch (error) {
      console.error('❌ Workflow failed:', error);
      throw error;
    }
  };

  return { runCompleteWorkflow };
}

/**
 * Example 2: React Component Usage
 */
export function AuditWorkflowButton({ dealershipId, website }: { dealershipId: string; website: string }) {
  const { runCompleteWorkflow } = useCompleteAuditWorkflow();
  const [isRunning, setIsRunning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleClick = async () => {
    setIsRunning(true);
    try {
      const result = await runCompleteWorkflow(dealershipId, website);
      setResult(result);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isRunning}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isRunning ? 'Running Workflow...' : 'Run Complete Audit'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <h3 className="font-bold">Workflow Complete! ✅</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Audit Score: {result.audit.audit.scores.overall}</li>
            <li>• Recommendations: {result.recommendations.length}</li>
            <li>• Competitors: {result.competitors.length}</li>
            <li>• Your Rank: #{result.matrix.yourRank}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Individual Step Usage
 */
export function useIndividualSteps() {
  // Step 1: Run just the audit
  const runAuditOnly = async (dealershipId: string, website: string) => {
    const audit = await trpc.audit.generate.mutate({
      dealershipId,
      website,
      detailed: true
    });
    return audit;
  };

  // Step 2: Generate recommendations from existing audit
  const generateRecommendations = async (dealershipId: string, auditId?: string) => {
    const recs = await trpc.recommendation.generate.mutate({
      dealershipId,
      auditId // Optional - uses latest audit if not provided
    });
    return recs;
  };

  // Step 3: Add a single competitor
  const addCompetitor = async (
    dealershipId: string,
    competitorName: string,
    competitorWebsite: string
  ) => {
    const competitor = await trpc.competitor.add.mutate({
      dealershipId,
      competitorName,
      competitorWebsite
    });
    return competitor;
  };

  // Step 4: Get competitive matrix
  const getMatrix = async (dealershipId: string) => {
    const matrix = await trpc.competitor.getMatrix.query({
      dealershipId
    });
    return matrix;
  };

  return {
    runAuditOnly,
    generateRecommendations,
    addCompetitor,
    getMatrix
  };
}

/**
 * Example 4: Query Results (Read-only operations)
 */
export function useAuditQueries(dealershipId: string) {
  // Get latest audit
  const { data: audits } = trpc.audit.list.useQuery({
    dealershipId,
    limit: 1
  });

  // Get score history for charts
  const { data: scoreHistory } = trpc.audit.getScoreHistory.useQuery({
    dealershipId,
    limit: 30
  });

  // Get recommendations
  const { data: recommendations } = trpc.recommendation.list.useQuery({
    dealershipId,
    status: 'pending'
  });

  // Get competitors
  const { data: competitors } = trpc.competitor.list.useQuery({
    dealershipId
  });

  // Get competitive matrix
  const { data: matrix } = trpc.competitor.getMatrix.useQuery({
    dealershipId
  });

  return {
    latestAudit: audits?.audits[0],
    scoreHistory,
    recommendations,
    competitors,
    matrix
  };
}

/**
 * Example 5: TypeScript Types
 *
 * These are automatically inferred from your tRPC router!
 */

// Audit result type
type AuditResult = Awaited<ReturnType<typeof trpc.audit.generate.mutate>>;

// Recommendation type
type Recommendation = Awaited<ReturnType<typeof trpc.recommendation.list.query>>[number];

// Competitor type
type Competitor = Awaited<ReturnType<typeof trpc.competitor.list.query>>[number];

// Matrix type
type CompetitorMatrix = Awaited<ReturnType<typeof trpc.competitor.getMatrix.query>>;

/**
 * Example 6: Error Handling
 */
export function useWorkflowWithErrorHandling() {
  const runWithErrorHandling = async (dealershipId: string, website: string) => {
    try {
      // Step 1: Audit
      const audit = await trpc.audit.generate.mutate({
        dealershipId,
        website,
        detailed: true
      });

      // Step 2: Recommendations (continue even if this fails)
      try {
        await trpc.recommendation.generate.mutate({
          dealershipId,
          auditId: audit.audit.id
        });
      } catch (error) {
        console.warn('Recommendations generation failed, but continuing:', error);
      }

      // Step 3: Competitors (continue even if this fails)
      try {
        await trpc.competitor.list.query({ dealershipId });
      } catch (error) {
        console.warn('Competitor analysis failed, but continuing:', error);
      }

      return { success: true, audit };

    } catch (error) {
      console.error('Critical failure in audit workflow:', error);
      return { success: false, error };
    }
  };

  return { runWithErrorHandling };
}
