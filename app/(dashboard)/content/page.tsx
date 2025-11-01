'use client';

import { useState } from 'react';
import { FileText, Link as LinkIcon, MousePointerClick, Search } from 'lucide-react';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const contentIssues = [
    {
      id: 1,
      type: 'broken_link',
      severity: 'high',
      title: 'Broken link to inventory page',
      url: '/inventory/toyota-camry',
      fix: 'Update link to /vehicles/toyota-camry',
    },
    {
      id: 2,
      type: 'missing_cta',
      severity: 'medium',
      title: 'Missing call-to-action on homepage',
      url: '/',
      fix: 'Add "Schedule Test Drive" CTA button',
    },
    {
      id: 3,
      type: 'duplicate_content',
      severity: 'low',
      title: 'Duplicate meta descriptions found',
      url: '/vehicles',
      fix: 'Create unique meta descriptions for each page',
    },
  ];

  const optimizationSuggestions = [
    {
      title: 'Add FAQ Schema',
      impact: 'High',
      pages: 12,
      description: 'Adding FAQ schema markup can improve visibility in AI search results',
    },
    {
      title: 'Optimize Product Descriptions',
      impact: 'Medium',
      pages: 48,
      description: 'Enhance product descriptions with more detailed specifications',
    },
    {
      title: 'Improve Image Alt Text',
      impact: 'Medium',
      pages: 156,
      description: 'Add descriptive alt text to all vehicle images',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Optimizer</h1>
        <p className="mt-2 text-gray-600">Identify and fix content issues to improve AI visibility</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'issues', label: 'Issues' },
            { id: 'optimization', label: 'Optimization' },
            { id: 'ctas', label: 'CTAs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Content Health Score */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Health Score</h2>
              <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${87.3 * 3.14159} ${351.86}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">87.3%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Broken Links</span>
                      <span className="text-sm font-medium text-red-600">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Missing CTAs</span>
                      <span className="text-sm font-medium text-yellow-600">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pages Analyzed</span>
                      <span className="text-sm font-medium text-gray-900">247</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Issues */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {contentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      issue.severity === 'high' ? 'bg-red-100 text-red-600' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {issue.type === 'broken_link' && <LinkIcon className="w-5 h-5" />}
                      {issue.type === 'missing_cta' && <MousePointerClick className="w-5 h-5" />}
                      {issue.type === 'duplicate_content' && <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{issue.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{issue.url}</p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Fix:</span> {issue.fix}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                      Fix Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Total Pages</span>
                    <span className="text-sm font-medium text-gray-900">247</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Optimized</span>
                    <span className="text-sm font-medium text-green-600">215</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Needs Attention</span>
                    <span className="text-sm font-medium text-red-600">32</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '13%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Run Full Scan
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Optimization Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimizationSuggestions.map((suggestion, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{suggestion.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.impact === 'High' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {suggestion.impact}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{suggestion.pages} pages</span>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Apply →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

