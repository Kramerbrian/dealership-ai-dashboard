'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  // Check if Clerk is configured
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!clerkKey || clerkKey.includes('your_key_here') || clerkKey.includes('emergency')) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white">
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="h-12 w-12 rounded-lg mx-auto mb-4" style={{background: 'var(--brand-gradient)'}}></div>
                <h1 className="text-2xl font-semibold">Sign In</h1>
                <p className="text-white/70 mt-2">Clerk authentication not configured</p>
              </div>
              
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-white/70 mb-4">Please configure Clerk API keys to enable authentication.</p>
                  <p className="text-sm text-white/50 mb-6">
                    Check the PRODUCTION_SETUP_GUIDE.md for setup instructions.
                  </p>
                  <Link 
                    href="/#scan" 
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold"
                    style={{backgroundImage: 'var(--brand-gradient)'}}
                  >
                    Run Free Scan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
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
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "glass rounded-2xl p-8",
              card: "bg-transparent shadow-none",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-white/70",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              formFieldInput: "bg-white/10 border-white/20 text-white placeholder-white/50",
              formFieldLabel: "text-white",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              identityPreviewText: "text-white/70",
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
            }
          }}
        />
      </div>
    </div>
  );
}