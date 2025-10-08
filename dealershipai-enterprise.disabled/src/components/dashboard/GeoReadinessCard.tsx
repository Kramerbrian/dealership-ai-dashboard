'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface GeoSignals {
  geoChecklistScore: number
  aioExposurePct: number
  topicalDepthScore: number
  kgPresent: boolean
  kgCompleteness: number
  mentionVelocity4w: number
  extractabilityScore: number
  computedAt: string
}

interface GeoComposite {
  aivGeoScore: number
  rarAdjustmentFactor: number
  weeklyChange: number
  isStable: boolean
}

interface GeoReadinessData {
  signals: GeoSignals
  composite: GeoComposite
  stability: {
    isStable: boolean
    maxWeeklyChange: number
    trendDirection: 'up' | 'down' | 'stable'
  }
  recommendations: Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    message: string
    action: string
  }>
}

interface GeoReadinessCardProps {
  tenantId: string
  className?: string
}

export function GeoReadinessCard({ tenantId, className = '' }: GeoReadinessCardProps) {
  const [data, setData] = useState<GeoReadinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGeoSignals()
  }, [tenantId])

  const fetchGeoSignals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tenants/${tenantId}/geo-signals/latest`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch GEO signals')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`bg-red-50 border border-red-200 p-4 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">GEO Readiness Unavailable</span>
        </div>
        <p className="text-red-600 text-xs mt-1">
          {error || 'No data available'}
        </p>
      </div>
    )
  }

  const { signals, composite, stability, recommendations } = data

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getTrendIcon = () => {
    switch (stability.trendDirection) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4" />
    }
  }

  const getStabilityIcon = () => {
    return stability.isStable ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">GEO Readiness</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Google Engine Optimization readiness score
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {getStabilityIcon()}
        </div>
      </div>

      {/* Main Score */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${getScoreColor(composite.aivGeoScore)}`}>
            {composite.aivGeoScore}
          </span>
          <span className="text-sm text-gray-500">/ 100</span>
          {composite.weeklyChange !== 0 && (
            <span className={`text-xs ${composite.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {composite.weeklyChange > 0 ? '+' : ''}{composite.weeklyChange}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(composite.aivGeoScore)}`}
            style={{ width: `${composite.aivGeoScore}%` }}
          ></div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-600">AIO Exposure</span>
          <span className={`text-xs font-medium ${getScoreColor(signals.aioExposurePct)}`}>
            {signals.aioExposurePct}%
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-600">KG Present</span>
          <span className={`text-xs font-medium ${signals.kgPresent ? 'text-green-600' : 'text-red-600'}`}>
            {signals.kgPresent ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-600">Mentions</span>
          <span className={`text-xs font-medium ${getScoreColor(signals.mentionVelocity4w * 10)}`}>
            {signals.mentionVelocity4w}/4w
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-600">Stability</span>
          <span className={`text-xs font-medium ${stability.isStable ? 'text-green-600' : 'text-yellow-600'}`}>
            {stability.isStable ? 'Stable' : 'Unstable'}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Top Recommendations</h4>
          <div className="space-y-1">
            {recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1 ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-800">{rec.message}</p>
                  <p className="text-xs text-gray-500">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-400 mt-3 pt-2 border-t">
        Updated {new Date(signals.computedAt).toLocaleString()}
      </div>
    </div>
  )
}
