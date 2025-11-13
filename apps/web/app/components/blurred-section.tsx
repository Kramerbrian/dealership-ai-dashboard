'use client';

import React from 'react';
import { Lock, Share2, ArrowRight } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

interface BlurredSectionProps {
  title: string;
  description: string;
  isBlurred: boolean;
  onUnlock: () => void;
  sessionsRequired: boolean;
  children: React.ReactNode;
}

export const BlurredSection: React.FC<BlurredSectionProps> = ({
  title,
  description,
  isBlurred,
  onUnlock,
  sessionsRequired,
  children
}) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 overflow-hidden">
      <div className={isBlurred ? 'blur-md pointer-events-none' : ''}>
        {children}
      </div>

      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center max-w-md px-6">
            <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 mb-6">{description}</p>
            
            {sessionsRequired ? (
              <div className="space-y-3">
                <button
                  onClick={onUnlock}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share to Unlock (24hrs)
                </button>
                <SignUpButton mode="modal">
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all">
                    Or Create Free Account (50 sessions)
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mx-auto">
                  Create Free Account to Unlock
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignUpButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface PillarCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

export const PillarCard: React.FC<PillarCardProps> = ({
  title,
  score,
  icon,
  description
}) => {
  const getColor = (s: number) => {
    if (s >= 75) return 'from-green-500/20 to-green-600/20 border-green-500/30';
    if (s >= 60) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    return 'from-red-500/20 to-red-600/20 border-red-500/30';
  };

  return (
    <div className={`bg-gradient-to-br ${getColor(score)} backdrop-blur-xl rounded-xl p-6 border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-white/10">
          {icon}
        </div>
        <div className="text-3xl font-bold text-white">{score}</div>
      </div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};

