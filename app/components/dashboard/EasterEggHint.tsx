'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EasterEggHintProps {
  trigger: 'score' | 'time' | 'click' | 'hover';
  condition: any; // score value, time of day, etc.
  message: string;
  reference?: string; // Movie/pop culture reference
  duration?: number; // milliseconds to display
}

export const EasterEggHint: React.FC<EasterEggHintProps> = ({
  trigger,
  condition,
  message,
  reference,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  // Check condition based on trigger type
  useEffect(() => {
    switch (trigger) {
      case 'score':
        // Specific score values trigger Easter eggs
        setShouldShow(condition === 88 || condition === 42 || condition === 100 || condition === 69);
        break;
      case 'time':
        // Time-based triggers (e.g., 4:20, 11:11, etc.)
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        setShouldShow(
          (hours === 4 && minutes === 20) ||
          (hours === 11 && minutes === 11) ||
          (hours === 23 && minutes === 59)
        );
        break;
      case 'click':
      case 'hover':
        setShouldShow(condition);
        break;
    }
  }, [trigger, condition]);

  // Auto-hide after duration
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [shouldShow, duration]);

  if (!isVisible || !shouldShow) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 20, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 right-6 z-50 max-w-xs"
        >
          <div className="p-4 rounded-xl bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 
            shadow-lg shadow-purple-500/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-sm text-white font-medium mb-1">
                  {message}
                </p>
                {reference && (
                  <p className="text-xs text-gray-400 italic">
                    {reference}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pre-built Easter egg collection
export const useEasterEggs = (currentScore: number) => {
  const [activeEgg, setActiveEgg] = useState<EasterEggHintProps | null>(null);

  const eggs: Record<number, Omit<EasterEggHintProps, 'trigger' | 'condition'>> = {
    42: {
      message: "Don't panic. 42 is actually pretty solid.",
      reference: "Hitchhiker's Guide to the Galaxy"
    },
    88: {
      message: "Great Scott! You've hit 88. Where we're going, we don't need roads.",
      reference: "Back to the Future"
    },
    100: {
      message: "Achievement unlocked: Perfect Score. You've crossed the event horizon.",
      reference: "Interstellar"
    },
    69: {
      message: "Nice.",
      reference: "IYKYK"
    }
  };

  useEffect(() => {
    if (eggs[currentScore]) {
      setActiveEgg({
        trigger: 'score',
        condition: currentScore,
        ...eggs[currentScore]
      } as EasterEggHintProps);
      // Clear after showing
      setTimeout(() => setActiveEgg(null), 6000);
    }
  }, [currentScore]);

  return activeEgg;
};

// Time-based Easter eggs
export const useTimeBasedEggs = () => {
  const [activeEgg, setActiveEgg] = useState<EasterEggHintProps | null>(null);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // 11:11 - Make a wish
      if (hours === 11 && minutes === 11) {
        setActiveEgg({
          trigger: 'time',
          condition: true,
          message: "11:11 - Make a wish for better AI visibility",
          duration: 60000 // Show for 1 minute
        });
      }
      // 4:20 - Chill vibes
      else if (hours === 16 && minutes === 20) {
        setActiveEgg({
          trigger: 'time',
          condition: true,
          message: "Take a break. Your competitors aren't optimizing right now either.",
          duration: 60000
        });
      }
      // 23:59 - End of day
      else if (hours === 23 && minutes === 59) {
        setActiveEgg({
          trigger: 'time',
          condition: true,
          message: "One minute to midnight. Time to let the robots rest.",
          reference: "Iron Maiden"
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    checkTime(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  return activeEgg;
};

// Konami code Easter egg
export const useKonamiCode = (onActivate: () => void) => {
  useEffect(() => {
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a'
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          onActivate();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActivate]);
};
