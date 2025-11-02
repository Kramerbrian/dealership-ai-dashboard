/**
 * Achievement System Component
 * 
 * Displays achievements, progress, and unlock animations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award, X } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: number; // 0-100
  requirement: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Fixed your first critical issue',
    icon: Zap,
    rarity: 'common',
    progress: 0,
    requirement: 'Fix 1 critical issue'
  },
  {
    id: 'flux-capacitor',
    name: 'Flux Capacitor',
    description: 'Reached Trust Score of 88',
    icon: Star,
    rarity: 'rare',
    progress: 0,
    requirement: 'Trust Score = 88'
  },
  {
    id: 'perfect-score',
    name: 'Perfectionist',
    description: 'Achieved 100/100 Trust Score',
    icon: Trophy,
    rarity: 'legendary',
    progress: 0,
    requirement: 'Trust Score = 100'
  },
  {
    id: 'competitor-crusher',
    name: 'Competitor Crusher',
    description: 'Overtook 5 competitors in one month',
    icon: Target,
    rarity: 'epic',
    progress: 0,
    requirement: 'Pass 5 competitors'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Logged in before 6am',
    icon: Award,
    rarity: 'rare',
    progress: 0,
    requirement: 'Login before 6am'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: '7 days of consecutive improvement',
    icon: Star,
    rarity: 'epic',
    progress: 0,
    requirement: '7 days improving'
  }
];

interface AchievementSystemProps {
  userProgress: {
    trustScore?: number;
    criticalIssuesFixed?: number;
    competitorsOvertaken?: number;
    consecutiveDaysImproving?: number;
  };
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ userProgress }) => {
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check for new achievements
    const updated = achievements.map(ach => {
      let progress = ach.progress;

      // Update progress based on userProgress
      switch (ach.id) {
        case 'first-blood':
          progress = Math.min(100, (userProgress.criticalIssuesFixed || 0) * 100);
          break;
        case 'flux-capacitor':
          progress = userProgress.trustScore === 88 ? 100 : 0;
          break;
        case 'perfect-score':
          progress = userProgress.trustScore === 100 ? 100 : 0;
          break;
        case 'competitor-crusher':
          progress = Math.min(100, ((userProgress.competitorsOvertaken || 0) / 5) * 100);
          break;
        case 'streak-master':
          progress = Math.min(100, ((userProgress.consecutiveDaysImproving || 0) / 7) * 100);
          break;
      }

      const wasUnlocked = ach.progress === 100;
      const isNowUnlocked = progress === 100;

      // Trigger unlock animation
      if (!wasUnlocked && isNowUnlocked) {
        setNewUnlock({ ...ach, progress, unlockedAt: new Date() });
        setShowModal(true);
      }

      return {
        ...ach,
        progress,
        unlockedAt: progress === 100 ? (ach.unlockedAt || new Date()) : undefined
      };
    });

    setAchievements(updated);
  }, [userProgress]);

  const rarityColors = {
    common: {
      text: 'text-gray-500',
      border: 'border-gray-500/20',
      bg: 'bg-gray-500/10'
    },
    rare: {
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/10'
    },
    epic: {
      text: 'text-purple-500',
      border: 'border-purple-500/20',
      bg: 'bg-purple-500/10'
    },
    legendary: {
      text: 'text-amber-500',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/10'
    }
  };

  return (
    <>
      <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Achievements
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map(achievement => {
            const Icon = achievement.icon;
            const isUnlocked = achievement.progress === 100;
            const colors = rarityColors[achievement.rarity];

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                  isUnlocked 
                    ? `${colors.border} ${colors.bg}` 
                    : 'opacity-50 grayscale border-gray-700'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-2 ${
                    isUnlocked ? colors.bg : 'bg-gray-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${isUnlocked ? colors.text : 'text-gray-500'}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {achievement.description}
                  </p>
                  {!isUnlocked && (
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                      <motion.div
                        className={`h-1.5 rounded-full ${colors.bg.replace('/10', '')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                  <span className={`text-xs capitalize ${isUnlocked ? colors.text : 'text-gray-500'}`}>
                    {achievement.rarity}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showModal && newUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setTimeout(() => setNewUnlock(null), 300);
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-center max-w-md mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  setTimeout(() => setNewUnlock(null), 300);
                }}
                className="absolute -top-4 -right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-4" />
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Achievement Unlocked!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-purple-400 mb-2"
              >
                {newUnlock.name}
              </motion.p>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-400"
              >
                {newUnlock.description}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

