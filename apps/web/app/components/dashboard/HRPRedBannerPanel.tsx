'use client'

import { useState } from 'react'

export default function HRPRedBannerPanel() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-2xl border bg-red-50 p-6 shadow-sm border-red-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-semibold text-red-800">HRP Red Banner</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600 font-bold">⚠️</span>
          <span className="font-semibold text-red-800">High Risk Content Detected</span>
        </div>
        <p className="text-sm text-red-700">
          AI accuracy risk detected. Auto-generated replies paused. Manual review required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-red-200 p-4 bg-white">
          <div className="text-sm text-red-600 mb-1">HRP Score</div>
          <div className="text-2xl font-bold text-red-600">0.78</div>
          <div className="text-xs text-red-500">Above 0.75 threshold</div>
        </div>
        <div className="rounded-xl border border-red-200 p-4 bg-white">
          <div className="text-sm text-red-600 mb-1">Risk Level</div>
          <div className="text-2xl font-bold text-red-600">HIGH</div>
          <div className="text-xs text-red-500">Requires intervention</div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 p-4 bg-white">
            <h4 className="font-semibold mb-2 text-red-800">Risk Factors</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Unverified Claims</span>
                <span className="font-medium text-red-600">3 detected</span>
              </div>
              <div className="flex justify-between">
                <span>Price Discrepancies</span>
                <span className="font-medium text-red-600">2 found</span>
              </div>
              <div className="flex justify-between">
                <span>Outdated Information</span>
                <span className="font-medium text-red-600">1 flagged</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-red-200 p-4 bg-white">
            <h4 className="font-semibold mb-2 text-red-800">Recommended Actions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Review and verify all pricing information</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Update outdated inventory data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Add source citations for claims</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-red-100 rounded-lg">
        <div className="text-sm text-red-800">
          <strong>Status:</strong> Auto-replies paused. Manual responses allowed after fact-check.
        </div>
      </div>
    </div>
  )
}