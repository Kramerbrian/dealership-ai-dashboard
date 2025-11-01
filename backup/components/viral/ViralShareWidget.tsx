/**
 * Viral Share Widget
 * Displays shareable results and viral sharing interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Linkedin, Twitter, Facebook, Mail, Copy, Check, TrendingUp, Users, Zap } from 'lucide-react';

interface ViralShareWidgetProps {
  auditData: {
    dealershipName: string;
    rank: number;
    totalCompetitors: number;
    aiVisibility: number;
    quickWins: number;
    competitors: Array<{ name: string; score: number }>;
  };
  onShare?: (platform: string, message: string) => void;
}

interface ShareMessage {
  platform: string;
  message: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export default function ViralShareWidget({ auditData, onShare }: ViralShareWidgetProps) {
  const [shareMessages, setShareMessages] = useState<ShareMessage[]>([]);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [viralMetrics, setViralMetrics] = useState({
    kFactor: 1.4,
    projectedGrowth: 0,
    viralVelocity: 0
  });

  useEffect(() => {
    generateShareMessages();
    fetchViralMetrics();
  }, [auditData]);

  const generateShareMessages = async () => {
    try {
      const response = await fetch('/api/viral/audit-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditData,
          userId: 'current-user',
          dealershipId: 'current-dealership'
        })
      });

      const data = await response.json();
      if (data.success) {
        const messages: ShareMessage[] = [
          {
            platform: 'LinkedIn',
            message: data.data.shareMessages.linkedin,
            url: data.data.shareUrls.linkedin,
            icon: <Linkedin className="w-4 h-4" />,
            color: 'bg-blue-600 hover:bg-blue-700'
          },
          {
            platform: 'Twitter',
            message: data.data.shareMessages.twitter,
            url: data.data.shareUrls.twitter,
            icon: <Twitter className="w-4 h-4" />,
            color: 'bg-sky-500 hover:bg-sky-600'
          },
          {
            platform: 'Facebook',
            message: data.data.shareMessages.facebook,
            url: data.data.shareUrls.facebook,
            icon: <Facebook className="w-4 h-4" />,
            color: 'bg-blue-700 hover:bg-blue-800'
          },
          {
            platform: 'Email',
            message: data.data.shareMessages.email,
            url: data.data.shareUrls.email,
            icon: <Mail className="w-4 h-4" />,
            color: 'bg-gray-600 hover:bg-gray-700'
          }
        ];
        setShareMessages(messages);
      }
    } catch (error) {
      console.error('Error generating share messages:', error);
    }
  };

  const fetchViralMetrics = async () => {
    try {
      const response = await fetch('/api/viral/metrics');
      const data = await response.json();
      if (data.success) {
        setViralMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching viral metrics:', error);
    }
  };

  const handleShare = (platform: string, message: string, url: string) => {
    if (platform === 'Email') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
    
    if (onShare) {
      onShare(platform, message);
    }
  };

  const copyToClipboard = async (message: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getRankMessage = () => {
    const { rank, totalCompetitors } = auditData;
    const competitorsBeaten = totalCompetitors - rank;
    
    if (rank === 1) {
      return "🏆 You're #1! Leading the pack!";
    } else if (rank <= 3) {
      return `🥈 You're in the top 3! Beating ${competitorsBeaten} competitors!`;
    } else if (rank <= 5) {
      return `🥉 You're in the top 5! Outperforming ${competitorsBeaten} competitors!`;
    } else {
      return `📈 You're beating ${competitorsBeaten} competitors! Room to improve!`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Share Your Results</h3>
          <p className="text-sm text-gray-600">Let competitors know where you rank!</p>
        </div>
      </div>

      {/* Rank Display */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            #{auditData.rank} out of {auditData.totalCompetitors}
          </div>
          <div className="text-lg text-gray-700 mb-2">{getRankMessage()}</div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>AI Visibility: {auditData.aiVisibility}%</span>
            <span>•</span>
            <span>Quick Wins: {auditData.quickWins}</span>
          </div>
        </div>
      </div>

      {/* Viral Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{viralMetrics.kFactor}</div>
          <div className="text-xs text-gray-600">K-Factor</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{viralMetrics.projectedGrowth.toFixed(0)}</div>
          <div className="text-xs text-gray-600">Projected Growth</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{viralMetrics.viralVelocity.toFixed(2)}</div>
          <div className="text-xs text-gray-600">Viral Velocity</div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3">
        {shareMessages.map((share, index) => (
          <motion.div
            key={share.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${share.color} flex items-center justify-center text-white`}>
                  {share.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{share.platform}</div>
                  <div className="text-sm text-gray-600 max-w-md truncate">{share.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(share.message, share.platform)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedPlatform === share.platform ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleShare(share.platform, share.message, share.url)}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${share.color} transition-colors`}
                >
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Viral Loop Explanation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Viral Growth Loop</h4>
            <p className="text-sm text-blue-800">
              When you share your results, competitors see your post and want to know where they rank. 
              Each share brings an average of {viralMetrics.kFactor} new users to the platform!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
