'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowRight, Loader2, Mail, Lock, Building2, Facebook, Github } from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/intelligence';
  const plan = searchParams.get('plan') || 'professional';

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider);
    setError('');
    
    try {
      const result = await signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: true
      });

      // If redirect is true, NextAuth will handle the redirect automatically
      // This code will only run if redirect: false
      if (result?.error) {
        setError('Authentication failed. Please try again.');
      } else if (result?.ok) {
        // Redirect to the callback URL
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading('email');
    setError('');

    try {
      const result = await signIn('email', {
        email,
        callbackUrl: `${callbackUrl}?plan=${plan}`,
        redirect: false
      });

      if (result?.error) {
        setError('Email sign-in failed. Please try again.');
      } else {
        // Show success message
        setError('');
        alert('Check your email for a sign-in link!');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
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
          <a href="/" className="text-sm text-white/70 hover:text-white">← Back to Home</a>
        </div>
      </header>

      <div className="mx-auto max-w-md px-5 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">Sign in to DealershipAI</h1>
          <p className="text-white/70">
            Choose your preferred sign-in method to continue
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* OAuth Providers */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              Continue with GitHub
            </button>

            <button
              onClick={() => handleOAuthSignIn('azure-ad')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0078d4] text-white rounded-lg font-medium hover:bg-[#106ebe] transition-colors disabled:opacity-50"
            >
              {isLoading === 'azure-ad' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
              Continue with Microsoft
            </button>

            <button
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877f2] text-white rounded-lg font-medium hover:bg-[#166fe5] transition-colors disabled:opacity-50"
            >
              {isLoading === 'facebook' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Facebook className="w-5 h-5" />
              )}
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--brand-bg)] text-white/60">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign-in */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@dealership.com"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              {isLoading === 'email' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Magic Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-sm font-semibold mb-3">Why sign in with SSO?</h3>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>Use your existing business account</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span>Faster setup and onboarding</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to signup */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/60">
            Don't have an account?{' '}
            <a href={`/signup?plan=${plan}`} className="text-[var(--brand-primary)] hover:underline">
              Sign up instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
