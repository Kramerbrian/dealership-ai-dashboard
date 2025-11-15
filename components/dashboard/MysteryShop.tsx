/**
 * Mystery Shop Component
 * Enterprise-tier feature for automated mystery shopping
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface MysteryShopProps {
  dealership: {
    id: string
    name: string
    domain: string
    city: string
    state: string
  }
  userTier: string
}

interface MysteryShopResult {
  id: string
  type: 'email' | 'chat' | 'phone' | 'form'
  query: string
  response: string
  responseTime: number
  personalizationScore: number
  transparencyScore: number
  followupScore: number
  professionalismScore: number
  overallScore: number
  conductedAt: Date
  status: 'completed' | 'pending' | 'failed'
}

export function MysteryShop({ dealership, userTier }: MysteryShopProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'settings'>('overview')
  const [isRunning, setIsRunning] = useState(false)

  // Mock data - in production this would come from the API
  const mockResults: MysteryShopResult[] = [
    {
      id: '1',
      type: 'email',
      query: 'I\'m looking for a 2024 Honda Civic. Do you have any in stock?',
      response: 'Thank you for your interest! We have several 2024 Honda Civics available. Let me check our inventory and get back to you with specific details.',
      responseTime: 2.5,
      personalizationScore: 85,
      transparencyScore: 90,
      followupScore: 75,
      professionalismScore: 88,
      overallScore: 84.5,
      conductedAt: new Date('2024-01-15T10:30:00Z'),
      status: 'completed'
    },
    {
      id: '2',
      type: 'chat',
      query: 'What are your financing options for a used car?',
      response: 'We offer competitive financing through multiple lenders. Our finance team can help you find the best rates based on your credit score.',
      responseTime: 1.2,
      personalizationScore: 70,
      transparencyScore: 80,
      followupScore: 60,
      professionalismScore: 85,
      overallScore: 73.8,
      conductedAt: new Date('2024-01-14T14:15:00Z'),
      status: 'completed'
    },
    {
      id: '3',
      type: 'phone',
      query: 'Do you have any special offers this month?',
      response: 'Yes! We have several special offers including 0% APR financing and cash back incentives. Let me transfer you to our sales team for details.',
      responseTime: 0.8,
      personalizationScore: 90,
      transparencyScore: 85,
      followupScore: 95,
      professionalismScore: 92,
      overallScore: 90.5,
      conductedAt: new Date('2024-01-13T16:45:00Z'),
      status: 'completed'
    }
  ]

  const averageScore = mockResults.reduce((sum, result) => sum + (result as any).overallScore, 0) / mockResults.length
  const totalTests = mockResults.length
  const completedTests = mockResults.filter(r => r.status === 'completed').length

  const handleRunMysteryShop = async () => {
    setIsRunning(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsRunning(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    if (score >= 60) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
    return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
  }

  if (userTier !== 'ENTERPRISE') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCartIcon className="w-12 h-12 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Mystery Shop</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Automated mystery shopping to test your customer experience across all touchpoints.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-purple-800 font-medium">Enterprise Feature</p>
          <p className="text-purple-600 text-sm">Upgrade to Enterprise to access mystery shopping automation</p>
        </div>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          Upgrade to Enterprise
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mystery Shop</h2>
          <p className="text-gray-600">Automated customer experience testing</p>
        </div>
        <button
          onClick={handleRunMysteryShop}
          disabled={isRunning}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <ShoppingCartIcon className="w-5 h-5" />
              Run Mystery Shop
            </>
          )}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
            </div>
            {getScoreIcon(averageScore)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedTests}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-3xl font-bold text-gray-900">{totalTests}</p>
            </div>
            <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalTests > 0 ? ((completedTests / totalTests) * 100).toFixed(0) : 0}%
              </p>
            </div>
            <StarIcon className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'results', name: 'Test Results' },
              { id: 'settings', name: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tests</h3>
                  <div className="space-y-3">
                    {mockResults.slice(0, 3).map((result) => (
                      <div key={(result as any).id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          {(result as any).type === 'email' && <EnvelopeIcon className="w-5 h-5 text-blue-600" />}
                          {(result as any).type === 'chat' && <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />}
                          {(result as any).type === 'phone' && <PhoneIcon className="w-5 h-5 text-purple-600" />}
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{(result as any).type} Test</p>
                            <p className="text-sm text-gray-600">{(result as any).conductedAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((result as any).overallScore)}`}>
                          {(result as any).overallScore.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium text-gray-900">
                        {(mockResults.reduce((sum, r) => sum + r.responseTime, 0) / mockResults.length).toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Personalization</span>
                      <span className="font-medium text-gray-900">
                        {(mockResults.reduce((sum, r) => sum + r.personalizationScore, 0) / mockResults.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Transparency</span>
                      <span className="font-medium text-gray-900">
                        {(mockResults.reduce((sum, r) => sum + r.transparencyScore, 0) / mockResults.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Follow-up</span>
                      <span className="font-medium text-gray-900">
                        {(mockResults.reduce((sum, r) => sum + r.followupScore, 0) / mockResults.length).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {mockResults.map((result) => (
                  <motion.div
                    key={(result as any).id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {(result as any).type === 'email' && <EnvelopeIcon className="w-6 h-6 text-blue-600" />}
                        {(result as any).type === 'chat' && <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />}
                        {(result as any).type === 'phone' && <PhoneIcon className="w-6 h-6 text-purple-600" />}
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">{(result as any).type} Test</h3>
                          <p className="text-sm text-gray-600">{(result as any).conductedAt.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((result as any).overallScore)}`}>
                        {(result as any).overallScore.toFixed(1)} Overall
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Query</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{(result as any).query}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Response</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{(result as any).response}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Response Time</p>
                          <p className="font-semibold text-gray-900">{(result as any).responseTime}s</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Personalization</p>
                          <p className="font-semibold text-gray-900">{(result as any).personalizationScore}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Transparency</p>
                          <p className="font-semibold text-gray-900">{(result as any).transparencyScore}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Follow-up</p>
                          <p className="font-semibold text-gray-900">{(result as any).followupScore}%</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Frequency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Types</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-gray-700">Email Inquiries</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-gray-700">Live Chat</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-gray-700">Phone Calls</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Contact Forms</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Queries</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Enter test queries, one per line..."
                      defaultValue="I'm looking for a 2024 Honda Civic. Do you have any in stock?
What are your financing options for a used car?
Do you have any special offers this month?
Can you help me find a reliable family car?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}