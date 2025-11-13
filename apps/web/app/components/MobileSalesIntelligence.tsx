'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Zap, Smartphone } from 'lucide-react';

const MobileSalesIntelligence: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Smartphone className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Mobile Sales Intelligence</h2>
        </div>
        <p className="text-sm text-slate-600">Optimized for mobile viewing</p>
      </div>

      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-3 bg-blue-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Analytics</span>
            </div>
            <div className="text-lg font-bold text-blue-600">85%</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 bg-emerald-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Visibility</span>
            </div>
            <div className="text-lg font-bold text-emerald-600">92%</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 bg-purple-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Efficiency</span>
            </div>
            <div className="text-lg font-bold text-purple-600">78%</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileSalesIntelligence;