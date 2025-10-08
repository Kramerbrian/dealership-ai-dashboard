'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Target, Eye, MousePointer } from 'lucide-react'

interface AOERData {
  rollup: {
    aoer: {
      unweighted: number
      volumeWeighted: number
      positional: number
      positionalWeighted: number
    }
    avgAiClaimScore: number
    citationShare: number
    estimatedMonthlyClickLoss: number
    totalQueries: number
    queriesWithAI: number
    topPriorityQueries: Array<{
      query: string
      intent: string
      aiClaimScore: number
      clickLoss: number
      priorityScore: number
    }>
  }
  intentBreakdown: Array<{
    intent: string
    aoer: number
    aoerWeighted: number
    queryCount: number
  }>
  trends: {
    aoerChange: number
    clickLossChange: number
    citationShareChange: number
    trend: 'improving' | 'declining' | 'stable'
  } | null
  recommendations: Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    message: string
    action: string
    impact: string
  }>
  lastUpdated: string
}

interface AOERCardProps {
  tenantId: string
  className?: string
}

export function AOERCard({ tenantId, className = '' }: AOERCardProps) {
  const [data, setData] = useState<AOERData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'priority' | 'intents'>('overview')

  useEffect(() => {
    fetchAOERData()
  }, [tenantId])

  const fetchAOERData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tenants/${tenantId}/aoer`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch AOER data')
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
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`bg-red-50 border border-red-200 p-6 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">AOER Data Unavailable</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          {error || 'No data available'}
        </p>
      </div>
    )
  }

  const { rollup, intentBreakdown, trends, recommendations } = data

  const getScoreColor = (score: number, reverse = false) => {
    const threshold = reverse ? 30 : 70
    if (reverse) {
      return score <= threshold ? 'text-green-600' : score <= 50 ? 'text-yellow-600' : 'text-red-600'
    }
    return score >= threshold ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
  }

  const getScoreBgColor = (score: number, reverse = false) => {
    const threshold = reverse ? 30 : 70
    if (reverse) {
      return score <= threshold ? 'bg-green-100' : score <= 50 ? 'bg-yellow-100' : 'bg-red-100'
    }
    return score >= threshold ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
  }

  const getTrendIcon = () => {
    if (!trends) return <div className="w-4 h-4" />
    
    switch (trends.trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">AI Overview Exposure Rate</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Tracks AI Overview presence and impact on your queries
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-sm text-gray-500">
              {new Date(data.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'priority', label: '🎯 Priority' },
            { id: 'intents', label: '📋 Intents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">AOER (Weighted)</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {(rollup.aoer.positionalWeighted * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Prominence-weighted</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600">Avg AI Claim Score</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(rollup.avgAiClaimScore, true)}`}>
                  {rollup.avgAiClaimScore.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Lower is better</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Citation Share</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(rollup.citationShare * 100)}`}>
                  {(rollup.citationShare * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">In AI Overviews</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600">Click Loss</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(rollup.estimatedMonthlyClickLoss)}
                </div>
                <div className="text-xs text-gray-500">Monthly estimated</div>
              </div>
            </div>

            {/* Trends */}
            {trends && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Trends (Last 15 days)</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">AOER Change:</span>
                    <span className={`ml-2 font-medium ${trends.aoerChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trends.aoerChange > 0 ? '+' : ''}{(trends.aoerChange * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Click Loss:</span>
                    <span className={`ml-2 font-medium ${trends.clickLossChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trends.clickLossChange > 0 ? '+' : ''}{formatNumber(trends.clickLossChange)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Citations:</span>
                    <span className={`ml-2 font-medium ${trends.citationShareChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trends.citationShareChange > 0 ? '+' : ''}{(trends.citationShareChange * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{rec.message}</p>
                        <p className="text-sm text-gray-600">{rec.action}</p>
                        <p className="text-xs text-gray-500 mt-1">Impact: {rec.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'priority' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Top Priority Queries</h4>
            <div className="space-y-2">
              {rollup.topPriorityQueries.slice(0, 10).map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{query.query}</p>
                    <p className="text-sm text-gray-600 capitalize">{query.intent}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-orange-600">{query.aiClaimScore.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">ACS</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-red-600">{formatNumber(query.clickLoss)}</p>
                      <p className="text-xs text-gray-500">Loss</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-blue-600">{query.priorityScore.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">Priority</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'intents' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Intent Breakdown</h4>
            <div className="space-y-3">
              {intentBreakdown.map((intent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{intent.intent}</p>
                    <p className="text-sm text-gray-600">{intent.queryCount} queries</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-blue-600">{(intent.aoer * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">AOER</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{(intent.aoerWeighted * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Weighted</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
