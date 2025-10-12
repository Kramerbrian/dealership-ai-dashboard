'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  ArrowUpRight, 
  Clock, 
  Target,
  Zap,
  Shield,
  MessageSquare
} from 'lucide-react';

interface Scores {
  aiVisibility: number;
  zeroClick: number;
  ugcHealth: number;
  geoTrust: number;
  sgpIntegrity: number;
  overall: number;
}

interface OpportunitiesEngineProps {
  scores?: Scores;
}

const OpportunitiesEngine: React.FC<OpportunitiesEngineProps> = ({ scores }) => {
  const opportunities = [
    {
      id: 'schema-markup',
      title: 'Fix Schema Markup',
      description: 'Add structured data to improve search visibility',
      impact: 'high',
      effort: 'medium',
      score: scores?.sgpIntegrity || 0,
      icon: <Shield className="w-5 h-5" />,
      color: 'from-red-500 to-rose-500',
      estimatedTime: '2-3 hours'
    },
    {
      id: 'ai-citations',
      title: 'Boost AI Citations',
      description: 'Improve content for better AI platform visibility',
      impact: 'high',
      effort: 'high',
      score: scores?.aiVisibility || 0,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      estimatedTime: '1-2 days'
    },
    {
      id: 'ugc-optimization',
      title: 'Optimize UGC',
      description: 'Improve user-generated content quality and response rate',
      impact: 'medium',
      effort: 'low',
      score: scores?.ugcHealth || 0,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      estimatedTime: '4-6 hours'
    }
  ];

  const getPriorityColor = (impact: string, effort: string) => {
    if (impact === 'high' && effort === 'low') return 'text-red-600 bg-red-50';
    if (impact === 'high' && effort === 'medium') return 'text-amber-600 bg-amber-50';
    if (impact === 'high' && effort === 'high') return 'text-blue-600 bg-blue-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getPriorityText = (impact: string, effort: string) => {
    if (impact === 'high' && effort === 'low') return 'High Priority';
    if (impact === 'high' && effort === 'medium') return 'Medium Priority';
    if (impact === 'high' && effort === 'high') return 'Strategic Priority';
    return 'Low Priority';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Smart Recommendations</h2>
        <p className="text-slate-600">AI-powered opportunities to improve visibility</p>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${opportunity.color} text-white`}>
                  {opportunity.icon}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {opportunity.title}
                  </h3>
                  <p className="text-sm text-slate-600">{opportunity.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(opportunity.impact, opportunity.effort)}`}>
                  {getPriorityText(opportunity.impact, opportunity.effort)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {opportunity.estimatedTime}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Current Score: <span className="font-medium">{opportunity.score}%</span>
                </div>
                <div className="text-sm text-slate-600">
                  Impact: <span className="font-medium capitalize">{opportunity.impact}</span>
                </div>
                <div className="text-sm text-slate-600">
                  Effort: <span className="font-medium capitalize">{opportunity.effort}</span>
                </div>
              </div>
              
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Implement</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar showing current score */}
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className={`h-2 bg-gradient-to-r ${opportunity.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${opportunity.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
        <h3 className="font-medium text-slate-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            Generate Content
          </button>
          <button className="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
            Run Analysis
          </button>
          <button className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
            Schedule Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesEngine;
