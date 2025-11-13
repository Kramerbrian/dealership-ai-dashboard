import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TierGate } from '@/components/TierGate'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  AlertTriangle,
  Trophy,
  Users,
  BarChart3,
  MapPin
} from 'lucide-react'

interface CompetitorData {
  id: string
  name: string
  domain: string
  qai_score: number
  rank: number
  gap: number
  change: number
  strengths: string[]
  weaknesses: string[]
  market_share: number
  last_updated: string
}

const competitors: CompetitorData[] = [
  {
    id: '1',
    name: 'Honda of Naples',
    domain: 'hondanaples.com',
    qai_score: 92,
    rank: 1,
    gap: 5,
    change: 3,
    strengths: ['Strong Local SEO', 'High Review Volume'],
    weaknesses: ['Slow Response Time'],
    market_share: 28,
    last_updated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Your Dealership',
    domain: 'yourdealership.com',
    qai_score: 87,
    rank: 2,
    gap: 0,
    change: 2,
    strengths: ['Good Schema Markup', 'Active Social Media'],
    weaknesses: ['Limited Local Content'],
    market_share: 22,
    last_updated: '2024-01-15'
  },
  {
    id: '3',
    name: 'Toyota of Naples',
    domain: 'toyotanaples.com',
    qai_score: 78,
    rank: 3,
    gap: -9,
    change: -1,
    strengths: ['Strong Brand Recognition'],
    weaknesses: ['Poor Review Management', 'Outdated Content'],
    market_share: 18,
    last_updated: '2024-01-14'
  },
  {
    id: '4',
    name: 'Ford Naples',
    domain: 'fordnaples.com',
    qai_score: 72,
    rank: 4,
    gap: -15,
    change: 0,
    strengths: ['Good Customer Service'],
    weaknesses: ['Weak Local SEO', 'No Schema Markup'],
    market_share: 15,
    last_updated: '2024-01-13'
  }
]

export function CompetitiveIntelligence() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-600" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-600" />
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <TierGate requiredTier="PRO" feature="Competitive Intelligence">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Competitive Intelligence War Room</h2>
          <p className="text-gray-600">Real-time competitive analysis and market positioning</p>
        </div>

        {/* Market Position Hero */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-blue-600" />
              <span>Your Market Position</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">#2</div>
                <div className="text-sm text-gray-600">Market Rank</div>
                <div className="text-xs text-green-600">+1 from last month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">87</div>
                <div className="text-sm text-gray-600">QAI Score</div>
                <div className="text-xs text-green-600">+2 from last month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">22%</div>
                <div className="text-sm text-gray-600">Market Share</div>
                <div className="text-xs text-green-600">+3% from last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Competitor Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitors.map((competitor) => (
                <div 
                  key={competitor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedCompetitor(competitor)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(competitor.rank)}
                    </div>
                    <div>
                      <div className="font-medium">{competitor.name}</div>
                      <div className="text-sm text-gray-600">{competitor.domain}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(competitor.qai_score)}`}>
                        {competitor.qai_score}
                      </div>
                      <div className="text-xs text-gray-500">QAI Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {competitor.gap > 0 ? '+' : ''}{competitor.gap}
                      </div>
                      <div className="text-xs text-gray-500">Gap</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(competitor.change)}
                      <span className="text-sm text-gray-600">
                        {competitor.change > 0 ? '+' : ''}{competitor.change}
                      </span>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Threats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-800">Honda of Naples Surge</div>
                  <div className="text-sm text-red-600">Gained 3 points in AI visibility this month</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-800">New Competitor Alert</div>
                  <div className="text-sm text-yellow-600">BMW of Naples entering market</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">Toyota Weakness</div>
                  <div className="text-sm text-green-600">Poor review management (-1 point this month)</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">Market Gap</div>
                  <div className="text-sm text-blue-600">Local content optimization opportunity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitor Detail Modal */}
        {selectedCompetitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{selectedCompetitor.name} Analysis</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCompetitor(null)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCompetitor.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCompetitor.weaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedCompetitor(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TierGate>
  )
}
