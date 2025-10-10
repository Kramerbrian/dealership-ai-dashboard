"use client";
import { useState, useEffect } from "react";
import { HyperAIVResults } from "@/lib/hyperaiv-optimizer";

interface HyperAIVOptimizerDashboardProps {
  className?: string;
}

export default function HyperAIVOptimizerDashboard({ className = "" }: HyperAIVOptimizerDashboardProps) {
  const [results, setResults] = useState<HyperAIVResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runHyperAIVOptimizer = async () => {
    try {
      setLoading(true);
      setIsRunning(true);
      setError(null);

      const response = await fetch('/api/train/reinforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId: 'demo-dealer' })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to run HyperAIV Optimizer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run HyperAIV Optimizer');
    } finally {
      setLoading(false);
      setIsRunning(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      const response = await fetch('/api/kpis/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh', dealerId: 'demo-dealer' })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Dashboard refreshed successfully');
      }
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  };

  const generateROIReport = async () => {
    try {
      const response = await fetch('/api/reports/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId: 'demo-dealer', reportPeriod: 'monthly' })
      });

      const data = await response.json();
      if (data.success) {
        console.log('ROI report generated:', data.roi_report);
      }
    } catch (err) {
      console.error('Failed to generate ROI report:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-slate-700 rounded-full"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HyperAIV Optimizer</h1>
          <p className="text-slate-400 mt-1">Continuous AIV™ optimization workflow</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runHyperAIVOptimizer}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isRunning ? 'Running...' : 'Run Optimizer'}
          </button>
          <button
            onClick={refreshDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Dashboard
          </button>
          <button
            onClick={generateROIReport}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Generate ROI Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">HyperAIV Workflow Steps</h3>
        <div className="space-y-3">
          {[
            { step: "Ingest", task: "Pull all current datasets from Supabase; validate completeness ≥ 95%", status: results ? 'completed' : 'pending' },
            { step: "Calibrate", task: "Run 8-week rolling regression of RaR vs AIV pillars", status: results ? 'completed' : 'pending' },
            { step: "Reinforce", task: "Adjust pillar weights using reinforcement learning", status: results ? 'completed' : 'pending' },
            { step: "Predict", task: "Apply Kalman-smoothed forecast for 4-week trajectory", status: results ? 'completed' : 'pending' },
            { step: "Optimize-Marketing", task: "Cross-reference AIV improvement with ad-spend ledger", status: results ? 'completed' : 'pending' },
            { step: "Report", task: "Generate monthly benchmark report", status: results ? 'completed' : 'pending' }
          ].map((workflow, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                workflow.status === 'completed' ? 'bg-green-500' : 'bg-slate-600'
              }`}></div>
              <div className="flex-1">
                <span className="font-medium text-blue-400">{workflow.step}:</span>
                <span className="text-slate-300 ml-2">{workflow.task}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Evaluation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Accuracy Gain"
              value={`+${results.evaluation_metrics.accuracy_gain_percent.toFixed(1)}%`}
              status="excellent"
            />
            <MetricCard
              title="ROI Gain"
              value={`+${results.evaluation_metrics.roi_gain_percent.toFixed(1)}%`}
              status="excellent"
            />
            <MetricCard
              title="Ad Efficiency Gain"
              value={`+${results.evaluation_metrics.ad_efficiency_gain_percent.toFixed(1)}%`}
              status="excellent"
            />
          </div>

          {/* Calibration Metrics */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Model Calibration Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">R² Score</p>
                <p className="text-lg font-semibold text-green-400">
                  {results.calibration_metrics.r2.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">RMSE</p>
                <p className="text-lg font-semibold text-blue-400">
                  {results.calibration_metrics.rmse.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Elasticity ($/pt)</p>
                <p className="text-lg font-semibold text-purple-400">
                  ${results.calibration_metrics.elasticity_usd_per_pt.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Correlation AIV-GEO</p>
                <p className="text-lg font-semibold text-orange-400">
                  {results.calibration_metrics.correlation_aiv_geo.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Updated Model Weights */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Updated Model Weights</h3>
            <div className="space-y-3">
              {[
                { name: 'SEO', weight: results.updated_model_weights.seo_w },
                { name: 'AEO', weight: results.updated_model_weights.aeo_w },
                { name: 'GEO', weight: results.updated_model_weights.geo_w },
                { name: 'UGC', weight: results.updated_model_weights.ugc_w },
                { name: 'GeoLocal', weight: results.updated_model_weights.geolocal_w }
              ].map((pillar) => (
                <div key={pillar.name} className="flex items-center justify-between">
                  <span className="font-medium">{pillar.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400">
                      {(pillar.weight * 100).toFixed(1)}%
                    </span>
                    <div className="w-32 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${pillar.weight * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">4-Week Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Projected Revenue Gain</p>
                <p className="text-2xl font-bold text-green-400">
                  ${results.forecast.projected_revenue_gain.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Model Version</p>
                <p className="text-lg font-semibold text-blue-400">
                  {results.forecast.model_version}
                </p>
              </div>
            </div>
          </div>

          {/* Ad Spend Optimization */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Marketing Optimization</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-400">Current Ad Spend</p>
                <p className="text-lg font-semibold text-red-400">
                  ${results.ad_spend_reallocation.current_ad_spend.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Projected Savings</p>
                <p className="text-lg font-semibold text-green-400">
                  ${results.ad_spend_reallocation.projected_savings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Inefficient Channels</p>
                <p className="text-lg font-semibold text-yellow-400">
                  {results.ad_spend_reallocation.inefficient_channels.length}
                </p>
              </div>
            </div>
          </div>

          {/* Execution Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Execution Summary</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Execution Time</p>
                <p className="text-lg font-semibold text-blue-400">
                  {results.execution_time_ms}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-lg font-semibold text-green-400">
                  {results.success ? 'Success' : 'Failed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Criteria */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Success Criteria</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">ΔAccuracy ≥ 10% MoM</span>
            <span className={`px-2 py-1 rounded text-sm ${
              results && results.evaluation_metrics.accuracy_gain_percent >= 10 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {results ? (results.evaluation_metrics.accuracy_gain_percent >= 10 ? '✓' : '✗') : '?'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">ΔAdEfficiency ≥ 15% MoM</span>
            <span className={`px-2 py-1 rounded text-sm ${
              results && results.evaluation_metrics.ad_efficiency_gain_percent >= 15 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {results ? (results.evaluation_metrics.ad_efficiency_gain_percent >= 15 ? '✓' : '✗') : '?'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Stable R² ≥ 0.8</span>
            <span className={`px-2 py-1 rounded text-sm ${
              results && results.calibration_metrics.r2 >= 0.8 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {results ? (results.calibration_metrics.r2 >= 0.8 ? '✓' : '✗') : '?'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  status: 'excellent' | 'good' | 'warning' | 'info';
}

function MetricCard({ title, value, status }: MetricCardProps) {
  const statusColors = {
    excellent: 'text-green-400',
    good: 'text-blue-400',
    warning: 'text-yellow-400',
    info: 'text-purple-400'
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className={`text-2xl font-semibold ${statusColors[status]}`}>{value}</p>
    </div>
  );
}
