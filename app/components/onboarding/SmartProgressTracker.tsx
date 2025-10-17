'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  Trophy, 
  Award, 
  Gift,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Crown,
  Clock,
  Rocket,
  Diamond
} from 'lucide-react';

interface SmartStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  reward?: {
    type: 'badge' | 'points' | 'feature' | 'discount' | 'unlock';
    value: string;
    description: string;
    icon?: React.ReactNode;
  };
  estimatedTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  impact?: 'Low' | 'Medium' | 'High';
}

interface SmartProgressTrackerProps {
  steps: SmartStep[];
  currentStep: number;
  onStepClick?: (stepId: string) => void;
  showRewards?: boolean;
  compact?: boolean;
  gamification?: boolean;
}

export default function SmartProgressTracker({
  steps,
  currentStep,
  onStepClick,
  showRewards = true,
  compact = false,
  gamification = true
}: SmartProgressTrackerProps) {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const completed = steps.filter(step => step.completed).length;
    setCompletedSteps(completed);
    
    // Calculate points
    const points = steps.reduce((total, step) => {
      if (!step.completed) return total;
      
      let stepPoints = 10; // Base points
      if (step.optional) stepPoints += 5; // Bonus for optional
      if (step.difficulty === 'Medium') stepPoints += 5;
      if (step.difficulty === 'Hard') stepPoints += 10;
      if (step.impact === 'High') stepPoints += 10;
      
      return total + stepPoints;
    }, 0);
    
    setTotalPoints(points);

    // Check for new rewards
    const newRewards = steps
      .filter(step => step.completed && step.reward)
      .map(step => step.reward!.value);
    
    setUnlockedRewards(newRewards);

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].completed) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);

    // Show celebration for new completions
    if (completed > 0 && completed !== completedSteps) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [steps, completedSteps]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'Low': return 'text-white/40';
      case 'Medium': return 'text-blue-400';
      case 'High': return 'text-purple-400';
      default: return 'text-white/60';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award className="w-4 h-4" />;
      case 'points': return <Star className="w-4 h-4" />;
      case 'feature': return <Zap className="w-4 h-4" />;
      case 'discount': return <Gift className="w-4 h-4" />;
      case 'unlock': return <Crown className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getProgressColor = () => {
    const progress = (completedSteps / steps.length) * 100;
    if (progress < 25) return 'from-red-500 to-orange-500';
    if (progress < 50) return 'from-orange-500 to-yellow-500';
    if (progress < 75) return 'from-yellow-500 to-blue-500';
    return 'from-blue-500 to-emerald-500';
  };

  const getLevel = () => {
    if (totalPoints < 50) return { level: 1, name: 'Beginner', icon: <Circle className="w-4 h-4" /> };
    if (totalPoints < 100) return { level: 2, name: 'Explorer', icon: <Target className="w-4 h-4" /> };
    if (totalPoints < 150) return { level: 3, name: 'Expert', icon: <Trophy className="w-4 h-4" /> };
    return { level: 4, name: 'Master', icon: <Crown className="w-4 h-4" /> };
  };

  const level = getLevel();

  if (compact) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {level.icon}
            <span className="text-sm font-medium">{level.name}</span>
            <span className="text-xs text-white/60">Level {level.level}</span>
          </div>
          <div className="text-sm font-bold text-[var(--brand-primary)]">
            {totalPoints} pts
          </div>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor()}`}
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="text-xs text-white/60">
          {completedSteps} of {steps.length} steps completed
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">
            🎉
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center mx-auto mb-2">
              {level.icon}
            </div>
            <div className="text-lg font-bold">{level.name}</div>
            <div className="text-xs text-white/60">Level {level.level}</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400">{totalPoints}</div>
            <div className="text-xs text-white/60">Points Earned</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400">{completedSteps}</div>
            <div className="text-xs text-white/60">Steps Done</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-400">{currentStreak}</div>
            <div className="text-xs text-white/60">Streak</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-white/60">
            {Math.round((completedSteps / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`glass rounded-xl p-4 cursor-pointer transition-all ${
              index === currentStep 
                ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary)]/10' 
                : 'hover:bg-white/5'
            }`}
            onClick={() => onStepClick?.(step.id)}
          >
            <div className="flex items-center gap-4">
              {/* Step Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : index === currentStep
                    ? 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                    : 'bg-white/10 text-white/40'
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  {step.optional && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                      Optional
                    </span>
                  )}
                  {step.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(step.difficulty)}`}>
                      {step.difficulty}
                    </span>
                  )}
                  {step.impact && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getImpactColor(step.impact)}`}>
                      {step.impact} Impact
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70 mb-2">{step.description}</p>
                
                {/* Step Meta */}
                <div className="flex items-center gap-4 text-xs text-white/50">
                  {step.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.estimatedTime}
                    </div>
                  )}
                  {step.reward && (
                    <div className="flex items-center gap-1">
                      {getRewardIcon(step.reward.type)}
                      {step.reward.value} {step.reward.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Reward Badge */}
              {step.completed && step.reward && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  {getRewardIcon(step.reward.type)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unlocked Rewards */}
      {gamification && unlockedRewards.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Unlocked Rewards
          </h3>
          <div className="flex flex-wrap gap-2">
            {unlockedRewards.map((reward, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                <Diamond className="w-4 h-4" />
                {reward}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
