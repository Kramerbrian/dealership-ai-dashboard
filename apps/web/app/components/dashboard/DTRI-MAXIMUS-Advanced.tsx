'use client'

import { useState } from 'react'

export default function DTRIAdvancedPanel() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">DTRI-MAXIMUS Advanced</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 bg-black text-white rounded-lg text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Trust Score</div>
          <div className="text-2xl font-bold text-green-600">87.3</div>
          <div className="text-xs text-gray-500">+2.1 from last week</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Authority Index</div>
          <div className="text-2xl font-bold text-blue-600">92.1</div>
          <div className="text-xs text-gray-500">+1.8 from last week</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Expertise Level</div>
          <div className="text-2xl font-bold text-purple-600">89.7</div>
          <div className="text-xs text-gray-500">+0.9 from last week</div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4">
            <h4 className="font-semibold mb-2">Trust Factors</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Schema Markup Coverage</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Review Response Rate</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="flex justify-between">
                <span>Content Freshness</span>
                <span className="font-medium">91%</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border p-4">
            <h4 className="font-semibold mb-2">Authority Signals</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Backlink Quality Score</span>
                <span className="font-medium">8.7/10</span>
              </div>
              <div className="flex justify-between">
                <span>Domain Authority</span>
                <span className="font-medium">72</span>
              </div>
              <div className="flex justify-between">
                <span>Citation Consistency</span>
                <span className="font-medium">96%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
