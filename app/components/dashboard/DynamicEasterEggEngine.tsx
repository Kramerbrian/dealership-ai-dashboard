'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface DynamicEasterEggEngineProps {
  context: {
    trustScore: number;
    topIssue?: string;
    competitorName?: string;
    dealershipName: string;
    currentTime: Date;
    recentAction?: string;
  };
  userTier: 'free' | 'pro' | 'enterprise';
}

export const DynamicEasterEggEngine: React.FC<DynamicEasterEggEngineProps> = ({
  context,
  userTier
}) => {
  const [currentEgg, setCurrentEgg] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Generate Easter egg via Claude API
  const generateEasterEgg = async (trigger: string) => {
    // Only Pro/Enterprise get dynamic eggs (another PLG hook)
    if (userTier === 'free') return;

    try {
      // Use API route instead of direct Anthropic call (keeps API key server-side)
      const response = await fetch('/api/ai/easter-egg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...context,
          currentTime: context.currentTime.toISOString(),
          trigger,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const eggText = result.egg || `Trust Score of ${context.trustScore}? That's no moon...`;
      
      setCurrentEgg(eggText);
      setIsVisible(true);
      
      // Hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
        setCurrentEgg(null);
      }, 6000);
    } catch (error) {
      console.error('Easter egg generation failed:', error);
    }
  };

  // Trigger detection system
  useEffect(() => {
    const checkTriggers = () => {
      const score = context.trustScore;
      const hour = context.currentTime.getHours();
      
      // Score-based triggers (with cooldown)
      if (score === 42 || score === 88 || score === 100) {
        generateEasterEgg(`Score reached ${score}`);
      }
      
      // Time-based triggers
      else if (hour === 3 && context.currentTime.getMinutes() === 0) {
        generateEasterEgg('3am - the witching hour of car sales');
      }
      
      // Competitor-based triggers
      else if (context.competitorName && score < 70) {
        generateEasterEgg(`Competitor ${context.competitorName} is ahead`);
      }
      
      // Action-based triggers
      else if (context.recentAction === 'fixed_schema') {
        generateEasterEgg('User just fixed schema markup');
      }
    };

    // Check triggers every 30 seconds
    const interval = setInterval(checkTriggers, 30000);
    checkTriggers(); // Check immediately
    
    return () => clearInterval(interval);
  }, [context, userTier]);

  if (!isVisible || !currentEgg) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-right fade-in duration-500">
      <div className="max-w-xs p-4 rounded-xl glass-dark card-light border border-purple-500/30 
        shadow-lg shadow-purple-500/10">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-sm text-primary font-medium italic">
            {currentEgg}
          </p>
        </div>
      </div>
    </div>
  );
};
