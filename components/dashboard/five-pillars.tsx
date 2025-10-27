import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Shield, 
  Users, 
  MapPin, 
  Database,
  TrendingUp,
  TrendingDown,
  Info,
  ExternalLink
} from 'lucide-react'

interface PillarData {
  name: string
  score: number
  change: number
  description: string
  icon: React.ReactNode
  color: string
  details: {
    components: Array<{
      name: string
      score: number
      impact: string
    }>
    recommendations: Array<{
      title: string
      impact: number
      effort: string
    }>
  }
}

const pillars: PillarData[] = [
  {
    name: 'AI Visibility',
    score: 90,
    change: 3,
    description: 'How visible you are across AI platforms like ChatGPT, Claude, and Perplexity',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'green',
    details: {
      components: [
        { name: 'Schema Markup', score: 95, impact: 'High' },
        { name: 'Content Quality', score: 88, impact: 'High' },
        { name: 'Local SEO', score: 87, impact: 'Medium' },
        { name: 'Social Signals', score: 85, impact: 'Medium' }
      ],
      recommendations: [
        { title: 'Add FAQ Schema', impact: 8, effort: 'Easy' },
        { title: 'Optimize for Voice Search', impact: 12, effort: 'Medium' }
      ]
    }
  },
  {
    name: 'Zero-Click Shield',
    score: 85,
    change: 2,
    description: 'Protecting your brand from direct AI answers that bypass your website',
    icon: <Shield className="h-6 w-6" />,
    color: 'blue',
    details: {
      components: [
        { name: 'Brand Authority', score: 92, impact: 'High' },
        { name: 'Citation Consistency', score: 88, impact: 'High' },
        { name: 'Review Management', score: 78, impact: 'Medium' },
        { name: 'Trust Signals', score: 82, impact: 'Medium' }
      ],
      recommendations: [
        { title: 'Improve Review Response Rate', impact: 6, effort: 'Easy' },
        { title: 'Build More Citations', impact: 10, effort: 'Medium' }
      ]
    }
  },
  {
    name: 'UGC Health',
    score: 78,
    change: 1,
    description: 'Quality and quantity of user-generated content and reviews',
    icon: <Users className="h-6 w-6" />,
    color: 'yellow',
    details: {
      components: [
        { name: 'Review Volume', score: 85, impact: 'High' },
        { name: 'Review Quality', score: 72, impact: 'High' },
        { name: 'Response Rate', score: 65, impact: 'Medium' },
        { name: 'Social Engagement', score: 70, impact: 'Low' }
      ],
      recommendations: [
        { title: 'Respond to All Reviews', impact: 8, effort: 'Easy' },
        { title: 'Improve Review Quality', impact: 12, effort: 'Hard' }
      ]
    }
  },
  {
    name: 'Geo Trust',
    score: 92,
    change: 4,
    description: 'Local relevance and trust signals for your geographic area',
    icon: <MapPin className="h-6 w-6" />,
    color: 'purple',
    details: {
      components: [
        { name: 'Google Business Profile', score: 95, impact: 'High' },
        { name: 'Local Citations', score: 90, impact: 'High' },
        { name: 'NAP Consistency', score: 88, impact: 'Medium' },
        { name: 'Local Content', score: 85, impact: 'Medium' }
      ],
      recommendations: [
        { title: 'Add More Local Content', impact: 5, effort: 'Medium' },
        { title: 'Optimize GMB Categories', impact: 7, effort: 'Easy' }
      ]
    }
  },
  {
    name: 'SGP Integrity',
    score: 88,
    change: 2,
    description: 'Structured data and Google Business Profile health',
    icon: <Database className="h-6 w-6" />,
    color: 'indigo',
    details: {
      components: [
        { name: 'Schema Implementation', score: 90, impact: 'High' },
        { name: 'GMB Optimization', score: 92, impact: 'High' },
        { name: 'Data Accuracy', score: 85, impact: 'Medium' },
        { name: 'Update Frequency', score: 80, impact: 'Low' }
      ],
      recommendations: [
        { name: 'Add Service Schema', impact: 6, effort: 'Easy' },
        { name: 'Update GMB Hours', impact: 4, effort: 'Easy' }
      ]
    }
  }
]

export function FivePillars() {
  const [selectedPillar, setSelectedPillar] = useState<PillarData | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">5 Pillars Deep Dive</h2>
        <p className="text-gray-600">Comprehensive analysis of your AI visibility across all key metrics</p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((pillar, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedPillar(pillar)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${pillar.color}-100`}>
                    <div className={`text-${pillar.color}-600`}>
                      {pillar.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pillar.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getScoreColor(pillar.score)}`}>
                        {pillar.score}
                      </span>
                      {getChangeIcon(pillar.change)}
                      <span className="text-sm text-gray-500">
                        {pillar.change > 0 ? '+' : ''}{pillar.change}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{pillar.description}</p>
              <div className="space-y-2">
                {pillar.details.components.slice(0, 2).map((component, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{component.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{component.score}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        component.impact === 'High' ? 'bg-red-100 text-red-800' :
                        component.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {component.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedPillar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{selectedPillar.name} Deep Dive</h3>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPillar(null)}
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Components */}
              <Card>
                <CardHeader>
                  <CardTitle>Component Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPillar.details.components.map((component, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-medium">{component.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">{component.score}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            component.impact === 'High' ? 'bg-red-100 text-red-800' :
                            component.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {component.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPillar.details.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{rec.title}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-green-600">+{rec.impact} impact</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.effort === 'Easy' ? 'bg-green-100 text-green-800' :
                            rec.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rec.effort} effort
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedPillar(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
