"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAIVForecast } from "@/hooks/useAIVForecast";
import { TrendingUp, Calendar } from "lucide-react";
import type { AIVOutputs } from "@/hooks/useAIVCalculator";

interface AIVForecastPanelProps {
  currentMetrics: AIVOutputs;
  history?: Array<{ AIVR_score: number; timestamp?: Date | string }>;
}

/**
 * AIV Forecast Panel Component
 * 
 * Displays next-month AIVR™ forecast and projected revenue recovery
 * using exponential smoothing based on historical data.
 */
export default function AIVForecastPanel({ currentMetrics, history }: AIVForecastPanelProps) {
  const historicalAIVR = history?.map((h) => h.AIVR_score) ?? [];
  
  const forecast = useAIVForecast({
    ...currentMetrics,
    historicalAIVR: historicalAIVR.length > 0 ? historicalAIVR : undefined
  });

  return (
    <Card className="bg-slate-900 border border-slate-700 text-white mt-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Next-Month AI Visibility Forecast</h2>
            <p className="text-sm text-slate-400">Predicted AIVR™ if current trends persist</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Next Month AIVR */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">Predicted AIVR™</span>
            </div>
            <p className="text-4xl font-semibold text-green-400 mb-1">
              {(forecast.nextMonthAIVR * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500">
              {historicalAIVR.length > 0 
                ? `Based on ${historicalAIVR.length} historical periods`
                : 'Historical data needed for accurate forecast'
              }
            </p>
          </div>

          {/* Projected Revenue Recovery */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Projected Revenue Recovery</span>
            </div>
            <p className="text-4xl font-semibold text-emerald-400 mb-1">
              ${forecast.projectedRevenueGain.toLocaleString()}/month
            </p>
            <p className="text-xs text-slate-500">
              Potential monthly revenue recovery
            </p>
          </div>
        </div>

        {/* Forecast Summary */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
          <p className="text-sm text-slate-300">
            {forecast.forecastSummary}
          </p>
        </div>

        {/* Current vs Forecast Comparison */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Current AIVR™</span>
              <p className="text-lg font-semibold text-white">
                {(currentMetrics.AIVR_score * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-slate-400">Forecasted AIVR™</span>
              <p className="text-lg font-semibold text-green-400">
                {(forecast.nextMonthAIVR * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

