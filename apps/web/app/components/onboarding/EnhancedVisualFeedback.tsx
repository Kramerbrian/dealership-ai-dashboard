'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Trophy, 
  Star,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface FeedbackProps {
  type: 'success' | 'error' | 'loading' | 'milestone' | 'achievement';
  message: string;
  details?: string;
  duration?: number;
  onComplete?: () => void;
  showProgress?: boolean;
  progressValue?: number;
}

export default function EnhancedVisualFeedback({
  type,
  message,
  details,
  duration = 3000,
  onComplete,
  showProgress = false,
  progressValue = 0
}: FeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress && progressValue > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= progressValue) {
            clearInterval(interval);
            return progressValue;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [showProgress, progressValue]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      case 'loading':
        return <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />;
      case 'milestone':
        return <Target className="w-8 h-8 text-[var(--brand-primary)]" />;
      case 'achievement':
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      default:
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/20 border-emerald-500/30';
      case 'error':
        return 'bg-red-500/20 border-red-500/30';
      case 'loading':
        return 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30';
      case 'milestone':
        return 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30';
      case 'achievement':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-emerald-500/20 border-emerald-500/30';
    }
  };

  const getAnimationClass = () => {
    switch (type) {
      case 'success':
        return 'animate-bounce-in';
      case 'error':
        return 'animate-shake';
      case 'loading':
        return 'animate-pulse';
      case 'milestone':
        return 'animate-scale-in';
      case 'achievement':
        return 'animate-bounce-in';
      default:
        return 'animate-fade-in';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${getAnimationClass()}`}>
      <div className={`glass rounded-xl p-4 border ${getBackgroundColor()} min-w-[300px] max-w-[400px]`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{message}</h3>
            {details && (
              <p className="text-sm text-white/70 mb-3">{details}</p>
            )}
            
            {showProgress && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confetti Animation Component
export function ConfettiAnimation({ onComplete }: { onComplete?: () => void }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1000
    }));
    
    setParticles(newParticles);
    
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`
          }}
        />
      ))}
    </div>
  );
}

// Progress Celebration Component
export function ProgressCelebration({ 
  milestone, 
  onComplete 
}: { 
  milestone: string; 
  onComplete?: () => void; 
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  return (
    <>
      {showConfetti && (
        <ConfettiAnimation onComplete={() => setShowConfetti(false)} />
      )}
      <EnhancedVisualFeedback
        type="achievement"
        message={`🎉 ${milestone} Unlocked!`}
        details="Great progress! You're on your way to maximum AI visibility."
        duration={4000}
        onComplete={onComplete}
      />
    </>
  );
}

// Connection Success Animation
export function ConnectionSuccess({ 
  integration, 
  onComplete 
}: { 
  integration: string; 
  onComplete?: () => void; 
}) {
  return (
    <>
      <ConfettiAnimation onComplete={() => {}} />
      <EnhancedVisualFeedback
        type="success"
        message={`${integration} Connected Successfully!`}
        details="Your integration is now active and collecting data."
        duration={3000}
        onComplete={onComplete}
      />
    </>
  );
}

// Connection Error Animation
export function ConnectionError({ 
  integration, 
  error, 
  onRetry 
}: { 
  integration: string; 
  error: string; 
  onRetry?: () => void; 
}) {
  return (
    <EnhancedVisualFeedback
      type="error"
      message={`Failed to Connect ${integration}`}
      details={error}
      duration={5000}
      onComplete={onRetry}
    />
  );
}

// Loading Animation
export function ConnectionLoading({ 
  integration 
}: { 
  integration: string; 
}) {
  return (
    <EnhancedVisualFeedback
      type="loading"
      message={`Connecting to ${integration}...`}
      details="Please wait while we verify your connection."
      duration={0}
      showProgress={true}
      progressValue={100}
    />
  );
}

// Add custom CSS animations
const styles = `
  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  
  @keyframes scale-in {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  
  .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
  .animate-shake { animation: shake 0.5s ease-in-out; }
  .animate-scale-in { animation: scale-in 0.3s ease-out; }
  .animate-fade-in { animation: fade-in 0.3s ease-out; }
  .animate-confetti { animation: confetti 3s linear forwards; }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
