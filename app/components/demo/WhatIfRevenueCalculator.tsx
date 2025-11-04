'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Scores {
  geo: number;
  aeo: number;
  seo: number;
}

interface WhatIfRevenueCalculatorProps {
  initialScores?: Scores;
  className?: string;
}

/**
 * Interactive "What-If" Revenue Calculator
 * 
 * Allows users to adjust GEO, AEO, and SEO scores with sliders
 * and see real-time revenue impact calculations based on DTRI-MAXIMUS model.
 */
export default function WhatIfRevenueCalculator({
  initialScores = { geo: 65.2, aeo: 73.8, seo: 87.3 },
  className = ''
}: WhatIfRevenueCalculatorProps) {
  const [scores, setScores] = useState<Scores>(initialScores);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Calculate VAI (Weighted Average Index)
  const vai = useMemo(() => {
    // Weights: GEO 40%, AEO 35%, SEO 25% (from DTRI-MAXIMUS spec)
    return Math.round((scores.geo * 0.4 + scores.aeo * 0.35 + scores.seo * 0.25) * 10) / 10;
  }, [scores]);

  // Calculate revenue impact using DTRI-MAXIMUS model
  const revenueImpact = useMemo(() => {
    const initialVAI = Math.round(
      (initialScores.geo * 0.4 + initialScores.aeo * 0.35 + initialScores.seo * 0.25) * 10
    ) / 10;
    
    const vaiImprovement = vai - initialVAI;

    // DTRI-MAXIMUS Beta Coefficients
    const GEO_BETA = 0.12; // 12% revenue impact per GEO point
    const AEO_BETA = 0.15; // 15% revenue impact per AEO point  
    const SEO_BETA = 0.10; // 10% revenue impact per SEO point
    const VAI_BASE_MULTIPLIER = 2480; // $2480 per VAI point (from DTRI model)

    // Calculate individual pillar impacts
    const geoImpact = (scores.geo - initialScores.geo) * GEO_BETA * VAI_BASE_MULTIPLIER;
    const aeoImpact = (scores.aeo - initialScores.aeo) * AEO_BETA * VAI_BASE_MULTIPLIER;
    const seoImpact = (scores.seo - initialScores.seo) * SEO_BETA * VAI_BASE_MULTIPLIER;

    // Total impact (simplified - in production use full DTRI model)
    const totalImpact = geoImpact + aeoImpact + seoImpact;

    // Also calculate based on VAI improvement for quick estimate
    const vaiBasedImpact = vaiImprovement * VAI_BASE_MULTIPLIER;

    return {
      total: Math.round(totalImpact),
      vaiBased: Math.round(vaiBasedImpact),
      geo: Math.round(geoImpact),
      aeo: Math.round(aeoImpact),
      seo: Math.round(seoImpact),
      vaiImprovement: Math.round(vaiImprovement * 10) / 10
    };
  }, [scores, initialScores, vai]);

  const handleScoreChange = (pillar: keyof Scores, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setScores(prev => ({ ...prev, [pillar]: clampedValue }));
    setIsAdjusting(true);
  };

  useEffect(() => {
    if (isAdjusting) {
      const timer = setTimeout(() => setIsAdjusting(false), 100);
      return () => clearTimeout(timer);
    }
  }, [scores, isAdjusting]);

  // Determine impact color
  const impactColor = revenueImpact.total >= 0 
    ? 'text-green-600' 
    : 'text-red-600';

  const impactBgColor = revenueImpact.total >= 0
    ? 'from-green-50 to-emerald-50'
    : 'from-red-50 to-orange-50';

  const impactBorderColor = revenueImpact.total >= 0
    ? 'border-green-200'
    : 'border-red-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What-If Revenue Calculator
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Adjust scores to see potential revenue impact
          </p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
          VAI: {vai.toFixed(1)}
        </div>
      </div>

      <div className="space-y-6">
        {/* GEO Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                GEO
              </span>
              GEO Visibility Score
            </label>
            <span className="text-lg font-mono font-semibold text-gray-900">
              {scores.geo.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={scores.geo}
            onChange={(e) => handleScoreChange('geo', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${scores.geo}%, #e5e7eb ${scores.geo}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          {revenueImpact.geo !== 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs mt-1 ${revenueImpact.geo >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {revenueImpact.geo >= 0 ? '+' : ''}${revenueImpact.geo.toLocaleString()}/month impact
            </motion.p>
          )}
        </div>

        {/* AEO Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                AEO
              </span>
              AEO Visibility Score
            </label>
            <span className="text-lg font-mono font-semibold text-gray-900">
              {scores.aeo.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={scores.aeo}
            onChange={(e) => handleScoreChange('aeo', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${scores.aeo}%, #e5e7eb ${scores.aeo}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          {revenueImpact.aeo !== 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs mt-1 ${revenueImpact.aeo >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {revenueImpact.aeo >= 0 ? '+' : ''}${revenueImpact.aeo.toLocaleString()}/month impact
            </motion.p>
          )}
        </div>

        {/* SEO Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                SEO
              </span>
              SEO Visibility Score
            </label>
            <span className="text-lg font-mono font-semibold text-gray-900">
              {scores.seo.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={scores.seo}
            onChange={(e) => handleScoreChange('seo', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${scores.seo}%, #e5e7eb ${scores.seo}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          {revenueImpact.seo !== 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs mt-1 ${revenueImpact.seo >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {revenueImpact.seo >= 0 ? '+' : ''}${revenueImpact.seo.toLocaleString()}/month impact
            </motion.p>
          )}
        </div>

        {/* Revenue Impact Display */}
        <motion.div
          key={revenueImpact.total}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className={`p-6 bg-gradient-to-r ${impactBgColor} rounded-lg border-2 ${impactBorderColor} relative overflow-hidden`}
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Estimated Monthly Revenue Impact
            </p>
            <motion.p
              key={revenueImpact.total}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-bold ${impactColor} mb-2`}
            >
              {revenueImpact.total >= 0 ? '+' : ''}${revenueImpact.total.toLocaleString()}
            </motion.p>
            
            {revenueImpact.vaiImprovement !== 0 && (
              <p className="text-sm text-gray-600 mb-3">
                VAI change: {revenueImpact.vaiImprovement >= 0 ? '+' : ''}
                {revenueImpact.vaiImprovement.toFixed(1)} points
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">GEO Impact</p>
                <p className={`text-sm font-semibold ${revenueImpact.geo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueImpact.geo >= 0 ? '+' : ''}${(revenueImpact.geo / 1000).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">AEO Impact</p>
                <p className={`text-sm font-semibold ${revenueImpact.aeo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueImpact.aeo >= 0 ? '+' : ''}${(revenueImpact.aeo / 1000).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">SEO Impact</p>
                <p className={`text-sm font-semibold ${revenueImpact.seo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueImpact.seo >= 0 ? '+' : ''}${(revenueImpact.seo / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3 italic">
              Based on DTRI-MAXIMUS financial model
            </p>
          </div>
        </motion.div>

        {/* Reset Button */}
        {JSON.stringify(scores) !== JSON.stringify(initialScores) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setScores(initialScores)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset to Original Scores
          </motion.button>
        )}

        {/* Export/Share CTA */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 mb-2 font-medium">
            Share this scenario with your team
          </p>
          <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2">
            <span>📄</span>
            Export This Scenario as PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}

