'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [dealershipId, setDealershipId] = useState('11111111-1111-1111-1111-111111111111');
  const [website, setWebsite] = useState('https://naplesautomall.com');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'appraisal' | 'competitor' | 'market'>('audit');

  const runAudit = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/trpc/audit.generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId,
          website,
          detailed: true
        })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Audit failed:', error);
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const runAppraisal = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/trpc/appraisal.analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId,
          dealershipUrl: website,
          dealershipName: 'Naples Auto Mall',
          location: 'Naples, FL'
        })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Appraisal analysis failed:', error);
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const getMarketAnalysis = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/trpc/market.getAnalysis?location=Naples,FL', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Market analysis failed:', error);
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const getCompetitors = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch(`/api/trpc/competitor.list?dealershipId=${dealershipId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Competitor fetch failed:', error);
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Backend admin features for AI analysis</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealership ID
              </label>
              <input
                type="text"
                value={dealershipId}
                onChange={(e) => setDealershipId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="UUID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['audit', 'appraisal', 'competitor', 'market'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'audit' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Full AI Audit</h3>
                <p className="text-gray-600 mb-4">
                  Runs complete 5-module scoring analysis: AI Visibility, SGP Integrity,
                  Zero-Click, UGC Health, and Geo Trust.
                </p>
                <button
                  onClick={runAudit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Running Audit...' : 'Run Full Audit'}
                </button>
              </div>
            )}

            {activeTab === 'appraisal' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Appraisal Penetration Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Analyzes appraisal forms, tests AI platform visibility, and generates
                  recommendations for lead conversion optimization.
                </p>
                <button
                  onClick={runAppraisal}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Analyzing...' : 'Analyze Appraisal Forms'}
                </button>
              </div>
            )}

            {activeTab === 'competitor' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Competitor Analysis</h3>
                <p className="text-gray-600 mb-4">
                  View and manage competitors, compare scores, and get competitive insights.
                </p>
                <button
                  onClick={getCompetitors}
                  disabled={loading}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Loading...' : 'Get Competitors'}
                </button>
              </div>
            )}

            {activeTab === 'market' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Market Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Get market-wide insights, benchmarks, and trends for the Naples, FL area.
                </p>
                <button
                  onClick={getMarketAnalysis}
                  disabled={loading}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Loading...' : 'Get Market Analysis'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 Documentation</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Setup Guides:</strong>
              <ul className="mt-2 space-y-1 text-blue-700">
                <li>• ADMIN_FEATURES_ACTIVATION.md</li>
                <li>• AUDIT_WORKFLOW_SETUP.md</li>
                <li>• APPRAISAL_PENETRATION_GUIDE.md</li>
              </ul>
            </div>
            <div>
              <strong>Test Pages:</strong>
              <ul className="mt-2 space-y-1 text-blue-700">
                <li>• <a href="/test-audit" className="underline">/test-audit</a></li>
                <li>• <a href="/admin" className="underline">/admin</a> (this page)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
