'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Globe,
  BarChart3,
  MapPin,
  Info,
  Zap
} from 'lucide-react';

function QuickSetup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    websiteUrl: '',
    ga4PropertyId: '',
    googleBusinessProfileId: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to dashboard
      router.push('/dash?onboarded=true&quick=true');
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dash?onboarded=true&skipped=true');
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
          <div className="text-sm text-white/70">
            Quick Setup
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold mb-4">Quick Setup</h1>
          <p className="text-white/70 text-lg">
            Get started in under 2 minutes with just the essentials. 
            You can always add more integrations later.
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website URL *
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://www.yourdealership.com"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                required
              />
              <p className="text-xs text-white/60 mt-1">
                We'll analyze your website for AI visibility and performance metrics
              </p>
            </div>

            {/* Google Analytics 4 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Google Analytics 4 Property ID
              </label>
              <input
                type="text"
                name="ga4PropertyId"
                value={formData.ga4PropertyId}
                onChange={handleInputChange}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <p className="text-xs text-white/60 mt-1">
                Optional: Provides 87% more accurate traffic insights
              </p>
            </div>

            {/* Google Business Profile */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Google Business Profile ID
              </label>
              <input
                type="text"
                name="googleBusinessProfileId"
                value={formData.googleBusinessProfileId}
                onChange={handleInputChange}
                placeholder="ChIJ..."
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <p className="text-xs text-white/60 mt-1">
                Optional: Tracks local AI search visibility
              </p>
            </div>

            {/* Info Box */}
            <div className="glass rounded-xl p-4 border border-blue-500/30 bg-blue-500/10">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium mb-1">Need help finding these IDs?</p>
                  <p className="text-white/70">
                    Don't worry! You can always add these integrations later in your dashboard settings. 
                    We'll provide step-by-step guides for each platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.websiteUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-50"
                style={{ backgroundImage: 'var(--brand-gradient)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-center mb-6">What You'll Get</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Basic AI Visibility</h4>
              <p className="text-sm text-white/70">Track your presence across AI platforms</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Website Analysis</h4>
              <p className="text-sm text-white/70">Performance and SEO insights</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Dashboard Access</h4>
              <p className="text-sm text-white/70">Full access to all features</p>
            </div>
          </div>
        </div>

        {/* Upgrade Prompt */}
        <div className="mt-12 text-center">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Want More Accurate Insights?</h3>
            <p className="text-white/70 text-sm mb-4">
              Connect more platforms for 87% more accurate AI visibility tracking
            </p>
            <button
              onClick={() => router.push('/onboarding/enhanced')}
              className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Use Guided Setup Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickSetup;
