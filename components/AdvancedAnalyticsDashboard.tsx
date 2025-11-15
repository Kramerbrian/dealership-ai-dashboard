'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

interface AdvancedAnalyticsData {
  hierarchical_bayesian: {
    results: Array<{
      dealer_id: string;
      vertical: string;
      region: string;
      posterior_mean: number;
      posterior_std: number;
      credible_interval: [number, number];
      shrinkage_factor: number;
      effective_sample_size: number;
    }>;
    diagnostics: {
      average_shrinkage: number;
      convergence_issues: number;
      effective_sample_sizes: { min: number; max: number; mean: number };
    };
  };
  causal_inference: {
    results: Array<{
      treatment_effect: number;
      confidence_interval: [number, number];
      p_value: number;
      method: string;
      assumptions_satisfied: boolean;
    }>;
    aggregated: {
      average_effect: number;
      significant_methods: number;
      robust_estimate: number;
    };
  };
  anomaly_detection: {
    anomalies: Array<{
      id: string;
      metric: string;
      value: number;
      expected_value: number;
      anomaly_score: number;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    summary: {
      total: number;
      by_severity: { low: number; medium: number; high: number };
      by_metric: Record<string, number>;
    };
  };
}

export default function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bayesian' | 'causal' | 'anomaly'>('bayesian');

  useEffect(() => {
    loadAdvancedAnalytics();
  }, []);

  const loadAdvancedAnalytics = async () => {
    try {
      // Mock data for demonstration
      setData({
        hierarchical_bayesian: {
          results: [
            { dealer_id: 'dealer_1', vertical: 'luxury', region: 'west', posterior_mean: 85.2, posterior_std: 3.1, credible_interval: [79.1, 91.3], shrinkage_factor: 0.3, effective_sample_size: 150 },
            { dealer_id: 'dealer_2', vertical: 'mass_market', region: 'east', posterior_mean: 78.9, posterior_std: 2.8, credible_interval: [73.4, 84.4], shrinkage_factor: 0.4, effective_sample_size: 120 },
            { dealer_id: 'dealer_3', vertical: 'luxury', region: 'south', posterior_mean: 92.1, posterior_std: 2.5, credible_interval: [87.2, 97.0], shrinkage_factor: 0.2, effective_sample_size: 180 }
          ],
          diagnostics: {
            average_shrinkage: 0.3,
            convergence_issues: 0,
            effective_sample_sizes: { min: 120, max: 180, mean: 150 }
          }
        },
        causal_inference: {
          results: [
            { treatment_effect: 12.5, confidence_interval: [8.2, 16.8], p_value: 0.001, method: 'propensity_score_matching', assumptions_satisfied: true },
            { treatment_effect: 11.8, confidence_interval: [7.1, 16.5], p_value: 0.003, method: 'instrumental_variable', assumptions_satisfied: true },
            { treatment_effect: 13.2, confidence_interval: [9.0, 17.4], p_value: 0.002, method: 'regression_discontinuity', assumptions_satisfied: true }
          ],
          aggregated: {
            average_effect: 12.5,
            significant_methods: 3,
            robust_estimate: 12.5
          }
        },
        anomaly_detection: {
          anomalies: [
            { id: '1', metric: 'DTRI', value: 95, expected_value: 78, anomaly_score: 0.9, severity: 'high', description: 'DTRI spike detected - 17 points above expected' },
            { id: '2', metric: 'Revenue', value: 45000, expected_value: 125000, anomaly_score: 0.7, severity: 'medium', description: 'Revenue drop - 64% below expected' },
            { id: '3', metric: 'Elasticity', value: 3.2, expected_value: 2.1, anomaly_score: 0.6, severity: 'low', description: 'Elasticity increase - 52% above expected' }
          ],
          summary: {
            total: 3,
            by_severity: { low: 1, medium: 1, high: 1 },
            by_metric: { 'DTRI': 1, 'Revenue': 1, 'Elasticity': 1 }
          }
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load advanced analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Advanced Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Advanced Analytics Dashboard</h1>
          <p className="text-slate-400">Hierarchical Bayesian, Causal Inference & Anomaly Detection</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'bayesian', label: 'Hierarchical Bayesian', icon: '🧠' },
            { id: 'causal', label: 'Causal Inference', icon: '🔬' },
            { id: 'anomaly', label: 'Anomaly Detection', icon: '🚨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Bayesian Tab */}
        {activeTab === 'bayesian' && (
          <div className="space-y-8">
            {/* Diagnostics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {data.hierarchical_bayesian.diagnostics.average_shrinkage.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">Average Shrinkage</div>
                <div className="text-xs text-slate-500 mt-1">Lower is better</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {data.hierarchical_bayesian.diagnostics.convergence_issues}
                </div>
                <div className="text-sm text-slate-400">Convergence Issues</div>
                <div className="text-xs text-slate-500 mt-1">Should be 0</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {data.hierarchical_bayesian.diagnostics.effective_sample_sizes.mean.toFixed(0)}
                </div>
                <div className="text-sm text-slate-400">Avg Effective Sample Size</div>
                <div className="text-xs text-slate-500 mt-1">Higher is better</div>
              </div>
            </div>

            {/* Bayesian Results */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Posterior Estimates by Dealer</h2>
              <div className="space-y-4">
                {data.hierarchical_bayesian.results.map((result, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{(result as any).dealer_id}</div>
                        <div className="text-sm text-slate-400">
                          {(result as any).vertical} • {(result as any).region}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-400">
                          {(result as any).posterior_mean.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">
                          ±{(result as any).posterior_std.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Credible Interval: </span>
                        <span className="text-white">
                          [{(result as any).credible_interval[0].toFixed(1)}, {(result as any).credible_interval[1].toFixed(1)}]
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Shrinkage: </span>
                        <span className="text-white">{((result as any).shrinkage_factor * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">ESS: </span>
                        <span className="text-white">{(result as any).effective_sample_size.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Causal Inference Tab */}
        {activeTab === 'causal' && (
          <div className="space-y-8">
            {/* Aggregated Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {data.causal_inference.aggregated.average_effect.toFixed(1)}
                </div>
                <div className="text-sm text-slate-400">Average Treatment Effect</div>
                <div className="text-xs text-slate-500 mt-1">DTRI points</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {data.causal_inference.aggregated.significant_methods}
                </div>
                <div className="text-sm text-slate-400">Significant Methods</div>
                <div className="text-xs text-slate-500 mt-1">Out of {data.causal_inference.results.length}</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {data.causal_inference.aggregated.robust_estimate.toFixed(1)}
                </div>
                <div className="text-sm text-slate-400">Robust Estimate</div>
                <div className="text-xs text-slate-500 mt-1">Assumptions satisfied</div>
              </div>
            </div>

            {/* Method Comparison */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Method Comparison</h2>
              <div className="space-y-4">
                {data.causal_inference.results.map((result, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{(result as any).method.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-slate-400">
                          P-value: {(result as any).p_value.toFixed(4)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          {(result as any).treatment_effect.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">
                          [{(result as any).confidence_interval[0].toFixed(1)}, {(result as any).confidence_interval[1].toFixed(1)}]
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className={`px-2 py-1 rounded text-xs ${
                        (result as any).assumptions_satisfied 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {(result as any).assumptions_satisfied ? 'Assumptions ✓' : 'Assumptions ✗'}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        (result as any).p_value < 0.05 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-gray-900 text-gray-300'
                      }`}>
                        {(result as any).p_value < 0.05 ? 'Significant' : 'Not Significant'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Anomaly Detection Tab */}
        {activeTab === 'anomaly' && (
          <div className="space-y-8">
            {/* Anomaly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-orange-400 mb-2">
                  {data.anomaly_detection.summary.total}
                </div>
                <div className="text-sm text-slate-400">Total Anomalies</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-red-400 mb-2">
                  {data.anomaly_detection.summary.by_severity.high}
                </div>
                <div className="text-sm text-slate-400">High Severity</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {data.anomaly_detection.summary.by_severity.medium}
                </div>
                <div className="text-sm text-slate-400">Medium Severity</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {data.anomaly_detection.summary.by_severity.low}
                </div>
                <div className="text-sm text-slate-400">Low Severity</div>
              </div>
            </div>

            {/* Anomaly Details */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Detected Anomalies</h2>
              <div className="space-y-4">
                {data.anomaly_detection.anomalies.map((anomaly, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{anomaly.metric}</div>
                        <div className="text-sm text-slate-400">{anomaly.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {anomaly.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          Expected: {anomaly.expected_value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Anomaly Score: </span>
                        <span className="text-white">{(anomaly.anomaly_score * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Deviation: </span>
                        <span className="text-white">
                          {((anomaly.value - anomaly.expected_value) / anomaly.expected_value * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
