'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface BotComparison {
  bot: string
  score: number
  response: string
  accuracy: number
  completeness: number
  relevance: number
}

export default function BotParityDiffViewer() {
  const [selectedQuery, setSelectedQuery] = useState('What are your current special offers?')
  const [expandedBot, setExpandedBot] = useState<string | null>(null)

  const mockComparisons: BotComparison[] = [
    {
      bot: 'ChatGPT',
      score: 87,
      response: 'We currently have several special offers including 0% APR financing for qualified buyers, $2,000 cash back on select models, and a trade-in bonus program. Our sales team can provide specific details based on your needs.',
      accuracy: 92,
      completeness: 85,
      relevance: 84
    },
    {
      bot: 'Claude',
      score: 91,
      response: 'Our dealership offers multiple special promotions: 0% APR financing for 60 months on new vehicles, up to $2,500 cash back on qualifying purchases, and an enhanced trade-in program that can add up to $1,000 to your vehicle\'s value. We also have seasonal promotions and manufacturer incentives.',
      accuracy: 94,
      completeness: 92,
      relevance: 87
    },
    {
      bot: 'Perplexity',
      score: 78,
      response: 'Special offers vary by location and time. Contact the dealership directly for current promotions.',
      accuracy: 85,
      completeness: 45,
      relevance: 78
    }
  ]

  const queries = [
    'What are your current special offers?',
    'What are your service hours?',
    'Do you have any hybrid vehicles in stock?',
    'What financing options do you offer?',
    'How do I schedule a test drive?'
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />
    if (score >= 80) return <AlertTriangle className="w-4 h-4" />
    return <XCircle className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Bot Parity Analysis</h3>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Query Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Query
        </label>
        <select
          value={selectedQuery}
          onChange={(e) => setSelectedQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {queries.map((query) => (
            <option key={query} value={query}>
              {query}
            </option>
          ))}
        </select>
      </div>

      {/* Bot Comparisons */}
      <div className="space-y-4">
        {mockComparisons.map((comparison) => (
          <div key={comparison.bot} className="border border-gray-200 rounded-lg">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedBot(expandedBot === comparison.bot ? null : comparison.bot)}
            >
              <div className="flex items-center gap-3">
                {expandedBot === comparison.bot ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <div className="font-medium">{comparison.bot}</div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getScoreColor(comparison.score)}`}>
                  {getScoreIcon(comparison.score)}
                  {comparison.score}/100
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Accuracy: {comparison.accuracy}% | Completeness: {comparison.completeness}% | Relevance: {comparison.relevance}%
              </div>
            </div>

            {expandedBot === comparison.bot && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Response:</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900">
                    {comparison.response}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{comparison.accuracy}%</div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{comparison.completeness}%</div>
                    <div className="text-xs text-gray-500">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{comparison.relevance}%</div>
                    <div className="text-xs text-gray-500">Relevance</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
        <div className="text-sm text-blue-800">
          <p>• Claude shows the highest overall performance with 91/100</p>
          <p>• ChatGPT provides good accuracy but could improve completeness</p>
          <p>• Perplexity needs significant improvement in response detail</p>
          <p>• All bots show good relevance to the query</p>
        </div>
      </div>
    </div>
  )
}