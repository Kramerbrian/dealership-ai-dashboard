'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Zap } from 'lucide-react';

const SalesIntelligenceDashboard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sales Intelligence Dashboard</h2>
        <p className="text-slate-600">AI-powered sales analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Analytics</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">85%</div>
          <div className="text-sm text-blue-700">Performance Score</div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-900">Visibility</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">92%</div>
          <div className="text-sm text-emerald-700">AI Presence</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">78%</div>
          <div className="text-sm text-purple-700">Conversion Rate</div>
        </div>
      </div>
    </div>
  );
};

export default SalesIntelligenceDashboard;