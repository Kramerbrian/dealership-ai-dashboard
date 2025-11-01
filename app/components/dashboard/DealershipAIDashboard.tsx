'use client';

/**
 * 🚀 DEALERSHIPAI PRODUCTION INTELLIGENCE DASHBOARD
 * The Bloomberg Terminal for Automotive AI Visibility
 * 
 * Launch Date: Tomorrow
 * Status: Production-Ready
 * Version: 1.0.0
 * 
 * INTEGRATIONS:
 * ✅ Five Pillar Scoring System (Trust Score, SEO, AEO, GEO, QAI)
 * ✅ ChatGPT Agent Mode Copilot
 * ✅ Mystery Shop AI Insights
 * ✅ Dynamic Easter Egg Engine
 * ✅ PLG Tier Gating
 * ✅ Real-time AI Visibility Tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, Search, MessageSquare, Bot, Zap, 
  TrendingUp, TrendingDown, Clock, DollarSign,
  AlertTriangle, Target, Sparkles, Terminal,
  ChevronRight, Lock, ExternalLink, Info
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

interface UserTier {
  level: 'free' | 'pro' | 'enterprise';
  sessionsUsed: number;
  sessionsLimit: number;
  features: string[];
}

interface TrustScoreData {
  score: number;
  delta: number;
  trend: number[];
  components: {
    qai: number;
    eeat: number;
  };
  lastRefreshed: Date;
}

interface PillarScore {
  score: number;
  delta: number;
  trend: number[];
  components: Array<{
    name: string;
    value: number;
    weight: number;
    status: 'good' | 'warning' | 'critical';
  }>;
}

interface DashboardData {
  dealership: {
    name: string;
    url: string;
    location: string;
  };
  userTier: UserTier;
  trustScore: TrustScoreData;
  pillars: {
    seo: PillarScore;
    aeo: PillarScore;
    geo: PillarScore;
    qai: PillarScore;
  };
  oci: {
    value: number;
    issues: Array<{
      title: string;
      impact: number;
      effort: 'low' | 'medium' | 'high';
      canAutomate: boolean;
    }>;
  };
  mysteryShop?: {
    competitors: Array<{ name: string; price: number; responseTime: number }>;
    pricing: { current: number };
    avgResponseTime: number;
    dailyVolume: number[];
    conversionHistory: number[];
  };
}

interface AIInsight {
  type: 'opportunity' | 'warning' | 'trend' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

interface EasterEggContext {
  trustScore: number;
  topIssue?: string;
  competitorName?: string;
  dealershipName: string;
  currentTime: Date;
  recentAction?: string;
}

// ==================== UTILITY FUNCTIONS ====================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value);
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number): string => {
  if (score >= 80) return 'from-green-500 to-emerald-500';
  if (score >= 60) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-500';
};

// ==================== AGENT MODE INTEGRATION ====================

const AgentCopilot: React.FC<{
  dashboardData: DashboardData;
  onQuery: (query: string) => Promise<string>;
}> = ({ dashboardData, onQuery }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await onQuery(query);
      setResponse(result);
      setIsExpanded(true);
    } catch (error) {
      setResponse('Unable to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Easter egg: TARS command
  useEffect(() => {
    if (query.toLowerCase().includes('tars')) {
      setResponse('TARS online. Humor setting: 75%. Honesty: 90%. How can I assist?');
      setIsExpanded(true);
    }
  }, [query]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-zinc-300">PIQR Terminal</span>
            <div className={`w-2 h-2 rounded-full ${loading ? 'animate-pulse bg-cyan-500' : 'bg-zinc-600'}`} />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-zinc-300 text-xs"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </button>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your AI visibility... (Try: 'How can I improve my GEO score?')"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 
                     placeholder-zinc-500 focus:border-purple-500 focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg
                     font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {/* Response Panel */}
        {isExpanded && response && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300 
                        leading-relaxed max-h-48 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {response}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setQuery('What are my top 3 quick wins?')}
            className="text-zinc-400 hover:text-cyan-500 transition-colors"
          >
            → Quick wins
          </button>
          <button
            onClick={() => setQuery('How am I doing vs competitors?')}
            className="text-zinc-400 hover:text-cyan-500 transition-colors"
          >
            → Competitive position
          </button>
          <button
            onClick={() => setQuery('What is my biggest risk?')}
            className="text-zinc-400 hover:text-cyan-500 transition-colors"
          >
            → Risk analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MYSTERY SHOP AI INSIGHTS ====================

const MysteryShopInsights: React.FC<{
  data: DashboardData['mysteryShop'];
  userTier: UserTier['level'];
}> = ({ data, userTier }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data || userTier === 'free') return;

    const generateInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/mystery-shop/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        setInsights(result.insights || []);
      } catch (error) {
        console.error('Mystery Shop insights failed:', error);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [data, userTier]);

  if (userTier === 'free') {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-700 rounded w-full" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-300 mb-1">Pro Feature</p>
            <p className="text-xs text-zinc-500">Unlock AI-powered competitive insights</p>
            <button className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white 
                             rounded-lg text-sm font-medium hover:shadow-lg transition-all">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Brain className="w-6 h-6 text-purple-500 animate-pulse" />
        <span className="ml-2 text-sm text-zinc-400">Analyzing...</span>
      </div>
    );
  }

  const INSIGHT_ICONS = {
    opportunity: Target,
    warning: AlertTriangle,
    trend: TrendingUp,
    prediction: Brain
  };

  return (
    <div className="space-y-3">
      {insights.slice(0, 5).map((insight, index) => {
        const Icon = INSIGHT_ICONS[insight.type];
        return (
          <div
            key={index}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-purple-500/30 
                     transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                insight.type === 'opportunity' ? 'bg-green-500/10' :
                insight.type === 'warning' ? 'bg-amber-500/10' :
                insight.type === 'trend' ? 'bg-cyan-500/10' :
                'bg-purple-500/10'
              }`}>
                <Icon className={`w-4 h-4 ${
                  insight.type === 'opportunity' ? 'text-green-500' :
                  insight.type === 'warning' ? 'text-amber-500' :
                  insight.type === 'trend' ? 'text-cyan-500' :
                  'text-purple-500'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-zinc-100 mb-1">{insight.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-2">{insight.description}</p>
                {insight.action && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{insight.action}</span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <span>{(insight.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== DYNAMIC EASTER EGG ENGINE ====================

const DynamicEasterEgg: React.FC<{
  context: EasterEggContext;
  userTier: UserTier['level'];
}> = ({ context, userTier }) => {
  const [eggText, setEggText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const generateEasterEgg = useCallback(async (trigger: string) => {
    if (userTier === 'free') return;

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a witty one-liner (max 15 words) with dry humor and subtle pop culture reference.

Context:
- Dealership: ${context.dealershipName}
- Trust Score: ${context.trustScore}/100
- Trigger: ${trigger}
- Time: ${context.currentTime.toLocaleTimeString()}

Style: Ryan Reynolds wit, IYKYK sci-fi references (Nolan, Kubrick, Star Wars, Matrix).

Generate ONE line. NO quotes, NO explanation:`,
          context: {
            trustScore: context.trustScore,
            dealershipName: context.dealershipName,
          }
        })
      });

      const data = await response.json();
      const egg = data.message || data.answer || '';
      setEggText(egg.trim());
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setEggText(null), 500);
      }, 6000);
    } catch (error) {
      console.error('Easter egg generation failed:', error);
    }
  }, [context, userTier]);

  // Static Easter eggs
  useEffect(() => {
    const score = context.trustScore;
    const hour = context.currentTime.getHours();

    if (score === 88) {
      setEggText("Great Scott! 88 means the flux capacitor is... wait, wrong dashboard.");
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 6000);
    } else if (score === 42) {
      setEggText("The answer to life, the universe, and Trust Scores.");
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 6000);
    } else if (score === 100) {
      setEggText("Event Horizon reached. You've entered the singularity.");
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 6000);
    } else if (score === 69) {
      setEggText("Nice.");
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    } else if (hour >= 23 || hour <= 4) {
      generateEasterEgg('Late night usage');
    }
  }, [context, generateEasterEgg]);

  if (!isVisible || !eggText) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-right fade-in duration-500">
      <div className="max-w-xs p-4 rounded-xl bg-zinc-800/95 backdrop-blur-xl border border-purple-500/30
                    shadow-lg shadow-purple-500/10">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-sm text-zinc-100 font-medium italic">{eggText}</p>
        </div>
      </div>
    </div>
  );
};

// ==================== TRUST SCORE HERO ====================

const TrustScoreHero: React.FC<{
  data: TrustScoreData;
  userTier: UserTier['level'];
}> = ({ data, userTier }) => {
  const { score, delta, components, lastRefreshed } = data;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/30 
                  transition-all group">
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-400">Trust Score</h2>
        <Info className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>

      {/* Score Display */}
      <div className="flex items-baseline gap-4 mb-4">
        <span className={`text-6xl font-bold ${getScoreColor(score)} tabular-nums`}>
          {score}
        </span>
        <div className="flex items-center gap-1 text-sm">
          {delta >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={delta >= 0 ? 'text-green-500' : 'text-red-500'}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
          </span>
          <span className="text-zinc-500 text-xs">vs yesterday</span>
        </div>
      </div>

      {/* Formula (Tier-gated) */}
      {userTier === 'free' && (
        <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white 
                         rounded-lg text-sm font-medium hover:shadow-lg transition-all">
          <Lock className="w-3 h-3 inline mr-1" />
          Unlock formula
        </button>
      )}

      {userTier === 'pro' && (
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900/50 p-3 rounded-lg">
          Trust Score = (QAI × 0.6) + (E-E-A-T × 0.4)
        </div>
      )}

      {userTier === 'enterprise' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">What drives this</p>
          <div className="space-y-1 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>QAI Score</span>
              <span className="text-zinc-300 font-medium">{components.qai} × 60%</span>
            </div>
            <div className="flex justify-between">
              <span>E-E-A-T Score</span>
              <span className="text-zinc-300 font-medium">{components.eeat} × 40%</span>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center gap-2 text-xs text-zinc-500">
        <Clock className="w-3 h-3" />
        <span>Updated {new Date(lastRefreshed).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

// ==================== PILLAR CARD ====================

const PillarCard: React.FC<{
  pillar: 'seo' | 'aeo' | 'geo' | 'qai';
  data: PillarScore;
  userTier: UserTier['level'];
}> = ({ pillar, data, userTier }) => {
  const PILLAR_CONFIG = {
    seo: {
      label: 'Search Foundation',
      description: 'Technical health & content',
      icon: Search,
      color: 'cyan'
    },
    aeo: {
      label: 'Zero-Click Dominance',
      description: 'AI-powered search visibility',
      icon: MessageSquare,
      color: 'purple'
    },
    geo: {
      label: 'Generative Engine',
      description: 'ChatGPT, Claude presence',
      icon: Bot,
      color: 'amber'
    },
    qai: {
      label: 'Internal Execution',
      description: 'Operational excellence',
      icon: Zap,
      color: 'green'
    }
  };

  const config = PILLAR_CONFIG[pillar];
  const Icon = config.icon;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-purple-500/30 
                  transition-all group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${
          config.color === 'cyan' ? 'bg-cyan-500/10' :
          config.color === 'purple' ? 'bg-purple-500/10' :
          config.color === 'amber' ? 'bg-amber-500/10' :
          'bg-green-500/10'
        }`}>
          <Icon className={`w-5 h-5 ${
            config.color === 'cyan' ? 'text-cyan-500' :
            config.color === 'purple' ? 'text-purple-500' :
            config.color === 'amber' ? 'text-amber-500' :
            'text-green-500'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-zinc-100">{config.label}</h3>
          <p className="text-xs text-zinc-500">{config.description}</p>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className={`text-4xl font-bold ${getScoreColor(data.score)} tabular-nums`}>
          {data.score}
        </span>
        <div className="flex items-center gap-1 text-xs">
          {data.delta >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={data.delta >= 0 ? 'text-green-500' : 'text-red-500'}>
            {data.delta >= 0 ? '+' : ''}{data.delta.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Component Breakdown (Tier-gated) */}
      {userTier === 'free' ? (
        <div className="relative">
          <div className="blur-sm pointer-events-none">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-zinc-500">Component {i}</span>
                  <span className="text-zinc-600">--</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 text-white 
                             text-xs font-medium rounded-lg hover:shadow-lg transition-all">
              <Lock className="w-3 h-3 inline mr-1" />
              Unlock
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {data.components.map((comp, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs group/comp">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  comp.status === 'good' ? 'bg-green-500' :
                  comp.status === 'warning' ? 'bg-amber-500' :
                  'bg-red-500'
                }`} />
                <span className="text-zinc-400 group-hover/comp:text-zinc-300 transition-colors">
                  {comp.name}
                </span>
              </div>
              <span className="text-zinc-300 font-medium">{comp.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== OCI PANEL ====================

const OCIPanel: React.FC<{
  data: DashboardData['oci'];
  userTier: UserTier['level'];
}> = ({ data, userTier }) => {
  return (
    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 
                  rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Revenue at Risk</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-red-500 tabular-nums">
              {formatCurrency(data.value)}
            </span>
            <span className="text-zinc-500 text-sm">/month</span>
          </div>
        </div>
        <DollarSign className="w-8 h-8 text-red-500/30" />
      </div>

      <div className="space-y-3">
        {data.issues.slice(0, 3).map((issue, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-zinc-100 font-medium mb-1">{issue.title}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-red-400 font-medium">
                  {formatCurrency(issue.impact)}/mo loss
                </span>
                <span className={`px-2 py-0.5 rounded-full ${
                  issue.effort === 'low' ? 'bg-green-500/20 text-green-400' :
                  issue.effort === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {issue.effort === 'low' ? '🟢' : issue.effort === 'medium' ? '🟡' : '🔴'} {issue.effort}
                </span>
              </div>
            </div>
            {userTier === 'enterprise' && issue.canAutomate && (
              <button className="ml-3 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 
                               text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all">
                Fix Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================

export default function DealershipAIDashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [activeView, setActiveView] = useState<'command-center' | 'mystery-shop'>('command-center');

  // Agent Query Handler
  const handleAgentQuery = async (query: string): Promise<string> => {
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          origin: data.dealership.url,
          context: {
            trustScore: data.trustScore.score,
            pillars: data.pillars,
          }
        })
      });
      const result = await response.json();
      return result.message || result.answer || 'Unable to process query.';
    } catch (error) {
      return 'Error processing query.';
    }
  };

  // Easter Egg Context
  const easterEggContext: EasterEggContext = {
    trustScore: data.trustScore.score,
    dealershipName: data.dealership.name,
    currentTime: new Date(),
    topIssue: data.oci.issues[0]?.title,
  };

  return (
    <div className="min-h-screen bg-zinc-900 pb-32">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{data.dealership.name}</h1>
              <p className="text-sm text-zinc-500">{data.dealership.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="text-zinc-400">Session Usage</p>
                <p className="text-zinc-100 font-medium">
                  {data.userTier.sessionsUsed}/{data.userTier.sessionsLimit || '∞'}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                data.userTier.level === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                data.userTier.level === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                'bg-zinc-700 text-zinc-300'
              }`}>
                {data.userTier.level.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveView('command-center')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeView === 'command-center'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => setActiveView('mystery-shop')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeView === 'mystery-shop'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-1" />
              Mystery Shop AI
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'command-center' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trust Score + Pillars */}
            <div className="lg:col-span-2 space-y-6">
              <TrustScoreHero data={data.trustScore} userTier={data.userTier.level} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PillarCard pillar="seo" data={data.pillars.seo} userTier={data.userTier.level} />
                <PillarCard pillar="aeo" data={data.pillars.aeo} userTier={data.userTier.level} />
                <PillarCard pillar="geo" data={data.pillars.geo} userTier={data.userTier.level} />
                <PillarCard pillar="qai" data={data.pillars.qai} userTier={data.userTier.level} />
              </div>
            </div>

            {/* Right Column - OCI */}
            <div>
              <OCIPanel data={data.oci} userTier={data.userTier.level} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Insights
              </h2>
              <MysteryShopInsights data={data.mysteryShop} userTier={data.userTier.level} />
            </div>
          </div>
        )}
      </main>

      {/* Agent Copilot */}
      <AgentCopilot dashboardData={data} onQuery={handleAgentQuery} />

      {/* Dynamic Easter Eggs */}
      <DynamicEasterEgg context={easterEggContext} userTier={data.userTier.level} />
    </div>
  );
}

