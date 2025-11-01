'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Zap, TrendingUp } from 'lucide-react';

const EnhancedSalesIntelligenceDashboard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Enhanced Sales Intelligence</h2>
        <p className="text-slate-600">Advanced AI-powered sales analytics with real-time insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Analytics</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">85%</div>
          <div className="text-sm text-blue-700">Performance Score</div>
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600">+5% this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-900">Visibility</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">92%</div>
          <div className="text-sm text-emerald-700">AI Presence</div>
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600">+3% this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">78%</div>
          <div className="text-sm text-purple-700">Conversion Rate</div>
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600">+2% this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">Growth</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">12%</div>
          <div className="text-sm text-amber-700">Month over Month</div>
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600">+1% this week</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedSalesIntelligenceDashboard;