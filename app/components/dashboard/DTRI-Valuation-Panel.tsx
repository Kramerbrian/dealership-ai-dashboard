'use client'

import { useState } from 'react'

export default function DTRIValuationPanel() {
  const [timeframe, setTimeframe] = useState('30d')

  const valuationData = {
    '7d': { value: 2.4, change: 0.3, trend: 'up' },
    '30d': { value: 8.7, change: 1.2, trend: 'up' },
    '90d': { value: 24.1, change: 3.4, trend: 'up' }
  }

  const current = valuationData[timeframe as keyof typeof valuationData]

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">DTRI Valuation</h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === period
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Estimated Value Impact</div>
          <div className="text-3xl font-bold text-green-600">
            ${current.value.toFixed(1)}M
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            current.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{current.trend === 'up' ? '↗' : '↘'}</span>
            <span>+${current.change.toFixed(1)}M vs last period</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-gray-500">Organic Traffic Value</div>
            <div className="text-lg font-semibold">$1.2M</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-gray-500">Brand Authority Value</div>
            <div className="text-lg font-semibold">$0.8M</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-gray-500">Trust Premium</div>
            <div className="text-lg font-semibold">$0.7M</div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Valuation Method:</strong> Based on organic traffic value, brand authority metrics, 
          and trust premium calculations using industry benchmarks.
        </div>
      </div>
    </div>
  )
}
