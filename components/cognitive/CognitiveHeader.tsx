'use client';

import { motion } from 'framer-motion';
import { BarChart3, Power, Settings, Zap } from 'lucide-react';

import { useCognitiveStore } from '@/lib/store/cognitive';
import type { CognitiveMode } from '@/lib/types/cognitive';

const MODES: Array<{ id: CognitiveMode; label: string; icon: typeof Power }> = [
  { id: 'drive', label: 'Drive', icon: Power },
  { id: 'autopilot', label: 'Autopilot', icon: Zap },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

export function CognitiveHeader() {
  const { mode, setMode, clarity, voice, toggleVoice } = useCognitiveStore();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neural-800 bg-neural-900/80 px-6 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between">
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-clarity-blue to-clarity-cyan font-mono text-xl font-semibold text-white">
            {clarity.score}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neural-400">Clarity Score</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {clarity.score}
              <span
                className={`text-xs ${
                  clarity.delta >= 0 ? 'text-alert-success' : 'text-alert-critical'
                }`}
              >
                {clarity.delta >= 0 ? '↑' : '↓'}
                {Math.abs(clarity.delta)}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 rounded-full border border-neural-800 bg-neural-900/60 p-1">
          {MODES.map(({ id, label, icon: Icon }) => {
            const isActive = mode === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-neural-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="cognitive-mode-active"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-clarity-blue to-clarity-cyan"
                    transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} />
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              voice.enabled
                ? 'bg-clarity-blue text-white shadow-lg shadow-clarity-blue/40'
                : 'text-neural-400 hover:bg-neural-800 hover:text-white'
            }`}
            aria-pressed={voice.enabled}
            aria-label={voice.enabled ? 'Disable voice assistant' : 'Enable voice assistant'}
          >
            <Zap size={18} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neural-400 transition-colors hover:bg-neural-800 hover:text-white"
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
