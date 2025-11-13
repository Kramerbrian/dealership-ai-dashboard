'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

const CompetitiveIntel: React.FC = () => {
  const competitors = [
    {
      name: 'AutoMax Dealership',
      score: 92,
      trend: 'up',
      marketShare: '23%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Premier Motors',
      score: 87,
      trend: 'stable',
      marketShare: '18%',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Elite Auto Group',
      score: 84,
      trend: 'down',
      marketShare: '15%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Your Dealership',
      score: 78,
      trend: 'up',
      marketShare: '12%',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-slate-400 rounded-full" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Competitive Intelligence</h2>
        <p className="text-slate-600">Market positioning and competitor analysis</p>
      </div>

      <div className="space-y-4">
        {competitors.map((competitor, index) => (
          <motion.div
            key={competitor.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${
              competitor.name === 'Your Dealership' 
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' 
                : 'bg-slate-50 hover:bg-slate-100'
            } transition-colors`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${competitor.color} text-white`}>
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-medium ${
                    competitor.name === 'Your Dealership' ? 'text-amber-900' : 'text-slate-900'
                  }`}>
                    {competitor.name}
                  </h3>
                  <p className="text-sm text-slate-600">Market Share: {competitor.marketShare}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(competitor.score)}`}>
                    {competitor.score}%
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(competitor.trend)}
                    <span className="text-xs text-slate-500 capitalize">{competitor.trend}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className={`h-2 bg-gradient-to-r ${competitor.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${competitor.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-3">Market Insights</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-slate-700">Market Leader: AutoMax (23%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-slate-700">Growth Opportunity: +11%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveIntel;
