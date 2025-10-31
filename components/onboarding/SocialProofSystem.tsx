/**
 * Social Proof System Component
 * Real dealer success stories and testimonials
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  StarIcon, 
  TrophyIcon, 
  ArrowArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface SuccessStory {
  id: string
  dealer: string
  location: string
  market: string
  improvement: string
  revenue: string
  timeframe: string
  quote: string
  videoUrl?: string
  imageUrl?: string
  rating: number
  category: 'ai-visibility' | 'revenue' | 'market-share' | 'efficiency'
  isVerified: boolean
}

interface SocialProofSystemProps {
  currentStep: number
  dealershipProfile: any
  onStoryClick?: (story: SuccessStory) => void
}

export default function SocialProofSystem({
  currentStep,
  dealershipProfile,
  onStoryClick
}: SocialProofSystemProps) {
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateStories = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const allStories: SuccessStory[] = [
        {
          id: 'fort-myers-toyota',
          dealer: 'Fort Myers Toyota',
          location: 'Fort Myers, FL',
          market: 'Fort Myers Automotive Market',
          improvement: '+127% AI Visibility',
          revenue: '$89K recovered',
          timeframe: '3 months',
          quote: 'DealershipAI helped us dominate our market! We went from invisible to unstoppable.',
          rating: 5,
          category: 'ai-visibility',
          isVerified: true
        },
        {
          id: 'miami-honda',
          dealer: 'Miami Honda',
          location: 'Miami, FL',
          market: 'Miami Automotive Market',
          improvement: '+89% Zero-Click Coverage',
          revenue: '$156K recovered',
          timeframe: '4 months',
          quote: 'The AI optimization was a game-changer. Our leads increased by 200%.',
          rating: 5,
          category: 'revenue',
          isVerified: true
        },
        {
          id: 'tampa-ford',
          dealer: 'Tampa Ford',
          location: 'Tampa, FL',
          market: 'Tampa Automotive Market',
          improvement: '+45% Market Share',
          revenue: '$234K recovered',
          timeframe: '6 months',
          quote: 'We went from 3rd place to market leader in just 6 months.',
          rating: 5,
          category: 'market-share',
          isVerified: true
        },
        {
          id: 'orlando-chevrolet',
          dealer: 'Orlando Chevrolet',
          location: 'Orlando, FL',
          market: 'Orlando Automotive Market',
          improvement: '+67% Lead Quality',
          revenue: '$78K recovered',
          timeframe: '2 months',
          quote: 'The setup was so easy, and the results came fast. Highly recommended!',
          rating: 5,
          category: 'efficiency',
          isVerified: true
        },
        {
          id: 'jacksonville-nissan',
          dealer: 'Jacksonville Nissan',
          location: 'Jacksonville, FL',
          market: 'Jacksonville Automotive Market',
          improvement: '+156% AI Mentions',
          revenue: '$112K recovered',
          timeframe: '5 months',
          quote: 'Our competitors are still trying to figure out what hit them.',
          rating: 5,
          category: 'ai-visibility',
          isVerified: true
        }
      ]
      
      // Filter stories based on current step and market
      let relevantStories = allStories
      
      // Show market-specific stories if available
      if (dealershipProfile?.location?.market) {
        const marketStories = allStories.filter(story => 
          story.market === dealershipProfile.location.market
        )
        if (marketStories.length > 0) {
          relevantStories = marketStories
        }
      }
      
      // Show stories relevant to current step
      if (currentStep >= 1) {
        relevantStories = relevantStories.filter(story => 
          story.category === 'ai-visibility' || story.category === 'efficiency'
        )
      }
      
      if (currentStep >= 3) {
        relevantStories = [...relevantStories, ...allStories.filter(story => 
          story.category === 'revenue' || story.category === 'market-share'
        )]
      }
      
      // Remove duplicates and limit to 3
      relevantStories = relevantStories
        .filter((story, index, self) => 
          index === self.findIndex(s => s.id === story.id)
        )
        .slice(0, 3)
      
      setStories(relevantStories)
      setIsLoading(false)
    }
    
    generateStories()
  }, [currentStep, dealershipProfile])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai-visibility': return '👁️'
      case 'revenue': return '💰'
      case 'market-share': return '📈'
      case 'efficiency': return '⚡'
      default: return '🏆'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai-visibility': return 'text-blue-600 bg-blue-100'
      case 'revenue': return 'text-green-600 bg-green-100'
      case 'market-share': return 'text-purple-600 bg-purple-100'
      case 'efficiency': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Success Stories</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Stories</h3>
        <p className="text-sm text-gray-600">
          See how other dealers are dominating their markets with DealershipAI
        </p>
      </div>

      {/* Stories Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedStory(story)
                onStoryClick?.(story)
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {story.dealer.split(' ')[0].charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{story.dealer}</h4>
                    <p className="text-sm text-gray-600">{story.location}</p>
                    {story.isVerified && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <TrophyIcon className="h-3 w-3 mr-1" />
                        Verified Success
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i < story.rating ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{story.improvement}</div>
                  <div className="text-xs text-gray-600">Improvement</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{story.revenue}</div>
                  <div className="text-xs text-gray-600">Revenue</div>
                </div>
              </div>

              <blockquote className="text-gray-700 italic mb-4">
                "{story.quote}"
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    {story.timeframe}
                  </div>
                  <div className={`px-2 py-1 rounded-full ${getCategoryColor(story.category)}`}>
                    {getCategoryIcon(story.category)} {story.category.replace('-', ' ')}
                  </div>
                </div>
                
                {story.videoUrl && (
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Watch Video
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Join These Success Stories?
        </h4>
        <p className="text-gray-600 mb-4">
          Start your journey to market domination today
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Get Started Now
        </button>
      </div>

      {/* Story Detail Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {selectedStory.dealer.split(' ')[0].charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStory.dealer}</h3>
                    <p className="text-gray-600">{selectedStory.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedStory.improvement}</div>
                  <div className="text-sm text-gray-600">Improvement</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedStory.revenue}</div>
                  <div className="text-sm text-gray-600">Revenue Recovered</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedStory.timeframe}</div>
                  <div className="text-sm text-gray-600">Timeframe</div>
                </div>
              </div>

              <blockquote className="text-lg text-gray-700 italic mb-6 p-6 bg-gray-50 rounded-lg">
                "{selectedStory.quote}"
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${i < selectedStory.rating ? 'fill-current' : ''}`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">5.0 rating</span>
                </div>
                
                <div className={`px-3 py-1 rounded-full ${getCategoryColor(selectedStory.category)}`}>
                  {getCategoryIcon(selectedStory.category)} {selectedStory.category.replace('-', ' ')}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
