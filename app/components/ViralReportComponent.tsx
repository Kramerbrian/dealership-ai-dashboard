'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Eye, Share2, Heart, MessageCircle } from 'lucide-react'

interface ViralMetric {
  name: string
  value: number
  change: number
  trend: 'up' | 'down'
  icon: React.ReactNode
}

export default function ViralReportComponent() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const viralMetrics: ViralMetric[] = [
    {
      name: 'Social Mentions',
      value: 1247,
      change: 23.5,
      trend: 'up',
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      name: 'Share Rate',
      value: 8.7,
      change: 12.3,
      trend: 'up',
      icon: <Share2 className="w-5 h-5" />
    },
    {
      name: 'Engagement Rate',
      value: 15.2,
      change: -2.1,
      trend: 'down',
      icon: <Heart className="w-5 h-5" />
    },
    {
      name: 'Reach',
      value: 45600,
      change: 34.8,
      trend: 'up',
      icon: <Eye className="w-5 h-5" />
    }
  ]

  const topContent = [
    {
      title: '2024 Honda Civic - Amazing Deal!',
      platform: 'Facebook',
      shares: 234,
      likes: 567,
      comments: 89,
      reach: 12300
    },
    {
      title: 'Tesla Model 3 Test Drive Experience',
      platform: 'Instagram',
      shares: 189,
      likes: 445,
      comments: 67,
      reach: 8900
    },
    {
      title: 'BMW i4 Electric Vehicle Review',
      platform: 'TikTok',
      shares: 156,
      likes: 789,
      comments: 123,
      reach: 15600
    }
  ]

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Viral Content Report</h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
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

      {/* Viral Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {viralMetrics.map((metric) => (
          <div key={metric.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">{metric.icon}</div>
              <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                <span className="text-sm font-medium">{metric.change}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value.toLocaleString()}
              {metric.name === 'Share Rate' || metric.name === 'Engagement Rate' ? '%' : ''}
            </div>
            <div className="text-sm text-gray-500">{metric.name}</div>
          </div>
        ))}
      </div>

      {/* Top Performing Content */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Top Performing Content</h4>
        <div className="space-y-4">
          {topContent.map((content, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">{content.title}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{content.platform}</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500">{content.reach.toLocaleString()} reach</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{content.shares} shares</div>
                  <div className="text-xs text-gray-500">Viral Score: {Math.round((content.shares + content.likes + content.comments) / 10)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{content.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{content.comments}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Share2 className="w-4 h-4" />
                  <span>{content.shares}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viral Potential Score */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Viral Potential Score</h4>
            <p className="text-sm text-gray-600">Based on engagement patterns and content performance</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">87/100</div>
            <div className="text-sm text-gray-500">High Potential</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Viral Score</span>
            <span>87%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '87%'}}></div>
          </div>
        </div>
      </div>
    </div>
  )
}