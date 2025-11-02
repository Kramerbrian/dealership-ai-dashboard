/**
 * Leaderboard Component
 * 
 * Shows regional rankings with social sharing
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Share2, Download, ExternalLink, Copy } from 'lucide-react';
import { AlertBanner, useAlerts } from '@/app/components/dashboard/AlertBanner';

interface LeaderboardEntry {
  rank: number;
  dealershipName: string;
  trustScore: number;
  city: string;
  state: string;
  isYou?: boolean;
  scoreDelta?: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  region?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  entries, 
  region = 'Regional' 
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { addAlert } = useAlerts();

  const generateShareableImage = async () => {
    // TODO: Use html-to-image or similar library
    addAlert('info', 'Generating shareable image...');
    console.log('Generating shareable image...');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DealershipAI ${region} Leaderboard`,
          text: `Check out my ranking on DealershipAI!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
        setShareModalOpen(true);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const sortedEntries = [...entries].sort((a, b) => b.trustScore - a.trustScore);

  return (
    <>
      <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{region} Leaderboard</h3>
              <p className="text-sm text-gray-400">{sortedEntries.length} dealerships</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 
                border border-purple-500/20 text-purple-500 text-sm hover:bg-purple-500/20 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={generateShareableImage}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 
                text-white text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {sortedEntries.map((entry, index) => {
            const actualRank = index + 1;
            
            return (
              <motion.div
                key={entry.rank || actualRank}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  entry.isYou 
                    ? 'bg-purple-500/20 border-2 border-purple-500/50 scale-105 shadow-lg shadow-purple-500/20' 
                    : 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${actualRank <= 3 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {actualRank}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold truncate ${
                      entry.isYou ? 'text-purple-400' : 'text-white'
                    }`}>
                      {entry.dealershipName}
                    </p>
                    {entry.isYou && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500 text-white">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{entry.city}, {entry.state}</p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-white">{entry.trustScore}</p>
                    {entry.scoreDelta && (
                      <span className={`text-xs font-medium ${
                        entry.scoreDelta > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {entry.scoreDelta > 0 ? '+' : ''}{entry.scoreDelta}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Trust Score</p>
                </div>

                {/* Trophy for top 3 */}
                {actualRank <= 3 && (
                  <div className="flex-shrink-0">
                    <Trophy className={`w-5 h-5 ${
                      actualRank === 1 ? 'text-amber-400' :
                      actualRank === 2 ? 'text-gray-300' :
                      'text-orange-600'
                    }`} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShareModalOpen(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Share Your Ranking</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addAlert('success', 'Link copied to clipboard!');
                  setShareModalOpen(false);
                }}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-left flex items-center gap-3"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={generateShareableImage}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-left flex items-center gap-3"
              >
                <Download className="w-5 h-5" />
                <span>Download Image</span>
              </button>
            </div>
            <button
              onClick={() => setShareModalOpen(false)}
              className="mt-4 w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

