'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, ArrowRight, Loader2, Building2, Mail, Phone, Globe } from 'lucide-react';

function SignupCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    phone: '',
    domain: '',
    role: 'owner'
  });

  const plan = searchParams.get('plan') || 'professional';
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Update user profile with additional information
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan
        })
      });

      if (response.ok) {
        // Redirect to checkout or dashboard based on plan
        if (plan === 'free') {
          router.push('/dashboard?onboarded=true');
        } else {
          router.push(`/checkout?plan=${plan}&domain=${encodeURIComponent(formData.domain)}`);
        }
      } else {
        throw new Error('Failed to complete signup');
      }
    } catch (error) {
      console.error('Signup completion error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading your account...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full glass mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Account Created Successfully
          </div>
          <h1 className="text-3xl font-semibold mb-2">Complete Your Profile</h1>
          <p className="text-white/70">
            Just a few more details to personalize your DealershipAI experience
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* User Info Summary */}
          <div className="mb-8 p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/60" />
                <span>{session.user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-white/60">👤</span>
                <span>{session.user?.name || 'Name not provided'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleCompleteSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Dealership Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Premium Auto Dealership"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website Domain *</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="url"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="www.yourdealership.com"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              >
                <option value="owner">Owner/General Manager</option>
                <option value="marketing">Marketing Manager</option>
                <option value="sales">Sales Manager</option>
                <option value="it">IT Manager</option>
                <option value="other">Other</option>
              </select>
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
                  Completing Setup...
                </>
              ) : (
                <>
                  Complete Setup & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Plan Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Selected Plan</div>
              <div className="text-lg font-semibold">
                {plan === 'professional' ? 'Level 2 - $499/month' : 
                 plan === 'enterprise' ? 'Level 3 - $999/month' : 
                 'Free Trial'}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {plan !== 'free' ? '14-day free trial included' : 'Full access to all features'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <SignupCompleteContent />
    </Suspense>
  );
}
