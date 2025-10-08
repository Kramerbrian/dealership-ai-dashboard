'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ReviewStats {
  totalReviews: number
  averageRating: number
  pendingResponses: number
  responseRate: number
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
  platformBreakdown: {
    google: number
    facebook: number
    cars: number
    dealerrater: number
  }
  recentTrend: {
    reviewsThisWeek: number
    averageRatingThisWeek: number
    responseRateThisWeek: number
  }
}

interface SentimentChartProps {
  stats: ReviewStats
}

export default function SentimentChart({ stats }: SentimentChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const totalSentiment = stats.sentimentBreakdown.positive + stats.sentimentBreakdown.neutral + stats.sentimentBreakdown.negative
  const positivePercent = totalSentiment > 0 ? (stats.sentimentBreakdown.positive / totalSentiment) * 100 : 0
  const neutralPercent = totalSentiment > 0 ? (stats.sentimentBreakdown.neutral / totalSentiment) * 100 : 0
  const negativePercent = totalSentiment > 0 ? (stats.sentimentBreakdown.negative / totalSentiment) * 100 : 0

  // Mock time series data - in production, this would come from your analytics service
  const generateTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Simulate daily sentiment data
      const basePositive = positivePercent
      const baseNegative = negativePercent
      const variation = 10 // ±10% variation
      
      const dailyPositive = Math.max(0, Math.min(100, basePositive + (Math.random() - 0.5) * variation))
      const dailyNegative = Math.max(0, Math.min(100, baseNegative + (Math.random() - 0.5) * variation))
      const dailyNeutral = 100 - dailyPositive - dailyNegative
      
      data.push({
        date: dateStr,
        positive: dailyPositive,
        neutral: dailyNeutral,
        negative: dailyNegative,
        total: Math.floor(Math.random() * 5) + 1 // 1-5 reviews per day
      })
    }
    
    return data
  }

  const timeSeriesData = generateTimeSeriesData()

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Sentiment Analysis</h3>
          <p className="text-sm text-slate-500">Review sentiment over time</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{positivePercent.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Positive</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-600">{neutralPercent.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Neutral</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{negativePercent.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Negative</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <line
              key={val}
              x1="0"
              y1={200 - val * 2}
              x2="800"
              y2={200 - val * 2}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Positive sentiment line */}
          <polyline
            points={timeSeriesData
              .map((point, i) => {
                const x = (i / (timeSeriesData.length - 1)) * 800
                const y = 200 - point.positive * 2
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Negative sentiment line */}
          <polyline
            points={timeSeriesData
              .map((point, i) => {
                const x = (i / (timeSeriesData.length - 1)) * 800
                const y = 200 - point.negative * 2
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area fills */}
          <polygon
            points={`0,200 ${timeSeriesData
              .map((point, i) => {
                const x = (i / (timeSeriesData.length - 1)) * 800
                const y = 200 - point.positive * 2
                return `${x},${y}`
              })
              .join(' ')} 800,200`}
            fill="url(#positiveGradient)"
          />

          <polygon
            points={`0,200 ${timeSeriesData
              .map((point, i) => {
                const x = (i / (timeSeriesData.length - 1)) * 800
                const y = 200 - point.negative * 2
                return `${x},${y}`
              })
              .join(' ')} 800,200`}
            fill="url(#negativeGradient)"
          />

          <defs>
            <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-slate-600">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-slate-600">Negative</span>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Reviews by Platform</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.platformBreakdown).map(([platform, count]) => (
            <div key={platform} className="text-center">
              <div className="text-lg font-bold text-slate-900">{count}</div>
              <div className="text-sm text-slate-600 capitalize">{platform}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
