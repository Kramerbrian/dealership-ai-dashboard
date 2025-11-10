'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrandHue, getBrandHSL } from '@/lib/hooks/useBrandHue'

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
  const hue = useBrandHue(domain)
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
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `radial-gradient(circle at center, ${getBrandHSL(hue, 15, 8)} 0%, black 100%)`,
      }}
    >
      <div className="max-w-4xl w-full">
        <motion.h1
          className="text-4xl md:text-6xl font-mono font-bold mb-12 text-center"
          style={{ color: getBrandHSL(hue, 80, 60) }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          PULSE ASSIMILATION
        </motion.h1>

        {loading && (
          <div className="text-center mb-8">
            <div
              className="text-sm font-mono uppercase tracking-wider mb-4"
              style={{ color: getBrandHSL(hue, 60, 70) }}
            >
              LOADING PULSE DATA...
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getBrandHSL(hue, 80, 60) }}
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
              style={{ color: getBrandHSL(hue, 80, 50) }}
            >
              WARNING: {error}
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: getBrandHSL(hue, 50, 60) }}
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
                  borderColor: isAssimilated
                    ? getBrandHSL(hue, 80, 60)
                    : getBrandHSL(hue, 20, 20),
                  backgroundColor: isAssimilated
                    ? `${getBrandHSL(hue, 30, 15)}60`
                    : `${getBrandHSL(hue, 10, 5)}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isAssimilated ? (
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getBrandHSL(hue, 80, 60) }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      />
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{ borderColor: getBrandHSL(hue, 40, 40) }}
                      />
                    )}
                    <div>
                      <div
                        className="font-mono text-lg"
                        style={{
                          color: isAssimilated
                            ? getBrandHSL(hue, 80, 70)
                            : getBrandHSL(hue, 40, 50),
                        }}
                      >
                        {pulse.title}
                      </div>
                      <div
                        className="text-sm font-mono mt-1"
                        style={{ color: getBrandHSL(hue, 50, 60) }}
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
                          style={{ backgroundColor: getBrandHSL(hue, 80, 60) }}
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

        {assimilated.length === pulses.length && pulses.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: getBrandHSL(hue, 80, 60) }}
            >
              ASSIMILATION COMPLETE
            </div>
          </motion.div>
        )}

        {pulses.length === 0 && !loading && !error && (
          <div className="text-center mt-12">
            <div
              className="text-sm font-mono uppercase tracking-wider"
              style={{ color: getBrandHSL(hue, 50, 60) }}
            >
              NO PULSES TO ASSIMILATE
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

