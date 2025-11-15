// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrandHue, getBrandHSL } from '@/lib/hooks/useBrandHue'

interface TronAcknowledgmentProps {
  domain?: string | null
  onComplete?: () => void
  duration?: number
  onSkip?: () => void
}

export default function TronAcknowledgment({
  domain,
  onComplete,
  duration = 3000,
}: TronAcknowledgmentProps) {
  const hue = useBrandHue(domain)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (duration / 100)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setVisible(false)
            onComplete?.()
          }, 500)
          return 100
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <div className="relative w-full max-w-4xl px-6">
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(${getBrandHSL(hue, 30, 20)} 1px, transparent 1px),
                  linear-gradient(90deg, ${getBrandHSL(hue, 30, 20)} 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-center"
            >
              <motion.h1
                className="text-6xl md:text-8xl font-mono font-bold mb-4"
                style={{ color: getBrandHSL(hue, 80, 60) }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                SYSTEM
              </motion.h1>
              <motion.h2
                className="text-4xl md:text-6xl font-mono font-light mb-8"
                style={{ color: getBrandHSL(hue, 60, 70) }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                ACKNOWLEDGED
              </motion.h2>

              {/* Progress bar */}
              <div className="w-full max-w-md mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: getBrandHSL(hue, 80, 60) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>

              {/* Glitch effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  opacity: [0, 0.1, 0],
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${getBrandHSL(hue, 100, 50)}, transparent)`,
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

