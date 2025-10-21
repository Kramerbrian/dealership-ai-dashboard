/**
 * Interactive Market Map Component
 * Visual map showing dealer's position vs competitors
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, TrophyIcon, ArrowArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline';

interface Competitor {
  id: string;
  name: string;
  position: { x: number; y: number };
  marketShare: number;
  aiVisibility: number;
  revenue: number;
  isActive: boolean;
}

interface MarketMapProps {
  dealership: {
    name: string;
    position: { x: number; y: number };
    marketShare: number;
    aiVisibility: number;
    revenue: number;
  };
  competitors: Competitor[];
  marketSize: number;
  onCompetitorClick?: (competitor: Competitor) => void;
}

export default function InteractiveMarketMap({
  dealership,
  competitors,
  marketSize,
  onCompetitorClick,
}: MarketMapProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [hoveredDealer, setHoveredDealer] = useState<string | null>(null);

  // Calculate market positions based on market share and AI visibility
  const calculatePosition = (dealer: any) => ({
    x: (dealer.marketShare / 100) * 400,
    y: 200 - (dealer.aiVisibility / 100) * 200,
  });

  const getSize = (revenue: number) => {
    const maxSize = 60;
    const minSize = 20;
    return Math.max(minSize, (revenue / 100000) * maxSize);
  };

  const getColor = (aiVisibility: number, isDealership: boolean = false) => {
    if (isDealership) return 'bg-blue-500';
    if (aiVisibility > 70) return 'bg-green-500';
    if (aiVisibility > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border border-gray-200 min-h-[400px]">
        {/* Market Grid */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
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

        {/* Competitors */}
        <div className="relative h-[300px]">
          {competitors.map((competitor, index) => {
            const position = calculatePosition(competitor);
            const size = getSize(competitor.revenue);
            const color = getColor(competitor.aiVisibility);

            return (
              <motion.div
                key={competitor.id}
                className={`absolute cursor-pointer ${color} rounded-full flex items-center justify-center text-white shadow-lg`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCompetitor(competitor);
                  onCompetitorClick?.(competitor);
                }}
                onMouseEnter={() => setHoveredDealer(competitor.id)}
                onMouseLeave={() => setHoveredDealer(null)}
              >
                {hoveredDealer === competitor.id && (
                  <motion.div
                    className="absolute -top-8 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {competitor.name}: {competitor.aiVisibility}%
                  </motion.div>
                )}
                <MapPinIcon className="h-4 w-4" />
              </motion.div>
            );
          })}

          {/* Dealership Position */}
          <motion.div
            className="absolute bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white"
            style={{
              left: `${calculatePosition(dealership).x}px`,
              top: `${calculatePosition(dealership).y}px`,
              width: `${getSize(dealership.revenue)}px`,
              height: `${getSize(dealership.revenue)}px`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-center">
              <TrophyIcon className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-semibold">You</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Your Market Share</p>
              <p className="text-2xl font-bold text-gray-900">{dealership.marketShare}%</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">AI Visibility Score</p>
              <p className="text-2xl font-bold text-gray-900">{dealership.aiVisibility}%</p>
            </div>
            <div className="text-3xl">🤖</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Competitive Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                #{competitors.filter(c => c.aiVisibility > dealership.aiVisibility).length + 1}
              </p>
            </div>
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Selected Competitor Details */}
      {selectedCompetitor && (
        <motion.div
          className="bg-white rounded-lg p-4 shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedCompetitor.name}</h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Market Share: {selectedCompetitor.marketShare}%</p>
                <p>AI Visibility: {selectedCompetitor.aiVisibility}%</p>
                <p>Revenue: ${(selectedCompetitor.revenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompetitor(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}