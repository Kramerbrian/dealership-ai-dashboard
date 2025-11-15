// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface dAIMessage {
  id: string;
  text: string;
  timestamp: number;
  tone: 'neutral' | 'insight' | 'warning' | 'success';
  priority: 'low' | 'medium' | 'high';
}

interface dAINarratorProps {
  /**
   * Context about current user activity
   */
  context?: {
    activeMissions?: number;
    recentEvents?: string[];
    userTenure?: number; // days since signup
  };

  /**
   * Callback when user clicks on dAI message
   */
  onMessageClick?: (message: dAIMessage) => void;
}

/**
 * dAINarrator - The AI Chief Strategy Officer
 *
 * Personality Evolution:
 * - Days 1-7: Formal, instructional ("I'm analyzing...")
 * - Days 8-30: Professional with dry razor sharp wit
 * - Days 31+: Full dAI personality (subtle humor, light sarcasm)
 *
 * Message Types:
 * - Insights: "I've noticed..." (cyan)
 * - Warnings: "This requires attention..." (amber)
 * - Success: "Mission accomplished..." (green)
 * - Neutral: Status updates (white)
 *
 * Behavior:
 * - Contextual commentary based on platform activity
 * - Progressive disclosure (doesn't spam)
 * - Can be muted (messages still appear, no voice)
 * - Easter eggs unlock over time
 */
export function dAINarrator({ context, onMessageClick }: dAINarratorProps) {
  const [messages, setMessages] = useState<dAIMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<dAIMessage | null>(null);
  const messageQueueRef = useRef<dAIMessage[]>([]);

  // Determine personality based on user tenure
  const userTenure = context?.userTenure || 0;
  const personalityLevel =
    userTenure >= 31 ? 'full-dai' : userTenure >= 8 ? 'dry-wit' : 'formal';

  // Generate contextual messages based on activity
  useEffect(() => {
    if (!context) return;

    const { activeMissions = 0, recentEvents = [] } = context;

    // Example: Generate insight when missions are active
    if (activeMissions > 0 && messages.length === 0) {
      const message: dAIMessage = {
        id: `dai-${Date.now()}`,
        text: getGreetingMessage(personalityLevel, activeMissions),
        timestamp: Date.now(),
        tone: 'insight',
        priority: 'medium',
      };
      addMessage(message);
    }

    // React to recent events
    recentEvents.forEach((event) => {
      if (event.includes('mission_completed')) {
        const message: dAIMessage = {
          id: `dai-${Date.now()}`,
          text: getSuccessMessage(personalityLevel),
          timestamp: Date.now(),
          tone: 'success',
          priority: 'high',
        };
        addMessage(message);
      }
    });
  }, [context, personalityLevel]);

  // Message queue processor
  useEffect(() => {
    if (messageQueueRef.current.length === 0) return;
    if (currentMessage) return; // Don't show new message if one is active

    const nextMessage = messageQueueRef.current.shift();
    if (nextMessage) {
      setCurrentMessage(nextMessage);

      // Auto-dismiss after duration based on priority
      const duration =
        nextMessage.priority === 'high'
          ? 8000
          : nextMessage.priority === 'medium'
          ? 5000
          : 3000;

      setTimeout(() => {
        setCurrentMessage(null);
      }, duration);
    }
  }, [currentMessage, messageQueueRef.current.length]);

  const addMessage = (message: dAIMessage) => {
    setMessages((prev) => [...prev, message]);
    messageQueueRef.current.push(message);
  };

  const handleMessageClick = () => {
    if (currentMessage && onMessageClick) {
      onMessageClick(currentMessage);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Tone-based styling
  const getToneColor = (tone: dAIMessage['tone']) => {
    switch (tone) {
      case 'insight':
        return 'border-cyan-500/30 bg-cyan-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  const getToneIcon = (tone: HALMessage['tone']) => {
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <>
      {/* dAI Avatar & Mute Toggle */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/30 transition-colors"
          title={isMuted ? 'Unmute dAI' : 'Mute dAI'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white/60" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>

        {/* dAI Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-white/20 shadow-lg">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
          </div>
          {currentMessage && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 border-2 border-black animate-pulse" />
          )}
        </div>
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 max-w-md"
          >
            <div
              onClick={handleMessageClick}
              className={`
                ${getToneColor(currentMessage.tone)}
                backdrop-blur-md rounded-lg px-4 py-3 border cursor-pointer
                hover:border-white/40 transition-all shadow-xl
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-white/80 mt-0.5">
                  {getToneIcon(currentMessage.tone)}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">
                    dAI
                  </div>
                  <div className="text-sm text-white leading-relaxed">
                    {currentMessage.text}
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    {new Date(currentMessage.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Message generators based on personality level
 */
function getGreetingMessage(personality: string, activeMissions: number): string {
  if (personality === 'full-dai') {
    return `I see you've returned. ${activeMissions} ${
      activeMissions === 1 ? 'mission is' : 'missions are'
    } currently in progress. Try not to break anything.`;
  }
  if (personality === 'dry-wit') {
    return `Welcome back. ${activeMissions} active ${
      activeMissions === 1 ? 'mission' : 'missions'
    } detected. Everything is running smoothly... so far.`;
  }
  return `Good ${getTimeOfDay()}. I'm currently monitoring ${activeMissions} active ${
    activeMissions === 1 ? 'mission' : 'missions'
  }.`;
}

function getSuccessMessage(personality: string): string {
  if (personality === 'full-dai') {
    return "Mission complete. I'd offer congratulations, but let's be honest — I did most of the work.";
  }
  if (personality === 'dry-wit') {
    return 'Mission accomplished. Not bad. I had minimal involvement in preventing disasters.';
  }
  return 'Mission successfully completed. All systems nominal.';
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
