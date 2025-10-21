/**
 * Real-Time Progress Visualization Component
 * Shows live progress with micro-animations and real-time metrics
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChartBarIcon, ArrowTrendingUpIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface ProgressMetrics {
  aiVisibility: number
  dataConnections: number
  competitorsAnalyzed: number
  revenueAtRisk: number
  marketShare: number
}

interface ProgressVisualizationProps {
  currentStep: number
  totalSteps: number
  metrics: ProgressMetrics
  targetMetrics: ProgressMetrics
  isAnimating?: boolean
}

export default function ProgressVisualization({
  currentStep,
  totalSteps,
  metrics,
  targetMetrics,
  isAnimating = true
}: ProgressVisualizationProps) {
  const [animatedMetrics, setAnimatedMetrics] = useState<ProgressMetrics>({
    aiVisibility: 0,
    dataConnections: 0,
    competitorsAnalyzed: 0,
    revenueAtRisk: 0,
    marketShare: 0
  })

  // Animate metrics in real-time
  useEffect(() => {
    if (!isAnimating) {
      setAnimatedMetrics(metrics)
      return
    }

    const interval = setInterval(() => {
      setAnimatedMetrics(prev => {
        const newMetrics = { ...prev }
        let hasChanges = false

        Object.keys(metrics).forEach(key => {
          const current = prev[key as keyof ProgressMetrics]
          const target = metrics[key as keyof ProgressMetrics]
          
          if (current < target) {
            const increment = Math.max(1, Math.ceil((target - current) / 10))
            newMetrics[key as keyof ProgressMetrics] = Math.min(current + increment, target)
            hasChanges = true
          }
        })

        return hasChanges ? newMetrics : prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [metrics, isAnimating])

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="space-y-6">
      {/* Main Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Setup Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={ChartBarIcon}
          label="AI Visibility"
          value={animatedMetrics.aiVisibility}
          target={targetMetrics.aiVisibility}
          unit="%"
          color="blue"
          isAnimating={isAnimating}
        />
        <MetricCard
          icon={ArrowTrendingUpIcon}
          label="Data Sources"
          value={animatedMetrics.dataConnections}
          target={targetMetrics.dataConnections}
          unit=""
          color="green"
          isAnimating={isAnimating}
        />
        <MetricCard
          icon={TrophyIcon}
          label="Competitors"
          value={animatedMetrics.competitorsAnalyzed}
          target={targetMetrics.competitorsAnalyzed}
          unit=""
          color="purple"
          isAnimating={isAnimating}
        />
        <MetricCard
          icon={ChartBarIcon}
          label="Revenue Risk"
          value={animatedMetrics.revenueAtRisk}
          target={targetMetrics.revenueAtRisk}
          unit="K"
          color="red"
          isAnimating={isAnimating}
          format="currency"
        />
      </div>

      {/* Progress Milestones */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
        <div className="space-y-1">
          {[
            { step: 1, label: "Domain Connected", completed: currentStep >= 1 },
            { step: 2, label: "Data Sources Linked", completed: currentStep >= 2 },
            { step: 3, label: "AI Optimization Complete", completed: currentStep >= 3 },
            { step: 4, label: "Competitors Analyzed", completed: currentStep >= 4 },
            { step: 5, label: "Dashboard Live", completed: currentStep >= 5 },
          ].map((milestone) => (
            <motion.div
              key={milestone.step}
              className={`flex items-center text-sm ${
                milestone.completed ? 'text-green-600' : 'text-gray-500'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: milestone.step * 0.1 }}
            >
              <motion.div
                className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                  milestone.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300'
                }`}
                animate={milestone.completed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {milestone.completed && (
                  <motion.svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </motion.svg>
                )}
              </motion.div>
              {milestone.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ComponentType<any>
  label: string
  value: number
  target: number
  unit: string
  color: 'blue' | 'green' | 'purple' | 'red'
  isAnimating: boolean
  format?: 'number' | 'currency'
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  target, 
  unit, 
  color, 
  isAnimating,
  format = 'number'
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50'
  }

  const formatValue = (val: number) => {
    if (format === 'currency') {
      return `$${val.toFixed(0)}`
    }
    return val.toFixed(0)
  }

  const percentage = target > 0 ? (value / target) * 100 : 0

  return (
    <motion.div
      className={`p-4 rounded-lg ${colorClasses[color]} border border-current border-opacity-20`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5" />
        <div className="text-xs opacity-75">
          {Math.round(percentage)}%
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold">
          {formatValue(value)}{unit}
        </div>
        <div className="text-xs opacity-75">
          {label}
        </div>
        
        {/* Progress bar for this metric */}
        <div className="w-full bg-current bg-opacity-20 rounded-full h-1 mt-2">
          <motion.div
            className="bg-current h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}
