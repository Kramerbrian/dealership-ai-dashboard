/**
 * Smart Recommendations Engine Component
 * AI-powered, contextual suggestions based on user progress and market data
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LightBulbIcon, 
  ClockIcon, 
  ArrowArrowTrendingUpIcon, 
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { aiRecommendationEngine } from '@/lib/onboarding/ai-recommendation-engine'

interface Recommendation {
  id: string
  title: string
  description: string
  category: 'setup' | 'optimization' | 'competitive' | 'growth'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: number // 1-100
  timeToComplete: string
  difficulty: 'easy' | 'medium' | 'hard'
  isCompleted: boolean
  actionUrl?: string
  prerequisites?: string[]
}

interface SmartRecommendationsProps {
  currentStep: number
  dealershipProfile: any
  marketData: any
  completedActions: string[]
  onRecommendationClick?: (recommendation: Recommendation) => void
}

export default function SmartRecommendations({
  currentStep,
  dealershipProfile,
  marketData,
  completedActions,
  onRecommendationClick
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Generate smart recommendations based on current state
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)
      
      // Use AI recommendation engine
      const newRecommendations = await aiRecommendationEngine.generateRecommendations(
        currentStep,
        dealershipProfile,
        completedActions
      )
      
      setRecommendations(newRecommendations)
      setIsLoading(false)
    }
    
    generateRecommendations()
  }, [currentStep, dealershipProfile, marketData, completedActions])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'setup': return '⚙️'
      case 'optimization': return '🚀'
      case 'competitive': return '🎯'
      case 'growth': return '📈'
      default: return '💡'
    }
  }

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All', count: recommendations.length },
    { id: 'setup', name: 'Setup', count: recommendations.filter(r => r.category === 'setup').length },
    { id: 'optimization', name: 'Optimization', count: recommendations.filter(r => r.category === 'optimization').length },
    { id: 'competitive', name: 'Competitive', count: recommendations.filter(r => r.category === 'competitive').length },
    { id: 'growth', name: 'Growth', count: recommendations.filter(r => r.category === 'growth').length },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
          <p className="text-sm text-gray-600">AI-powered suggestions tailored to your progress</p>
        </div>
        <div className="text-sm text-gray-500">
          {recommendations.filter(r => !r.isCompleted).length} pending
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                recommendation.isCompleted
                  ? 'bg-green-50 border-green-200 opacity-75'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onRecommendationClick?.(recommendation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">
                      {getCategoryIcon(recommendation.category)}
                    </span>
                    <h4 className="font-semibold text-gray-900">
                      {recommendation.title}
                    </h4>
                    {recommendation.isCompleted && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {recommendation.timeToComplete}
                    </div>
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      {recommendation.estimatedImpact}% impact
                    </div>
                    <div className={`flex items-center ${getDifficultyColor(recommendation.difficulty)}`}>
                      <StarIcon className="h-4 w-4 mr-1" />
                      {recommendation.difficulty}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority}
                  </div>
                  
                  {!recommendation.isCompleted && (
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {recommendation.actionUrl ? 'Take Action' : 'Mark Complete'}
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8">
          <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recommendations for this category yet</p>
        </div>
      )}
    </div>
  )
}
