import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TierGate } from '@/components/TierGate'
import { RecommendationCard } from '@/components/ui/RecommendationCard'
import { 
  Lightbulb, 
  Zap, 
  Clock, 
  DollarSign, 
  Target,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  description: string
  impact: number
  revenue: number
  time: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
  status: 'pending' | 'in_progress' | 'completed'
  automated: boolean
  category: string
  tags: string[]
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Add LocalBusiness Schema Markup',
    description: 'Missing critical schema.org markup for better AI visibility and local search ranking',
    impact: 12,
    revenue: 3600,
    time: 15,
    priority: 'critical',
    effort: 'easy',
    status: 'pending',
    automated: true,
    category: 'Technical SEO',
    tags: ['Schema', 'Local SEO', 'AI Visibility']
  },
  {
    id: '2',
    title: 'Optimize Google Business Profile Categories',
    description: 'Update GMB categories to better match your services and improve local search visibility',
    impact: 8,
    revenue: 2400,
    time: 10,
    priority: 'high',
    effort: 'easy',
    status: 'pending',
    automated: false,
    category: 'Local SEO',
    tags: ['GMB', 'Categories', 'Local Search']
  },
  {
    id: '3',
    title: 'Respond to All Recent Reviews',
    description: '3 reviews from the last 7 days are waiting for response, affecting your review score',
    impact: 6,
    revenue: 1800,
    time: 20,
    priority: 'high',
    effort: 'easy',
    status: 'pending',
    automated: false,
    category: 'Review Management',
    tags: ['Reviews', 'Customer Service', 'Reputation']
  },
  {
    id: '4',
    title: 'Add FAQ Schema to Service Page',
    description: 'Implement FAQ structured data to capture more featured snippets and voice search',
    impact: 10,
    revenue: 3000,
    time: 30,
    priority: 'medium',
    effort: 'medium',
    status: 'pending',
    automated: true,
    category: 'Technical SEO',
    tags: ['Schema', 'FAQ', 'Voice Search']
  },
  {
    id: '5',
    title: 'Create Local Content Strategy',
    description: 'Develop location-specific content to improve geo-targeting and local authority',
    impact: 15,
    revenue: 4500,
    time: 120,
    priority: 'medium',
    effort: 'hard',
    status: 'pending',
    automated: false,
    category: 'Content Marketing',
    tags: ['Content', 'Local SEO', 'Authority']
  }
]

export function QuickWins() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesFilter = filter === 'all' || rec.priority === filter || rec.effort === filter
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalImpact = recommendations.reduce((sum, rec) => sum + rec.impact, 0)
  const totalRevenue = recommendations.reduce((sum, rec) => sum + rec.revenue, 0)
  const totalTime = recommendations.reduce((sum, rec) => sum + rec.time, 0)

  const handleComplete = (id: string) => {
    // In production, this would update the database
    console.log(`Marking recommendation ${id} as completed`)
    setSelectedRecommendation(null)
  }

  const handleLearn = (id: string) => {
    // In production, this would open a learning modal or redirect
    console.log(`Opening learning content for recommendation ${id}`)
  }

  return (
    <TierGate requiredTier="PRO" feature="Quick Wins">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Wins & Smart Recommendations</h2>
          <p className="text-gray-600">AI-powered recommendations with ROI estimates and one-click implementation</p>
        </div>

        {/* Impact Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-green-600" />
              <span>Potential Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">+{totalImpact}</div>
                <div className="text-sm text-gray-600">QAI Score Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">${totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{totalTime}m</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recommendations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('critical')}
                >
                  Critical
                </Button>
                <Button
                  variant={filter === 'easy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('easy')}
                >
                  Easy
                </Button>
                <Button
                  variant={filter === 'automated' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('automated')}
                >
                  Automated
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              id={recommendation.id}
              title={recommendation.title}
              description={recommendation.description}
              impact={recommendation.impact}
              revenue={recommendation.revenue}
              time={recommendation.time}
              priority={recommendation.priority}
              effort={recommendation.effort}
              status={recommendation.status}
              automated={recommendation.automated}
              onComplete={handleComplete}
              onLearn={handleLearn}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredRecommendations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        )}

        {/* Implementation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Implementation Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">0 of {recommendations.length} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{recommendations.length}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TierGate>
  )
}
