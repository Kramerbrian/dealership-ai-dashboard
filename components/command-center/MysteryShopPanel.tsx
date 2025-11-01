'use client';

/**
 * Mystery Shop Panel Component
 * Integrates Mystery Shop AI agent into Command Center
 */

import React, { useState } from 'react';
import { Play, FileText, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MysteryShopConfig, MysteryShopResult } from '@/lib/agents/mystery-shop';

interface MysteryShopPanelProps {
  dealerId: string;
}

export default function MysteryShopPanel({ dealerId }: MysteryShopPanelProps) {
  const [config, setConfig] = useState<MysteryShopConfig>({
    dealerId,
    scenario: 'full',
    modelCategory: 'mid-market',
    storePersona: 'high-volume'
  });
  const [result, setResult] = useState<MysteryShopResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mystery-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Mystery shop failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Mystery Shop Agent</h3>
          <p className="text-sm text-slate-400">Execute scenario-based customer journey evaluations</p>
        </div>
        <button
          onClick={handleExecute}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 
                     rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
        >
          <Play className="w-4 h-4" />
          {loading ? 'Running...' : 'Execute Shop'}
        </button>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Scenario</label>
          <select
            value={config.scenario}
            onChange={(e) => setConfig({ ...config, scenario: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="greeting">Greeting</option>
            <option value="needs">Needs Assessment</option>
            <option value="demo">Vehicle Demo</option>
            <option value="close">Closing</option>
            <option value="follow-up">Follow-Up</option>
            <option value="full">Full Journey</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Model Category</label>
          <select
            value={config.modelCategory || 'mid-market'}
            onChange={(e) => setConfig({ ...config, modelCategory: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="ev">EV</option>
            <option value="luxury">Luxury</option>
            <option value="mid-market">Mid-Market</option>
            <option value="entry-level">Entry-Level</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Score</span>
              <span className={`text-2xl font-bold ${
                result.scores.overall >= 80 ? 'text-green-400' :
                result.scores.overall >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {result.scores.overall}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  result.scores.overall >= 80 ? 'bg-green-500' :
                  result.scores.overall >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.scores.overall}%` }}
              />
            </div>
          </div>

          {/* Stage Scores */}
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(result.scores)
              .filter(([key]) => key !== 'overall')
              .map(([stage, score]) => (
                <div key={stage} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1 capitalize">{stage}</div>
                  <div className={`text-xl font-bold ${
                    score >= 80 ? 'text-green-400' :
                    score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {score}
                  </div>
                </div>
              ))}
          </div>

          {/* Priority Issues */}
          {result.varianceAnalysis.priorityIssues.length > 0 && (
            <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h4 className="font-medium text-amber-300">Priority Issues</h4>
              </div>
              <div className="space-y-2">
                {result.varianceAnalysis.priorityIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 capitalize">{issue.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">{issue.score}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        issue.impact === 'P0' ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'
                      }`}>
                        {issue.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coaching Recommendations */}
          {result.coachingRecommendations.length > 0 && (
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-blue-300">Coaching Recommendations</h4>
              </div>
              <div className="space-y-3">
                {result.coachingRecommendations.map((rec, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-white capitalize">{rec.stage}</span>
                      <span className="text-green-400 font-semibold">+{rec.expectedLift} pts</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{rec.issue}</p>
                    <p className="text-blue-300 text-xs">{rec.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Evidence</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Shop ID: <code className="text-slate-300">{result.shopId}</code></div>
              <div>Timestamp: {new Date(result.timestamp).toLocaleString()}</div>
              <div>Scenario: {result.scenario}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-8 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Configure options above and click "Execute Shop" to run a mystery shop evaluation.</p>
        </div>
      )}
    </div>
  );
}

