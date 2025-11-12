'use client'

import { useEffect, useState } from 'react'

interface Action {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  impact: number
  effort: string
  confidence: number
}

export function ActionStack() {
  const [actions, setActions] = useState<Action[]>([])

  useEffect(() => {
    // TODO: Fetch from ASR generator
    const mockActions: Action[] = [
      {
        id: '1',
        priority: 'high',
        title: 'Add missing schema markup',
        impact: 5000,
        effort: 'Low',
        confidence: 0.87,
      },
      {
        id: '2',
        priority: 'medium',
        title: 'Optimize FAQ page content',
        impact: 3000,
        effort: 'Medium',
        confidence: 0.75,
      },
    ]
    setActions(mockActions)
  }, [])

  const sortedActions = actions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold mb-4">Action Stack</h3>
      <div className="space-y-3">
        {sortedActions.map((action) => (
          <div
            key={action.id}
            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm">{action.title}</div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  action.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : action.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {action.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Impact: ${(action.impact / 1000).toFixed(0)}K</span>
              <span>Effort: {action.effort}</span>
              <span>Confidence: {(action.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

