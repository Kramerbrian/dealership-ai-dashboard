'use client'

import React, { useState, useEffect } from 'react'

interface ConfidenceInterval {
  mean: number
  lower: number
  upper: number
  confidence: number
  sampleSize: number
}

interface ConfidenceIntervalDisplayProps {
  type: 'ai_visibility' | 'conversion_rate' | 'revenue' | 'click_through_rate' | 'session_duration' | 'bounce_rate'
  data: any
  title: string
  unit?: string
  currency?: boolean
}

export default function ConfidenceIntervalDisplay({ 
  type, 
  data, 
  title, 
  unit = '', 
  currency = false 
}: ConfidenceIntervalDisplayProps) {
  const [ci, setCi] = useState<ConfidenceInterval | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateCI = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analytics/confidence-intervals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          confidence: 0.95
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate confidence interval')
      }

      setCi(result.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculateCI()
  }, [type, data])

  const formatValue = (value: number) => {
    if (currency) {
      return `$${value.toLocaleString()}`
    }
    if (unit === '%') {
      return `${(value * 100).toFixed(1)}%`
    }
    return `${value.toFixed(1)}${unit}`
  }

  const getRangeWidth = () => {
    if (!ci) return 0
    return ci.upper - ci.lower
  }

  const getRangePercentage = () => {
    if (!ci) return 0
    return ((ci.upper - ci.lower) / ci.mean) * 100
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-red-600 text-sm">
          Error: {error}
        </div>
        <button
          onClick={calculateCI}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!ci) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {/* Main Result */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {formatValue(ci.mean)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {ci.confidence}% Confidence Interval
          </div>
        </div>

        {/* Range Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Range</span>
            <span className="text-sm text-gray-600">
              {formatValue(ci.lower)} - {formatValue(ci.upper)}
            </span>
          </div>
          
          {/* Visual Range Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full relative"
                style={{ 
                  width: '100%',
                  left: `${Math.max(0, ((ci.lower - (ci.mean - (ci.upper - ci.lower) * 2)) / ((ci.mean + (ci.upper - ci.lower) * 2) - (ci.mean - (ci.upper - ci.lower) * 2))) * 100)}%`
                }}
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-blue-700 rounded"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatValue(ci.lower)}</span>
              <span className="font-medium">{formatValue(ci.mean)}</span>
              <span>{formatValue(ci.upper)}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Sample Size</div>
            <div className="font-semibold">{ci.sampleSize}</div>
          </div>
          <div>
            <div className="text-gray-600">Range Width</div>
            <div className="font-semibold">{formatValue(getRangeWidth())}</div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>Interpretation:</strong> We are {ci.confidence}% confident that the true value lies between{' '}
            {formatValue(ci.lower)} and {formatValue(ci.upper)}. The range width is{' '}
            {getRangePercentage().toFixed(1)}% of the mean value.
          </div>
        </div>

        {/* Data Quality Indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Data Quality</span>
          <div className="flex items-center">
            {ci.sampleSize >= 30 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600">High (n≥30)</span>
              </>
            ) : ci.sampleSize >= 10 ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-yellow-600">Medium (n≥10)</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-600">Low (n&lt;10)</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Example usage component
export function ConfidenceIntervalExamples() {
  const examples = [
    {
      type: 'ai_visibility' as const,
      data: { scores: [78, 82, 75, 85, 79, 81, 77, 83, 80, 76] },
      title: 'AI Visibility Score',
      unit: ' points'
    },
    {
      type: 'conversion_rate' as const,
      data: { conversions: 45, total: 1000 },
      title: 'Conversion Rate',
      unit: '%'
    },
    {
      type: 'revenue' as const,
      data: { revenues: [15000, 18000, 16500, 22000, 19500] },
      title: 'Revenue Impact',
      currency: true
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Confidence Interval Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <ConfidenceIntervalDisplay
            key={index}
            type={example.type}
            data={example.data}
            title={example.title}
            unit={example.unit}
            currency={example.currency}
          />
        ))}
      </div>
    </div>
  )
}
