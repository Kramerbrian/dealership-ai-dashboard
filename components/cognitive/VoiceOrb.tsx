'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useEffect } from 'react';

import { useCognitiveStore } from '@/lib/store/cognitive';
import type { VoiceState } from '@/lib/types/cognitive';

const VOICE_STATE_LABELS: Record<VoiceState, string> = {
  idle: 'Voice assistant idle',
  listening: 'Listening…',
  thinking: 'Processing intent…',
  speaking: 'Responding…',
};

export function VoiceOrb() {
  const { voice, toggleVoice, setVoiceState } = useCognitiveStore();

  useEffect(() => {
    if (!voice.enabled) {
      setVoiceState('idle');
      return undefined;
    }

    const cycle: VoiceState[] = ['listening', 'thinking', 'speaking'];
    let index = 0;
    setVoiceState(cycle[index]);

    const timer = setInterval(() => {
      index = (index + 1) % cycle.length;
      setVoiceState(cycle[index]);
    }, 2400);

    return () => {
      clearInterval(timer);
      setVoiceState('idle');
    };
  }, [setVoiceState, voice.enabled]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 sm:bottom-10 sm:right-10">
      <motion.button
        type="button"
        onClick={toggleVoice}
        whileTap={{ scale: 0.92 }}
        className={`pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full border border-clarity-blue/30 bg-gradient-to-br transition-all ${
          voice.enabled
            ? 'from-clarity-blue/80 to-clarity-cyan/70 shadow-lg shadow-clarity-blue/30'
            : 'from-neural-800/60 to-neural-900/80 text-neural-400 hover:border-clarity-cyan/40 hover:text-white'
        }`}
        aria-pressed={voice.enabled}
        aria-label={voice.enabled ? 'Disable voice assistant' : 'Enable voice assistant'}
      >
        <motion.span
          animate={{
            scale: voice.enabled ? [1, 1.08, 1] : 1,
            opacity: voice.enabled ? [0.75, 1, 0.75] : 1,
          }}
          transition={{ repeat: voice.enabled ? Infinity : 0, duration: 2.4, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-white/20"
        />
        {voice.enabled ? <Mic className="relative z-10 h-6 w-6 text-white" /> : <MicOff className="relative z-10 h-6 w-6" />}
      </motion.button>

      <motion.div
        key={voice.state}
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -6, filter: 'blur(8px)' }}
        className="pointer-events-auto rounded-2xl border border-neural-800 bg-neural-900/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-neural-300 backdrop-blur"
      >
        {VOICE_STATE_LABELS[voice.state]}
      </motion.div>
    </div>
  );
}
