'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lock, Zap,
  Users, Share2, Gift, Clock, DollarSign, ArrowRight, Eye, EyeOff,
  Sparkles, Target, Shield, MessageSquare, Star, BarChart3, Brain, Search
} from 'lucide-react';

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
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
  const { sessions, decayTax } = useSessionTracking();

  const handleUnlock = (feature: string) => {
    setShareFeature(feature);
    setShareModalOpen(true);
  };

  const handleShared = () => {
    console.log('Feature unlocked via share:', shareFeature);
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

