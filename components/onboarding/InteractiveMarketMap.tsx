/**
 * Interactive Market Map Component
 * Visual map showing dealer's position vs competitors
 */

'use client'

import React, { useState, useEffect } from 'framer-motion'
import { MapPinIcon, TrophyIcon, TrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline'

interface Competitor {
  id: string
  name: string
  position: { x: number; y: number }
  marketShare: number
  aiVisibility: number
  revenue: number
  isActive: boolean
}

interface MarketMapProps {
  dealership: {
    name: string
    position: { x: number; y: number }
    marketShare: number
    aiVisibility: number
    revenue: number
  }
  competitors: Competitor[]
  marketSize: number
  onCompetitorClick?: (competitor: Competitor) => void
}

export default function InteractiveMarketMap({
  dealership,
  competitors,
  marketSize,
  onCompetitorClick
}: MarketMapProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null)
  const [hoveredDealer, setHoveredDealer] = useState<string | null>(null)

  // Calculate market positions based on market share and AI visibility
  const calculatePosition = (dealer: any) => ({
    x: (dealer.marketShare / 100) * 400,
    y: 200 - (dealer.aiVisibility / 100) * 200
  })

  const getSize = (revenue: number) => {
    const maxSize = 60
    const minSize = 20
    return Math.max(minSize, (revenue / 100000) * maxSize)
  }

  const getColor = (aiVisibility: number, isDealership: boolean = false) => {
    if (isDealership) return 'bg-blue-500'
    if (aiVisibility > 70) return 'bg-green-500'
    if (aiVisibility > 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your Market Position
        </h3>
        <p className="text-gray-600">
          See how you stack up against competitors in real-time
        </p>
      </div>

      {/* Market Map Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border border-gray-200">
        {/* Market Grid */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Market Size Indicator */}
        <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-sm border">
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-4 w-4 mr-2" />
            Market Size: {marketSize.toLocaleString()} customers
          </div>
        </div>

        {/* AI Visibility Axis */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Market Share Axis */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-between text-xs text-gray-500 px-8">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        {/* Competitors */}
        {competitors.map((competitor, index) => {
          const position = calculatePosition(competitor)
          const size = getSize(competitor.revenue)
          const color = getColor(competitor.aiVisibility)
          
          return (
            <motion.div
              key={competitor.id}
              className="absolute cursor-pointer"
              style={{
                left: position.x - size / 2,
                top: position.y - size / 2,
                width: size,
                height: size
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCompetitor(competitor)
                onCompetitorClick?.(competitor)
              }}
              onMouseEnter={() => setHoveredDealer(competitor.id)}
              onMouseLeave={() => setHoveredDealer(null)}
            >
              <div className={`w-full h-full rounded-full ${color} shadow-lg border-2 border-white flex items-center justify-center text-white font-bold text-xs relative`}>
                {competitor.name.split(' ')[0].charAt(0)}
                
                {/* Market Share Ring */}
                <div 
                  className="absolute inset-0 rounded-full border-4 border-current opacity-30"
                  style={{
                    borderWidth: `${Math.max(2, competitor.marketShare / 10)}px`
                  }}
                />
                
                {/* Hover Tooltip */}
                {hoveredDealer === competitor.id && (
                  <motion.div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="font-semibold">{competitor.name}</div>
                    <div>AI Visibility: {competitor.aiVisibility}%</div>
                    <div>Market Share: {competitor.marketShare}%</div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 absolute top-full left-1/2 transform -translate-x-1/2" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Your Dealership */}
        <motion.div
          className="absolute cursor-pointer"
          style={{
            left: calculatePosition(dealership).x - 30,
            top: calculatePosition(dealership).y - 30,
            width: 60,
            height: 60
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setHoveredDealer('dealership')}
          onMouseLeave={() => setHoveredDealer(null)}
        >
          <div className="w-full h-full rounded-full bg-blue-500 shadow-xl border-4 border-white flex items-center justify-center text-white font-bold text-sm relative">
            <TrophyIcon className="h-6 w-6" />
            
            {/* Pulsing ring for your dealership */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Hover Tooltip */}
            {hoveredDealer === 'dealership' && (
              <motion.div
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-blue-600 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="font-semibold">Your Dealership</div>
                <div>AI Visibility: {dealership.aiVisibility}%</div>
                <div>Market Share: {dealership.marketShare}%</div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600 absolute top-full left-1/2 transform -translate-x-1/2" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-sm border">
          <div className="text-xs font-medium text-gray-700 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              High AI Visibility (70%+)
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
              Medium AI Visibility (40-70%)
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              Low AI Visibility (&lt;40%)
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              Your Dealership
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Details Modal */}
      {selectedCompetitor && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCompetitor(null)}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCompetitor.name}
              </h3>
              <button
                onClick={() => setSelectedCompetitor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">AI Visibility:</span>
                <span className="font-medium">{selectedCompetitor.aiVisibility}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Market Share:</span>
                <span className="font-medium">{selectedCompetitor.marketShare}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium">${(selectedCompetitor.revenue / 1000).toFixed(0)}K</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Opportunity:</strong> You can gain {Math.max(0, selectedCompetitor.marketShare - dealership.marketShare)}% 
                market share by improving your AI visibility to {selectedCompetitor.aiVisibility + 10}%.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
