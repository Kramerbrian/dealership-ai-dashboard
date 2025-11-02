'use client';

// Force dynamic rendering to prevent SSG useContext errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <a href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="glass rounded-2xl p-8">
          <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>
          <p className="text-white/70 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-white">1. Information We Collect</h2>
            <p className="text-white/80 mb-6">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, 
              dealership information, and any other information you choose to provide.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
            <p className="text-white/80 mb-6">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, send you technical notices and support messages, and communicate 
              with you about products, services, and promotional offers.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">3. Information Sharing</h2>
            <p className="text-white/80 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this privacy policy. We may share your 
              information with trusted third parties who assist us in operating our website and 
              conducting our business.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">4. Data Security</h2>
            <p className="text-white/80 mb-6">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">5. Cookies and Tracking</h2>
            <p className="text-white/80 mb-6">
              We use cookies and similar tracking technologies to enhance your experience on our 
              website, analyze usage patterns, and provide personalized content and advertisements.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">6. Third-Party Services</h2>
            <p className="text-white/80 mb-6">
              Our service integrates with third-party services such as Google Analytics, OAuth providers, 
              and other analytics tools. These services have their own privacy policies, and we encourage 
              you to review them.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">7. Your Rights</h2>
            <p className="text-white/80 mb-6">
              You have the right to access, update, or delete your personal information. You may also 
              opt out of certain communications from us. To exercise these rights, please contact us 
              using the information provided below.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">8. Changes to This Policy</h2>
            <p className="text-white/80 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">9. Contact Us</h2>
            <p className="text-white/80 mb-6">
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-white/80">
                <strong>Email:</strong> kainomura@dealershipai.com<br />
                <strong>Address:</strong> DealershipAI, Inc.<br />
                <strong>Phone:</strong> (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
