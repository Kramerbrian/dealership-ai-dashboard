/**
 * Ultra Enhanced Onboarding Flow Component
 * Integrates all advanced features: progress visualization, market map, gamification, smart recommendations, and social proof
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, ArrowRightIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { personalizationEngine, OnboardingStep, DealershipProfile } from '@/lib/onboarding/personalization-engine'
import ProgressVisualization from './ProgressVisualization'
import InteractiveMarketMap from './InteractiveMarketMap'
import GamificationSystem from './GamificationSystem'
import SmartRecommendations from './SmartRecommendations'
import SocialProofSystem from './SocialProofSystem'

interface UltraEnhancedOnboardingFlowProps {
  initialDomain?: string
  onComplete?: () => void
  onSkip?: () => void
}

const ONBOARDING_STEPS: Omit<OnboardingStep, 'isCompleted' | 'progressPercentage' | 'personalizedMessage' | 'motivationalMessage'>[] = [
  {
    id: 'domain-setup',
    title: 'Domain Setup',
    description: 'Connect your dealership website for AI analysis',
    estimatedTime: '2 minutes',
    isRequired: true,
  },
  {
    id: 'data-connection',
    title: 'Data Connection',
    description: 'Link your Google Analytics, Search Console, and other data sources',
    estimatedTime: '5 minutes',
    isRequired: true,
  },
  {
    id: 'ai-optimization',
    title: 'AI Optimization',
    description: 'Configure AI visibility settings and preferences',
    estimatedTime: '3 minutes',
    isRequired: true,
  },
  {
    id: 'competitor-analysis',
    title: 'Competitor Analysis',
    description: 'Set up competitor monitoring and market analysis',
    estimatedTime: '4 minutes',
    isRequired: false,
  },
  {
    id: 'go-live',
    title: 'Go Live',
    description: 'Launch your AI-powered dashboard and start tracking',
    estimatedTime: '1 minute',
    isRequired: true,
  },
]

export default function UltraEnhancedOnboardingFlow({ 
  initialDomain = '', 
  onComplete, 
  onSkip 
}: UltraEnhancedOnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [domain, setDomain] = useState(initialDomain)
  const [dealershipProfile, setDealershipProfile] = useState<DealershipProfile | null>(null)
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [personalizedMessages, setPersonalizedMessages] = useState<any>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [showMarketMap, setShowMarketMap] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showSocialProof, setShowSocialProof] = useState(false)

  // Initialize steps
  useEffect(() => {
    const initializedSteps = ONBOARDING_STEPS.map((step, index) => ({
      ...step,
      isCompleted: false,
      progressPercentage: 0,
      personalizedMessage: '',
      motivationalMessage: '',
    }))
    setSteps(initializedSteps)
  }, [])

  // Initialize profile when domain is provided
  useEffect(() => {
    if (domain && !dealershipProfile) {
      initializeProfile()
    }
  }, [domain])

  // Update personalized messages when step changes
  useEffect(() => {
    if (dealershipProfile && steps.length > 0) {
      const currentStep = steps[currentStepIndex]
      const progress = currentStepIndex / (steps.length - 1)
      const messages = personalizationEngine.generatePersonalizedMessages(currentStep, progress)
      setPersonalizedMessages(messages)
    }
  }, [currentStepIndex, dealershipProfile, steps])

  // Show different features based on step
  useEffect(() => {
    setShowMarketMap(currentStepIndex >= 1)
    setShowGamification(currentStepIndex >= 1)
    setShowRecommendations(currentStepIndex >= 2)
    setShowSocialProof(currentStepIndex >= 3)
  }, [currentStepIndex])

  const initializeProfile = async () => {
    setIsLoading(true)
    try {
      const profile = await personalizationEngine.initializeProfile(domain)
      setDealershipProfile(profile)
    } catch (error) {
      console.error('Error initializing profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    
    await initializeProfile()
    setCompletedActions(prev => [...prev, 'domain-setup'])
  }

  const handleStepComplete = (stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, isCompleted: true, progressPercentage: 100 }
          : step
      )
    )
    setCompletedActions(prev => [...prev, stepId])
  }

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      onComplete?.()
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100
  const completedSteps = steps.filter(step => step.isCompleted).length

  // Progress metrics for visualization
  const progressMetrics = {
    aiVisibility: dealershipProfile?.aiVisibility || 0,
    dataConnections: completedActions.filter(a => a.includes('data')).length,
    competitorsAnalyzed: dealershipProfile?.competitors.length || 0,
    revenueAtRisk: dealershipProfile?.revenueAtRisk || 0,
    marketShare: dealershipProfile?.marketShare || 0
  }

  const targetMetrics = {
    aiVisibility: 90,
    dataConnections: 3,
    competitorsAnalyzed: 5,
    revenueAtRisk: 0,
    marketShare: 25
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your dealership...</h2>
          <p className="text-gray-600">This will just take a moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">dealershipAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Step {currentStepIndex + 1} of {steps.length}</span>
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Progress & Features */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Visualization */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <ProgressVisualization
                currentStep={currentStepIndex}
                totalSteps={steps.length}
                metrics={progressMetrics}
                targetMetrics={targetMetrics}
                isAnimating={true}
              />
            </div>

            {/* Gamification System */}
            {showGamification && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <GamificationSystem
                  currentStep={currentStepIndex}
                  totalSteps={steps.length}
                  completedActions={completedActions}
                  onAchievementUnlocked={(achievement) => {
                    console.log('Achievement unlocked:', achievement)
                  }}
                />
              </div>
            )}

            {/* Smart Recommendations */}
            {showRecommendations && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <SmartRecommendations
                  currentStep={currentStepIndex}
                  dealershipProfile={dealershipProfile}
                  marketData={{}}
                  completedActions={completedActions}
                  onRecommendationClick={(recommendation) => {
                    console.log('Recommendation clicked:', recommendation)
                  }}
                />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step Header */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {currentStep?.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">
                      {currentStep?.description}
                    </p>
                    
                    {/* Personalized Message */}
                    {personalizedMessages && (
                      <motion.div
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 mb-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-purple-800 font-medium">
                          {personalizedMessages.motivation}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="mb-8">
                    {currentStep?.id === 'domain-setup' && (
                      <DomainSetupStep
                        domain={domain}
                        setDomain={setDomain}
                        onSubmit={handleDomainSubmit}
                        dealershipProfile={dealershipProfile}
                        personalizedMessages={personalizedMessages}
                      />
                    )}
                    
                    {currentStep?.id === 'data-connection' && (
                      <DataConnectionStep
                        onComplete={() => handleStepComplete('data-connection')}
                        dealershipProfile={dealershipProfile}
                        personalizedMessages={personalizedMessages}
                      />
                    )}
                    
                    {currentStep?.id === 'ai-optimization' && (
                      <AIOptimizationStep
                        onComplete={() => handleStepComplete('ai-optimization')}
                        dealershipProfile={dealershipProfile}
                        personalizedMessages={personalizedMessages}
                      />
                    )}
                    
                    {currentStep?.id === 'competitor-analysis' && (
                      <CompetitorAnalysisStep
                        onComplete={() => handleStepComplete('competitor-analysis')}
                        dealershipProfile={dealershipProfile}
                        personalizedMessages={personalizedMessages}
                      />
                    )}
                    
                    {currentStep?.id === 'go-live' && (
                      <GoLiveStep
                        onComplete={() => handleStepComplete('go-live')}
                        dealershipProfile={dealershipProfile}
                        personalizedMessages={personalizedMessages}
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePreviousStep}
                      disabled={currentStepIndex === 0}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-4">
                      {currentStep?.isCompleted && (
                        <motion.div
                          className="flex items-center text-green-600 text-sm font-medium"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-1" />
                          Completed!
                        </motion.div>
                      )}
                      
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar - Market Map & Social Proof */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interactive Market Map */}
            {showMarketMap && dealershipProfile && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <InteractiveMarketMap
                  dealership={{
                    name: dealershipProfile.name,
                    position: { x: 50, y: 50 },
                    marketShare: dealershipProfile.marketShare,
                    aiVisibility: dealershipProfile.aiVisibility,
                    revenue: dealershipProfile.revenueAtRisk
                  }}
                  competitors={dealershipProfile.competitors.map((comp, index) => ({
                    id: `competitor-${index}`,
                    name: comp,
                    position: { x: Math.random() * 100, y: Math.random() * 100 },
                    marketShare: Math.random() * 30 + 10,
                    aiVisibility: Math.random() * 60 + 20,
                    revenue: Math.random() * 100000 + 50000,
                    isActive: true
                  }))}
                  marketSize={100000}
                  onCompetitorClick={(competitor) => {
                    console.log('Competitor clicked:', competitor)
                  }}
                />
              </div>
            )}

            {/* Social Proof System */}
            {showSocialProof && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <SocialProofSystem
                  currentStep={currentStepIndex}
                  dealershipProfile={dealershipProfile}
                  onStoryClick={(story) => {
                    console.log('Story clicked:', story)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components (simplified versions)
function DomainSetupStep({ 
  domain, 
  setDomain, 
  onSubmit, 
  dealershipProfile, 
  personalizedMessages 
}: {
  domain: string
  setDomain: (domain: string) => void
  onSubmit: (e: React.FormEvent) => void
  dealershipProfile: DealershipProfile | null
  personalizedMessages: any
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Let's start with your dealership website
        </h3>
        <p className="text-gray-600">
          We'll analyze your current AI visibility and identify opportunities
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
            Your Dealership Website
          </label>
          <div className="relative">
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="www.yourdealership.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Include www. for best results (e.g., www.fortmyerstoyota.com)
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
        >
          Analyze My Dealership
        </button>
      </form>

      {dealershipProfile && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome, {dealershipProfile.name}!
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Market:</span>
              <span className="ml-2 font-medium">{dealershipProfile.location.market}</span>
            </div>
            <div>
              <span className="text-gray-600">Revenue at Risk:</span>
              <span className="ml-2 font-medium text-red-600">
                ${(dealershipProfile.revenueAtRisk / 1000).toFixed(0)}K/mo
              </span>
            </div>
            <div>
              <span className="text-gray-600">AI Visibility:</span>
              <span className="ml-2 font-medium">{dealershipProfile.aiVisibility}%</span>
            </div>
            <div>
              <span className="text-gray-600">Competitors:</span>
              <span className="ml-2 font-medium">{dealershipProfile.competitors.length}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function DataConnectionStep({ 
  onComplete, 
  dealershipProfile, 
  personalizedMessages 
}: {
  onComplete: () => void
  dealershipProfile: DealershipProfile | null
  personalizedMessages: any
}) {
  const [connectedServices, setConnectedServices] = useState<string[]>([])

  const services = [
    { id: 'google-analytics', name: 'Google Analytics', icon: '📊' },
    { id: 'google-search-console', name: 'Google Search Console', icon: '🔍' },
    { id: 'google-my-business', name: 'Google My Business', icon: '📍' },
    { id: 'facebook-pixel', name: 'Facebook Pixel', icon: '📘' },
  ]

  const handleServiceToggle = (serviceId: string) => {
    setConnectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  useEffect(() => {
    if (connectedServices.length >= 2) {
      onComplete()
    }
  }, [connectedServices, onComplete])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Connect Your Data Sources
        </h3>
        <p className="text-gray-600">
          Link your marketing platforms for 10x more accurate insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              connectedServices.includes(service.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleServiceToggle(service.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{service.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-500">
                  {connectedServices.includes(service.id) ? 'Connected' : 'Click to connect'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function AIOptimizationStep({ 
  onComplete, 
  dealershipProfile, 
  personalizedMessages 
}: {
  onComplete: () => void
  dealershipProfile: DealershipProfile | null
  personalizedMessages: any
}) {
  const [optimizations, setOptimizations] = useState<string[]>([])

  const availableOptimizations = [
    'ChatGPT visibility optimization',
    'Google AI Overview inclusion',
    'Schema markup generation',
    'FAQ content optimization',
    'Review response automation',
  ]

  const handleOptimizationToggle = (optimization: string) => {
    setOptimizations(prev => 
      prev.includes(optimization) 
        ? prev.filter(opt => opt !== optimization)
        : [...prev, optimization]
    )
  }

  useEffect(() => {
    if (optimizations.length >= 3) {
      onComplete()
    }
  }, [optimizations, onComplete])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Configure AI Optimizations
        </h3>
        <p className="text-gray-600">
          Choose which AI platforms to optimize for maximum visibility
        </p>
      </div>

      <div className="space-y-3">
        {availableOptimizations.map((optimization) => (
          <motion.div
            key={optimization}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              optimizations.includes(optimization)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleOptimizationToggle(optimization)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={optimizations.includes(optimization)}
                onChange={() => handleOptimizationToggle(optimization)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-900">{optimization}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CompetitorAnalysisStep({ 
  onComplete, 
  dealershipProfile, 
  personalizedMessages 
}: {
  onComplete: () => void
  dealershipProfile: DealershipProfile | null
  personalizedMessages: any
}) {
  useEffect(() => {
    if (dealershipProfile?.competitors) {
      onComplete()
    }
  }, [dealershipProfile, onComplete])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Competitor Analysis Setup
        </h3>
        <p className="text-gray-600">
          We've identified your main competitors in the {dealershipProfile?.location.market} market
        </p>
      </div>

      {dealershipProfile?.competitors && (
        <div className="space-y-3">
          {dealershipProfile.competitors.map((competitor, index) => (
            <motion.div
              key={competitor}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{competitor}</h4>
                  <p className="text-sm text-gray-500">Will be monitored for AI visibility</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function GoLiveStep({ 
  onComplete, 
  dealershipProfile, 
  personalizedMessages 
}: {
  onComplete: () => void
  dealershipProfile: DealershipProfile | null
  personalizedMessages: any
}) {
  useEffect(() => {
    onComplete()
  }, [onComplete])

  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          You're Ready to Go Live! 🚀
        </h3>
        
        <p className="text-lg text-gray-600 mb-6">
          Your AI-powered dashboard is now active and tracking your visibility across all platforms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-900">AI Visibility</div>
            <div className="text-2xl font-bold text-blue-600">
              {dealershipProfile?.aiVisibility || 0}%
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="font-semibold text-red-900">Revenue at Risk</div>
            <div className="text-2xl font-bold text-red-600">
              ${(dealershipProfile?.revenueAtRisk || 0) / 1000}K/mo
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-900">Competitors</div>
            <div className="text-2xl font-bold text-green-600">
              {dealershipProfile?.competitors.length || 0}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
