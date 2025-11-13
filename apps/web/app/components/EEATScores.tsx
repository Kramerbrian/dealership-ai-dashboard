'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EEATData {
  expertise: number;
  experience: number;
  authoritativeness: number;
  trustworthiness: number;
  overall: number;
}

interface EEATScoresProps {
  eeat?: EEATData;
}

const EEATScores: React.FC<EEATScoresProps> = ({ eeat }) => {
  const metrics = [
    {
      id: 'expertise',
      name: 'Expertise',
      value: eeat?.expertise || 0,
      color: 'from-blue-500 to-cyan-500',
      description: 'Knowledge and skill demonstration'
    },
    {
      id: 'experience',
      name: 'Experience',
      value: eeat?.experience || 0,
      color: 'from-emerald-500 to-teal-500',
      description: 'Practical experience and case studies'
    },
    {
      id: 'authoritativeness',
      name: 'Authoritativeness',
      value: eeat?.authoritativeness || 0,
      color: 'from-purple-500 to-pink-500',
      description: 'Industry recognition and citations'
    },
    {
      id: 'trustworthiness',
      name: 'Trustworthiness',
      value: eeat?.trustworthiness || 0,
      color: 'from-amber-500 to-orange-500',
      description: 'Credibility and transparency'
    }
  ];

  const getTrendIcon = (value: number) => {
    if (value >= 80) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (value >= 60) return <Minus className="w-4 h-4 text-amber-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-emerald-600';
    if (value >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">E-E-A-T Authority Scores</h2>
        <p className="text-slate-600">Expertise, Experience, Authoritativeness, and Trustworthiness</p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} text-white`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{metric.name}</h3>
                <p className="text-sm text-slate-600">{metric.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                  {metric.value}%
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.value)}
                  <span className="text-xs text-slate-500">
                    {metric.value >= 80 ? 'Excellent' : metric.value >= 60 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
              </div>
              
              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall E-E-A-T Score */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Overall E-E-A-T Score</h3>
            <p className="text-sm text-slate-600">Weighted average of all authority metrics</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(eeat?.overall || 0)}`}>
              {eeat?.overall || 0}%
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(eeat?.overall || 0)}
              <span className="text-sm text-slate-600">
                {eeat?.overall && eeat.overall >= 80 ? 'Excellent Authority' : 
                 eeat?.overall && eeat.overall >= 60 ? 'Good Authority' : 'Needs Authority Building'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EEATScores;
