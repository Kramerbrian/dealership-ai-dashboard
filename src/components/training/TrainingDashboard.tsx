"use client";
import { useState, useEffect } from "react";
import { ModelWeights, ModelAudit, FeatureImportance, PromptPerformanceAnalysis } from "@/types/training";

interface TrainingDashboardProps {
  className?: string;
}

export default function TrainingDashboard({ className = "" }: TrainingDashboardProps) {
  const [modelWeights, setModelWeights] = useState<ModelWeights | null>(null);
  const [modelAudit, setModelAudit] = useState<ModelAudit | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [promptPerformance, setPromptPerformance] = useState<PromptPerformanceAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      
      // Load model weights
      const weightsResponse = await fetch('/api/training/train-model');
      const weightsData = await weightsResponse.json();
      if (weightsData.success) {
        setModelWeights(weightsData.model_weights);
      }

      // Load model audit
      const auditResponse = await fetch('/api/training/validate-model');
      const auditData = await auditResponse.json();
      if (auditData.success) {
        setModelAudit(auditData.audit);
      }

      // Load prompt performance
      const promptResponse = await fetch('/api/training/prompt-optimization?promptId=aiv-analysis');
      const promptData = await promptResponse.json();
      if (promptData.success) {
        setPromptPerformance(promptData.performance_analysis);
      }

      // Mock feature importance data
      setFeatureImportance([
        {
          id: '1',
          model_version: 'v1.0',
          feature_name: 'seo',
          importance_score: 0.35,
          shap_value: 0.38,
          permutation_importance: 0.33,
          calculated_at: new Date().toISOString()
        },
        {
          id: '2',
          model_version: 'v1.0',
          feature_name: 'aeo',
          importance_score: 0.28,
          shap_value: 0.31,
          permutation_importance: 0.26,
          calculated_at: new Date().toISOString()
        },
        {
          id: '3',
          model_version: 'v1.0',
          feature_name: 'geo',
          importance_score: 0.22,
          shap_value: 0.25,
          permutation_importance: 0.20,
          calculated_at: new Date().toISOString()
        },
        {
          id: '4',
          model_version: 'v1.0',
          feature_name: 'ugc',
          importance_score: 0.10,
          shap_value: 0.08,
          permutation_importance: 0.12,
          calculated_at: new Date().toISOString()
        },
        {
          id: '5',
          model_version: 'v1.0',
          feature_name: 'geolocal',
          importance_score: 0.05,
          shap_value: 0.03,
          permutation_importance: 0.07,
          calculated_at: new Date().toISOString()
        }
      ]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  const triggerModelTraining = async () => {
    try {
      setLoading(true);
      
      // Mock training data
      const trainingData = [
        {
          dealer_id: 'dealer_1',
          date: '2024-01-01',
          seo: 75,
          aeo: 68,
          geo: 82,
          ugc: 45,
          geolocal: 30,
          observed_aiv: 72,
          observed_rar: 0.15
        },
        // Add more training samples...
      ];

      const response = await fetch('/api/training/train-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingData })
      });

      const result = await response.json();
      if (result.success) {
        setModelWeights(result.model_weights);
        await loadTrainingData(); // Reload all data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-red-500">
        <p className="text-red-400">Error: {error}</p>
        <button 
          onClick={loadTrainingData}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AIV Model Training Dashboard</h1>
        <button
          onClick={triggerModelTraining}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Train New Model
        </button>
      </div>

      {/* Model Performance Metrics */}
      {modelWeights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Model R²"
            value={modelWeights.r2.toFixed(3)}
            status={modelWeights.r2 > 0.8 ? 'excellent' : modelWeights.r2 > 0.6 ? 'good' : 'warning'}
          />
          <MetricCard
            title="RMSE"
            value={modelWeights.rmse.toFixed(2)}
            status={modelWeights.rmse < 5 ? 'excellent' : modelWeights.rmse < 10 ? 'good' : 'warning'}
          />
          <MetricCard
            title="MAPE"
            value={`${modelWeights.mape.toFixed(1)}%`}
            status={modelWeights.mape < 5 ? 'excellent' : modelWeights.mape < 10 ? 'good' : 'warning'}
          />
          <MetricCard
            title="Training Samples"
            value={modelWeights.training_samples.toString()}
            status="info"
          />
        </div>
      )}

      {/* Model Audit Results */}
      {modelAudit && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Latest Model Validation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Accuracy Improvement</p>
              <p className="text-lg font-semibold text-green-400">
                +{(modelAudit.delta_accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">ROI Improvement</p>
              <p className="text-lg font-semibold text-green-400">
                +${modelAudit.delta_roi.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Validation Samples</p>
              <p className="text-lg font-semibold text-blue-400">
                {modelAudit.validation_samples}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Model Version</p>
              <p className="text-lg font-semibold text-purple-400">
                {modelAudit.model_version}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
        <div className="space-y-3">
          {featureImportance.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{feature.feature_name.toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Importance</p>
                  <p className="font-semibold">{(feature.importance_score * 100).toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">SHAP</p>
                  <p className="font-semibold">{(feature.shap_value * 100).toFixed(1)}%</p>
                </div>
                <div className="w-24 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${feature.importance_score * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Performance */}
      {promptPerformance.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Prompt Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">Factual Precision</p>
              <p className="text-lg font-semibold text-green-400">
                {(promptPerformance[0].avg_factual_precision * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Hallucination Rate</p>
              <p className="text-lg font-semibold text-red-400">
                {(promptPerformance[0].avg_hallucination_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Cost</p>
              <p className="text-lg font-semibold text-blue-400">
                ${promptPerformance[0].avg_cost.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Status */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Training Status</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Model Training Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Auto-retraining: Daily</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Prompt Optimization: Active</span>
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
