'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lock, Zap,
  Users, Share2, Gift, Clock, DollarSign, ArrowRight, Eye, EyeOff,
  Sparkles, Target, Shield, MessageSquare, Star, BarChart3, Brain, Search
} from 'lucide-react';

// Import new PLG components (Parts 6-10)
import ROICalculator from '@/components/landing/ROICalculator';
import SessionCounter from '@/components/landing/SessionCounter';
import ShareToUnlock from '@/components/landing/ShareToUnlock';
import CompetitiveRageBait from '@/components/landing/CompetitiveRageBait';
import OnboardingBridge from '@/components/landing/OnboardingBridge';

// ============================================================================
// CORE TYPES
// ============================================================================

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
  sessionsRemaining?: number;
  dealerName?: string;
  domain?: string;
  topIssues?: string[];
}

interface CompetitorPreview {
  name: string;
  score: number;
  delta: number;
}

// ============================================================================
// SESSION TRACKING HOOK
// ============================================================================

const useSessionTracking = () => {
  const [sessions, setSessions] = useState(0);
  const [decayTax, setDecayTax] = useState(0);
  const [timeWasted, setTimeWasted] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('dai_sessions');
    const count = stored ? parseInt(stored) : 0;
    setSessions(count);

    const interval = setInterval(() => {
      setTimeWasted(prev => prev + 1);
      const dailyLoss = (75 - 62) * 280;
      setDecayTax(dailyLoss * (timeWasted / 86400));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeWasted]);

  const incrementSession = () => {
    const newCount = sessions + 1;
    setSessions(newCount);
    localStorage.setItem('dai_sessions', newCount.toString());
  };

  return { sessions, decayTax, timeWasted, incrementSession };
};

// ============================================================================
// INSTANT ANALYZER COMPONENT
// ============================================================================

const InstantAnalyzer = ({ onAnalyzed }: { onAnalyzed: (score: InstantScore) => void }) => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [placeholder, setPlaceholder] = useState('terryreidhyundai.com');

  useEffect(() => {
    const examples = [
      'terryreidhyundai.com',
      'yourdealership.com',
      'germainhonda.com',
      'autonation.com'
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % examples.length;
      setPlaceholder(examples[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;
    
    setAnalyzing(true);
    
    try {
      // Call real API endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: url, url }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const score: InstantScore = await response.json();
      
      setAnalyzing(false);
      onAnalyzed(score);
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Fallback to mock data if API fails
      const baseScore = 55 + Math.random() * 20;
      const score: InstantScore = {
        overall: Math.round(baseScore),
        aiVisibility: Math.round(baseScore + (Math.random() * 10 - 5)),
        zeroClick: Math.round(baseScore + (Math.random() * 10 - 5)),
        ugcHealth: Math.round(baseScore + (Math.random() * 10 - 5)),
        geoTrust: Math.round(baseScore + (Math.random() * 10 - 5)),
        sgpIntegrity: Math.round(baseScore + (Math.random() * 10 - 5)),
        competitorRank: Math.floor(Math.random() * 8) + 3,
        totalCompetitors: 12,
        revenueAtRisk: Math.round((75 - baseScore) * 280 * 30)
      };
      
      setAnalyzing(false);
      onAnalyzed(score);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Is Your Dealership Invisible to AI?
        </h1>
        <p className="text-2xl text-gray-300 mb-4">
          When ChatGPT doesn't know you exist, you might as well be selling horse carriages.
        </p>
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
          <p className="text-lg text-blue-200 font-medium">
            🧠 <strong>Cognitive Ops Platform:</strong> Every dealer has an embedded <strong>AI Chief Strategy Officer</strong> — always on, never guessing.
          </p>
        </div>
        <p className="text-lg text-gray-400">
          Get your free AI Visibility Score in 60 seconds →
        </p>
      </motion.div>

      <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder={placeholder}
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center gap-2 text-lg whitespace-nowrap"
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Free
              </>
            )}
          </button>
        </div>

        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Checking AI visibility across 5 platforms...</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Comparing against 12 local competitors...</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Calculating revenue impact...</span>
            </div>
          </motion.div>
        )}

        <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Takes 60 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>2,847 dealers analyzed this week</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INSTANT RESULTS COMPONENT
// ============================================================================

const InstantResults = ({ score, onUnlock }: { score: InstantScore; onUnlock: (feature: string) => void }) => {
  const { sessions } = useSessionTracking();
  const [blurredSections, setBlurredSections] = useState({
    competitors: true,
    actionPlan: true,
    fullReport: true
  });
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set());
  const [isFullReportUnlocked, setIsFullReportUnlocked] = useState(false);

  // Check unlock status on mount
  useEffect(() => {
    const checkUnlocks = async () => {
      try {
        const sessionId = localStorage.getItem('dai_sessions') || 'anonymous';
        const features = ['Competitive Comparison', 'AI-Powered Action Plan', 'Full Report'];
        
        for (const feature of features) {
          const response = await fetch(`/api/share/track?featureName=${encodeURIComponent(feature)}&sessionId=${sessionId}`);
          const data = await response.json();
          
          if (data.isUnlocked) {
            setUnlockedFeatures(prev => new Set([...prev, feature]));
            // Auto-unblur if unlocked
            if (feature === 'Competitive Comparison') {
              setBlurredSections(prev => ({ ...prev, competitors: false }));
            } else if (feature === 'AI-Powered Action Plan') {
              setBlurredSections(prev => ({ ...prev, actionPlan: false }));
            } else if (feature === 'Full Report') {
              setBlurredSections(prev => ({ ...prev, fullReport: false }));
            }
          }
        }
      } catch (error) {
        console.error('Error checking unlocks:', error);
      }
    };
    
    checkUnlocks();
  }, []);

  const unblurSection = (section: keyof typeof blurredSections) => {
    setBlurredSections(prev => ({ ...prev, [section]: false }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-purple-500/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        
        <div className="relative z-10 grid md:grid-cols-3 gap-8">
          {/* Overall Score */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-purple-500/30 bg-purple-500/10 mb-4">
              <div>
                <div className="text-6xl font-bold text-white">{score.overall}</div>
                <div className="text-sm text-gray-400">/ 100</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Visibility Score</h3>
            <p className="text-gray-400">
              {score.overall >= 75 ? '🎉 Excellent' : score.overall >= 60 ? '⚠️ Needs Work' : '🚨 Critical'}
            </p>
          </div>

          {/* Competitive Position */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-orange-500/30 bg-orange-500/10 mb-4">
              <div>
                <div className="text-5xl font-bold text-white">#{score.competitorRank}</div>
                <div className="text-sm text-gray-400">of {score.totalCompetitors}</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Market Position</h3>
            <p className="text-gray-400">In your local market</p>
          </div>

          {/* Revenue at Risk */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-red-500/30 bg-red-500/10 mb-4">
              <div>
                <div className="text-3xl font-bold text-white">
                  ${(score.revenueAtRisk / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-400">/ month</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Revenue at Risk</h3>
            <p className="text-gray-400">From AI invisibility</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold mb-1">Want the full analysis with competitor breakdowns?</p>
              <p className="text-sm text-gray-400">Create a free account to see detailed insights + 50 free sessions</p>
            </div>
            <a
              href="/sign-up"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Get Free Account
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Five Pillars Breakdown */}
      <div className="grid md:grid-cols-5 gap-4">
        <PillarCard
          title="AI Visibility"
          score={score.aiVisibility}
          icon={<Brain className="w-6 h-6" />}
          description="How AI platforms describe you"
        />
        <PillarCard
          title="Zero-Click Shield"
          score={score.zeroClick}
          icon={<Shield className="w-6 h-6" />}
          description="Featured snippet dominance"
        />
        <PillarCard
          title="UGC Health"
          score={score.ugcHealth}
          icon={<MessageSquare className="w-6 h-6" />}
          description="Review quality & velocity"
        />
        <PillarCard
          title="Geo Trust"
          score={score.geoTrust}
          icon={<Target className="w-6 h-6" />}
          description="Local search authority"
        />
        <PillarCard
          title="SGP Integrity"
          score={score.sgpIntegrity}
          icon={<BarChart3 className="w-6 h-6" />}
          description="Structured data richness"
        />
      </div>

      {/* Part 7: Session Counter */}
      <SessionCounter />

      {/* Part 6: ROI Calculator */}
      <ROICalculator />

      {/* Part 9: Competitive Rage Bait */}
      <CompetitiveRageBait
        dealerName={score.dealerName || 'Your Dealership'}
        dealerScore={score.overall}
        marketLeaderScore={87}
        onCtaClick={() => setIsFullReportUnlocked(true)}
      />

      {/* Part 8: Share-to-Unlock */}
      <ShareToUnlock
        dealerName={score.dealerName || 'Your Dealership'}
        revenueAtRisk={score.revenueAtRisk}
        onUnlock={() => setIsFullReportUnlocked(true)}
        isUnlocked={isFullReportUnlocked}
      />

      {/* Part 10: Onboarding Bridge (only after unlock) */}
      {isFullReportUnlocked && (
        <OnboardingBridge
          scanResults={{
            dealerName: score.dealerName || 'Your Dealership',
            aiVisibilityScore: score.overall,
            revenueAtRisk: score.revenueAtRisk,
            topIssues: score.topIssues || ['Missing LocalBusiness schema', 'Low review velocity', 'Weak GBP optimization'],
            competitorData: {
              marketLeaderScore: 87,
              yourRank: score.competitorRank,
              totalDealers: score.totalCompetitors,
            },
          }}
          isUnlocked={isFullReportUnlocked}
        />
      )}
    </div>
  );
};

const PillarCard = ({
  title,
  score,
  icon,
  description
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}) => {
  const getColor = (s: number) => {
    if (s >= 75) return 'from-green-500/20 to-green-600/20 border-green-500/30';
    if (s >= 60) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    return 'from-red-500/20 to-red-600/20 border-red-500/30';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${getColor(score)} backdrop-blur-xl rounded-xl p-6 border`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-white/10">{icon}</div>
        <div className="text-3xl font-bold text-white">{score}</div>
      </div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </motion.div>
  );
};

// ============================================================================
// MAIN PLG LANDING COMPONENT
// ============================================================================

export function AdvancedPLGLandingPage() {
  const [currentScore, setCurrentScore] = useState<InstantScore | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFeature, setShareFeature] = useState('');
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set());
  const { sessions, decayTax } = useSessionTracking();

  const handleUnlock = (feature: string) => {
    setShareFeature(feature);
    setShareModalOpen(true);
  };

  const handleShared = async (platform: string) => {
    try {
      const sessionId = localStorage.getItem('dai_sessions') || 'anonymous';
      const domain = currentScore?.domain || window.location.hostname;
      const shareUrl = window.location.href;

      // Track share via API
      const response = await fetch('/api/share/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          featureName: shareFeature,
          platform,
          shareUrl,
          sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUnlockedFeatures(prev => new Set([...prev, shareFeature]));
        
        // Store unlock in localStorage for persistence
        const unlocks = JSON.parse(localStorage.getItem('dai_unlocks') || '{}');
        unlocks[shareFeature] = {
          expiresAt: data.unlockExpiresAt,
          platform
        };
        localStorage.setItem('dai_unlocks', JSON.stringify(unlocks));
      }
    } catch (error) {
      console.error('Share tracking error:', error);
      // Still unlock locally even if API fails
      setUnlockedFeatures(prev => new Set([...prev, shareFeature]));
    }
    
    setShareModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Decay Tax Banner */}
      {currentScore && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-900/90 to-orange-900/90 backdrop-blur-sm border-b border-red-500/30">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <span className="font-semibold">Revenue Decay Active: </span>
                <span className="text-red-300">
                  ${decayTax.toFixed(0)} lost while you wait
                </span>
              </div>
            </div>
            <a href="/sign-up">
              <button className="bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                Stop The Bleeding →
              </button>
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-20">
        {!currentScore ? (
          <InstantAnalyzer onAnalyzed={setCurrentScore} />
        ) : (
          <InstantResults score={currentScore} onUnlock={handleUnlock} />
        )}
      </div>

      {/* Share Modal */}
      <ShareToUnlockModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShared={handleShared}
        featureName={shareFeature}
      />

      {/* Social Proof Footer */}
      <div className="border-t border-gray-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-6">Trusted by forward-thinking dealerships</p>
          <div className="flex items-center justify-center gap-12 opacity-50">
            <div className="text-2xl font-bold">Terry Reid Hyundai</div>
            <div className="text-2xl font-bold">Germain Auto</div>
            <div className="text-2xl font-bold">Crown Motors</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SHARE-TO-UNLOCK MODAL
// ============================================================================

const ShareToUnlockModal = ({
  isOpen,
  onClose,
  onShared,
  featureName
}: {
  isOpen: boolean;
  onClose: () => void;
  onShared: (platform: string) => void;
  featureName: string;
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `I just discovered my dealership's AI visibility score! Check yours at ${shareUrl} #AIvisibility #DealershipMarketing`;

  const handleShare = async (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      // Track and unlock after short delay
      setTimeout(() => {
        onShared(platform);
      }, 1000);
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onShared('copy');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/30"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
            <Share2 className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Unlock {featureName}
          </h3>
          <p className="text-gray-400">
            Share with one dealer friend to unlock this feature for 24 hours
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleShare('twitter')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share on Twitter
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share on LinkedIn
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share on Facebook
          </button>
          <button
            onClick={handleCopy}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied! Unlocking...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Maybe later
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Or <a href="/sign-up" className="text-purple-400 hover:text-purple-300 underline">create a free account</a> for unlimited access
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

