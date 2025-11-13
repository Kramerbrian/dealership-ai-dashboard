/**
 * PLG Widget
 * Product-Led Growth widget with teaser metrics and SSO CTA
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Lock, 
  Unlock, 
  TrendingUp, 
  Eye, 
  ArrowRight,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { pickRoleAwareHeadline } from '@/lib/dai/headlines';

interface PLGWidgetProps {
  teaserMetrics: {
    vai?: number;
    revenueAtRisk?: number;
    quickWins?: number;
    marketPosition?: number;
  };
  userRole?: 'gm' | 'dealer_principal' | 'dp' | 'marketing' | 'marketing_director' | 'internet' | 'general';
  domain?: string;
  location?: {
    city?: string;
    state?: string;
  };
  isAuthenticated?: boolean;
}

export default function PLGWidget({ 
  teaserMetrics, 
  userRole, 
  domain, 
  location,
  isAuthenticated = false 
}: PLGWidgetProps) {
  const [isUnlocked, setIsUnlocked] = useState(isAuthenticated);
  const [showFullMetrics, setShowFullMetrics] = useState(isAuthenticated);

  // Get role-aware headline
  const headline = pickRoleAwareHeadline({
    role: userRole,
    domain,
    location,
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    setShowFullMetrics(true);
  };

  if (isAuthenticated || isUnlocked) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Unlock className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Full Dashboard Unlocked</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">{headline}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teaserMetrics.vai !== undefined && (
              <div className="text-center p-4 bg-white rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{teaserMetrics.vai}%</p>
                <p className="text-xs text-gray-600">VAI Score</p>
              </div>
            )}
            {teaserMetrics.revenueAtRisk !== undefined && (
              <div className="text-center p-4 bg-white rounded-lg">
                <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  ${(teaserMetrics.revenueAtRisk / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-gray-600">At Risk</p>
              </div>
            )}
            {teaserMetrics.quickWins !== undefined && (
              <div className="text-center p-4 bg-white rounded-lg">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{teaserMetrics.quickWins}</p>
                <p className="text-xs text-gray-600">Quick Wins</p>
              </div>
            )}
            {teaserMetrics.marketPosition !== undefined && (
              <div className="text-center p-4 bg-white rounded-lg">
                <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">#{teaserMetrics.marketPosition}</p>
                <p className="text-xs text-gray-600">Market Rank</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
      {/* Blur overlay for locked content */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center p-6">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Dashboard</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            {headline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>

      {/* Teaser metrics (blurred) */}
      <CardContent className="p-6 blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-400">Your Metrics</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">{headline}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teaserMetrics.vai !== undefined && (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-400">{teaserMetrics.vai}%</p>
              <p className="text-xs text-gray-400">VAI Score</p>
            </div>
          )}
          {teaserMetrics.revenueAtRisk !== undefined && (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-400">
                ${(teaserMetrics.revenueAtRisk / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-400">At Risk</p>
            </div>
          )}
          {teaserMetrics.quickWins !== undefined && (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-400">{teaserMetrics.quickWins}</p>
              <p className="text-xs text-gray-400">Quick Wins</p>
            </div>
          )}
          {teaserMetrics.marketPosition !== undefined && (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-400">#{teaserMetrics.marketPosition}</p>
              <p className="text-xs text-gray-400">Market Rank</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

