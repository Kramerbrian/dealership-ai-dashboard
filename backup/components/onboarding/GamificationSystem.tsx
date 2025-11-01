/**
 * Gamification System Component
 * Points, badges, achievements, and progress rewards
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  LightningBoltIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  points: number
  unlocked: boolean
  unlockedAt?: Date
  category: 'setup' | 'performance' | 'social' | 'milestone'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface GamificationSystemProps {
  currentStep: number
  totalSteps: number
  completedActions: string[]
  onAchievementUnlocked?: (achievement: Achievement) => void
}

export default function GamificationSystem({
  currentStep,
  totalSteps,
  completedActions,
  onAchievementUnlocked
}: GamificationSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-step',
      name: 'Getting Started',
      description: 'Complete your first setup step',
      icon: StarIcon,
      points: 10,
      unlocked: false,
      category: 'setup',
      rarity: 'common'
    },
    {
      id: 'data-pioneer',
      name: 'Data Pioneer',
      description: 'Connect your first data source',
      icon: LightningBoltIcon,
      points: 25,
      unlocked: false,
      category: 'setup',
      rarity: 'rare'
    },
    {
      id: 'ai-master',
      name: 'AI Master',
      description: 'Complete AI optimization setup',
      icon: SparklesIcon,
      points: 50,
      unlocked: false,
      category: 'performance',
      rarity: 'epic'
    },
    {
      id: 'market-dominator',
      name: 'Market Dominator',
      description: 'Analyze all competitors in your market',
      icon: TrophyIcon,
      points: 100,
      unlocked: false,
      category: 'milestone',
      rarity: 'legendary'
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete setup in under 5 minutes',
      icon: FireIcon,
      points: 75,
      unlocked: false,
      category: 'performance',
      rarity: 'epic'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete all optional steps',
      icon: CheckCircleIcon,
      points: 30,
      unlocked: false,
      category: 'setup',
      rarity: 'rare'
    }
  ])

  const [totalPoints, setTotalPoints] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  // Calculate total points
  useEffect(() => {
    const points = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0)
    setTotalPoints(points)
  }, [achievements])

  // Check for new achievements
  useEffect(() => {
    const checkAchievements = () => {
      const newUnlocks: Achievement[] = []

      achievements.forEach(achievement => {
        if (achievement.unlocked) return

        let shouldUnlock = false

        switch (achievement.id) {
          case 'first-step':
            shouldUnlock = currentStep >= 1
            break
          case 'data-pioneer':
            shouldUnlock = completedActions.includes('data-connection')
            break
          case 'ai-master':
            shouldUnlock = completedActions.includes('ai-optimization')
            break
          case 'market-dominator':
            shouldUnlock = completedActions.includes('competitor-analysis')
            break
          case 'speed-demon':
            // This would need a timer in a real implementation
            shouldUnlock = false
            break
          case 'perfectionist':
            shouldUnlock = currentStep === totalSteps && completedActions.length >= 5
            break
        }

        if (shouldUnlock) {
          newUnlocks.push({
            ...achievement,
            unlocked: true,
            unlockedAt: new Date()
          })
        }
      })

      if (newUnlocks.length > 0) {
        setAchievements(prev => 
          prev.map(a => {
            const newAchievement = newUnlocks.find(na => na.id === a.id)
            return newAchievement || a
          })
        )

        // Show celebration for the first new achievement
        if (newUnlocks[0]) {
          setNewAchievement(newUnlocks[0])
          setShowCelebration(true)
          onAchievementUnlocked?.(newUnlocks[0])
        }
      }
    }

    checkAchievements()
  }, [currentStep, completedActions, achievements, totalSteps, onAchievementUnlocked])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300'
      case 'rare': return 'border-blue-300'
      case 'epic': return 'border-purple-300'
      case 'legendary': return 'border-yellow-300'
      default: return 'border-gray-300'
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div className="space-y-6">
      {/* Points Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
            <p className="text-gray-600">Earn points and unlock achievements</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Next Level</span>
            <span>{totalPoints}/500 points</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalPoints / 500) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Achievements</h4>
        
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-green-600">Unlocked ({unlockedAchievements.length})</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unlockedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${getRarityBorder(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center">
                    <achievement.icon className="h-6 w-6 mr-3" />
                    <div className="flex-1">
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-sm opacity-75">{achievement.description}</div>
                      <div className="text-xs mt-1">+{achievement.points} points</div>
                    </div>
                    <div className="text-lg">🏆</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-600">Locked ({lockedAchievements.length})</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lockedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <achievement.icon className="h-6 w-6 mr-3 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-500">{achievement.name}</div>
                      <div className="text-sm text-gray-400">{achievement.description}</div>
                      <div className="text-xs mt-1 text-gray-400">+{achievement.points} points</div>
                    </div>
                    <div className="text-lg">🔒</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && newAchievement && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.6 }}
              >
                🎉
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Achievement Unlocked!
              </h3>
              
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${getRarityColor(newAchievement.rarity)} mb-4`}>
                <newAchievement.icon className="h-5 w-5 mr-2" />
                <span className="font-semibold">{newAchievement.name}</span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {newAchievement.description}
              </p>
              
              <div className="text-2xl font-bold text-blue-600 mb-4">
                +{newAchievement.points} Points!
              </div>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
