'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

export function QuickROICalculator() {
  const [monthlySales, setMonthlySales] = useState(50);
  const [avgProfit, setAvgProfit] = useState(2800);
  const [visibilityScore, setVisibilityScore] = useState(45);

  // Calculate revenue at risk
  const calculateRisk = () => {
    // Conservative estimate: low visibility = higher risk
    const riskMultiplier = (100 - visibilityScore) / 100;
    const potentialSales = monthlySales * riskMultiplier * 0.3; // 30% of at-risk sales
    return potentialSales * avgProfit;
  };

  const revenueAtRisk = calculateRisk();
  const annualImpact = revenueAtRisk * 12;
  const roi = (annualImpact / 499) * 100; // $499/month Pro plan

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Quick ROI Calculator</h3>
          <p className="text-sm text-gray-600">See your potential impact</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Unit Sales
          </label>
          <input
            type="number"
            value={monthlySales}
            onChange={(e) => setMonthlySales(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avg Profit Per Vehicle ($)
          </label>
          <input
            type="number"
            value={avgProfit}
            onChange={(e) => setAvgProfit(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current AI Visibility Score
          </label>
          <input
            type="range"
            value={visibilityScore}
            onChange={(e) => setVisibilityScore(Number(e.target.value))}
            min="0"
            max="100"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span className="font-semibold text-blue-600">{visibilityScore}</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Monthly Revenue at Risk</span>
          </div>
          <span className="text-xl font-bold text-red-600">
            ${revenueAtRisk.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Annual Impact</span>
          </div>
          <span className="text-xl font-bold text-orange-600">
            ${annualImpact.toLocaleString()}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">ROI vs Pro Plan</span>
            <span className="text-2xl font-bold text-green-600">
              {Math.round(roi)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

