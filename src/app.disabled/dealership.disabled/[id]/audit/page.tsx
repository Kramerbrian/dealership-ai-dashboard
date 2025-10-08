'use client';

import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { useState } from 'react';
import { AuditDashboard } from '@/components/audit/AuditDashboard';

/**
 * Complete Audit Workflow Page
 * Demonstrates all 4 steps of the audit process
 */
export default function AuditPage() {
  const params = useParams();
  const dealershipId = params?.id as string;

  const [isRunningFullWorkflow, setIsRunningFullWorkflow] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<string>('');

  // Get dealership details
  const { data: dealership, isLoading } = trpc.dealership.getById.useQuery({
    id: dealershipId
  });

  /**
   * COMPLETE WORKFLOW: Runs all 4 steps automatically
   */
  const runCompleteWorkflow = async () => {
    if (!dealership) return;

    setIsRunningFullWorkflow(true);
    setWorkflowStatus('Starting complete audit workflow...');

    try {
      // ============================================
      // STEP 1: Run Audit (uses real scoring engine)
      // ============================================
      setWorkflowStatus('🔍 Step 1/4: Running AI Visibility Audit...');

      const audit = await trpc.audit.generate.mutate({
        dealershipId,
        website: dealership.website,
        detailed: true
      });

      console.log('✅ Step 1 Complete - Audit Results:', audit);
      // ↓ Automatically stores in `audits` + `score_history` tables

      setWorkflowStatus(`✅ Audit Complete! Overall Score: ${audit.audit.scores.overall}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ============================================
      // STEP 2: Generate Recommendations
      // ============================================
      setWorkflowStatus('💡 Step 2/4: Generating Recommendations...');

      const recs = await trpc.recommendation.generate.mutate({
        dealershipId,
        auditId: audit.audit.id
      });

      console.log('✅ Step 2 Complete - Recommendations:', recs);
      // ↓ Automatically stores in `recommendations` table

      setWorkflowStatus(`✅ Generated ${recs.length} recommendations`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ============================================
      // STEP 3: Add/Refresh Competitors (Example)
      // ============================================
      setWorkflowStatus('🏆 Step 3/4: Analyzing Competitors...');

      // Example: Add a competitor if you know their website
      // Uncomment and customize this for real competitor tracking:
      /*
      await trpc.competitor.add.mutate({
        dealershipId,
        competitorName: 'Rival Auto Dealership',
        competitorWebsite: 'https://rivaldealer.com',
        location: dealership.location
      });
      */

      // For now, just get existing competitors
      const competitors = await trpc.competitor.list.query({
        dealershipId
      });

      console.log('✅ Step 3 Complete - Competitors:', competitors);
      // ↓ Runs scoring + stores in `competitors` table

      setWorkflowStatus(`✅ Tracking ${competitors.length} competitors`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ============================================
      // STEP 4: Get Competitive Matrix
      // ============================================
      setWorkflowStatus('📊 Step 4/4: Building Competitive Matrix...');

      const matrix = await trpc.competitor.getMatrix.query({
        dealershipId
      });

      console.log('✅ Step 4 Complete - Matrix:', matrix);
      // ↓ Returns you vs competitors comparison across all 5 metrics

      setWorkflowStatus(
        `✅ Complete! You rank #${matrix.yourRank} out of ${matrix.totalCompetitors + 1} dealerships`
      );

      // Show success for 3 seconds then reset
      await new Promise(resolve => setTimeout(resolve, 3000));
      setWorkflowStatus('');

    } catch (error) {
      console.error('❌ Workflow failed:', error);
      setWorkflowStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningFullWorkflow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dealership...</p>
        </div>
      </div>
    );
  }

  if (!dealership) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Dealership Not Found</h1>
          <p className="mt-2 text-gray-600">ID: {dealershipId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workflow Control Panel */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dealership.name}
            </h1>
            <p className="text-sm text-gray-600">{dealership.website}</p>
          </div>

          <div className="flex items-center gap-4">
            {workflowStatus && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                {isRunningFullWorkflow && (
                  <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span className="text-sm font-medium text-blue-900">
                  {workflowStatus}
                </span>
              </div>
            )}

            <button
              onClick={runCompleteWorkflow}
              disabled={isRunningFullWorkflow}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isRunningFullWorkflow ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Running...
                </span>
              ) : (
                '🚀 Run Complete Audit Workflow'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto py-6">
        <AuditDashboard
          dealershipId={dealershipId}
          website={dealership.website}
        />
      </div>

      {/* Workflow Explainer */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 Complete Audit Workflow
          </h2>
          <p className="text-gray-700 mb-6">
            The "Run Complete Audit Workflow" button executes all 4 steps automatically:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <WorkflowStep
              number={1}
              title="Run AI Visibility Audit"
              description="Analyzes your dealership across 5 scoring modules: AI Visibility, SGP Integrity, Zero-Click, UGC Health, and Geo Trust"
              icon="🔍"
              color="blue"
            />

            <WorkflowStep
              number={2}
              title="Generate Recommendations"
              description="Creates actionable recommendations based on your audit scores, prioritized by impact and effort"
              icon="💡"
              color="green"
            />

            <WorkflowStep
              number={3}
              title="Analyze Competitors"
              description="Tracks and scores your competitors to understand your market position"
              icon="🏆"
              color="purple"
            />

            <WorkflowStep
              number={4}
              title="Build Competitive Matrix"
              description="Compares your scores against competitors across all metrics to show your rank"
              icon="📊"
              color="orange"
            />
          </div>

          <div className="mt-8 p-4 bg-white rounded-lg border-2 border-blue-300">
            <h3 className="font-semibold text-gray-900 mb-2">💾 Data Storage</h3>
            <p className="text-sm text-gray-600">
              All results are automatically saved to your Supabase database in the following tables:
            </p>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">audits</code> - Full audit results</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">score_history</code> - Historical score trends</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">recommendations</code> - Actionable insights</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">competitors</code> - Competitor tracking</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">api_usage</code> - Cost tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function WorkflowStep({
  number,
  title,
  description,
  icon,
  color
}: {
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
  }[color] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses} transition-transform hover:scale-105`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-sm font-bold">
              {number}
            </span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}
