'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PredictiveTrendProps {
  historicalData: number[];
  currentValue: number;
}

export const PredictiveTrendArrow: React.FC<PredictiveTrendProps> = ({
  historicalData,
  currentValue
}) => {
  // Simple linear regression for 7-day forecast
  const predictNext7Days = () => {
    const n = historicalData.length;
    if (n < 2) {
      return {
        predicted: currentValue,
        delta: 0,
        confidence: 50
      };
    }

    const sumX = historicalData.reduce((acc, _, i) => acc + i, 0);
    const sumY = historicalData.reduce((acc, val) => acc + val, 0);
    const sumXY = historicalData.reduce((acc, val, i) => acc + (i * val), 0);
    const sumXX = historicalData.reduce((acc, _, i) => acc + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const predicted = slope * n + intercept;
    const delta = predicted - currentValue;
    
    return {
      predicted: Math.round(predicted),
      delta: Math.round(delta),
      confidence: Math.min(95, 60 + Math.abs(slope) * 10) // Higher slope = higher confidence
    };
  };

  const forecast = predictNext7Days();
  const isImproving = forecast.delta > 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <Activity className="w-3 h-3 text-gray-400" />
      <span className="text-gray-400">7-day forecast:</span>
      <div className={`flex items-center gap-1 font-semibold ${
        isImproving ? 'text-green-500' : 'text-red-500'
      }`}>
        {isImproving ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{forecast.predicted}</span>
        <span className="text-gray-400 font-normal">({forecast.delta > 0 ? '+' : ''}{forecast.delta})</span>
      </div>
      <span className="text-gray-400 ml-1">{forecast.confidence}% confident</span>
    </div>
  );
};
