'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Eye, Users, DollarSign, Star, AlertTriangle, CheckCircle } from 'lucide-react'

interface MetricCard {
  id: string
  title: string
  value: string
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description: string
  lastUpdated: Date
}

export default function EnhancedMockMetricCards() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      id: 'qai',
      title: 'QAI Score',
      value: '87.3',
      change: 4.2,
      changeType: 'positive',
      icon: <Star className="w-5 h-5" />,
      description: 'Quality Assurance Index - Overall dealership performance',
      lastUpdated: new Date()
    },
    {
      id: 'vco',
      title: 'VCO Rating',
      value: '92.1',
      change: -1.8,
      changeType: 'negative',
      icon: <Users className="w-5 h-5" />,
      description: 'Vehicle Customer Operations - Customer satisfaction metrics',
      lastUpdated: new Date()
    },
    {
      id: 'piqr',
      title: 'PIQR Index',
      value: '78.9',
      change: 2.1,
      changeType: 'positive',
      icon: <Eye className="w-5 h-5" />,
      description: 'Product Information Quality Rating - Content accuracy',
      lastUpdated: new Date()
    },
    {
      id: 'marketing',
      title: 'Marketing ROI',
      value: '156%',
      change: 12.3,
      changeType: 'positive',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Return on marketing investment across all channels',
      lastUpdated: new Date()
    },
    {
      id: 'mystery',
      title: 'Mystery Shop',
      value: '8.7/10',
      change: 0.3,
      changeType: 'positive',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Average mystery shopper experience rating',
      lastUpdated: new Date()
    },
    {
      id: 'alerts',
      title: 'Active Alerts',
      value: '3',
      change: -2,
      changeType: 'positive',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Critical issues requiring immediate attention',
      lastUpdated: new Date()
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        // Randomly update some metrics
        if (Math.random() > 0.7) {
          const change = (Math.random() - 0.5) * 2 // -1 to 1
          const newValue = parseFloat(metric.value.replace(/[^\d.]/g, '')) + change
          
          return {
            ...metric,
            value: metric.id === 'marketing' ? `${Math.max(0, newValue).toFixed(0)}%` :
                   metric.id === 'mystery' ? `${Math.min(10, Math.max(0, newValue)).toFixed(1)}/10` :
                   Math.max(0, newValue).toFixed(1),
            change: change,
            changeType: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
            lastUpdated: new Date()
          }
        }
        return metric
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                {metric.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(metric.changeType)}`}>
              {getChangeIcon(metric.changeType)}
              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
          </div>
          
          <div className="text-xs text-gray-500">
            Last updated: {metric.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  )
}
