'use client'

import { useState } from 'react'
import { Zap, Target, Clock, TrendingUp, Brain, Shield, Rocket, Star } from 'lucide-react'

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'analytics' | 'automation' | 'insights' | 'fun'
  action: () => void
}

export default function QuickActionsPanel() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'symmetry-mode',
      name: 'Symmetry Mode',
      description: 'Activate perfect balance across all metrics',
      icon: <Target className="w-5 h-5" />,
      category: 'analytics',
      action: () => handleAction('symmetry-mode')
    },
    {
      id: 'time-dilation',
      name: 'Time Dilation',
      description: 'Speed up slow processes with AI magic',
      icon: <Clock className="w-5 h-5" />,
      category: 'automation',
      action: () => handleAction('time-dilation')
    },
    {
      id: 'trend-analysis',
      name: 'Trend Analysis',
      description: 'Uncover hidden patterns in your data',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'insights',
      action: () => handleAction('trend-analysis')
    },
    {
      id: 'ai-visibility',
      name: 'AI Visibility Boost',
      description: 'Enhance your presence in AI responses',
      icon: <Brain className="w-5 h-5" />,
      category: 'insights',
      action: () => handleAction('ai-visibility')
    },
    {
      id: 'security-scan',
      name: 'Security Scan',
      description: 'Run comprehensive security check',
      icon: <Shield className="w-5 h-5" />,
      category: 'automation',
      action: () => handleAction('security-scan')
    },
    {
      id: 'performance-boost',
      name: 'Performance Boost',
      description: 'Optimize all systems for maximum speed',
      icon: <Rocket className="w-5 h-5" />,
      category: 'automation',
      action: () => handleAction('performance-boost')
    },
    {
      id: 'witty-insights',
      name: 'Witty Insights',
      description: 'Get humorous analysis of your metrics',
      icon: <Star className="w-5 h-5" />,
      category: 'fun',
      action: () => handleAction('witty-insights')
    },
    {
      id: 'lightning-mode',
      name: 'Lightning Mode',
      description: 'Ultra-fast data processing activated',
      icon: <Zap className="w-5 h-5" />,
      category: 'automation',
      action: () => handleAction('lightning-mode')
    }
  ]

  const handleAction = (actionId: string) => {
    setSelectedAction(actionId)
    
    // Simulate action execution
    setTimeout(() => {
      setSelectedAction(null)
    }, 2000)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'automation':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'insights':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'fun':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getActionResponse = (actionId: string) => {
    const responses: Record<string, string> = {
      'symmetry-mode': "🎯 Symmetry Mode activated! Your metrics are now perfectly balanced, as all things should be. Thanos would be proud!",
      'time-dilation': "⏰ Time Dilation engaged! Your processes are now moving at relativistic speeds. Einstein would be impressed!",
      'trend-analysis': "📈 Trend analysis complete! I've found patterns that would make even Sherlock Holmes jealous.",
      'ai-visibility': "🤖 AI Visibility boosted! You're now more visible to AI than a neon sign in Times Square.",
      'security-scan': "🛡️ Security scan complete! Your systems are more secure than Fort Knox.",
      'performance-boost': "🚀 Performance boost activated! Your systems are now faster than a Tesla on Ludicrous Mode.",
      'witty-insights': "✨ Witty insights generated! Your data is funnier than a stand-up comedian at a car dealership.",
      'lightning-mode': "⚡ Lightning Mode activated! Your data processing is now faster than a bolt of lightning!"
    }
    return responses[actionId] || "Action completed successfully!"
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
        <p className="text-sm text-gray-600">One-click solutions for common tasks</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={selectedAction === action.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getCategoryColor(action.category)} ${
              selectedAction === action.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2">
                {action.icon}
              </div>
              <h4 className="text-sm font-medium mb-1">{action.name}</h4>
              <p className="text-xs opacity-75">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedAction && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-800 font-medium">Executing...</span>
          </div>
          <p className="text-sm text-green-700 mt-2">{getActionResponse(selectedAction)}</p>
        </div>
      )}
    </div>
  )
}
