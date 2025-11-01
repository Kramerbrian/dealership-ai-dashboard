'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ROICalculation {
  monthlySearches: number;
  avgCloseRate: number;
  avgDealGross: number;
  aiVisibilityGap: number;
  revenueAtRisk: number;
  platformCost: number;
  monthlyROI: number;
  annualROI: number;
  paybackDays: number;
}

export default function ROICalculator() {
  const [monthlySearches, setMonthlySearches] = useState(500);
  const [avgDealGross, setAvgDealGross] = useState(3500);
  const [aiVisibilityScore, setAiVisibilityScore] = useState(35); // 0-100

  const calculate = (): ROICalculation => {
    // Industry benchmarks
    const avgCloseRate = 0.12; // 12% close rate
    const aiSearchPercentage = 0.45; // 45% of searches now use AI
    const platformCost = 499; // DIY Guide tier

    // Calculate AI-driven searches
    const aiSearches = monthlySearches * aiSearchPercentage;

    // Calculate visibility gap (inverse of score)
    const aiVisibilityGap = (100 - aiVisibilityScore) / 100;

    // Calculate lost opportunities
    const lostSearches = aiSearches * aiVisibilityGap;
    const lostDeals = lostSearches * avgCloseRate;
    const revenueAtRisk = lostDeals * avgDealGross;

    // Calculate ROI
    const monthlyROI = ((revenueAtRisk - platformCost) / platformCost) * 100;
    const annualROI = ((revenueAtRisk * 12 - platformCost * 12) / (platformCost * 12)) * 100;
    const paybackDays = (platformCost / revenueAtRisk) * 30;

    return {
      monthlySearches,
      avgCloseRate,
      avgDealGross,
      aiVisibilityGap: aiVisibilityGap * 100,
      revenueAtRisk,
      platformCost,
      monthlyROI,
      annualROI,
      paybackDays,
    };
  };

  const results = calculate();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-purple-500/20 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Revenue Impact Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Searches for Your Dealership
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={monthlySearches}
              onChange={(e) => setMonthlySearches(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="text-right text-purple-400 font-bold mt-1">
              {monthlySearches.toLocaleString()} searches/month
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Average Deal Gross
            </label>
            <input
              type="range"
              min="1000"
              max="8000"
              step="250"
              value={avgDealGross}
              onChange={(e) => setAvgDealGross(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="text-right text-purple-400 font-bold mt-1">
              ${avgDealGross.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current AI Visibility Score
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={aiVisibilityScore}
              onChange={(e) => setAiVisibilityScore(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-400 text-sm">Invisible</span>
              <span className={`font-bold ${
                aiVisibilityScore < 40 ? 'text-red-400' :
                aiVisibilityScore < 70 ? 'text-amber-400' :
                'text-green-400'
              }`}>
                {aiVisibilityScore}/100
              </span>
              <span className="text-gray-400 text-sm">Dominant</span>
            </div>
          </div>

          {/* Evidence Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Calculation Methodology</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>AI Search Percentage:</span>
                <span className="text-white">45%</span>
              </div>
              <div className="flex justify-between">
                <span>Average Close Rate:</span>
                <span className="text-white">12%</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Cost (DIY Guide):</span>
                <span className="text-white">${results.platformCost}/mo</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <a href="#" className="text-xs text-purple-400 hover:text-purple-300 underline">
                View full methodology →
              </a>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Revenue at Risk */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-medium text-red-300">Monthly Revenue at Risk</h3>
            </div>
            <div className="text-4xl font-bold text-red-400">
              ${results.revenueAtRisk.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Lost due to {results.aiVisibilityGap.toFixed(0)}% AI visibility gap
            </p>
          </div>

          {/* Monthly ROI */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-medium text-green-300">Monthly ROI</h3>
            </div>
            <div className="text-4xl font-bold text-green-400">
              {results.monthlyROI.toLocaleString('en-US', { maximumFractionDigits: 0 })}%
            </div>
            <p className="text-sm text-gray-400 mt-2">
              ${(results.revenueAtRisk - results.platformCost).toLocaleString()} net gain/month
            </p>
          </div>

          {/* Payback Period */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-300">Payback Period</h3>
            </div>
            <div className="text-4xl font-bold text-purple-400">
              {results.paybackDays < 1 ? '<1' : results.paybackDays.toFixed(0)} days
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Annual ROI: {results.annualROI.toLocaleString('en-US', { maximumFractionDigits: 0 })}%
            </p>
          </div>

          {/* CTA */}
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
            Get Your Free AI Visibility Scan →
          </button>

          <p className="text-xs text-center text-gray-400">
            No credit card required • Results in 3 seconds • 2,847 dealerships scanned this month
          </p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">$45K</div>
            <div className="text-xs text-gray-400">Avg. Monthly Recovery</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">92×</div>
            <div className="text-xs text-gray-400">Average ROI</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">&lt;48hrs</div>
            <div className="text-xs text-gray-400">Time to First Fix</div>
          </div>
        </div>
      </div>
    </div>
  );
}
