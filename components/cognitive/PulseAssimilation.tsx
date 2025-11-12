'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrandPalette } from '@/lib/hooks/useBrandHue'

interface PulseAssimilationProps {
  domain?: string | null
  pulses?: Array<{
    id: string
    title: string
    impactMonthlyUSD: number
  }>
  onComplete?: () => void
  loading?: boolean
  error?: string | null
  onSkip?: () => void
}

export default function PulseAssimilation({
  domain,
  pulses = [],
  onComplete,
  loading = false,
  error = null,
  onSkip,
}: PulseAssimilationProps) {
  const { accent, accentSoft, accentBg } = useBrandPalette(domain)
  const [assimilated, setAssimilated] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // If loading, wait
    if (loading) return

    // If error or no pulses, complete quickly
    if (error || pulses.length === 0) {
      setTimeout(() => {
        onComplete?.()
      }, 1000)
      return
    }

    const interval = setInterval(() => {
      if (currentIndex < pulses.length) {
        setAssimilated((prev) => [...prev, pulses[currentIndex].id])
        setCurrentIndex((prev) => prev + 1)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          onComplete?.()
        }, 1000)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [pulses, currentIndex, onComplete, loading, error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative">
      {/* Background grid fade-in */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}15, transparent 80%)`,
        }}
        animate={{ opacity: [0, 0.4, 0.8, 0.4, 0] }}
        transition={{ duration: 3.2, ease: 'easeInOut' }}
      />
      
      <div className="max-w-4xl w-full relative z-10">
        <motion.h1
          className="text-4xl md:text-6xl font-mono font-bold mb-12 text-center"
          style={{ color: accent }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          PULSE ASSIMILATION
        </motion.h1>

        {loading && (
          <div className="text-center mb-8">
            <div
              className="text-sm font-mono uppercase tracking-wider mb-4"
              style={{ color: accentSoft }}
            >
              LOADING PULSE DATA...
            </div>
            <div className="flex justify-center gap-1">
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
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center mb-8">
            <div
              className="text-sm font-mono uppercase tracking-wider mb-2"
              style={{ color: accent }}
            >
              WARNING: {error}
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: accentSoft }}
            >
              Continuing with available data...
            </div>
          </div>
        )}

        <div className="space-y-4">
          {pulses.map((pulse, index) => {
            const isAssimilated = assimilated.includes(pulse.id)
            const isCurrent = index === currentIndex

            return (
              <motion.div
                key={pulse.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{
                  opacity: isAssimilated ? 1 : 0.3,
                  x: 0,
                }}
                className="border rounded-lg p-6 backdrop-blur-sm"
                style={{
                  borderColor: isAssimilated ? accent : `${accent}40`,
                  backgroundColor: isAssimilated
                    ? `${accentBg}60`
                    : `${accentBg}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isAssimilated ? (
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: accent }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      />
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{ borderColor: `${accent}60` }}
                      />
                    )}
                    <div>
                      <div
                        className="font-mono text-lg"
                        style={{
                          color: isAssimilated ? accentSoft : `${accentSoft}80`,
                        }}
                      >
                        {pulse.title}
                      </div>
                      <div
                        className="text-sm font-mono mt-1"
                        style={{ color: accentSoft }}
                      >
                        ${(pulse.impactMonthlyUSD / 1000).toFixed(1)}K/mo impact
                      </div>
                    </div>
                  </div>

                  {isCurrent && !isAssimilated && (
                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
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
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Energy pulse line */}
        <motion.div
          className="absolute w-[180%] h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentSoft}90, transparent)`,
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {assimilated.length === pulses.length && pulses.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: accent }}
            >
              ASSIMILATION COMPLETE
            </div>
          </motion.div>
        )}

        {pulses.length === 0 && !loading && !error && (
          <div className="text-center mt-12">
            <div
              className="text-sm font-mono uppercase tracking-wider"
              style={{ color: accentSoft }}
            >
              NO PULSES TO ASSIMILATE
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

