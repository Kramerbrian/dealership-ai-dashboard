'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>
          <p className="text-white/70 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-white/80 mb-6">
              By accessing and using DealershipAI services, you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="text-white/80 mb-6">
              DealershipAI provides AI-powered analytics and visibility tracking services for 
              automotive dealerships. Our service includes website analysis, SEO monitoring, 
              social media tracking, and AI visibility optimization tools.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">3. User Accounts</h2>
            <p className="text-white/80 mb-6">
              To access certain features of our service, you must create an account. You are 
              responsible for maintaining the confidentiality of your account credentials and 
              for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">4. Payment Terms</h2>
            <p className="text-white/80 mb-6">
              Our service offers both free and paid subscription plans. Paid subscriptions are 
              billed monthly or annually as selected. All fees are non-refundable unless otherwise 
              specified. We reserve the right to change our pricing with 30 days notice.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">5. Acceptable Use</h2>
            <p className="text-white/80 mb-6">
              You agree to use our service only for lawful purposes and in accordance with these 
              terms. You may not use our service to violate any laws, infringe on others' rights, 
              or transmit harmful or malicious content.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
            <p className="text-white/80 mb-6">
              The service and its original content, features, and functionality are owned by 
              DealershipAI and are protected by international copyright, trademark, and other 
              intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">7. Data and Privacy</h2>
            <p className="text-white/80 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which also 
              governs your use of the service, to understand our practices regarding the 
              collection and use of your information.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">8. Service Availability</h2>
            <p className="text-white/80 mb-6">
              We strive to maintain high service availability but do not guarantee uninterrupted 
              access. We may temporarily suspend service for maintenance, updates, or technical 
              issues without prior notice.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">9. Limitation of Liability</h2>
            <p className="text-white/80 mb-6">
              In no event shall DealershipAI be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">10. Termination</h2>
            <p className="text-white/80 mb-6">
              We may terminate or suspend your account and access to the service immediately, 
              without prior notice, for any reason, including breach of these terms.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">11. Changes to Terms</h2>
            <p className="text-white/80 mb-6">
              We reserve the right to modify these terms at any time. We will notify users of 
              any material changes by posting the new terms on this page and updating the 
              "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">12. Contact Information</h2>
            <p className="text-white/80 mb-6">
              If you have any questions about these terms, please contact us at:
            </p>
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-white/80">
                <strong>Email:</strong> legal@dealershipai.com<br />
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
