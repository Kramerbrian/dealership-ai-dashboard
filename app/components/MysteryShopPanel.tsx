'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building, Clock, CheckCircle, AlertTriangle, Play, BarChart3 } from 'lucide-react';
import { ABTestDashboard } from '@/components/ab-testing/ABTestDashboard';

const MysteryShopPanel: React.FC = () => {
  const tests = [
    {
      id: 1,
      date: '2024-01-15',
      type: 'Phone Inquiry',
      score: 85,
      status: 'completed',
      notes: 'Excellent response time and professionalism'
    },
    {
      id: 2,
      date: '2024-01-10',
      type: 'Email Inquiry',
      score: 72,
      status: 'completed',
      notes: 'Good response but could improve follow-up'
    },
    {
      id: 3,
      date: '2024-01-05',
      type: 'Walk-in Visit',
      score: 91,
      status: 'completed',
      notes: 'Outstanding customer service and knowledge'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* A/B Testing Dashboard */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">A/B Test Results</h2>
          </div>
          <p className="text-slate-600">Data-driven optimization for landing page conversion</p>
        </div>
        <ABTestDashboard showAllTests={true} />
      </div>

      {/* Mystery Shop Testing */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Mystery Shop Testing</h2>
          <p className="text-slate-600">Enterprise-grade customer experience monitoring</p>
        </div>

      {/* Schedule New Test Button */}
      <div className="mb-6">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
          <Play className="w-5 h-5" />
          <span className="font-medium">Schedule New Mystery Shop Test</span>
        </button>
      </div>

      {/* Test Results Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 mb-3">Recent Test Results</h3>
        
        {tests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <h4 className="font-medium text-slate-900">{test.type}</h4>
                  <p className="text-sm text-slate-600">{test.date}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xl font-bold ${getScoreColor(test.score)}`}>
                  {test.score}%
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {test.status.replace('-', ' ')}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mt-2">{test.notes}</p>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">85%</div>
          <div className="text-xs text-slate-600">Average Score</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-xs text-slate-600">Tests Completed</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">91%</div>
          <div className="text-xs text-slate-600">Best Score</div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MysteryShopPanel;
