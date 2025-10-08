'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * TEST AUDIT PAGE
 * Access at: http://localhost:3001/test-audit
 *
 * This page lets you test the complete audit workflow without needing a dealership ID
 */
export default function TestAuditPage() {
  const [dealershipId, setDealershipId] = useState('');
  const [website, setWebsite] = useState('https://naplesautomall.com');
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * COMPLETE WORKFLOW - All 4 Steps
   */
  const runCompleteWorkflow = async () => {
    if (!dealershipId || !website) {
      setError('Please enter both Dealership ID and Website');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      // ============================================
      // STEP 1: Run Audit
      // ============================================
      setCurrentStep('🔍 Step 1/4: Running AI Visibility Audit...');
      console.log('🔍 STEP 1: Starting audit for', website);

      const audit = await trpc.audit.generate.mutate({
        dealershipId,
        website,
        detailed: true
      });

      console.log('✅ Step 1 Complete:', audit);
      setResults((prev: any) => ({ ...prev, audit }));
      await delay(500);

      // ============================================
      // STEP 2: Generate Recommendations
      // ============================================
      setCurrentStep('💡 Step 2/4: Generating Recommendations...');
      console.log('💡 STEP 2: Generating recommendations');

      const recommendations = await trpc.recommendation.generate.mutate({
        dealershipId,
        auditId: audit.audit.id
      });

      console.log('✅ Step 2 Complete:', recommendations);
      setResults((prev: any) => ({ ...prev, recommendations }));
      await delay(500);

      // ============================================
      // STEP 3: Get Competitors
      // ============================================
      setCurrentStep('🏆 Step 3/4: Analyzing Competitors...');
      console.log('🏆 STEP 3: Getting competitors');

      const competitors = await trpc.competitor.list.query({
        dealershipId
      });

      console.log('✅ Step 3 Complete:', competitors);
      setResults((prev: any) => ({ ...prev, competitors }));
      await delay(500);

      // ============================================
      // STEP 4: Get Competitive Matrix
      // ============================================
      setCurrentStep('📊 Step 4/4: Building Competitive Matrix...');
      console.log('📊 STEP 4: Building matrix');

      const matrix = await trpc.competitor.getMatrix.query({
        dealershipId
      });

      console.log('✅ Step 4 Complete:', matrix);
      setResults((prev: any) => ({ ...prev, matrix }));

      setCurrentStep('✅ Workflow Complete!');

    } catch (err: any) {
      console.error('❌ Workflow Error:', err);
      setError(err.message || 'Workflow failed');
      setCurrentStep('');
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Individual Step Tests
   */
  const testStep1Only = async () => {
    if (!dealershipId || !website) return;

    setIsRunning(true);
    setError(null);
    setCurrentStep('Testing Step 1 only...');

    try {
      const audit = await trpc.audit.generate.mutate({
        dealershipId,
        website,
        detailed: true
      });

      console.log('Audit result:', audit);
      setResults({ audit });
      setCurrentStep('Step 1 complete!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Audit Workflow Test Page
          </h1>
          <p className="text-gray-600">
            Test the complete 4-step audit workflow or individual steps
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealership ID
              </label>
              <input
                type="text"
                value={dealershipId}
                onChange={(e) => setDealershipId(e.target.value)}
                placeholder="e.g., 22222222-2222-2222-2222-222222222222"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Get this from your database's dealership_data table
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://dealership.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={runCompleteWorkflow}
              disabled={isRunning || !dealershipId || !website}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isRunning ? '🔄 Running...' : '🚀 Run Complete Workflow (All 4 Steps)'}
            </button>

            <button
              onClick={testStep1Only}
              disabled={isRunning || !dealershipId || !website}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Test Step 1 Only
            </button>
          </div>

          {/* Status */}
          {currentStep && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                {isRunning && (
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
                <span className="text-blue-900 font-medium">{currentStep}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-900 font-medium">❌ Error: {error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Step 1: Audit Results */}
            {results.audit && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>✅</span>
                  <span>Step 1: Audit Results</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ScoreCard
                    label="Overall Score"
                    score={results.audit.audit.scores.overall}
                  />
                  <ScoreCard
                    label="AI Visibility"
                    score={results.audit.audit.scores.ai_visibility}
                  />
                  <ScoreCard
                    label="SGP Integrity"
                    score={results.audit.audit.scores.sgp_integrity}
                  />
                  <ScoreCard
                    label="Zero-Click"
                    score={results.audit.audit.scores.zero_click}
                  />
                  <ScoreCard
                    label="UGC Health"
                    score={results.audit.audit.scores.ugc_health}
                  />
                  <ScoreCard
                    label="Geo Trust"
                    score={results.audit.audit.scores.geo_trust}
                  />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <p className="font-mono text-gray-600">
                    Audit ID: {results.audit.audit.id}
                  </p>
                  <p className="text-gray-500 mt-1">
                    ✅ Stored in: <code>audits</code> + <code>score_history</code> tables
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Recommendations */}
            {results.recommendations && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>💡</span>
                  <span>Step 2: Recommendations</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Generated {results.recommendations.length} recommendations
                </p>
                <div className="space-y-3">
                  {results.recommendations.slice(0, 5).map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Priority: {rec.priority}</span>
                        <span>Impact: {rec.impact_score}/10</span>
                        <span>Effort: {rec.effort_level}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-500">
                  ✅ Stored in: <code>recommendations</code> table
                </div>
              </div>
            )}

            {/* Step 3: Competitors */}
            {results.competitors && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🏆</span>
                  <span>Step 3: Competitors</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Tracking {results.competitors.length} competitors
                </p>
                {results.competitors.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800">
                      No competitors added yet. Use <code>trpc.competitor.add.mutate()</code> to add some!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.competitors.map((comp: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{comp.name}</p>
                          <p className="text-sm text-gray-500">{comp.website}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{comp.last_score}</p>
                          <p className="text-xs text-gray-500">Overall Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-500">
                  ✅ Stored in: <code>competitors</code> table
                </div>
              </div>
            )}

            {/* Step 4: Matrix */}
            {results.matrix && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📊</span>
                  <span>Step 4: Competitive Matrix</span>
                </h3>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                  <p className="text-2xl font-bold text-center">
                    Your Rank: #{results.matrix.yourRank} of {results.matrix.totalCompetitors + 1}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-2">Dealership</th>
                        <th className="text-center p-2">Overall</th>
                        <th className="text-center p-2">AI</th>
                        <th className="text-center p-2">Zero-Click</th>
                        <th className="text-center p-2">UGC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.matrix.matrix.map((dealer: any, idx: number) => (
                        <tr
                          key={idx}
                          className={dealer.type === 'yours' ? 'bg-blue-50 font-bold' : ''}
                        >
                          <td className="p-2">
                            {dealer.name} {dealer.type === 'yours' && '⭐'}
                          </td>
                          <td className="text-center p-2">{dealer.overall}</td>
                          <td className="text-center p-2">{dealer.ai_visibility}</td>
                          <td className="text-center p-2">{dealer.zero_click}</td>
                          <td className="text-center p-2">{dealer.ugc_health}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Setup Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-bold mb-3">📝 Quick Setup</h3>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">1. Create test dealership in Supabase:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`INSERT INTO dealership_data (
  tenant_id, name, website, domain, location
) VALUES (
  'your-tenant-id',
  'Test Dealership',
  'https://testdealer.com',
  'testdealer.com',
  'Naples, FL'
) RETURNING id;`}
            </pre>
            <p className="font-semibold mt-4">2. Copy the returned ID and paste it above</p>
            <p className="font-semibold mt-4">3. Click "Run Complete Workflow"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  const bgColor = {
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  }[color];
  const textColor = {
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    red: 'text-red-800',
  }[color];

  return (
    <div className={`p-4 rounded-lg border-2 ${bgColor}`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{score}</p>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
