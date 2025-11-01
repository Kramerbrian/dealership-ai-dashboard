'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, AlertTriangle, TrendingUp, Share2, Copy, X,
  CheckCircle2, ArrowRight, Sparkles, Clock, Users,
  BarChart3, Shield, MessageSquare, Award, Zap,
  ExternalLink, ChevronRight, Star, Target, Lock,
  TrendingDown, DollarSign, Eye, Activity, Globe
} from 'lucide-react';

// ==================== TEXT ROTATOR ====================
const TextRotator: React.FC<{ phrases: string[] }> = ({ phrases }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <span className="inline-block min-w-[200px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          {phrases[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

// ==================== TYPES ====================
interface AnalysisResult {
  domain: string;
  overallScore: number;
  marketRank: number;
  totalDealers: number;
  pillars: {
    aiVisibility: number;
    zeroClick: number;
    ugcHealth: number;
    geoTrust: number;
    sgpIntegrity: number;
  };
  revenueImpact: {
    monthlyLoss: number;
    annualLoss: number;
    missedLeads: number;
  };
  topCompetitor?: {
    name: string;
    score: number;
    rank: number;
  };
}

// ==================== SESSION TRACKING ====================
const useSessionTracking = () => {
  const [sessions, setSessions] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const SESSION_LIMIT = 3;

  useEffect(() => {
    const stored = localStorage.getItem('dai_sessions');
    const count = stored ? parseInt(stored) : 0;
    setSessions(count);
    setIsLimited(count >= SESSION_LIMIT);
  }, []);

  const incrementSession = () => {
    const newCount = sessions + 1;
    setSessions(newCount);
    localStorage.setItem('dai_sessions', newCount.toString());
    setIsLimited(newCount >= SESSION_LIMIT);
  };

  const resetSessions = () => {
    setSessions(0);
    localStorage.setItem('dai_sessions', '0');
    setIsLimited(false);
  };

  return { sessions, isLimited, incrementSession, resetSessions, limit: SESSION_LIMIT };
};

// ==================== DECAY TAX COUNTER ====================
const DecayTaxCounter: React.FC<{ monthlyLoss: number }> = ({ monthlyLoss }) => {
  const [lossThisSession, setLossThisSession] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const perMs = monthlyLoss / (30 * 24 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      setLossThisSession(perMs * elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [monthlyLoss]);

  return (
    <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-red-400 font-semibold mb-1">💸 REVENUE DECAY TAX</div>
          <div className="text-3xl font-bold text-red-500">
            ${lossThisSession.toFixed(2)}
          </div>
          <div className="text-sm text-zinc-400 mt-1">
            Lost since you opened this page
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-zinc-400">Monthly Impact</div>
          <div className="text-2xl font-bold text-red-500">
            ${monthlyLoss.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-red-500/20">
        <div className="text-xs text-zinc-400">
          <Clock className="w-3 h-3 inline mr-1" />
          This counter represents estimated lost revenue from poor AI visibility
        </div>
      </div>
    </div>
  );
};

// ==================== SHARE TO UNLOCK MODAL ====================
const ShareToUnlockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  domain: string;
  score: number;
}> = ({ isOpen, onClose, onUnlock, domain, score }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const url = `${window.location.origin}?ref=${btoa(domain)}&score=${score}`;
    setShareUrl(url);
  };

  const shareText = `🚨 Just discovered my dealership's AI Visibility Score: ${score}/100\n\nWhile customers are asking ChatGPT & Claude for dealer recommendations, here's where I rank...\n\nGet YOUR free score:`;

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl || window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl || window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || window.location.href)}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    
    // Simulate unlock after 2 seconds
    setTimeout(() => {
      onUnlock();
      onClose();
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareUrl();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-2xl font-bold mb-2">🎁 Unlock Full Analysis</div>
            <div className="text-zinc-400 text-sm">
              Share to unlock competitive intel + action plan
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm">Detailed competitor breakdown (who's beating you)</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm">30-day action plan with revenue projections</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm">7 days of Pro features (free)</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full flex items-center justify-center gap-3 bg-[#0077b5] hover:bg-[#006399] text-white py-4 rounded-xl font-semibold transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share on LinkedIn
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center justify-center gap-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-4 rounded-xl font-semibold transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share on Twitter/X
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#4267B2] hover:bg-[#365899] text-white py-4 rounded-xl font-semibold transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share on Facebook
          </button>
        </div>

        {shareUrl && (
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">Or copy link:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
          <button
            onClick={() => {
              // Simulate upgrade path
              window.location.href = '/signup?plan=pro';
            }}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Skip sharing, unlock with Pro →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==================== SESSION LIMIT BANNER ====================
const SessionLimitBanner: React.FC<{
  sessions: number;
  limit: number;
  onUpgrade: () => void;
}> = ({ sessions, limit, onUpgrade }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || sessions < limit - 1) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">
            {sessions === limit 
              ? "❌ Free analyses exhausted" 
              : `⚠️ Last free analysis remaining (${sessions}/${limit} used)`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onUpgrade}
            className="bg-white text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-zinc-100 transition-colors"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== COMPETITIVE RAGE BAIT ====================
const CompetitiveRankingCard: React.FC<{
  yourRank: number;
  totalDealers: number;
  topCompetitor?: { name: string; score: number; rank: number };
  isLocked: boolean;
  onUnlock: () => void;
}> = ({ yourRank, totalDealers, topCompetitor, isLocked, onUnlock }) => {
  return (
    <div className="relative">
      <div className={`border-2 rounded-2xl p-6 ${
        isLocked 
          ? 'border-zinc-700 bg-zinc-900/50 blur-sm' 
          : 'border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-zinc-400 mb-2">Your Market Position</div>
            <div className="text-5xl font-bold text-red-500">
              #{yourRank}
              <span className="text-2xl text-zinc-400"> / {totalDealers}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-red-500">Below Average</span>
          </div>
        </div>

        {topCompetitor && (
          <div className="border-t border-zinc-700 pt-4">
            <div className="text-sm text-zinc-400 mb-3">Top Competitor</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">{topCompetitor.name}</div>
                <div className="text-sm text-zinc-400">Rank #{topCompetitor.rank}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-500">{topCompetitor.score}</div>
                <div className="text-xs text-zinc-400">AI Score</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onUnlock}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-2xl transform hover:scale-105 transition-transform"
          >
            <Lock className="w-6 h-6" />
            Unlock Competitive Analysis
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN LANDING PAGE ====================
const DealershipAIPLGLanding: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { sessions, isLimited, incrementSession, limit } = useSessionTracking();

  const analyzeDealer = async () => {
    if (!domain || isLimited) return;

    setIsAnalyzing(true);
    incrementSession();

    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate synthetic but realistic results
    const mockResult: AnalysisResult = {
      domain,
      overallScore: Math.floor(Math.random() * 30) + 45, // 45-75
      marketRank: Math.floor(Math.random() * 8) + 5, // 5-12
      totalDealers: 15,
      pillars: {
        aiVisibility: Math.floor(Math.random() * 25) + 50,
        zeroClick: Math.floor(Math.random() * 30) + 45,
        ugcHealth: Math.floor(Math.random() * 35) + 40,
        geoTrust: Math.floor(Math.random() * 20) + 60,
        sgpIntegrity: Math.floor(Math.random() * 25) + 55,
      },
      revenueImpact: {
        monthlyLoss: Math.floor(Math.random() * 30000) + 25000,
        annualLoss: 0,
        missedLeads: Math.floor(Math.random() * 40) + 30,
      },
      topCompetitor: {
        name: 'Competitor Honda',
        score: Math.floor(Math.random() * 15) + 85,
        rank: Math.floor(Math.random() * 2) + 1,
      }
    };

    mockResult.revenueImpact.annualLoss = mockResult.revenueImpact.monthlyLoss * 12;

    setResult(mockResult);
    setIsAnalyzing(false);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Session Limit Banner */}
      <SessionLimitBanner
        sessions={sessions}
        limit={limit}
        onUpgrade={() => window.location.href = '/signup?plan=pro'}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="container mx-auto px-4 pt-24 pb-16 relative">
          {/* Live Activity Feed */}
          <div className="flex justify-end mb-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 rounded-full px-4 py-2"
            >
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm text-zinc-400">
                <span className="text-white font-semibold">127</span> dealers analyzed today
              </span>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-semibold">
                The Bloomberg Terminal for Automotive AI Visibility
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Is Your Dealership{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Invisible to AI?
              </span>
            </h1>

            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              When customers ask{' '}
              <TextRotator 
                phrases={[
                  'ChatGPT',
                  'Google Gemini',
                  'Google AI Overviews',
                  'Perplexity'
                ]}
              />{' '}
              for dealer recommendations,
              <span className="text-white font-semibold"> do they even know you exist?</span>
            </p>

            {/* Instant Analyzer */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeDealer()}
                    placeholder="Enter your dealership website (e.g., lougrubbsmotors.com)"
                    disabled={isLimited}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={analyzeDealer}
                  disabled={!domain || isAnalyzing || isLimited}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Get Free Score
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No email required • {limit - sessions} free analyses left</span>
                </div>
                <div className="text-zinc-400">
                  <Clock className="w-4 h-4 inline mr-1" />
                  ~60 seconds
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-3xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-sm text-zinc-400 mb-2">Overall AI Visibility Score</div>
                  <div className="text-7xl font-bold mb-4">
                    <span className={result.overallScore > 70 ? 'text-green-500' : result.overallScore > 50 ? 'text-yellow-500' : 'text-red-500'}>
                      {result.overallScore}
                    </span>
                    <span className="text-3xl text-zinc-500">/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.overallScore > 70 ? (
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Above Average
                      </div>
                    ) : result.overallScore > 50 ? (
                      <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Needs Improvement
                      </div>
                    ) : (
                      <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Critical Issues
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Market Rank</span>
                    <span className="text-2xl font-bold">#{result.marketRank} / {result.totalDealers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Estimated Missed Leads</span>
                    <span className="text-2xl font-bold text-red-500">{result.revenueImpact.missedLeads}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Annual Revenue at Risk</span>
                    <span className="text-2xl font-bold text-red-500">
                      ${(result.revenueImpact.annualLoss / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decay Tax Counter */}
            <DecayTaxCounter monthlyLoss={result.revenueImpact.monthlyLoss} />

            {/* 5 Pillars Breakdown */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">5-Pillar Visibility Analysis</h3>
              <div className="space-y-4">
                {Object.entries(result.pillars).map(([key, value]) => {
                  const labels = {
                    aiVisibility: 'AI Visibility',
                    zeroClick: 'Zero-Click Shield',
                    ugcHealth: 'UGC Health',
                    geoTrust: 'Geo Trust',
                    sgpIntegrity: 'SGP Integrity'
                  };
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{labels[key as keyof typeof labels]}</span>
                        <span className="text-sm font-bold">{value}/100</span>
                      </div>
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            value > 70 ? 'bg-green-500' : value > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Competitive Ranking - LOCKED */}
            <CompetitiveRankingCard
              yourRank={result.marketRank}
              totalDealers={result.totalDealers}
              topCompetitor={result.topCompetitor}
              isLocked={!isUnlocked}
              onUnlock={() => setShowShareModal(true)}
            />

            {/* Action Plan - BLURRED IF LOCKED */}
            <div className="relative">
              <div className={`bg-zinc-900 border border-zinc-800 rounded-3xl p-8 ${!isUnlocked ? 'blur-sm' : ''}`}>
                <h3 className="text-2xl font-bold mb-6">30-Day Action Plan</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Fix Schema Markup</div>
                      <div className="text-sm text-zinc-400">
                        Add Organization, LocalBusiness, and FAQ schema • Expected impact: +12 points
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Optimize Review Response Rate</div>
                      <div className="text-sm text-zinc-400">
                        Respond to 100% of reviews within 48hrs • Expected impact: +8 points
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Claim & Complete GMB Profile</div>
                      <div className="text-sm text-zinc-400">
                        Complete all attributes, add photos, verify hours • Expected impact: +15 points
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-2xl transform hover:scale-105 transition-transform"
                  >
                    <Lock className="w-6 h-6" />
                    Unlock Full Action Plan
                  </button>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Dominate AI Search Results?
              </h3>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Join 143 dealerships (87 in Florida) using DealershipAI to monitor, optimize,
                and dominate AI-powered car shopping.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/signup?plan=pro'}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-zinc-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share & Get 7 Days Free
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Social Proof Section */}
      <div className="bg-zinc-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Forward-Thinking Dealers</h2>
            <p className="text-zinc-400">Real results from dealerships dominating AI search</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Mike Stevens',
                role: 'General Manager',
                dealership: 'Premium Auto Group',
                quote: 'We went from invisible to #1 in ChatGPT results. 34% more organic leads in 60 days.',
                improvement: '+34%'
              },
              {
                name: 'Sarah Chen',
                role: 'Marketing Director',
                dealership: 'Elite Motors',
                quote: 'The competitive intel alone is worth 10x the price. We know exactly where we stand.',
                improvement: '+28%'
              },
              {
                name: 'James Rodriguez',
                role: 'Owner',
                dealership: 'Rodriguez Automotive',
                quote: 'Stopped hemorrhaging $40K/month to competitors who invested in AI visibility first.',
                improvement: '+41%'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-zinc-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-zinc-300 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                  <div className="text-sm text-zinc-400">{testimonial.dealership}</div>
                  <div className="text-green-500 font-bold">{testimonial.improvement}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-zinc-400 text-lg">Start free. Upgrade when you're ready to dominate.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="text-sm text-zinc-400 mb-2">Free</div>
            <div className="text-4xl font-bold mb-4">
              $0<span className="text-lg text-zinc-400">/month</span>
            </div>
            <div className="text-sm text-zinc-400 mb-6">Perfect for testing the waters</div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">3 analyses per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Basic 5-pillar scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Revenue impact calculator</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-500">Competitive intel</span>
              </li>
            </ul>

            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-semibold transition-colors">
              Start Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-8 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            
            <div className="text-sm text-blue-100 mb-2">Pro</div>
            <div className="text-4xl font-bold mb-4">
              $499<span className="text-lg text-blue-100">/month</span>
            </div>
            <div className="text-sm text-blue-100 mb-6">For serious growth</div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">50 analyses per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Full competitive intel</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">E-E-A-T scoring & optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Weekly performance reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">API access</span>
              </li>
            </ul>

            <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-zinc-100 transition-colors">
              Start Pro Trial
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="text-sm text-zinc-400 mb-2">Enterprise</div>
            <div className="text-4xl font-bold mb-4">
              $999<span className="text-lg text-zinc-400">/month</span>
            </div>
            <div className="text-sm text-zinc-400 mb-6">For dominant market leaders</div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">200 analyses per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Mystery Shop automation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Dedicated success manager</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">White-label reports</span>
              </li>
            </ul>

            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-semibold transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-t border-zinc-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Stop Losing to Competitors Who Invested in AI First
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Every day you wait is another day of lost leads, lost sales, and lost market share.
            Your competitors are already optimizing for AI search.
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg inline-flex items-center gap-3 transform hover:scale-105 transition-all"
          >
            Get Your Free Score Now
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="mt-4 text-sm text-zinc-500">
            No credit card required • 60-second setup • Cancel anytime
          </div>
        </div>
      </div>

      {/* Share to Unlock Modal */}
      <ShareToUnlockModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onUnlock={handleUnlock}
        domain={result?.domain || ''}
        score={result?.overallScore || 0}
      />
    </div>
  );
};

export default DealershipAIPLGLanding;
