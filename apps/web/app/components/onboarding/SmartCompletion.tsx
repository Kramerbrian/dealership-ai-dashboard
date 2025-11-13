'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Award, 
  Gift,
  Brain,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Star,
  Rocket,
  Crown,
  Diamond,
  Play,
  BarChart3,
  Globe,
  MapPin
} from 'lucide-react';

interface CompletionData {
  dealershipName?: string;
  connectedIntegrations: string[];
  totalTime: number;
  pointsEarned: number;
  level: number;
  nextSteps: string[];
  estimatedFirstReport: string;
}

interface SmartCompletionProps {
  completionData: CompletionData;
  onViewDashboard: () => void;
  onGetHelp: () => void;
  onStartTracking: () => void;
}

export default function SmartCompletion({ 
  completionData, 
  onViewDashboard, 
  onGetHelp, 
  onStartTracking 
}: SmartCompletionProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(0);

  const achievements = [
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: "Setup Complete!",
      description: "You've successfully connected your platforms",
      color: "text-emerald-400"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Assistant Master",
      description: "Completed setup with AI guidance",
      color: "text-blue-400"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Integration Expert",
      description: `${completionData.connectedIntegrations.length} platforms connected`,
      color: "text-yellow-400"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Speed Demon",
      description: `Completed in ${Math.round(completionData.totalTime / 60)} minutes`,
      color: "text-purple-400"
    }
  ];

  const integrationIcons: Record<string, React.ReactNode> = {
    'Website': <Globe className="w-5 h-5" />,
    'Google Business Profile': <MapPin className="w-5 h-5" />,
    'Google Analytics 4': <BarChart3 className="w-5 h-5" />,
    'Facebook': <Globe className="w-5 h-5" />,
    'Instagram': <Globe className="w-5 h-5" />,
    'YouTube': <Play className="w-5 h-5" />
  };

  const nextSteps = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "View Your First Report",
      description: "Your AI visibility report will be ready in 5 minutes",
      action: "View Dashboard",
      onClick: onViewDashboard,
      priority: "high"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Set Up Alerts",
      description: "Get notified when your AI visibility changes",
      action: "Configure Alerts",
      onClick: onViewDashboard,
      priority: "medium"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Track Competitors",
      description: "Monitor how you compare to other dealerships",
      action: "Add Competitors",
      onClick: onViewDashboard,
      priority: "low"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Invite Your Team",
      description: "Share insights with your marketing team",
      action: "Invite Team",
      onClick: onViewDashboard,
      priority: "low"
    }
  ];

  useEffect(() => {
    setShowCelebration(true);
    
    // Cycle through achievements
    const interval = setInterval(() => {
      setCurrentAchievement(prev => (prev + 1) % achievements.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getLevelInfo = (level: number) => {
    if (level >= 4) return { name: 'Master', icon: <Crown className="w-6 h-6" />, color: 'text-purple-400' };
    if (level >= 3) return { name: 'Expert', icon: <Trophy className="w-6 h-6" />, color: 'text-yellow-400' };
    if (level >= 2) return { name: 'Explorer', icon: <Target className="w-6 h-6" />, color: 'text-blue-400' };
    return { name: 'Beginner', icon: <Star className="w-6 h-6" />, color: 'text-emerald-400' };
  };

  const levelInfo = getLevelInfo(completionData.level);

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center p-5">
      <div className="max-w-4xl w-full">
        {/* Celebration Header */}
        <div className="text-center mb-12">
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-8xl animate-bounce opacity-20">
                🎉
              </div>
            </div>
          )}
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
            Congratulations{completionData.dealershipName ? `, ${completionData.dealershipName}` : ''}! 🎉
          </h1>
          
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            You've successfully set up your AI visibility tracking! Your first insights will be ready in just 5 minutes.
          </p>
        </div>

        {/* Achievement Showcase */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Your Achievements</h2>
            <p className="text-white/70">Here's what you've accomplished</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-xl transition-all ${
                  index === currentAchievement 
                    ? 'bg-white/10 scale-105' 
                    : 'bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 ${achievement.color}`}>
                  {achievement.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                <p className="text-xs text-white/70">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {Math.round(completionData.totalTime / 60)}m
            </div>
            <div className="text-sm text-white/70">Setup Time</div>
          </div>
          
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <Diamond className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {completionData.pointsEarned}
            </div>
            <div className="text-sm text-white/70">Points Earned</div>
          </div>
          
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              {levelInfo.icon}
            </div>
            <div className={`text-2xl font-bold ${levelInfo.color}`}>
              {levelInfo.name}
            </div>
            <div className="text-sm text-white/70">Level Achieved</div>
          </div>
        </div>

        {/* Connected Integrations */}
        <div className="glass rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Connected Integrations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {completionData.connectedIntegrations.map((integration, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  {integrationIcons[integration] || <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className="text-sm font-medium">{integration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[var(--brand-primary)]" />
            What's Next?
          </h3>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  step.priority === 'high' 
                    ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    step.priority === 'high' 
                      ? 'bg-[var(--brand-primary)]/20' 
                      : 'bg-white/10'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-white/70">{step.description}</p>
                  </div>
                </div>
                <button
                  onClick={step.onClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    step.priority === 'high'
                      ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/80'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {step.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onViewDashboard}
            className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
            style={{ backgroundImage: 'var(--brand-gradient)' }}
          >
            <BarChart3 className="w-5 h-5" />
            View My Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onGetHelp}
            className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold bg-white/10 hover:bg-white/20 transition-all"
          >
            <Brain className="w-5 h-5" />
            Get Help
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-white/60">
          <p>Your first AI visibility report will be ready in {completionData.estimatedFirstReport}</p>
          <p className="mt-1">Need help? Our support team is here 24/7</p>
        </div>
      </div>
    </div>
  );
}
