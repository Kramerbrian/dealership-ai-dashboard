// @ts-nocheck
'use client'

import { motion } from 'framer-motion'
import { useBrandPalette } from '@/lib/hooks/useBrandHue'

interface OrchestratorReadyStateProps {
  domain?: string | null
  onReady?: () => void
  onSkip?: () => void
}

export default function OrchestratorReadyState({
  domain,
  onReady,
}: OrchestratorReadyStateProps) {
  const { accent, accentSoft, accentBg } = useBrandPalette(domain)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative">
      {/* Cinematic grid glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}15, transparent 80%)`,
        }}
      />
      
      <div className="max-w-4xl w-full relative z-10">
        {/* Status grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {['ORCHESTRATOR', 'PULSE ENGINE', 'COGNITIVE CORE'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="border rounded-lg p-4 backdrop-blur-sm"
              style={{
                borderColor: accent,
                backgroundColor: `${accentBg}40`,
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: accent }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
                <span
                  className="text-sm font-mono uppercase tracking-wider"
                  style={{ color: accentSoft }}
                >
                  {label}
                </span>
              </div>
              <div
                className="text-xs font-mono mt-2"
                style={{ color: accentSoft }}
              >
                READY
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-mono font-bold mb-4"
            style={{ color: accent }}
          >
            ORCHESTRATOR
          </motion.h1>
          <motion.h2
            className="text-2xl md:text-4xl font-mono font-light mb-8"
            style={{ color: accentSoft }}
          >
            READY STATE
          </motion.h2>

          {/* Pulse indicator */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div
              className="text-sm font-mono uppercase tracking-widest"
              style={{ color: accentSoft }}
            >
              INITIALIZING PULSE ASSIMILATION
            </div>
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accent }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Continue button */}
          <motion.button
            onClick={onReady}
            className="px-8 py-4 rounded-lg font-mono uppercase tracking-wider border-2 transition-all hover:scale-105"
            style={{
              borderColor: accent,
              color: accent,
              backgroundColor: `${accent}10`,
            }}
            whileHover={{
              backgroundColor: `${accent}20`,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            PROCEED
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

