"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, TrendingUp, Users } from 'lucide-react'

interface CompetitorData {
  visible_name: string  // Blurred competitor
  score: number
  recent_improvement: boolean
}

export default function CompetitiveFOMO({ dealershipUrl }: { dealershipUrl?: string }) {
  const [data, setData] = useState<{
    competitors: CompetitorData[]
    checks_today: number
    city: string
  } | null>(null)

  useEffect(() => {
    if (dealershipUrl) {
      fetch('/api/competitive-context', {
        method: 'POST',
        body: JSON.stringify({ url: dealershipUrl })
      })
        .then(res => res.json())
        .then(setData)
    }
  }, [dealershipUrl])

  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mt-6"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-amber-200 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            {data.checks_today} dealerships in {data.city} checked their AI visibility today
          </p>
          
          <div className="space-y-2 mb-3">
            {data.competitors.map((comp, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-amber-300/80 blur-sm select-none">
                  {comp.visible_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-200 font-mono">
                    Score: {comp.score}/100
                  </span>
                  {comp.recent_improvement && (
                    <TrendingUp className="text-green-400 w-4 h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-amber-400">
            Where do you rank? <strong>Check now</strong> before they pull further ahead.
          </p>
        </div>
      </div>
    </motion.div>
  )
}