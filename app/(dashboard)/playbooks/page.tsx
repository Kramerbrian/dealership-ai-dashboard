'use client';

import { useState } from 'react';
import { BookOpen, Plus, Play, Copy, Edit, Trash2, TrendingUp } from 'lucide-react';

export default function PlaybooksPage() {
  const [playbooks] = useState([
    {
      id: 1,
      name: 'Increase ChatGPT Visibility',
      description: 'Step-by-step guide to improve visibility in ChatGPT responses',
      steps: 8,
      successRate: 87,
      usage: 124,
    },
    {
      id: 2,
      name: 'Optimize Google Business Profile',
      description: 'Complete playbook for GBP optimization and AI Overview inclusion',
      steps: 12,
      successRate: 92,
      usage: 89,
    },
    {
      id: 3,
      name: 'Schema Markup Implementation',
      description: 'Guide to implementing and validating schema markup',
      steps: 6,
      successRate: 95,
      usage: 156,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Playbooks</h1>
          <p className="mt-2 text-gray-600">Step-by-step guides to improve your AI visibility</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Create Playbook</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <div key={playbook.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{playbook.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{playbook.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Steps</span>
                <span className="font-medium text-gray-900">{playbook.steps}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">{playbook.successRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Times Used</span>
                <span className="font-medium text-gray-900">{playbook.usage}</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Play className="w-4 h-4" />
              <span>Run Playbook</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Popular Playbooks</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'AI Overview Optimization', category: 'Google', usage: 342 },
            { name: 'Review Generation Strategy', category: 'Trust', usage: 289 },
            { name: 'Competitor Analysis Guide', category: 'Intelligence', usage: 198 },
          ].map((playbook, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{playbook.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{playbook.category} • {playbook.usage} uses</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

