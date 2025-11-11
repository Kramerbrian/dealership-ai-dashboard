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
  Crown
} from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  reward?: {
    type: 'badge' | 'points' | 'feature' | 'discount';
    value: string;
    description: string;
  };
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepId: string) => void;
  showRewards?: boolean;
  compact?: boolean;
}

export default function ProgressTracker({
  steps,
  currentStep,
  onStepClick,
  showRewards = true,
  compact = false
}: ProgressTrackerProps) {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);

  useEffect(() => {
    const completed = steps.filter(step => step.completed).length;
    setCompletedSteps(completed);
    
    // Calculate points
    const points = steps.reduce((total, step) => {
      if (step.completed) {
        return total + (step.optional ? 5 : 10);
      }
      return total;
    }, 0);
    setTotalPoints(points);

    // Check for unlocked rewards
    const rewards = [];
    if (completed >= 3) rewards.push('bronze');
    if (completed >= 5) rewards.push('silver');
    if (completed >= 7) rewards.push('gold');
    if (completed === steps.length) rewards.push('platinum');
    setUnlockedRewards(rewards);
  }, [steps]);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'bronze': return <Award className="w-5 h-5 text-amber-600" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-400" />;
      case 'gold': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'platinum': return <Crown className="w-5 h-5 text-purple-500" />;
      default: return <Gift className="w-5 h-5 text-[var(--brand-primary)]" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-amber-500/20 border-amber-500/30';
      case 'silver': return 'bg-gray-500/20 border-gray-500/30';
      case 'gold': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'platinum': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30';
    }
  };

  const getRewardTitle = (type: string) => {
    switch (type) {
      case 'bronze': return 'Bronze Badge';
      case 'silver': return 'Silver Badge';
      case 'gold': return 'Gold Badge';
      case 'platinum': return 'Platinum Badge';
      default: return 'Reward';
    }
  };

  const getRewardDescription = (type: string) => {
    switch (type) {
      case 'bronze': return 'You\'ve connected 3+ platforms!';
      case 'silver': return 'You\'ve connected 5+ platforms!';
      case 'gold': return 'You\'ve connected 7+ platforms!';
      case 'platinum': return 'You\'ve completed all setup steps!';
      default: return 'Great progress!';
    }
  };

  if (compact) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--brand-primary)]" />
            <span className="font-semibold">Setup Progress</span>
          </div>
          <div className="text-sm text-white/70">
            {completedSteps}/{steps.length}
          </div>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
          <div 
            className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          ></div>
        </div>

        {showRewards && totalPoints > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white/70">{totalPoints} points earned</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Setup Progress</h3>
            <p className="text-sm text-white/70">
              Complete steps to unlock rewards and maximize your AI visibility insights
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--brand-primary)]">
              {completedSteps}/{steps.length}
            </div>
            <div className="text-sm text-white/70">steps completed</div>
          </div>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <div 
            className="bg-[var(--brand-primary)] h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          ></div>
        </div>

        {showRewards && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">{totalPoints} points</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
              <span className="text-sm text-white/70">
                {Math.round((completedSteps / steps.length) * 100)}% complete
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              step.completed 
                ? 'border-emerald-500/30 bg-emerald-500/10' 
                : index === currentStep
                ? 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => onStepClick?.(step.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-emerald-500 text-white' 
                  : index === currentStep
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-white/10 text-white/40'
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{step.title}</h4>
                  {step.optional && (
                    <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">
                      Optional
                    </span>
                  )}
                  {step.reward && step.completed && (
                    <div className="flex items-center gap-1">
                      {getRewardIcon(step.reward.type)}
                      <span className="text-xs text-yellow-400 font-medium">
                        +{step.reward.value}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/70">{step.description}</p>
              </div>

              {step.completed && (
                <div className="text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rewards Section */}
      {showRewards && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-[var(--brand-primary)]" />
            <h3 className="text-lg font-semibold">Unlocked Rewards</h3>
          </div>

          {unlockedRewards.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {unlockedRewards.map((reward) => (
                <div
                  key={reward}
                  className={`${getRewardColor(reward)} border rounded-xl p-4`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getRewardIcon(reward)}
                    <div>
                      <div className="font-semibold text-sm">{getRewardTitle(reward)}</div>
                      <div className="text-xs text-white/70">{getRewardDescription(reward)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">
                Complete more steps to unlock rewards and badges!
              </p>
            </div>
          )}

          {/* Next Reward Preview */}
          {completedSteps < steps.length && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/20">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-white/40" />
                <div>
                  <div className="font-semibold text-sm">Next Reward</div>
                  <div className="text-xs text-white/70">
                    Complete {Math.ceil(steps.length * 0.6)} steps to unlock Silver Badge
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Celebration */}
      {completedSteps === steps.length && (
        <div className="glass rounded-xl p-6 border border-emerald-500/30 bg-emerald-500/10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">🎉 Setup Complete!</h3>
            <p className="text-white/70 mb-4">
              You've successfully connected all your marketing platforms and unlocked maximum AI visibility insights!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{totalPoints} points earned</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>Platinum Badge unlocked</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-configured progress steps for onboarding
export const onboardingSteps: ProgressStep[] = [
  {
    id: 'welcome',
    title: 'Welcome & Account Setup',
    description: 'Complete your account setup and profile',
    completed: false,
    reward: {
      type: 'points',
      value: '10',
      description: 'Welcome bonus points'
    }
  },
  {
    id: 'required_setup',
    title: 'Required Setup',
    description: 'Connect Google Business Profile OR Website URL',
    completed: false,
    reward: {
      type: 'points',
      value: '10',
      description: 'Core tracking enabled'
    }
  },
  {
    id: 'google_analytics',
    title: 'Google Analytics 4 (Optional)',
    description: 'Connect GA4 for traffic insights',
    completed: false,
    optional: true,
    reward: {
      type: 'feature',
      value: '87%',
      description: 'More accurate data'
    }
  },
  {
    id: 'goals',
    title: 'Set Goals',
    description: 'Define your AI visibility objectives',
    completed: false,
    reward: {
      type: 'points',
      value: '10',
      description: 'Personalized insights'
    }
  },
  {
    id: 'team',
    title: 'Invite Team',
    description: 'Add team members to collaborate',
    completed: false,
    optional: true,
    reward: {
      type: 'points',
      value: '5',
      description: 'Team collaboration'
    }
  }
];
