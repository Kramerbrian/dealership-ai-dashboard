'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Search, 
  Sparkles, 
  Shield, 
  Gauge, 
  LineChart, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react';

// Import dashboard components
import { RAGDashboard } from '@/components/RAGDashboard';
import EnhancedDealershipDashboard from '@/components/dashboard/EnhancedDealershipDashboard';
import TabbedDashboard from '@/components/dashboard/TabbedDashboard';

function IntelligenceContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [domain, setDomain] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  // Mock data for demo
  const [indexTrend, setIndexTrend] = useState(
    Array.from({ length: 16 }).map((_, i) => ({ t: i, v: 62 + Math.sin(i / 3) * 6 + i * 0.4 }))
  );

  const pillarTrends = {
    GEO: Array.from({ length: 16 }).map((_, i) => ({ t: i, v: 74 + Math.sin(i / 2) * 8 })),
    AEO: Array.from({ length: 16 }).map((_, i) => ({ t: i, v: 61 + Math.cos(i / 2.2) * 7 })),
    SEO: Array.from({ length: 16 }).map((_, i) => ({ t: i, v: 53 + Math.sin(i / 2.7) * 5 })),
  };

  const pillarScores = { GEO: 74, AEO: 61, SEO: 53 };

  // Loading states for Quick Actions
  const [actionLoading, setActionLoading] = useState({
    audit: false,
    health: false,
    competitors: false,
    recommendations: false
  });

  // Click handlers for Quick Actions
  const handleQuickAction = async (action: string) => {
    setActionLoading(prev => ({ ...prev, [action]: true }));
    try {
      console.log(`Executing ${action}...`);
      
      // Simulate API call based on action type
      switch (action) {
        case 'audit':
          // Simulate full audit API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          alert('Full audit completed! Your AI visibility analysis is ready.');
          break;
        case 'health':
          // Simulate AI health check
          await new Promise(resolve => setTimeout(resolve, 1500));
          alert('AI Health Check completed! All platforms are operational.');
          break;
        case 'competitors':
          // Simulate competitor analysis
          await new Promise(resolve => setTimeout(resolve, 2500));
          alert('Competitor analysis completed! Check the results below.');
          break;
        case 'recommendations':
          // Simulate recommendations generation
          await new Promise(resolve => setTimeout(resolve, 1800));
          alert('Recommendations generated! 5 new action items are available.');
          break;
        default:
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert(`${action} completed!`);
      }
    } catch (error) {
      console.error(`Error in ${action}:`, error);
      alert(`Error in ${action}: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  useEffect(() => {
    // Get URL parameters
    const domainParam = searchParams.get('domain');
    const modeParam = searchParams.get('mode');
    const planParam = searchParams.get('plan');

    setDomain(domainParam);
    setMode(modeParam);
    setPlan(planParam);

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Intelligence Dashboard</h2>
          <p className="text-white/60">Analyzing your dealership data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleWeightsChange = (weights: any) => {
    console.log('Pillar weights updated:', weights);
  };

  const handleExportCitations = () => {
    console.log('Exporting citations...');
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white">
      {/* Brand Tokens */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root{
            --brand-gradient: linear-gradient(90deg,#3b82f6, #8b5cf6);
            --brand-primary: #3b82f6;
            --brand-accent: #8b5cf6;
            --brand-bg: #0a0b0f;
            --brand-card: rgba(255,255,255,0.04);
            --brand-border: rgba(255,255,255,0.08);
            --brand-glow: 0 0 60px rgba(59,130,246,.35);
          }
          .glass{ background:var(--brand-card); border:1px solid var(--brand-border); backdrop-filter: blur(12px); }
        `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: 'var(--brand-gradient)' }} />
            <div className="text-lg font-semibold tracking-tight">
              dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span>
            </div>
            <div className="text-sm text-white/60">Intelligence Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/70">
              Welcome, {session.user?.name || session.user?.email}
            </div>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg grid place-items-center bg-white/5">
                <Brain className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">AI Intelligence Dashboard</h1>
                <p className="text-white/70">
                  {domain ? `Analyzing: ${domain}` : 'Your dealership AI visibility analysis'}
                </p>
              </div>
            </div>
            
            {mode === 'calculator' && (
              <div className="mt-4 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                  <Target className="w-5 h-5" />
                  Opportunity Calculator Mode
                </div>
                <p className="text-sm text-white/80">
                  Calculate your potential revenue recovery and AI visibility improvements.
                </p>
              </div>
            )}

            {plan && (
              <div className="mt-4 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                  <Zap className="w-5 h-5" />
                  Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </div>
                <p className="text-sm text-white/80">
                  Accessing features for your selected plan.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Visibility Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-[var(--brand-primary)]" />
              AI Visibility Analysis
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">87.3%</div>
                <div className="text-sm text-white/70">Overall VAI Score</div>
                <div className="text-xs text-green-400 mt-1">↗ +2.1% this month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">92.1%</div>
                <div className="text-sm text-white/70">PIQR Score</div>
                <div className="text-xs text-blue-400 mt-1">↗ +1.8% this month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">0.12</div>
                <div className="text-sm text-white/70">HRP Score</div>
                <div className="text-xs text-purple-400 mt-1">↘ -0.03 this month</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[var(--brand-primary)]" />
              Quick Actions
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Run Full Audit',
                  description: 'Complete AI visibility analysis',
                  icon: <Search className="w-5 h-5" />,
                  color: 'text-blue-400',
                  bgColor: 'bg-blue-600/20',
                  borderColor: 'border-blue-500/50'
                },
                {
                  title: 'AI Health Check',
                  description: 'Monitor AI platform performance',
                  icon: <Shield className="w-5 h-5" />,
                  color: 'text-green-400',
                  bgColor: 'bg-green-600/20',
                  borderColor: 'border-green-500/50'
                },
                {
                  title: 'Competitor Analysis',
                  description: 'Compare with local dealers',
                  icon: <TrendingUp className="w-5 h-5" />,
                  color: 'text-purple-400',
                  bgColor: 'bg-purple-600/20',
                  borderColor: 'border-purple-500/50'
                },
                {
                  title: 'Get Recommendations',
                  description: 'AI-powered action items',
                  icon: <Target className="w-5 h-5" />,
                  color: 'text-orange-400',
                  bgColor: 'bg-orange-600/20',
                  borderColor: 'border-orange-500/50'
                }
              ].map((action, index) => {
                // Map action titles to loading state keys
                const actionKey = action.title.toLowerCase()
                  .replace('run full ', '')
                  .replace(' ', '')
                  .replace('analysis', 'competitors')
                  .replace('check', 'health')
                  .replace('recommendations', 'recommendations');
                
                const isLoading = actionLoading[actionKey as keyof typeof actionLoading];
                
                return (
                  <motion.button
                    key={action.title}
                    onClick={() => handleQuickAction(actionKey)}
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    className={`p-4 ${action.bgColor} border ${action.borderColor} rounded-xl text-left transition-all duration-200 hover:bg-opacity-30 group disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className={`${action.color} flex items-center gap-2 mb-2`}>
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        action.icon
                      )}
                      <span className="font-semibold text-sm">{action.title}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {isLoading ? 'Processing...' : action.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Advanced Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TabbedDashboard />
        </motion.div>
      </main>

      {/* CSS for ring colors */}
      <style jsx global>{`
        .ring-colors {
          --ring: #10b981;
          --ring-muted: #1f2937;
        }
        :global(.dark) .ring-colors {
          --ring: #4ade80;
          --ring-muted: #111827;
        }
      `}</style>
    </div>
  );
}

export default function IntelligenceDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Intelligence Dashboard</h2>
          <p className="text-white/60">Preparing your dashboard...</p>
        </div>
      </div>
    }>
      <IntelligenceContent />
    </Suspense>
  );
}
