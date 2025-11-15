/**
 * Quick Actions Panel with Christopher Nolan & Matrix References
 * Sophisticated, cinematic responses that maintain wit without Tesla references
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BoltIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    id: 'symmetry-mode',
    name: 'Symmetry Mode',
    description: 'Balance your metrics like layers of a dream',
    icon: ChartBarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'time-dilation',
    name: 'Time Dilation',
    description: 'Navigate time like Cooper in Interstellar',
    icon: ClockIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    description: 'Uncover patterns more intricate than Inception',
    icon: ChartBarIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'ai-visibility',
    name: 'AI Visibility',
    description: 'Shine brighter than the Bat-Signal',
    icon: EyeIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'security-scan',
    name: 'Security Scan',
    description: 'Secure as the vault in The Dark Knight',
    icon: ShieldCheckIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'performance-boost',
    name: 'Performance Boost',
    description: 'Faster than Neo dodging bullets',
    icon: RocketLaunchIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'witty-insights',
    name: 'Witty Insights',
    description: 'More entertaining than a Nolan plot twist',
    icon: SparklesIcon,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  {
    id: 'lightning-mode',
    name: 'Lightning Mode',
    description: 'Bend time and space like Inception',
    icon: BoltIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
]

function getActionResponse(actionId: string): string {
  const responses: Record<string, string> = {
    'symmetry-mode': "🎯 Symmetry Mode activated! Your metrics are perfectly balanced—like layers of a dream within a dream. Even Cobb would be jealous.",
    'time-dilation': "⏰ Time Dilation engaged! Your processes are moving through time like Cooper navigating a black hole—time is on your side.",
    'trend-analysis': "📈 Trend analysis complete! I've found patterns more intricate than the dreamscapes of *Inception*—Sherlock Holmes might still be jealous.",
    'ai-visibility': "🤖 AI Visibility boosted! You're now more visible to AI than the Bat‑Signal piercing Gotham's night sky.",
    'security-scan': "🛡️ Security scan complete! Your systems are more secure than the vault in *The Dark Knight*.",
    'performance-boost': "🚀 Performance boost activated! Your systems are operating in bullet time—faster than Neo dodging bullets in *The Matrix*.",
    'witty-insights': "✨ Witty insights generated! Your data is more entertaining than a Christopher Nolan plot twist at a car dealership.",
    'lightning-mode': "⚡ Lightning Mode activated! Your data processing now bends time and space like the rotating hallway in *Inception*."
  }
  return responses[actionId] || "Action completed successfully!"
}

export default function QuickActionsPanel() {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<string, string>>({})

  const handleActionClick = async (actionId: string) => {
    setActiveAction(actionId)
    
    // Simulate action processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const response = getActionResponse(actionId)
    setResponses(prev => ({ ...prev, [actionId]: response }))
    setActiveAction(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
        <p className="text-gray-600">
          Execute powerful operations with cinematic precision. Choose your reality.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          const isActive = activeAction === action.id
          const hasResponse = responses[action.id]

          return (
            <motion.button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              disabled={isActive}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : hasResponse
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <div className={`text-center ${isActive ? 'opacity-0' : ''}`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.name}</h3>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>

              {hasResponse && (
                <div className="absolute inset-0 bg-green-50 border-2 border-green-500 rounded-lg p-3 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto mb-2 text-green-600">✓</div>
                    <p className="text-xs font-medium text-green-800">Complete</p>
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Response Display */}
      {Object.keys(responses).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          <h3 className="font-semibold text-gray-900">Action Results</h3>
          {Object.entries(responses).map(([actionId, response]) => (
            <div key={actionId} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{response}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}