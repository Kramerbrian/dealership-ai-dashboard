'use client';

// Force dynamic rendering to avoid SSR context issues

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, CreditCard, Shield, Zap, Building2, Facebook, Github } from 'lucide-react';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const PLANS: Record<string, PlanDetails> = {
  professional: {
    id: 'professional',
    name: 'Level 2',
    price: 499,
    popular: true,
    features: [
      'Bi-weekly AI visibility checks',
      'Automated response generation',
      'Schema markup generator',
      'Priority email support',
      'Custom AI prompts',
      'Competitor tracking',
      'Monthly performance reports'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Level 3',
    price: 999,
    features: [
      'Everything in Level 2',
      'Enterprise security & SSO',
      'Multi-dealership management',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'White-label options',
      'API access'
    ]
  }
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
    domain: ''
  });

  useEffect(() => {
    const plan = searchParams.get('plan');
    const domain = searchParams.get('domain');
    
    if (plan && PLANS[plan]) {
      setSelectedPlan(plan);
    }
    
    if (domain) {
      setFormData(prev => ({ ...prev, domain }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create customer and checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan
        })
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plan = PLANS[selectedPlan];

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
          <a href="/" className="text-sm text-white/70 hover:text-white">← Back to Home</a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold mb-4">Start Your AI Visibility Journey</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Join hundreds of dealerships already maximizing their AI presence and recovering lost revenue.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Choose Your Plan</h2>
            
            {Object.values(PLANS).map((planOption) => (
              <div
                key={planOption.id}
                className={`glass rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedPlan === planOption.id 
                    ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary)]/10' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setSelectedPlan(planOption.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{planOption.name}</h3>
                      {planOption.popular && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      ${planOption.price}
                      <span className="text-sm font-normal text-white/60">/month</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedPlan === planOption.id 
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' 
                      : 'border-white/30'
                  }`}>
                    {selectedPlan === planOption.id && (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {planOption.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Trust Indicators */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Why Dealerships Choose Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">14-day free trial, cancel anytime</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">Setup in under 5 minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6">Create Your Account</h2>
            
            {/* OAuth Options */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(`/signup/complete?plan=${selectedPlan}`)}`}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>

              <button
                onClick={() => window.location.href = `/api/auth/signin/github?callbackUrl=${encodeURIComponent(`/signup/complete?plan=${selectedPlan}`)}`}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <Github className="w-5 h-5" />
                Sign up with GitHub
              </button>

              <button
                onClick={() => window.location.href = `/api/auth/signin/azure-ad?callbackUrl=${encodeURIComponent(`/signup/complete?plan=${selectedPlan}`)}`}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0078d4] text-white rounded-lg font-medium hover:bg-[#106ebe] transition-colors"
              >
                <Building2 className="w-5 h-5" />
                Sign up with Microsoft
              </button>

              <button
                onClick={() => window.location.href = `/api/auth/signin/facebook?callbackUrl=${encodeURIComponent(`/signup/complete?plan=${selectedPlan}`)}`}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877f2] text-white rounded-lg font-medium hover:bg-[#166fe5] transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Sign up with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--brand-bg)] text-white/60">Or create account manually</span>
              </div>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dealership Name *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website Domain *</label>
                <input
                  type="url"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="www.yourdealership.com"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
                style={{ backgroundImage: 'var(--brand-gradient)' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Start {plan.name} Trial - ${plan.price}/month
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-xs text-white/50 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
                Your trial starts immediately with full access to all features.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
