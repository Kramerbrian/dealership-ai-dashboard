'use client'

import { useState } from 'react'
// Removed Clerk dependency
import { GPTIframe, GPTAPIComponent } from '@/components/gpt/GPTIframe'
import { Brain, Zap, BarChart3, TrendingUp, Users, Target } from 'lucide-react'

export default function GPTPage() {
  // Mock user for demo purposes
  const user = {
    id: 'demo-user',
    organizationMemberships: [{ organization: { id: 'demo-tenant' } }]
  }
  const [selectedAction, setSelectedAction] = useState('analyze_visibility')
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const gptActions = [
    {
      id: 'analyze_visibility',
      name: 'Analyze Visibility',
      description: 'Get comprehensive visibility analysis and recommendations',
      icon: <BarChart3 className="w-5 h-5" />,
      parameters: {
        includeCompetitors: true,
        includeTrends: true,
        includeRecommendations: true
      }
    },
    {
      id: 'generate_content',
      name: 'Generate Content',
      description: 'Create optimized content for your dealership',
      icon: <Brain className="w-5 h-5" />,
      parameters: {
        contentType: 'blog_post',
        targetKeywords: ['car dealership', 'auto financing'],
        tone: 'professional'
      }
    },
    {
      id: 'analyze_competitors',
      name: 'Analyze Competitors',
      description: 'Get insights about your competitive landscape',
      icon: <Users className="w-5 h-5" />,
      parameters: {
        competitorCount: 5,
        includePricing: true,
        includeContent: true
      }
    },
    {
      id: 'generate_insights',
      name: 'Generate Insights',
      description: 'Get AI-powered insights from your data',
      icon: <TrendingUp className="w-5 h-5" />,
      parameters: {
        includePredictions: true,
        includeOpportunities: true,
        includeRisks: true
      }
    },
    {
      id: 'optimize_performance',
      name: 'Optimize Performance',
      description: 'Get recommendations to improve your performance',
      icon: <Target className="w-5 h-5" />,
      parameters: {
        focusArea: 'seo',
        includeQuickWins: true,
        includeLongTerm: true
      }
    }
  ]

  const handleResponse = (data: any) => {
    setResponse(data)
    setError(null)
  }

  const handleError = (error: string) => {
    setError(error)
    setResponse(null)
  }

  const selectedActionData = gptActions.find(action => action.id === selectedAction)

  // Always show the GPT interface for demo purposes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GPT Assistant</h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights and recommendations for your dealership
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="w-4 h-4" />
          <span>Powered by GPT with tenant isolation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Action</h2>
            <div className="space-y-2">
              {gptActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAction === action.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <div>
                      <div className="font-medium">{action.name}</div>
                      <div className="text-sm text-gray-600">{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GPT Interface */}
        <div className="lg:col-span-2">
          {selectedActionData && (
            <GPTIframe
              tenantId={user.organizationMemberships?.[0]?.organization?.id || 'default-tenant'}
              action={selectedAction}
              parameters={selectedActionData.parameters}
              height="600px"
              onResponse={handleResponse}
              onError={handleError}
            />
          )}
        </div>
      </div>

      {/* Response Display */}
      {response && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">GPT Response</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-red-800">GPT Error</h3>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Alternative API Component */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alternative API Interface</h2>
        <GPTAPIComponent
          tenantId={user.organizationMemberships?.[0]?.organization?.id || 'default-tenant'}
          action={selectedAction}
          parameters={selectedActionData?.parameters || {}}
          onResponse={handleResponse}
          onError={handleError}
        />
      </div>
    </div>
  )
}
