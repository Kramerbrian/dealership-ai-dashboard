/**
 * Dealer Targeting Dashboard
 * Identify and target underperforming dealers with poor AI visibility
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TargetIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface DealerTarget {
  id: string
  name: string
  city: string
  state: string
  brand: string
  qaiScore: number
  marketRank: number
  totalCompetitors: number
  revenueAtRisk: number
  quickWinsAvailable: number
  trend: 'up' | 'down' | 'stable'
  targetScore: number
  priority: 'high' | 'medium' | 'low'
  lastContacted?: Date
  status: 'new' | 'contacted' | 'demo_scheduled' | 'closed' | 'lost'
}

interface TargetingMetrics {
  totalTargets: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
  totalRevenueAtRisk: number
  averageQaiScore: number
  conversionRate: number
}

export default function DealerTargetingDashboard() {
  const [targets, setTargets] = useState<DealerTarget[]>([])
  const [metrics, setMetrics] = useState<TargetingMetrics | null>(null)
  const [filters, setFilters] = useState({
    qaiScoreMax: 60,
    marketRankMin: 8,
    revenueAtRiskMin: 10000,
    priority: 'all' as 'all' | 'high' | 'medium' | 'low'
  })
  const [sortBy, setSortBy] = useState<'targetScore' | 'revenueAtRisk' | 'qaiScore'>('targetScore')

  // Mock data - in production this would come from the API
  useEffect(() => {
    const mockTargets: DealerTarget[] = [
      {
        id: '1',
        name: 'Terry Reid Hyundai',
        city: 'Naples',
        state: 'FL',
        brand: 'Hyundai',
        qaiScore: 45,
        marketRank: 8,
        totalCompetitors: 12,
        revenueAtRisk: 15000,
        quickWinsAvailable: 7,
        trend: 'down',
        targetScore: 22,
        priority: 'high',
        status: 'new'
      },
      {
        id: '2',
        name: 'Honda of Naples',
        city: 'Naples',
        state: 'FL',
        brand: 'Honda',
        qaiScore: 52,
        marketRank: 6,
        totalCompetitors: 10,
        revenueAtRisk: 12000,
        quickWinsAvailable: 5,
        trend: 'stable',
        targetScore: 28,
        priority: 'medium',
        status: 'contacted'
      },
      {
        id: '3',
        name: 'Ford Country',
        city: 'Naples',
        state: 'FL',
        brand: 'Ford',
        qaiScore: 35,
        marketRank: 10,
        totalCompetitors: 12,
        revenueAtRisk: 20000,
        quickWinsAvailable: 9,
        trend: 'down',
        targetScore: 18,
        priority: 'high',
        status: 'demo_scheduled'
      },
      {
        id: '4',
        name: 'Chevrolet Central',
        city: 'Naples',
        state: 'FL',
        brand: 'Chevrolet',
        qaiScore: 58,
        marketRank: 5,
        totalCompetitors: 8,
        revenueAtRisk: 8000,
        quickWinsAvailable: 3,
        trend: 'up',
        targetScore: 32,
        priority: 'low',
        status: 'new'
      },
      {
        id: '5',
        name: 'Toyota Town',
        city: 'Naples',
        state: 'FL',
        brand: 'Toyota',
        qaiScore: 42,
        marketRank: 9,
        totalCompetitors: 11,
        revenueAtRisk: 18000,
        quickWinsAvailable: 8,
        trend: 'down',
        targetScore: 20,
        priority: 'high',
        status: 'new'
      }
    ]

    setTargets(mockTargets)

    // Calculate metrics
    const totalTargets = mockTargets.length
    const highPriority = mockTargets.filter(t => t.priority === 'high').length
    const mediumPriority = mockTargets.filter(t => t.priority === 'medium').length
    const lowPriority = mockTargets.filter(t => t.priority === 'low').length
    const totalRevenueAtRisk = mockTargets.reduce((sum, t) => sum + t.revenueAtRisk, 0)
    const averageQaiScore = mockTargets.reduce((sum, t) => sum + t.qaiScore, 0) / mockTargets.length
    const conversionRate = 0.25 // 25% demo-to-deal conversion

    setMetrics({
      totalTargets,
      highPriority,
      mediumPriority,
      lowPriority,
      totalRevenueAtRisk,
      averageQaiScore,
      conversionRate
    })
  }, [])

  const filteredTargets = targets
    .filter(target => {
      if (filters.qaiScoreMax && target.qaiScore > filters.qaiScoreMax) return false
      if (filters.marketRankMin && target.marketRank < filters.marketRankMin) return false
      if (filters.revenueAtRiskMin && target.revenueAtRisk < filters.revenueAtRiskMin) return false
      if (filters.priority !== 'all' && target.priority !== filters.priority) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'targetScore':
          return a.targetScore - b.targetScore
        case 'revenueAtRisk':
          return b.revenueAtRisk - a.revenueAtRisk
        case 'qaiScore':
          return a.qaiScore - b.qaiScore
        default:
          return 0
      }
    })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50'
      case 'contacted': return 'text-yellow-600 bg-yellow-50'
      case 'demo_scheduled': return 'text-purple-600 bg-purple-50'
      case 'closed': return 'text-green-600 bg-green-50'
      case 'lost': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
      case 'down': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 rotate-180" />
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dealer Targeting Dashboard</h1>
          <p className="text-gray-600">Identify and target underperforming dealers with poor AI visibility</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <TargetIcon className="w-5 h-5 inline mr-2" />
            Run Market Scan
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <ChartBarIcon className="w-5 h-5 inline mr-2" />
            Export Targets
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Targets</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTargets}</p>
              </div>
              <TargetIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highPriority}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue at Risk</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenueAtRisk.toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg QAI★ Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageQaiScore.toFixed(1)}</p>
              </div>
              <StarIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">QAI★ Score Max</label>
            <input
              type="number"
              value={filters.qaiScoreMax}
              onChange={(e) => setFilters({...filters, qaiScoreMax: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Market Rank Min</label>
            <input
              type="number"
              value={filters.marketRankMin}
              onChange={(e) => setFilters({...filters, marketRankMin: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Revenue at Risk Min</label>
            <input
              type="number"
              value={filters.revenueAtRiskMin}
              onChange={(e) => setFilters({...filters, revenueAtRiskMin: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="targetScore">Target Score</option>
              <option value="revenueAtRisk">Revenue at Risk</option>
              <option value="qaiScore">QAI★ Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Targets Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QAI★ Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue at Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Wins</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTargets.map((target) => (
                <motion.tr
                  key={target.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{target.name}</div>
                      <div className="text-sm text-gray-500">{target.city}, {target.state} • {target.brand}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{target.qaiScore}</span>
                      {getTrendIcon(target.trend)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">#{target.marketRank} of {target.totalCompetitors}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${target.revenueAtRisk.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{target.quickWinsAvailable}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(target.priority)}`}>
                      {target.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(target.status)}`}>
                      {target.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Contact</button>
                      <button className="text-green-600 hover:text-green-900">Demo</button>
                      <button className="text-purple-600 hover:text-purple-900">Close</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center">
          <EyeIcon className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Targeting Summary</h3>
            <p className="text-blue-700">
              Found {filteredTargets.length} underperforming dealers with poor AI visibility. 
              Total revenue opportunity: ${filteredTargets.reduce((sum, t) => sum + t.revenueAtRisk, 0).toLocaleString()}/month
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
