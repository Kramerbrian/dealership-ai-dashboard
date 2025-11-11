'use client';

import { useState } from 'react';
import type { ScenarioAction, ScenarioResult } from '@/lib/pulse/scenario';

interface ScenarioBuilderProps {
  dealerId: string;
  onScenarioRun?: (result: ScenarioResult) => void;
}

export function ScenarioBuilder({ dealerId, onScenarioRun }: ScenarioBuilderProps) {
  const [actions, setActions] = useState<ScenarioAction[]>([]);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current signals state (would typically come from props or context)
  const [currentSignals] = useState({
    aiv: 65,
    ati: 72,
    zero_click: 58,
    ugc_health: 80,
    geo_trust: 70,
  });

  const actionTemplates = [
    {
      type: 'improve_aiv' as const,
      label: 'Improve AI Visibility',
      description: 'Optimize schema markup and AI citations',
      defaultMagnitude: 10,
      defaultConfidence: 0.75,
      timeframe: 30,
      cost: 2500,
    },
    {
      type: 'improve_ati' as const,
      label: 'Boost Trust Index',
      description: 'Enhance E-E-A-T signals and authority',
      defaultMagnitude: 8,
      defaultConfidence: 0.70,
      timeframe: 60,
      cost: 5000,
    },
    {
      type: 'improve_zero_click' as const,
      label: 'Zero-Click Defense',
      description: 'Optimize for direct answers and featured snippets',
      defaultMagnitude: 12,
      defaultConfidence: 0.80,
      timeframe: 45,
      cost: 3000,
    },
    {
      type: 'improve_ugc' as const,
      label: 'UGC Health',
      description: 'Improve review generation and sentiment',
      defaultMagnitude: 15,
      defaultConfidence: 0.85,
      timeframe: 90,
      cost: 4000,
    },
    {
      type: 'improve_geo' as const,
      label: 'Geo Trust',
      description: 'Enhance local citations and map presence',
      defaultMagnitude: 10,
      defaultConfidence: 0.78,
      timeframe: 30,
      cost: 2000,
    },
  ];

  const addAction = (template: typeof actionTemplates[0]) => {
    const newAction: ScenarioAction = {
      type: template.type,
      magnitude: template.defaultMagnitude,
      confidence: template.defaultConfidence,
      timeframe: template.timeframe,
      cost: template.cost,
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<ScenarioAction>) => {
    const updatedActions = [...actions];
    updatedActions[index] = { ...updatedActions[index], ...updates };
    setActions(updatedActions);
  };

  const runScenario = async () => {
    if (actions.length === 0) {
      setError('Please add at least one action to the scenario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pulse/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealerId,
          currentSignals,
          actions,
          simulations: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run scenario');
      }

      const scenarioResult: ScenarioResult = await response.json();
      setResult(scenarioResult);

      if (onScenarioRun) {
        onScenarioRun(scenarioResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetScenario = () => {
    setActions([]);
    setResult(null);
    setError(null);
  };

  const getActionLabel = (type: ScenarioAction['type']): string => {
    const template = actionTemplates.find(t => t.type === type);
    return template?.label || type;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scenario Builder</h3>
          <p className="text-sm text-gray-500 mt-1">Model what-if improvements with Monte Carlo simulation</p>
        </div>
        {actions.length > 0 && (
          <button
            onClick={resetScenario}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Reset scenario"
          >
            Reset
          </button>
        )}
      </div>

      {/* Action Templates */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Improvements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {actionTemplates.map((template) => (
            <button
              key={template.type}
              onClick={() => addAction(template)}
              className="flex items-start p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left"
              aria-label={`Add ${template.label} action`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{template.label}</div>
                <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  +{template.defaultMagnitude} pts • {template.timeframe} days • ${(template.cost / 1000).toFixed(1)}k
                </div>
              </div>
              <span className="text-blue-600 ml-2" aria-hidden="true">+</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Actions */}
      {actions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Actions ({actions.length})</h4>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">{getActionLabel(action.type)}</span>
                  <button
                    onClick={() => removeAction(index)}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                    aria-label={`Remove ${getActionLabel(action.type)} action`}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Magnitude (+pts)
                    </label>
                    <input
                      type="number"
                      value={action.magnitude}
                      onChange={(e) => updateAction(index, { magnitude: Number(e.target.value) })}
                      min="1"
                      max="50"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Magnitude"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Confidence (0-1)
                    </label>
                    <input
                      type="number"
                      value={action.confidence}
                      onChange={(e) => updateAction(index, { confidence: Number(e.target.value) })}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Confidence"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={runScenario}
        disabled={loading || actions.length === 0}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Run scenario simulation"
      >
        {loading ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Simulation Results</h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xs text-blue-700 mb-1">Current Score</div>
              <div className="text-2xl font-bold text-blue-900">{result.currentScore.toFixed(1)}</div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-xs text-green-700 mb-1">Expected Score</div>
              <div className="text-2xl font-bold text-green-900">{result.expectedScore.toFixed(1)}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-2">Improvement: <span className="font-semibold text-green-600">+{result.improvement.toFixed(1)} points</span></div>
            <div className="text-xs text-gray-600">Confidence: <span className="font-semibold">{(result.confidence * 100).toFixed(0)}%</span></div>
          </div>

          {/* Distribution */}
          <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">Score Distribution</div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Min</div>
                <div className="font-semibold">{result.distribution.min.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-gray-500">P25</div>
                <div className="font-semibold">{result.distribution.p25.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-gray-500">Median</div>
                <div className="font-semibold">{result.distribution.median.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-gray-500">P75</div>
                <div className="font-semibold">{result.distribution.p75.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-gray-500">Max</div>
                <div className="font-semibold">{result.distribution.max.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* ROI */}
          {result.roi && (
            <div className="mb-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs font-semibold text-purple-900 mb-2">ROI Analysis</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-purple-700">Cost</div>
                  <div className="font-semibold">${(result.roi.totalCost / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <div className="text-purple-700">Value</div>
                  <div className="font-semibold">${(result.roi.expectedValue / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <div className="text-purple-700">ROI</div>
                  <div className="font-semibold">{result.roi.roiPercent.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-900 mb-2">Recommendations</div>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-amber-800">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
