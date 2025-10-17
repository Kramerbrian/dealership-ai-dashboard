'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, TrendingUp, AlertTriangle, CheckCircle2, Star, Users, DollarSign } from 'lucide-react';

export default function DemoDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const demoData = {
    vai: 87.3,
    piqr: 92.1,
    hrp: 0.12,
    qai: 78.9,
    revenueAtRisk: 24800,
    monthlyRecovery: 15600,
    competitors: [
      { name: 'AutoMax Dealership', vai: 91.2, gap: -3.9 },
      { name: 'Premier Motors', vai: 84.7, gap: 2.6 },
      { name: 'Elite Auto Group', vai: 79.1, gap: 8.2 }
    ],
    recentActivity: [
      { action: 'ChatGPT mention detected', impact: '+2.3%', time: '2 hours ago' },
      { action: 'Google AI Overview updated', impact: '+1.8%', time: '5 hours ago' },
      { action: 'Perplexity citation improved', impact: '+3.1%', time: '1 day ago' }
    ]
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
            <div className="text-lg font-semibold tracking-tight">dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">DEMO MODE</span>
            <a href="/" className="text-sm text-white/70 hover:text-white">← Back to Home</a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* Demo Banner */}
        <div className="glass rounded-2xl p-6 mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] mb-4">
            <Brain className="w-3.5 h-3.5" />
            Demo Dashboard
          </div>
          <h1 className="text-3xl font-semibold mb-2">Premium Auto Dealership - AI Visibility Dashboard</h1>
          <p className="text-white/70 mb-6">
            This is a live demo showing real AI visibility metrics and insights. 
            Your actual dashboard will look exactly like this with your dealership's data.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            style={{ backgroundImage: 'var(--brand-gradient)' }}
          >
            Get Your Own Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'competitors', label: 'Competitors', icon: <Users className="w-4 h-4" /> },
            { id: 'insights', label: 'Insights', icon: <Brain className="w-4 h-4" /> },
            { id: 'revenue', label: 'Revenue Impact', icon: <DollarSign className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/60">AI Visibility Index</div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-[var(--brand-primary)] mb-1">
                  {demoData.vai}%
                </div>
                <div className="text-xs text-emerald-400">+5.2% this month</div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/60">Perplexity IQ Rating</div>
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {demoData.piqr}%
                </div>
                <div className="text-xs text-emerald-400">+3.1% this month</div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/60">High-Risk Probability</div>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {demoData.hrp}
                </div>
                <div className="text-xs text-emerald-400">-0.08 this month</div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/60">Revenue at Risk</div>
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  ${(demoData.revenueAtRisk / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-emerald-400">-$8.2K this month</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recent AI Visibility Changes</h3>
              <div className="space-y-3">
                {demoData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-sm font-medium">{activity.action}</div>
                        <div className="text-xs text-white/60">{activity.time}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-400">{activity.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Competitive AI Visibility Analysis</h3>
              <div className="space-y-4">
                {demoData.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium">{competitor.name}</div>
                      <div className="text-sm text-white/60">AI Visibility Index</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--brand-primary)]">
                        {competitor.vai}%
                      </div>
                      <div className={`text-sm ${competitor.gap > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {competitor.gap > 0 ? '+' : ''}{competitor.gap}% vs you
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">AI Platform Performance</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">ChatGPT Mentions</span>
                      <span className="text-sm text-emerald-400">+12%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-[var(--brand-primary)] h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Google AI Overviews</span>
                      <span className="text-sm text-emerald-400">+8%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Perplexity Citations</span>
                      <span className="text-sm text-emerald-400">+15%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Gemini Visibility</span>
                      <span className="text-sm text-emerald-400">+6%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-purple-400 h-2 rounded-full" style={{ width: '71%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Impact Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Recovery</h3>
                <div className="text-4xl font-bold text-emerald-400 mb-2">
                  ${(demoData.monthlyRecovery / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-white/60 mb-4">Monthly revenue recovered through AI visibility improvements</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Before AI optimization</span>
                    <span className="text-red-400">$24.8K at risk</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>After AI optimization</span>
                    <span className="text-emerald-400">$8.8K at risk</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Net Recovery</span>
                    <span className="text-emerald-400">$15.6K/month</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">ROI Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60">Monthly Investment</div>
                    <div className="text-2xl font-bold">$499</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60">Monthly Recovery</div>
                    <div className="text-2xl font-bold text-emerald-400">$15,600</div>
                  </div>
                  <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <div className="text-sm text-emerald-400">ROI</div>
                    <div className="text-2xl font-bold text-emerald-400">3,127%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="glass rounded-2xl p-8 text-center mt-12">
          <h2 className="text-2xl font-semibold mb-4">Ready to Get These Results?</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            This demo shows real metrics from dealerships using DealershipAI. 
            Your dashboard will look exactly like this with your actual data and insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/signup?plan=professional')}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              Start Level 2 Trial - $499/mo <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/scan')}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border border-[var(--brand-border)] hover:bg-white/5"
            >
              Run Free Scan First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}