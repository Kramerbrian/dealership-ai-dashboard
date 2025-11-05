// components/dashboard/GEOTestCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, TrendingUp, AlertCircle, CheckCircle, Clock, Download, Play } from 'lucide-react';
import { GEOPromptGenerator } from '@/lib/geo/prompt-generator';

interface GEOTestResult {
  id: string;
  prompt: string;
  dealership_named: boolean;
  competitor_named?: string;
  surface_type: 'ai_overview' | 'maps_3pack' | 'perplexity' | 'chatgpt';
  tested_at: string;
}

interface GEOScore {
  prompts_tested: number;
  named_count: number;
  geo_score: number;
  citation_mix: number;
  answer_surface_mix: number;
}

export function GEOTestCard() {
  const [city, setCity] = useState('Naples');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [results, setResults] = useState<GEOTestResult[]>([]);
  const [score, setScore] = useState<GEOScore | null>(null);
  const [testing, setTesting] = useState(false);
  const [fixes, setFixes] = useState<any[]>([]);

  // Generate prompts
  const generatePrompts = () => {
    const generated = GEOPromptGenerator.generateWeeklyPrompts(city);
    setPrompts(generated);
  };

  // Run GEO tests
  const runTests = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/geo/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts, city }),
      });
      const data = await response.json();
      setResults(data.results || []);
      setScore(data.score || null);
      setFixes(data.fixes || []);
    } catch (error) {
      console.error('GEO test error:', error);
    } finally {
      setTesting(false);
    }
  };

  // Load existing results
  useEffect(() => {
    fetch('/api/geo/results?city=' + encodeURIComponent(city))
      .then(r => r.json())
      .then(data => {
        setResults(data.results || []);
        setScore(data.score || null);
      })
      .catch(() => {});
  }, [city]);

  const geoScore = score?.geo_score || 0;
  const namedCount = score?.named_count || 0;
  const totalTested = score?.prompts_tested || prompts.length || 16;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                    dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                GEO Test & Zero-Click Visibility
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test AI visibility for local search queries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Naples"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generatePrompts}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 
                       transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Generate Prompts
            </button>
            <button
              onClick={runTests}
              disabled={testing || prompts.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                       flex items-center gap-2"
            >
              {testing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Tests
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* GEO Score */}
      {score && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r 
                      from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">GEO Score</div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {geoScore}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Named in {namedCount}/{totalTested} prompts
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Citation Mix</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {score.citation_mix}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Surface Mix</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {score.answer_surface_mix}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tests Run</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalTested}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Results
        </h3>
        {results.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No test results yet. Generate prompts and run tests to see results.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border ${
                  result.dealership_named
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {result.dealership_named ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {result.prompt}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Surface: {result.surface_type} • {new Date(result.tested_at).toLocaleDateString()}
                      {result.competitor_named && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          • {result.competitor_named} was named instead
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixes Queue */}
      {fixes.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 
                      dark:bg-yellow-900/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recommended Fixes
          </h3>
          <div className="space-y-2">
            {fixes.map((fix: any) => (
              <div
                key={fix.id}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 
                          dark:border-yellow-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {fix.fix_type === 'title' ? 'Update Page Title' :
                       fix.fix_type === 'h1' ? 'Update H1' :
                       fix.fix_type === 'faq' ? 'Add FAQ' :
                       fix.fix_type === 'schema' ? 'Add Schema Markup' :
                       fix.fix_type === 'gbp_post' ? 'Create GBP Post' :
                       'Add Receipts Block'}
                    </div>
                    {fix.generated_content && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {fix.generated_content.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    fix.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    fix.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {fix.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 
                    dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Weekly cadence: 10-20 prompts, 60-90 minutes
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                            hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 
                            transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Results
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                            transition-colors">
              View Playbook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

