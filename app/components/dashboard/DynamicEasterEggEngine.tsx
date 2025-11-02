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
      const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.warn('[EasterEgg] Anthropic API key not configured');
        return;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `You're an AI Easter egg generator for a car dealership dashboard. Generate a single, witty one-liner (max 15 words) with dry humor and a subtle pop culture reference.

Context:
- Dealership: ${context.dealershipName}
- Trust Score: ${context.trustScore}/100
- Top Issue: ${context.topIssue || 'none'}
- Trigger: ${trigger}
- Time: ${context.currentTime.toLocaleTimeString()}

Style: Ryan Reynolds wit, IYKYK movie references (Nolan, Kubrick, Star Wars, Matrix, sci-fi). Be clever, not forced.

Examples:
- Score 88: "Great Scott! 88 means the flux capacitor is... wait, wrong dashboard."
- Low score at night: "The night is darkest before the dawn. Or before you fix your schema."
- Competitor ahead: "There is no spoon. Also, no reason ${context.competitorName || 'they'} should be beating you."

Generate ONE witty line for this trigger. NO quotes, NO explanation, JUST the line:`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const eggText = data.content?.[0]?.text?.trim().replace(/^["']|["']$/g, '') || 
                     `Trust Score of ${context.trustScore}? That's no moon...`;
      
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
