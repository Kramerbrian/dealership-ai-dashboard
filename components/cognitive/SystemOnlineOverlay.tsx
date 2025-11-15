// @ts-nocheck
'use client'

import { motion } from 'framer-motion'
import { useBrandHue, getBrandHSL } from '@/lib/hooks/useBrandHue'

interface SystemOnlineOverlayProps {
  domain?: string | null
  onDismiss?: () => void
}

export default function SystemOnlineOverlay({
  domain,
  onDismiss,
}: SystemOnlineOverlayProps) {
  const hue = useBrandHue(domain)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 max-w-2xl w-full mx-6 p-8 rounded-2xl border backdrop-blur-md"
        style={{
          borderColor: getBrandHSL(hue, 60, 40),
          backgroundColor: `${getBrandHSL(hue, 20, 10)}90`,
        }}
      >
        <div className="text-center">
          {/* Status indicator */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getBrandHSL(hue, 80, 60) }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <h1
              className="text-4xl md:text-5xl font-mono font-bold"
              style={{ color: getBrandHSL(hue, 80, 60) }}
            >
              SYSTEM ONLINE
            </h1>
          </motion.div>

          {/* Status lines */}
          <div className="space-y-3 mb-8">
            {[
              'ORCHESTRATOR: ACTIVE',
              'PULSE ENGINE: OPERATIONAL',
              'COGNITIVE CORE: READY',
            ].map((line, i) => (
              <motion.div
                key={line}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="font-mono text-sm uppercase tracking-wider"
                style={{ color: getBrandHSL(hue, 60, 70) }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Dismiss button */}
          <motion.button
            onClick={onDismiss}
            className="px-6 py-3 rounded-lg font-mono uppercase tracking-wider border-2 transition-all hover:scale-105 pointer-events-auto"
            style={{
              borderColor: getBrandHSL(hue, 80, 60),
              color: getBrandHSL(hue, 80, 60),
              backgroundColor: `${getBrandHSL(hue, 80, 60)}10`,
            }}
            whileHover={{
              backgroundColor: `${getBrandHSL(hue, 80, 60)}20`,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            ENTER DASHBOARD
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

