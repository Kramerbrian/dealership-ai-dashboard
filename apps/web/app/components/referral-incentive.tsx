'use client';

import React, { useState } from 'react';
import { Gift, Share2, CheckCircle } from 'lucide-react';

interface ReferralReward {
  invitesNeeded: number;
  reward: string;
  tier: 'pro' | 'enterprise';
  duration: string;
}

export const ReferralIncentive: React.FC = () => {
  const rewards: ReferralReward[] = [
    { invitesNeeded: 1, reward: '2 weeks Pro access', tier: 'pro', duration: '14 days' },
    { invitesNeeded: 3, reward: '1 month Pro access', tier: 'pro', duration: '30 days' },
    { invitesNeeded: 5, reward: '2 weeks Enterprise access', tier: 'enterprise', duration: '14 days' },
    { invitesNeeded: 10, reward: '1 month Enterprise access', tier: 'enterprise', duration: '30 days' }
  ];

  const [copied, setCopied] = useState(false);
  const referralCode = typeof window !== 'undefined'
    ? 'DEALER_' + Math.random().toString(36).substr(2, 6).toUpperCase()
    : 'DEALER_ABC123';

  const copyReferralLink = () => {
    if (typeof window === 'undefined') return;
    
    const url = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-500/20">
          <Gift className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Invite & Unlock Premium Features</h3>
          <p className="text-gray-300">Help other dealers discover AI visibility = Unlock paid features free</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {rewards.map((reward, idx) => (
          <div
            key={idx}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center"
          >
            <div className="text-3xl font-bold text-white mb-2">
              {reward.invitesNeeded}
            </div>
            <div className="text-sm text-gray-400 mb-2">invites</div>
            <div className="text-sm font-semibold text-purple-400">
              {reward.reward}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : ''}
          readOnly
          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
        <button
          onClick={copyReferralLink}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          {copied ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Copy Link
            </>
          )}
        </button>
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">
        Track your invites and unlock rewards in your dashboard
      </p>
    </div>
  );
};

