'use client';

import { motion } from 'framer-motion';
import { Power, Zap, BarChart3, Settings, Activity } from 'lucide-react';
import { useCognitiveStore } from '@/lib/store/cognitive';
import { usePrefsStore } from '@/lib/store/prefs';
import type { CognitiveMode } from '@/lib/types/cognitive';

export function CognitiveHeader() {
  const { mode, setMode, clarity, voice, toggleVoice } = useCognitiveStore();
  const { setOpenSettings } = usePrefsStore();

  const modes: { id: CognitiveMode; label: string; icon: any }[] = [
    { id: 'drive',    label: 'Drive',    icon: Power },
    { id: 'autopilot',label: 'Autopilot',icon: Zap },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'pulse',    label: 'Pulse',    icon: Activity },
  ];

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Left: Clarity */}
      <div className="flex items-center gap-4">
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-lg text-white">
            {clarity.score}
          </div>
          <div>
            <div className="text-xs text-gray-400">Clarity Score</div>
            <div className="text-sm font-semibold flex items-center gap-1 text-white">
              {clarity.score}
              <span className={`text-xs ${clarity.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {clarity.delta > 0 ? '↑' : '↓'}{Math.abs(clarity.delta)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Center: Modes */}
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-full p-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`
                relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} />
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Voice + Settings */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleVoice}
          className={`
            p-2 rounded-lg transition-all
            ${voice.enabled ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
          `}
        >
          <Zap size={18} />
        </button>
        <button
          onClick={() => setOpenSettings(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          aria-label="Open settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

