'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react'

interface APIUsageData {
  t: string
  calls: number
  errors: number
  latency: number
}

interface APIUsageChartProps {
  data: APIUsageData[]
}

export default function APIUsageChart({ data }: APIUsageChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'calls' | 'errors' | 'latency'>('calls')
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')

  const maxValue = Math.max(...data.map(d => d[selectedMetric]))
  const minValue = Math.min(...data.map(d => d[selectedMetric]))
  const avgValue = data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'calls': return 'text-blue-600'
      case 'errors': return 'text-red-600'
      case 'latency': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'calls': return <Activity className="w-4 h-4" />
      case 'errors': return <AlertTriangle className="w-4 h-4" />
      case 'latency': return <TrendingUp className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatValue = (value: number) => {
    if (selectedMetric === 'latency') return `${value}ms`
    return value.toString()
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">API Usage Analytics</h3>
        <div className="flex gap-2">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6">
        {(['calls', 'errors', 'latency'] as const).map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === metric
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getMetricIcon(metric)}
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="h-64 flex items-end justify-between gap-1">
          {data.map((point, index) => {
            const height = (point[selectedMetric] / maxValue) * 100
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    selectedMetric === 'calls' ? 'bg-blue-500' :
                    selectedMetric === 'errors' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                  {point.t}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{formatValue(maxValue)}</div>
          <div className="text-sm text-gray-500">Peak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{formatValue(Math.round(avgValue))}</div>
          <div className="text-sm text-gray-500">Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{formatValue(minValue)}</div>
          <div className="text-sm text-gray-500">Minimum</div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">API Status: Healthy</span>
          </div>
          <div className="text-sm text-gray-500">
            Error Rate: {(data.reduce((sum, d) => sum + d.errors, 0) / data.reduce((sum, d) => sum + d.calls, 0) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}