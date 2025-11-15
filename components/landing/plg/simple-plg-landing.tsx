// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Lock, Zap,
  Users, Share2, Gift, Clock, DollarSign, ArrowRight, Eye, EyeOff,
  Sparkles, Target, Shield, MessageSquare, Star, BarChart3, Brain, Search
} from 'lucide-react';

interface InstantScore {
  overall: number;
  aiVisibility: number;
  zeroClick: number;
  ugcHealth: number;
  geoTrust: number;
  sgpIntegrity: number;
  competitorRank: number;
  totalCompetitors: number;
  revenueAtRisk: number;
}

export function AdvancedPLGLandingPage() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<InstantScore | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);

  const handleAnalyze = async () => {
    if (!url || !email) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockScore: InstantScore = {
      overall: 87,
      aiVisibility: 92,
      zeroClick: 78,
      ugcHealth: 84,
      geoTrust: 88,
      sgpIntegrity: 87,
      competitorRank: 3,
      totalCompetitors: 12,
      revenueAtRisk: 367000
    };
    
    setScore(mockScore);
    setIsAnalyzing(false);
  };

  const handleUnlockFeature = (feature: string) => {
    setShowShareModal(true);
  };

  const handleShared = () => {
    setUnlockedFeatures(prev => [...prev, 'zeroClick', 'geoTrust', 'sgpIntegrity']);
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI Visibility Intelligence Platform
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
            >
              How Visible Are You in{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                AI Search?
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto"
            >
              Discover your AI visibility score across ChatGPT, Claude, Gemini, and Perplexity. 
              Track Zero-Click rates, UGC health, and competitive intelligence.
            </motion.p>
          </div>

          {/* Instant Analyzer */}
          {!score ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="yourdealership.com"
                      className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@dealership.com"
                      className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      We'll send you a detailed report
                    </p>
                  </div>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={!url || !email || isAnalyzing}
                    className="w-full h-14 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Analyzing... 87%
                      </>
                    ) : (
                      <>
                        Analyze Free
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Social Proof */}
              <div className="grid md:grid-cols-3 gap-6 mt-12 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">92%</div>
                  <div className="text-sm text-gray-400">Average AI Visibility Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">$367K</div>
                  <div className="text-sm text-gray-400">Revenue at Risk (median)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">30 Days</div>
                  <div className="text-sm text-gray-400">Time to Fix & See Results</div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results Display */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 rounded-full px-4 py-2 mb-6">
                  <CheckCircle className="w-4 h-4" />
                  Audit Complete
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                  Your AI Visibility Score: {score.overall}/100
                </h2>
                <p className="text-xl text-gray-400">
                  Excellent! You're highly visible in AI search.
                </p>
              </div>
              
              {/* 5-Pillar Breakdown */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <MetricCard 
                  label="AI Visibility" 
                  value={score.aiVisibility} 
                  max={100} 
                  description="How often you appear in AI responses" 
                  locked={false} 
                />
                <MetricCard 
                  label="Zero-Click Shield" 
                  value={score.zeroClick} 
                  max={100} 
                  description="Protection against zero-click results" 
                  locked={!unlockedFeatures.includes('zeroClick')} 
                  onUnlock={() => handleUnlockFeature('zeroClick')} 
                />
                <MetricCard 
                  label="UGC Health" 
                  value={score.ugcHealth} 
                  max={100} 
                  description="User-generated content quality" 
                  locked={false} 
                />
                <MetricCard 
                  label="Geo Trust" 
                  value={score.geoTrust} 
                  max={100} 
                  description="Local search authority" 
                  locked={!unlockedFeatures.includes('geoTrust')} 
                  onUnlock={() => handleUnlockFeature('geoTrust')} 
                />
                <MetricCard 
                  label="SGP Integrity" 
                  value={score.sgpIntegrity} 
                  max={100} 
                  description="Structured data & knowledge graph" 
                  locked={!unlockedFeatures.includes('sgpIntegrity')} 
                  onUnlock={() => handleUnlockFeature('sgpIntegrity')} 
                />
                <MetricCard 
                  label="Revenue at Risk" 
                  value={score.revenueAtRisk} 
                  displayFormat="currency" 
                  description="Estimated monthly loss from gaps" 
                  locked={false} 
                />
              </div>
              
              {/* CTA */}
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">Ready to dominate AI search?</h3>
                <p className="text-gray-400 mb-8">Upgrade to Pro for unlimited audits, competitor tracking, and one-click fixes.</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <a 
                    href="/pricing" 
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                  >
                    View Pricing Plans
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleUnlockFeature('fullReport')}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-white/20 hover:bg-white/10 transition"
                  >
                    Share to unlock full report
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareToUnlockModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShared={handleShared}
          featureName="Premium Features"
        />
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  label, 
  value, 
  max, 
  description, 
  locked, 
  onUnlock, 
  displayFormat 
}: {
  label: string;
  value: number;
  max: number;
  description: string;
  locked: boolean;
  onUnlock?: () => void;
  displayFormat?: 'currency' | 'percentage';
}) {
  const displayValue = displayFormat === 'currency' 
    ? `$${(value / 1000).toFixed(0)}K`
    : displayFormat === 'percentage'
    ? `${value}%`
    : value;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{label}</h3>
        {locked && (
          <button
            onClick={onUnlock}
            className="text-gray-400 hover:text-white transition"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="text-2xl font-bold mb-2">
        {locked ? '???' : displayValue}
      </div>
      
      <div className="text-xs text-gray-400 mb-4">
        {description}
      </div>
      
      {!locked && (
        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all duration-300" 
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Share Modal Component
function ShareToUnlockModal({
  isOpen,
  onClose,
  onShared,
  featureName
}: {
  isOpen: boolean;
  onClose: () => void;
  onShared: () => void;
  featureName: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-8 shadow-2xl">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-600 grid place-items-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold mb-2">Share to Unlock</h4>
          <p className="text-gray-400 mb-6">
            Share your AI visibility discovery to unlock {featureName}. No cost, just spread the word!
          </p>
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={window.location.href} 
              readOnly 
              className="flex-1 h-12 px-4 rounded-xl bg-gray-950 border border-white/10 text-white text-sm" 
            />
            <button 
              onClick={handleCopy}
              className="h-12 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 font-medium"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button 
            onClick={onShared}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
