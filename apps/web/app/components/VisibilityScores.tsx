'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MousePointer, 
  MessageSquare, 
  MapPin, 
  Shield,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface Scores {
  aiVisibility: number;
  zeroClick: number;
  ugcHealth: number;
  geoTrust: number;
  sgpIntegrity: number;
  overall: number;
}

interface VisibilityScoresProps {
  scores?: Scores;
}

const VisibilityScores: React.FC<VisibilityScoresProps> = ({ scores }) => {
  const metrics = [
    {
      id: 'aiVisibility',
      name: 'AI Visibility',
      value: scores?.aiVisibility || 0,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Presence across AI platforms'
    },
    {
      id: 'zeroClick',
      name: 'Zero-Click',
      value: scores?.zeroClick || 0,
      icon: <MousePointer className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      description: 'Direct answer visibility'
    },
    {
      id: 'ugcHealth',
      name: 'UGC Health',
      value: scores?.ugcHealth || 0,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-500',
      description: 'User-generated content quality'
    },
    {
      id: 'geoTrust',
      name: 'Geo Trust',
      value: scores?.geoTrust || 0,
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      description: 'Local search authority'
    },
    {
      id: 'sgpIntegrity',
      name: 'SGP Integrity',
      value: scores?.sgpIntegrity || 0,
      icon: <Shield className="w-5 h-5" />,
      color: 'from-red-500 to-rose-500',
      description: 'Structured data completeness'
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
        <h2 className="text-xl font-bold text-slate-900 mb-2">Visibility Scores</h2>
        <p className="text-slate-600">Core metrics for dealership AI presence</p>
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
                {metric.icon}
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

      {/* Overall Score */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Overall Score</h3>
            <p className="text-sm text-slate-600">Weighted average of all metrics</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scores?.overall || 0)}`}>
              {scores?.overall || 0}%
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(scores?.overall || 0)}
              <span className="text-sm text-slate-600">
                {scores?.overall && scores.overall >= 80 ? 'Excellent Performance' : 
                 scores?.overall && scores.overall >= 60 ? 'Good Performance' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilityScores;
