'use client'

import { useEffect, useState } from 'react'

interface Insight {
  id: string
  type: 'insight' | 'warning' | 'success'
  message: string
  timestamp: Date
}

export function InsightsFeed() {
  const [insights, setInsights] = useState<Insight[]>([])

  useEffect(() => {
    // TODO: Connect to real-time feed
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'insight',
        message: 'AI Visibility increased 5% this week',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'warning',
        message: 'Competitor launched new schema markup',
        timestamp: new Date(Date.now() - 3600000),
      },
    ]
    setInsights(mockInsights)

    // TODO: Set up real-time subscription
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold mb-4">AI Insights</h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-3 rounded-lg text-sm ${
              insight.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200'
                : insight.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <p>{insight.message}</p>
              <span className="text-xs text-gray-500 ml-2">
                {insight.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

