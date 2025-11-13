'use client'

import { useState } from 'react'

export default function AcquisitionKPIPanel() {
  const [timeframe, setTimeframe] = useState('30d')

  const kpiData = {
    '7d': { 
      leads: 127, 
      cost: 1840, 
      conversion: 12.3, 
      cac: 145,
      trend: 'up'
    },
    '30d': { 
      leads: 523, 
      cost: 7890, 
      conversion: 11.8, 
      cac: 151,
      trend: 'up'
    },
    '90d': { 
      leads: 1547, 
      cost: 22100, 
      conversion: 11.2, 
      cac: 143,
      trend: 'stable'
    }
  }

  const current = kpiData[timeframe as keyof typeof kpiData]

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Acquisition KPIs</h3>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Leads</div>
          <div className="text-2xl font-bold text-blue-600">{current.leads.toLocaleString()}</div>
          <div className={`text-xs flex items-center justify-center gap-1 ${
            current.trend === 'up' ? 'text-green-600' : current.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <span>{current.trend === 'up' ? '↗' : current.trend === 'down' ? '↘' : '→'}</span>
            <span>vs last period</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Cost</div>
          <div className="text-2xl font-bold text-orange-600">${current.cost.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total spend</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Conversion</div>
          <div className="text-2xl font-bold text-green-600">{current.conversion}%</div>
          <div className="text-xs text-gray-500">Lead to sale</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">CAC</div>
          <div className="text-2xl font-bold text-purple-600">${current.cac}</div>
          <div className="text-xs text-gray-500">Cost per lead</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Organic Traffic</span>
            <span className="text-sm text-green-600 font-semibold">+23%</span>
          </div>
          <div className="text-xs text-gray-500">AI visibility improvements</div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Paid Search</span>
            <span className="text-sm text-blue-600 font-semibold">-8%</span>
          </div>
          <div className="text-xs text-gray-500">Reduced dependency</div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Direct Traffic</span>
            <span className="text-sm text-purple-600 font-semibold">+15%</span>
          </div>
          <div className="text-xs text-gray-500">Brand recognition</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>ROI Impact:</strong> AI visibility improvements reduced paid acquisition costs by $1,890 this period.
        </div>
      </div>
    </div>
  )
}
