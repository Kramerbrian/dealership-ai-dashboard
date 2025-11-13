'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Prediction {
  metric: string;
  current_value: number;
  predicted_value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  days_ahead: number;
  impact_points: number;
}

interface ImpactEstimate {
  action: string;
  metric: string;
  estimated_improvement: number;
  confidence: number;
  time_to_impact_hours: number;
  reasoning: string;
}

interface ActionableInsight {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact_estimates: ImpactEstimate[];
  reasoning: string;
}

interface PredictiveInsightsProps {
  dealerId: string;
  daysAhead?: number;
}

export default function PredictiveInsights({ dealerId, daysAhead = 7 }: PredictiveInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<Record<string, Prediction | null>>({});
  const [insights, setInsights] = useState<ActionableInsight[]>([]);

  useEffect(() => {
    fetchPredictions();
  }, [dealerId, daysAhead]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/predict?dealerId=${dealerId}&days=${daysAhead}`);
      const data = await response.json();

      if (response.ok) {
        setPredictions(data.predictions || {});
        setInsights(data.recommended_actions || []);
      }
    } catch (error) {
      console.error('[PredictiveInsights] Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string, impactPoints: number) => {
    if (trend === 'stable') return 'text-gray-400';
    if (impactPoints > 0) return 'text-emerald-400';
    return 'text-red-400';
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return 'bg-red-900/30 text-red-400 border-red-500/50';
    if (priority === 'medium') return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50';
    return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Predictions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">
          {daysAhead}-Day Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(predictions).map(([key, prediction]) => {
            if (!prediction) return null;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-400">
                    {key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                  <span className="text-xl">{getTrendIcon(prediction.trend)}</span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-white">
                    {prediction.predicted_value}
                    {key !== 'ai_visibility' && '%'}
                  </div>
                  <div className={`text-lg font-medium ${getTrendColor(prediction.trend, prediction.impact_points)}`}>
                    {prediction.impact_points > 0 ? '+' : ''}
                    {prediction.impact_points}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Current: {prediction.current_value}
                  {key !== 'ai_visibility' && '%'}
                </div>

                {/* Confidence bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Confidence</span>
                    <span>{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommended Actions */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Recommended Actions
          </h3>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-xs rounded-lg border ${getPriorityBadge(insight.priority)}`}>
                        {insight.priority.toUpperCase()}
                      </span>
                      <h4 className="text-lg font-semibold text-white">
                        {insight.action}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {insight.reasoning}
                    </p>
                  </div>
                </div>

                {/* Impact Estimates */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 font-medium">Expected Impact:</div>
                  {insight.impact_estimates.map((estimate, estIdx) => (
                    <div
                      key={estIdx}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium mb-1">
                          {estimate.metric.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </div>
                        <div className="text-xs text-gray-500">
                          {estimate.reasoning}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-emerald-400">
                          +{estimate.estimated_improvement}
                          {estimate.metric !== 'ai_visibility' && '%'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(estimate.time_to_impact_hours / 24)}d
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <button className="mt-4 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Take Action
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-200 mb-1">
              How Predictions Work
            </h4>
            <p className="text-xs text-blue-300/80">
              Predictions use linear regression on your historical data combined with seasonality detection.
              Confidence scores are based on R² (coefficient of determination) from the regression model.
              Impact estimates are based on automotive industry benchmarks and observed patterns across dealerships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
